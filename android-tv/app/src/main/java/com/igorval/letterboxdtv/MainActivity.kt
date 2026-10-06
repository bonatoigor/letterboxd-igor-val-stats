package com.igorval.letterboxdtv

import android.annotation.SuppressLint
import android.app.Activity
import android.graphics.Color
import android.os.Bundle
import android.os.SystemClock
import android.view.Gravity
import android.view.InputDevice
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.TextView
import kotlin.math.min

/**
 * Abre o site publicado em tela cheia. O controle da TV move um cursor virtual
 * (setas), clica (OK) e rola a página (cursor na borda ou CH+/CH-), sem alterar o site.
 */
class MainActivity : Activity() {

    private lateinit var webView: WebView
    private lateinit var cursor: CursorView
    private lateinit var offlineView: TextView
    private var offline = false

    private val density by lazy { resources.displayMetrics.density }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.cacheMode = WebSettings.LOAD_DEFAULT
            settings.useWideViewPort = true
            settings.loadWithOverviewMode = true
            setBackgroundColor(Color.parseColor("#14181C"))
            webViewClient = object : WebViewClient() {
                override fun onReceivedError(
                    view: WebView,
                    request: WebResourceRequest,
                    error: WebResourceError,
                ) {
                    if (request.isForMainFrame) setOffline(true)
                }
            }
        }

        cursor = CursorView(this)

        offlineView = TextView(this).apply {
            text = getString(R.string.offline)
            textSize = 24f
            gravity = Gravity.CENTER
            setTextColor(Color.WHITE)
            setBackgroundColor(Color.parseColor("#14181C"))
            visibility = View.GONE
        }

        val root = FrameLayout(this).apply {
            addView(webView, FrameLayout.LayoutParams(MATCH_PARENT, MATCH_PARENT))
            addView(offlineView, FrameLayout.LayoutParams(MATCH_PARENT, MATCH_PARENT))
            addView(cursor, FrameLayout.LayoutParams(MATCH_PARENT, MATCH_PARENT))
        }
        setContentView(root)

        root.post { cursor.moveTo(root.width / 2f, root.height / 2f) }
        webView.requestFocus()
        webView.loadUrl(BuildConfig.SITE_URL)
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                or View.SYSTEM_UI_FLAG_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION)
        }
    }

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        val down = event.action == KeyEvent.ACTION_DOWN
        when (event.keyCode) {
            KeyEvent.KEYCODE_DPAD_UP -> if (down) moveCursor(0, -1, event.repeatCount)
            KeyEvent.KEYCODE_DPAD_DOWN -> if (down) moveCursor(0, 1, event.repeatCount)
            KeyEvent.KEYCODE_DPAD_LEFT -> if (down) moveCursor(-1, 0, event.repeatCount)
            KeyEvent.KEYCODE_DPAD_RIGHT -> if (down) moveCursor(1, 0, event.repeatCount)

            KeyEvent.KEYCODE_DPAD_CENTER,
            KeyEvent.KEYCODE_ENTER,
            KeyEvent.KEYCODE_NUMPAD_ENTER,
            KeyEvent.KEYCODE_BUTTON_A -> if (down && event.repeatCount == 0) {
                if (offline) reload() else click()
            }

            KeyEvent.KEYCODE_PAGE_UP,
            KeyEvent.KEYCODE_CHANNEL_UP -> if (down) scroll(0f, PAGE_SCROLL)
            KeyEvent.KEYCODE_PAGE_DOWN,
            KeyEvent.KEYCODE_CHANNEL_DOWN -> if (down) scroll(0f, -PAGE_SCROLL)

            KeyEvent.KEYCODE_BACK,
            KeyEvent.KEYCODE_BUTTON_B -> if (!down && !event.isCanceled) handleBack()

            else -> return super.dispatchKeyEvent(event)
        }
        return true
    }

    private fun moveCursor(dx: Int, dy: Int, repeatCount: Int) {
        // Acelera enquanto a tecla fica pressionada.
        val step = STEP_DP * density * min(1f + repeatCount / 4f, MAX_ACCEL)
        val maxX = (cursor.width - 1).toFloat()
        val maxY = (cursor.height - 1).toFloat()
        val wantX = cursor.cursorX + dx * step
        val wantY = cursor.cursorY + dy * step
        val x = wantX.coerceIn(0f, maxX)
        val y = wantY.coerceIn(0f, maxY)
        cursor.moveTo(x, y)

        // Encostou na borda: rola o que estiver embaixo do cursor (página ou modal).
        val scrollY = if (wantY != y) -dy * EDGE_SCROLL else 0f
        val scrollX = if (wantX != x) dx * EDGE_SCROLL else 0f
        if (scrollX != 0f || scrollY != 0f) scroll(scrollX, scrollY)

        sendMouseEvent(MotionEvent.ACTION_HOVER_MOVE)
    }

    private fun click() {
        val x = cursor.cursorX
        val y = cursor.cursorY
        val time = SystemClock.uptimeMillis()
        for (action in intArrayOf(MotionEvent.ACTION_DOWN, MotionEvent.ACTION_UP)) {
            val ev = MotionEvent.obtain(time, SystemClock.uptimeMillis(), action, x, y, 0)
            ev.source = InputDevice.SOURCE_TOUCHSCREEN
            webView.dispatchTouchEvent(ev)
            ev.recycle()
        }
    }

    private fun scroll(h: Float, v: Float) =
        sendMouseEvent(MotionEvent.ACTION_SCROLL, h, v)

    private fun sendMouseEvent(action: Int, hScroll: Float = 0f, vScroll: Float = 0f) {
        val props = MotionEvent.PointerProperties().apply {
            id = 0
            toolType = MotionEvent.TOOL_TYPE_MOUSE
        }
        val coords = MotionEvent.PointerCoords().apply {
            x = cursor.cursorX
            y = cursor.cursorY
            setAxisValue(MotionEvent.AXIS_HSCROLL, hScroll)
            setAxisValue(MotionEvent.AXIS_VSCROLL, vScroll)
        }
        val now = SystemClock.uptimeMillis()
        val ev = MotionEvent.obtain(
            now, now, action, 1, arrayOf(props), arrayOf(coords),
            0, 0, 1f, 1f, 0, 0, InputDevice.SOURCE_MOUSE, 0,
        )
        webView.dispatchGenericMotionEvent(ev)
        ev.recycle()
    }

    /** Voltar: fecha um modal aberto; senão volta no histórico; senão sai do app. */
    private fun handleBack() {
        if (offline) {
            finish()
            return
        }
        webView.evaluateJavascript(CLOSE_OVERLAY_JS) { result ->
            when {
                result == "\"closed\"" -> Unit
                webView.canGoBack() -> webView.goBack()
                else -> finish()
            }
        }
    }

    private fun reload() {
        setOffline(false)
        webView.loadUrl(BuildConfig.SITE_URL)
    }

    private fun setOffline(value: Boolean) {
        offline = value
        offlineView.visibility = if (value) View.VISIBLE else View.GONE
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }

    private companion object {
        const val STEP_DP = 10f
        const val MAX_ACCEL = 4f
        const val EDGE_SCROLL = 1f
        const val PAGE_SCROLL = 8f

        // Modais do Radix (role=dialog) fecham com Escape; o modal do mapa fecha clicando no fundo.
        val CLOSE_OVERLAY_JS = """
            (function () {
              if (document.querySelector('[role="dialog"]')) {
                document.dispatchEvent(new KeyboardEvent('keydown', {
                  key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true
                }));
                return 'closed';
              }
              var overlay = document.querySelector('div.fixed.inset-0');
              if (overlay) { overlay.click(); return 'closed'; }
              return 'none';
            })();
        """.trimIndent()
    }
}
