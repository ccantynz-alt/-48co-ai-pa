package nz.co.fortyeightco.keyboard

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.*
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.AttributeSet
import android.view.HapticFeedbackConstants
import android.view.MotionEvent
import android.view.View
import android.view.animation.AccelerateDecelerateInterpolator
import kotlin.math.max
import kotlin.math.min

/**
 * Custom keyboard view for 48co Voice Keyboard.
 * Full QWERTY layout with number row, symbols, voice, and grammar buttons.
 * Material 3 styling with light/dark theme support and key press animations.
 */
class KeyboardView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    // --- Listener interface ---
    interface KeyboardActionListener {
        fun onKeyPress(char: Char)
        fun onDelete()
        fun onEnter()
        fun onSpace()
        fun onShift()
        fun onSymbolToggle()
        fun onVoiceInput()
        fun onGrammarCheck()
        fun onSwitchKeyboard()
    }

    var listener: KeyboardActionListener? = null

    // --- Layout modes ---
    enum class LayoutMode { LETTERS, SYMBOLS_1, SYMBOLS_2 }

    private var layoutMode = LayoutMode.LETTERS
    private var isShifted = false
    private var isCapsLock = false
    private var isVoiceActive = false

    // --- Theme ---
    private var colors = KeyboardTheme.getColors(context)

    // --- Paints ---
    private val keyPaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val keyTextPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        textAlign = Paint.Align.CENTER
        typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
    }
    private val iconPaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val shadowPaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val toolbarPaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val toolbarTextPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        textAlign = Paint.Align.CENTER
        typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
    }

    // --- Key data ---
    data class Key(
        val label: String,
        val code: Int,        // -1=shift, -2=delete, -3=enter, -4=space, -5=symbols, -6=voice, -7=grammar, -8=switch, -9=symbols2
        val widthWeight: Float = 1f,
        val isSpecial: Boolean = false,
        val isBrand: Boolean = false
    )

    // --- Computed key rects ---
    private data class KeyRect(
        val key: Key,
        val rect: RectF,
        var isPressed: Boolean = false,
        var pressAnimProgress: Float = 0f
    )

    private var keyRects = mutableListOf<KeyRect>()

    // --- Dimensions in pixels ---
    private val density = context.resources.displayMetrics.density
    private val keyHeight = (KeyboardTheme.KEY_HEIGHT_DP * density).toInt()
    private val keyMargin = (KeyboardTheme.KEY_MARGIN_DP * density)
    private val keyCornerRadius = KeyboardTheme.KEY_CORNER_RADIUS_DP * density
    private val toolbarHeight = (KeyboardTheme.TOOLBAR_HEIGHT_DP * density).toInt()
    private val keyboardPadding = KeyboardTheme.KEYBOARD_PADDING_DP * density
    private val shadowOffset = KeyboardTheme.KEY_SHADOW_OFFSET_DP * density

    // --- Layouts ---
    private val letterRows = listOf(
        listOf(Key("q", 'q'.code), Key("w", 'w'.code), Key("e", 'e'.code), Key("r", 'r'.code), Key("t", 't'.code), Key("y", 'y'.code), Key("u", 'u'.code), Key("i", 'i'.code), Key("o", 'o'.code), Key("p", 'p'.code)),
        listOf(Key("a", 'a'.code), Key("s", 's'.code), Key("d", 'd'.code), Key("f", 'f'.code), Key("g", 'g'.code), Key("h", 'h'.code), Key("j", 'j'.code), Key("k", 'k'.code), Key("l", 'l'.code)),
        listOf(Key("\u21E7", -1, 1.5f, isSpecial = true), Key("z", 'z'.code), Key("x", 'x'.code), Key("c", 'c'.code), Key("v", 'v'.code), Key("b", 'b'.code), Key("n", 'n'.code), Key("m", 'm'.code), Key("\u232B", -2, 1.5f, isSpecial = true)),
        listOf(Key("123", -5, 1.2f, isSpecial = true), Key("\uD83C\uDF10", -8, 1f, isSpecial = true), Key("\uD83C\uDFA4", -6, 1f, isBrand = true), Key("space", -4, 4f), Key(".", '.'.code, 1f), Key("\u21B5", -3, 1.8f, isBrand = true))
    )

    private val numberRow = listOf(
        Key("1", '1'.code), Key("2", '2'.code), Key("3", '3'.code), Key("4", '4'.code), Key("5", '5'.code),
        Key("6", '6'.code), Key("7", '7'.code), Key("8", '8'.code), Key("9", '9'.code), Key("0", '0'.code)
    )

    private val symbolRows1 = listOf(
        listOf(Key("1", '1'.code), Key("2", '2'.code), Key("3", '3'.code), Key("4", '4'.code), Key("5", '5'.code), Key("6", '6'.code), Key("7", '7'.code), Key("8", '8'.code), Key("9", '9'.code), Key("0", '0'.code)),
        listOf(Key("@", '@'.code), Key("#", '#'.code), Key("$", '$'.code), Key("%", '%'.code), Key("&", '&'.code), Key("-", '-'.code), Key("+", '+'.code), Key("(", '('.code), Key(")", ')'.code)),
        listOf(Key("=\\<", -9, 1.5f, isSpecial = true), Key("*", '*'.code), Key("\"", '"'.code), Key("'", '\''.code), Key(":", ':'.code), Key(";", ';'.code), Key("!", '!'.code), Key("?", '?'.code), Key("\u232B", -2, 1.5f, isSpecial = true)),
        listOf(Key("ABC", -5, 1.2f, isSpecial = true), Key(",", ','.code, 1f), Key("\uD83C\uDFA4", -6, 1f, isBrand = true), Key("space", -4, 4f), Key(".", '.'.code, 1f), Key("\u21B5", -3, 1.8f, isBrand = true))
    )

    private val symbolRows2 = listOf(
        listOf(Key("~", '~'.code), Key("`", '`'.code), Key("|", '|'.code), Key("\u2022", '\u2022'.code), Key("\u221A", '\u221A'.code), Key("\u03C0", '\u03C0'.code), Key("\u00F7", '\u00F7'.code), Key("\u00D7", '\u00D7'.code), Key("\u00B6", '\u00B6'.code), Key("\u0394", '\u0394'.code)),
        listOf(Key("\u00A3", '\u00A3'.code), Key("\u00A2", '\u00A2'.code), Key("\u20AC", '\u20AC'.code), Key("\u00A5", '\u00A5'.code), Key("^", '^'.code), Key("\u00B0", '\u00B0'.code), Key("=", '='.code), Key("{", '{'.code), Key("}", '}'.code)),
        listOf(Key("123", -5, 1.5f, isSpecial = true), Key("\\", '\\'.code), Key("\u00A9", '\u00A9'.code), Key("\u00AE", '\u00AE'.code), Key("\u2122", '\u2122'.code), Key("\u2030", '\u2030'.code), Key("[", '['.code), Key("]", ']'.code), Key("\u232B", -2, 1.5f, isSpecial = true)),
        listOf(Key("ABC", -5, 1.2f, isSpecial = true), Key("<", '<'.code, 1f), Key("\uD83C\uDFA4", -6, 1f, isBrand = true), Key("space", -4, 4f), Key(">", '>'.code, 1f), Key("\u21B5", -3, 1.8f, isBrand = true))
    )

    // --- Suggestion bar ---
    private var suggestions: List<String> = emptyList()
    var grammarButtonVisible = true

    fun setSuggestions(items: List<String>) {
        suggestions = items
        invalidate()
    }

    fun setVoiceActive(active: Boolean) {
        isVoiceActive = active
        invalidate()
    }

    fun setShiftState(shifted: Boolean, capsLock: Boolean) {
        isShifted = shifted
        isCapsLock = capsLock
        buildKeyLayout()
        invalidate()
    }

    fun getShiftState(): Boolean = isShifted
    fun getCapsLockState(): Boolean = isCapsLock

    fun toggleShift() {
        if (isCapsLock) {
            isCapsLock = false
            isShifted = false
        } else if (isShifted) {
            isCapsLock = true
        } else {
            isShifted = true
        }
        buildKeyLayout()
        invalidate()
    }

    fun toggleSymbols() {
        layoutMode = when (layoutMode) {
            LayoutMode.LETTERS -> LayoutMode.SYMBOLS_1
            LayoutMode.SYMBOLS_1 -> LayoutMode.LETTERS
            LayoutMode.SYMBOLS_2 -> LayoutMode.LETTERS
        }
        buildKeyLayout()
        invalidate()
    }

    fun toggleSymbols2() {
        layoutMode = when (layoutMode) {
            LayoutMode.SYMBOLS_2 -> LayoutMode.SYMBOLS_1
            else -> LayoutMode.SYMBOLS_2
        }
        buildKeyLayout()
        invalidate()
    }

    // --- Measure ---
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val width = MeasureSpec.getSize(widthMeasureSpec)
        val rows = getCurrentRows()
        val totalRows = rows.size + if (layoutMode == LayoutMode.LETTERS) 1 else 0 // +1 for number row
        val totalHeight = toolbarHeight + (totalRows * (keyHeight + (keyMargin * 2).toInt())) + (keyboardPadding * 2).toInt()
        setMeasuredDimension(width, totalHeight)
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        colors = KeyboardTheme.getColors(context)
        buildKeyLayout()
    }

    private fun getCurrentRows(): List<List<Key>> {
        return when (layoutMode) {
            LayoutMode.LETTERS -> letterRows
            LayoutMode.SYMBOLS_1 -> symbolRows1
            LayoutMode.SYMBOLS_2 -> symbolRows2
        }
    }

    private fun buildKeyLayout() {
        keyRects.clear()
        if (width <= 0) return

        val rows = getCurrentRows()
        val allRows = if (layoutMode == LayoutMode.LETTERS) listOf(numberRow) + rows else rows

        var yOffset = toolbarHeight + keyboardPadding

        for (row in allRows) {
            val totalWeight = row.sumOf { it.widthWeight.toDouble() }.toFloat()
            val availableWidth = width - (keyboardPadding * 2)
            val unitWidth = availableWidth / totalWeight

            var xOffset = keyboardPadding

            for (key in row) {
                val keyWidth = unitWidth * key.widthWeight
                val rect = RectF(
                    xOffset + keyMargin,
                    yOffset + keyMargin,
                    xOffset + keyWidth - keyMargin,
                    yOffset + keyHeight - keyMargin
                )
                keyRects.add(KeyRect(key, rect))
                xOffset += keyWidth
            }
            yOffset += keyHeight
        }
    }

    // --- Drawing ---
    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        drawBackground(canvas)
        drawToolbar(canvas)
        drawKeys(canvas)
    }

    private fun drawBackground(canvas: Canvas) {
        canvas.drawColor(colors.keyboardBackground)
    }

    private fun drawToolbar(canvas: Canvas) {
        // Toolbar background
        toolbarPaint.color = colors.keyboardBackground
        canvas.drawRect(0f, 0f, width.toFloat(), toolbarHeight.toFloat(), toolbarPaint)

        // Divider line
        toolbarPaint.color = colors.divider
        canvas.drawRect(0f, toolbarHeight - density, width.toFloat(), toolbarHeight.toFloat(), toolbarPaint)

        // Grammar check button on the left
        if (grammarButtonVisible) {
            toolbarTextPaint.textSize = 13f * density
            toolbarTextPaint.color = colors.brandPrimary
            val grammarX = 60f * density
            val grammarY = toolbarHeight / 2f + toolbarTextPaint.textSize / 3f
            canvas.drawText("Aa\u2713", grammarX, grammarY, toolbarTextPaint)
        }

        // Suggestions in the middle
        if (suggestions.isNotEmpty()) {
            toolbarTextPaint.textSize = 14f * density
            toolbarTextPaint.color = colors.keyText
            val spacing = width / (suggestions.size + 1).toFloat()
            suggestions.forEachIndexed { i, suggestion ->
                val x = spacing * (i + 1)
                val y = toolbarHeight / 2f + toolbarTextPaint.textSize / 3f
                canvas.drawText(suggestion, x, y, toolbarTextPaint)
            }
        }

        // Brand label on the right
        toolbarTextPaint.textSize = 11f * density
        toolbarTextPaint.color = colors.brandPrimaryLight
        val brandX = width - 40f * density
        val brandY = toolbarHeight / 2f + toolbarTextPaint.textSize / 3f
        canvas.drawText("48co", brandX, brandY, toolbarTextPaint)
    }

    private fun drawKeys(canvas: Canvas) {
        for (kr in keyRects) {
            drawSingleKey(canvas, kr)
        }
    }

    private fun drawSingleKey(canvas: Canvas, kr: KeyRect) {
        val key = kr.key
        val rect = kr.rect
        val isPressed = kr.isPressed

        // Key shadow (below the key, simulates depth)
        if (!isPressed) {
            shadowPaint.color = colors.keyShadow
            val shadowRect = RectF(rect.left, rect.top + shadowOffset, rect.right, rect.bottom + shadowOffset)
            canvas.drawRoundRect(shadowRect, keyCornerRadius, keyCornerRadius, shadowPaint)
        }

        // Key background
        val bgColor = when {
            isPressed -> colors.keyPressedBackground
            key.isBrand -> colors.brandPrimary
            key.isSpecial -> colors.specialKeyBackground
            else -> colors.keyBackground
        }
        keyPaint.color = bgColor
        val drawRect = if (isPressed) {
            RectF(rect.left, rect.top + shadowOffset, rect.right, rect.bottom + shadowOffset)
        } else {
            rect
        }
        canvas.drawRoundRect(drawRect, keyCornerRadius, keyCornerRadius, keyPaint)

        // Key label
        val textColor = when {
            key.isBrand -> Color.WHITE
            key.isSpecial && key.code == -1 && (isShifted || isCapsLock) -> colors.brandPrimary
            else -> colors.keyText
        }
        keyTextPaint.color = textColor

        val label = getDisplayLabel(key)
        val textSize = if (key.isSpecial || key.code == -4) {
            KeyboardTheme.SPECIAL_KEY_TEXT_SIZE_SP * density
        } else {
            KeyboardTheme.KEY_TEXT_SIZE_SP * density
        }
        keyTextPaint.textSize = textSize

        // For voice button, show mic icon differently when active
        if (key.code == -6 && isVoiceActive) {
            keyPaint.color = colors.voiceActive
            canvas.drawRoundRect(drawRect, keyCornerRadius, keyCornerRadius, keyPaint)
            keyTextPaint.color = Color.WHITE
        }

        val textY = drawRect.centerY() + textSize / 3f
        canvas.drawText(label, drawRect.centerX(), textY, keyTextPaint)

        // Caps lock indicator
        if (key.code == -1 && isCapsLock) {
            val indicatorPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = colors.brandPrimary
            }
            canvas.drawCircle(drawRect.right - 8 * density, drawRect.top + 8 * density, 3 * density, indicatorPaint)
        }
    }

    private fun getDisplayLabel(key: Key): String {
        return when (key.code) {
            -4 -> "space"
            -6 -> if (isVoiceActive) "\u23F9" else "\uD83C\uDFA4" // stop vs mic
            -1 -> if (isCapsLock) "\u21E7" else if (isShifted) "\u21E7" else "\u21E7" // shift arrow
            else -> {
                if (layoutMode == LayoutMode.LETTERS && key.code > 0 && (isShifted || isCapsLock)) {
                    key.label.uppercase()
                } else {
                    key.label
                }
            }
        }
    }

    // --- Touch handling ---
    private var pressedKeyIndex = -1
    private var lastShiftTapTime = 0L
    private val DOUBLE_TAP_MS = 300L

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                val idx = findKeyAt(event.x, event.y)
                if (idx >= 0) {
                    pressedKeyIndex = idx
                    keyRects[idx].isPressed = true
                    performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                    invalidate()
                }
                return true
            }
            MotionEvent.ACTION_MOVE -> {
                val idx = findKeyAt(event.x, event.y)
                if (idx != pressedKeyIndex) {
                    if (pressedKeyIndex >= 0 && pressedKeyIndex < keyRects.size) {
                        keyRects[pressedKeyIndex].isPressed = false
                    }
                    pressedKeyIndex = idx
                    if (idx >= 0) {
                        keyRects[idx].isPressed = true
                    }
                    invalidate()
                }
                return true
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                if (pressedKeyIndex >= 0 && pressedKeyIndex < keyRects.size && event.actionMasked == MotionEvent.ACTION_UP) {
                    val key = keyRects[pressedKeyIndex].key
                    handleKeyAction(key)
                    keyRects[pressedKeyIndex].isPressed = false
                } else if (pressedKeyIndex >= 0 && pressedKeyIndex < keyRects.size) {
                    keyRects[pressedKeyIndex].isPressed = false
                }
                pressedKeyIndex = -1
                invalidate()
                return true
            }
        }
        return super.onTouchEvent(event)
    }

    private fun findKeyAt(x: Float, y: Float): Int {
        // Expand touch area slightly for better hit detection
        val touchSlop = 2 * density
        for (i in keyRects.indices) {
            val r = keyRects[i].rect
            if (x >= r.left - touchSlop && x <= r.right + touchSlop &&
                y >= r.top - touchSlop && y <= r.bottom + touchSlop
            ) {
                return i
            }
        }
        return -1
    }

    private fun handleKeyAction(key: Key) {
        when (key.code) {
            -1 -> { // Shift
                val now = System.currentTimeMillis()
                if (now - lastShiftTapTime < DOUBLE_TAP_MS) {
                    // Double-tap = caps lock
                    isCapsLock = true
                    isShifted = true
                    lastShiftTapTime = 0L
                } else {
                    lastShiftTapTime = now
                    if (isCapsLock) {
                        isCapsLock = false
                        isShifted = false
                    } else {
                        isShifted = !isShifted
                    }
                }
                buildKeyLayout()
                invalidate()
                listener?.onShift()
            }
            -2 -> listener?.onDelete()
            -3 -> listener?.onEnter()
            -4 -> listener?.onSpace()
            -5 -> {
                toggleSymbols()
                listener?.onSymbolToggle()
            }
            -6 -> listener?.onVoiceInput()
            -7 -> listener?.onGrammarCheck()
            -8 -> listener?.onSwitchKeyboard()
            -9 -> {
                toggleSymbols2()
            }
            else -> {
                val c = key.code.toChar()
                val output = if (layoutMode == LayoutMode.LETTERS && (isShifted || isCapsLock)) {
                    c.uppercaseChar()
                } else {
                    c
                }
                listener?.onKeyPress(output)
                // Auto-unshift after typing a character (unless caps lock)
                if (isShifted && !isCapsLock && layoutMode == LayoutMode.LETTERS) {
                    isShifted = false
                    buildKeyLayout()
                    invalidate()
                }
            }
        }
    }

    // --- Toolbar touch handling ---
    // The toolbar grammar button area
    fun handleToolbarTouch(x: Float, y: Float): Boolean {
        if (y < toolbarHeight) {
            if (grammarButtonVisible && x < 120 * density) {
                listener?.onGrammarCheck()
                return true
            }
        }
        return false
    }
}
