# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# Kotlin
-keep class kotlin.** { *; }
-keep class kotlinx.** { *; }
-dontwarn kotlin.**
-dontwarn kotlinx.**

# Room
-keep class androidx.room.** { *; }
-keep @androidx.room.Entity class * { *; }
-dontwarn androidx.room.**

# Hilt
-keep class com.google.dagger.hilt.** { *; }
-keep @dagger.hilt.** class * { *; }
-dontwarn com.google.dagger.hilt.**

# Jetpack Compose
-keep class androidx.compose.** { *; }
-dontwarn androidx.compose.**

# GSON
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# Androidx
-keep class androidx.** { *; }
-dontwarn androidx.**

# Suppress warnings for missing libraries
-dontwarn android.support.**
-dontwarn androidx.support.**

# Data classes annotations preservation
-keepattributes *Annotation*
