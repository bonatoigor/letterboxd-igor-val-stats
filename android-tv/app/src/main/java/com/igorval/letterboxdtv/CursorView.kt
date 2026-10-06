package com.igorval.letterboxdtv

import android.content.Context
import android.graphics.Canvas
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Path
import android.view.View

/** Setinha de mouse desenhada por cima do WebView e movida pelo controle remoto. */
class CursorView(context: Context) : View(context) {

    var cursorX = 0f
        private set
    var cursorY = 0f
        private set

    private val density = resources.displayMetrics.density

    private val arrow = Path().apply {
        moveTo(0f, 0f)
        lineTo(0f, 22f)
        lineTo(6f, 17f)
        lineTo(10f, 26f)
        lineTo(14f, 24f)
        lineTo(10f, 15.5f)
        lineTo(17f, 15.5f)
        close()
        transform(Matrix().apply { setScale(density * 1.4f, density * 1.4f) })
    }

    private val fill = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        color = 0xFFFFFFFF.toInt()
    }

    private val stroke = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = density * 1.5f
        strokeJoin = Paint.Join.ROUND
        color = 0xFF000000.toInt()
    }

    init {
        isClickable = false
        isFocusable = false
    }

    fun moveTo(x: Float, y: Float) {
        cursorX = x
        cursorY = y
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        canvas.save()
        canvas.translate(cursorX, cursorY)
        canvas.drawPath(arrow, fill)
        canvas.drawPath(arrow, stroke)
        canvas.restore()
    }
}
