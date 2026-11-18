package com.example.taskmanager.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Minta design system colours
val Mist = Color(0xFFEAF7F3)        // background
val SurfaceMint = Color(0xFFDDEEE9) // surface
val Tint = Color(0xFF91E1C3)        // tint
val Mint = Color(0xFF009878)        // primary
val Glow = Color(0xFF52DB9C)        // secondary / glow
val Coral = Color(0xFFA83634)       // error / destructive

val TextPrimary = Color(0xFF0F2E28)
val TextSecondary = Color(0xFF5B7A72)
val White = Color(0xFFFFFFFF)

private val LightColors = lightColorScheme(
    primary = Mint,
    onPrimary = White,
    primaryContainer = Tint,
    onPrimaryContainer = Color(0xFF00382C),
    secondary = Glow,
    onSecondary = Color(0xFF00382C),
    secondaryContainer = Color(0xFFC8F5E4),
    onSecondaryContainer = Color(0xFF00382C),
    tertiary = Color(0xFF3E6373),
    background = Mist,
    onBackground = TextPrimary,
    surface = SurfaceMint,
    onSurface = TextPrimary,
    surfaceVariant = Color(0xFFD5E8E1),
    onSurfaceVariant = TextSecondary,
    surfaceContainer = White,
    surfaceContainerHigh = Color(0xFFF2FAF7),
    error = Coral,
    onError = White,
    outline = Color(0xFF9DB8AF),
    outlineVariant = Color(0xFFC4D8D1)
)

private val DarkColors = darkColorScheme(
    primary = Glow,
    onPrimary = Color(0xFF00382C),
    primaryContainer = Color(0xFF00513F),
    onPrimaryContainer = Color(0xFFC8F5E4),
    secondary = Tint,
    onSecondary = Color(0xFF00382C),
    background = Color(0xFF0E1513),
    onBackground = Color(0xFFDEE5E1),
    surface = Color(0xFF1A2421),
    onSurface = Color(0xFFDEE5E1),
    surfaceVariant = Color(0xFF3F4945),
    onSurfaceVariant = Color(0xFFBEC9C4),
    error = Color(0xFFFFB4AB),
    onError = Color(0xFF690005)
)

@Composable
fun TaskManagerTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColors else LightColors
    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}