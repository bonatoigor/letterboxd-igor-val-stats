plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val siteUrl = providers.gradleProperty("siteUrl").get()

android {
    namespace = "com.igorval.letterboxdtv"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.igorval.letterboxdtv"
        minSdk = 23
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
        buildConfigField("String", "SITE_URL", "\"$siteUrl\"")
    }

    buildFeatures {
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}
