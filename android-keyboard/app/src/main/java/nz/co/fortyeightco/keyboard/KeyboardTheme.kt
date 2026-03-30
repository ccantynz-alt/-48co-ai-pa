package nz.co.fortyeightco.keyboard

import android.content.Context
import android.content.res.Configuration
import android.graphics.Color
import androidx.core.content.ContextCompat

/**
 * Material 3 theming for the 48co Voice Keyboard.
 * Supports light/dark mode with indigo brand accent.
 */
data class KeyboardColors(
    val keyboardBackground: Int,
    val keyBackground: Int,
    val keyText: Int,
    val specialKeyBackground: Int,
    val keyPressedBackground: Int,
    val keyShadow: Int,
    val brandPrimary: Int,
    val brandPrimaryDark: Int,
    val brandPrimaryLight: Int,
    val voiceActive: Int,
    val grammarHighlight: Int,
    val suggestionBackground: Int,
    val divider: Int
)

object KeyboardTheme {

    fun getColors(context: Context): KeyboardColors {
        val isDark = isDarkMode(context)
        return if (isDark) darkColors(context) else lightColors(context)
    }

    fun isDarkMode(context: Context): Boolean {
        val nightMode = context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK
        return nightMode == Configuration.UI_MODE_NIGHT_YES
    }

    private fun lightColors(context: Context) = KeyboardColors(
        keyboardBackground = ContextCompat.getColor(context, R.color.keyboard_bg_light),
        keyBackground = ContextCompat.getColor(context, R.color.key_bg_light),
        keyText = ContextCompat.getColor(context, R.color.key_text_light),
        specialKeyBackground = ContextCompat.getColor(context, R.color.key_special_bg_light),
        keyPressedBackground = ContextCompat.getColor(context, R.color.key_pressed_light),
        keyShadow = ContextCompat.getColor(context, R.color.key_shadow_light),
        brandPrimary = ContextCompat.getColor(context, R.color.brand_primary),
        brandPrimaryDark = ContextCompat.getColor(context, R.color.brand_primary_dark),
        brandPrimaryLight = ContextCompat.getColor(context, R.color.brand_primary_light),
        voiceActive = ContextCompat.getColor(context, R.color.voice_active),
        grammarHighlight = ContextCompat.getColor(context, R.color.grammar_highlight),
        suggestionBackground = ContextCompat.getColor(context, R.color.suggestion_bg),
        divider = ContextCompat.getColor(context, R.color.divider_light)
    )

    private fun darkColors(context: Context) = KeyboardColors(
        keyboardBackground = ContextCompat.getColor(context, R.color.keyboard_bg_dark),
        keyBackground = ContextCompat.getColor(context, R.color.key_bg_dark),
        keyText = ContextCompat.getColor(context, R.color.key_text_dark),
        specialKeyBackground = ContextCompat.getColor(context, R.color.key_special_bg_dark),
        keyPressedBackground = ContextCompat.getColor(context, R.color.key_pressed_dark),
        keyShadow = ContextCompat.getColor(context, R.color.key_shadow_dark),
        brandPrimary = ContextCompat.getColor(context, R.color.brand_primary),
        brandPrimaryDark = ContextCompat.getColor(context, R.color.brand_primary_dark),
        brandPrimaryLight = ContextCompat.getColor(context, R.color.brand_primary_light),
        voiceActive = ContextCompat.getColor(context, R.color.voice_active),
        grammarHighlight = ContextCompat.getColor(context, R.color.grammar_highlight),
        suggestionBackground = ContextCompat.getColor(context, R.color.suggestion_bg_dark),
        divider = ContextCompat.getColor(context, R.color.divider_dark)
    )

    // Key dimension constants (in dp) — minimum 48dp touch targets per Material guidelines
    const val KEY_HEIGHT_DP = 52
    const val KEY_MARGIN_DP = 3
    const val KEY_CORNER_RADIUS_DP = 8
    const val KEY_TEXT_SIZE_SP = 20f
    const val SPECIAL_KEY_TEXT_SIZE_SP = 14f
    const val ICON_SIZE_DP = 22
    const val TOOLBAR_HEIGHT_DP = 44
    const val KEY_SHADOW_OFFSET_DP = 1
    const val KEY_PRESS_ELEVATION_DP = 0
    const val KEYBOARD_PADDING_DP = 4
}
