# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in the Android SDK tools.

# Retrofit / Gson
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.example.taskmanager.data.model.** { *; }
-keep class com.example.taskmanager.data.api.** { *; }

# Gson
-keep class com.google.gson.** { *; }
-keep class sun.misc.Unsafe { *; }