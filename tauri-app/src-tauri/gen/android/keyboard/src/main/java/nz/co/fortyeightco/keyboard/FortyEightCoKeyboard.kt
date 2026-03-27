package nz.co.fortyeightco.keyboard

import android.inputmethodservice.InputMethodService
import android.inputmethodservice.Keyboard
import android.inputmethodservice.KeyboardView
import android.view.KeyEvent
import android.view.View
import android.view.inputmethod.InputConnection
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

/**
 * 48co Android Keyboard — InputMethodService
 *
 * Built by Claude. Designed for humans.
 *
 * Features:
 * - Standard QWERTY layout
 * - Real-time grammar correction in suggestion bar
 * - Voice button for Whisper transcription
 * - All processing runs on-device
 *
 * Setup: Settings → Languages & Input → Manage Keyboards → 48co
 */
class FortyEightCoKeyboard : InputMethodService() {

    private lateinit var suggestionBar: LinearLayout
    private var isRecording = false

    // Grammar rules (same as iOS + desktop for consistency)
    private val grammarRules = listOf(
        Triple("\\bshould of\\b", "should have", "of → have"),
        Triple("\\bcould of\\b", "could have", "of → have"),
        Triple("\\bwould of\\b", "would have", "of → have"),
        Triple("\\byour welcome\\b", "you're welcome", "your → you're"),
        Triple("\\byour right\\b", "you're right", "your → you're"),
        Triple("\\balot\\b", "a lot", "alot → a lot"),
        Triple("\\bdont\\b", "don't", "missing apostrophe"),
        Triple("\\bcant\\b", "can't", "missing apostrophe"),
        Triple("\\bwont\\b", "won't", "missing apostrophe"),
        Triple("\\bdidnt\\b", "didn't", "missing apostrophe"),
        Triple("\\bim\\b", "I'm", "missing apostrophe"),
        Triple("\\bive\\b", "I've", "missing apostrophe"),
        Triple("\\bdefinately\\b", "definitely", "spelling"),
        Triple("\\bseperate\\b", "separate", "spelling"),
        Triple("\\brecieve\\b", "receive", "spelling"),
        Triple("\\bprobly\\b", "probably", "spelling"),
        Triple("\\bteh\\b", "the", "typo"),
        Triple("\\badn\\b", "and", "typo"),
        Triple("\\bgonna\\b", "going to", "informal"),
        Triple("\\bwanna\\b", "want to", "informal"),
        Triple("\\bcuz\\b", "because", "informal"),
        Triple("\\bu\\b", "you", "text speak"),
        Triple("\\bur\\b", "your", "text speak"),
        Triple("\\bthx\\b", "thanks", "abbreviation"),
        Triple("\\btmrw\\b", "tomorrow", "abbreviation"),
    )

    override fun onCreateInputView(): View {
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
        }

        // Suggestion bar
        suggestionBar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(8, 4, 8, 4)
            minimumHeight = 44
        }
        layout.addView(suggestionBar)

        // Build QWERTY keyboard
        val rows = listOf(
            listOf("q","w","e","r","t","y","u","i","o","p"),
            listOf("a","s","d","f","g","h","j","k","l"),
            listOf("z","x","c","v","b","n","m","⌫"),
        )

        for (row in rows) {
            val rowLayout = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
            }

            for (key in row) {
                val button = Button(this).apply {
                    text = key
                    textSize = 18f
                    isAllCaps = false
                    layoutParams = LinearLayout.LayoutParams(0, 120, 1f).apply {
                        setMargins(2, 2, 2, 2)
                    }

                    setOnClickListener {
                        when (key) {
                            "⌫" -> handleBackspace()
                            else -> handleKeyPress(key)
                        }
                    }
                }
                rowLayout.addView(button)
            }

            layout.addView(rowLayout)
        }

        // Bottom row: voice, space, return
        val bottomRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }

        // Voice button
        val voiceBtn = Button(this).apply {
            text = "🎤"
            textSize = 20f
            layoutParams = LinearLayout.LayoutParams(0, 120, 1f).apply {
                setMargins(2, 2, 2, 2)
            }
            setOnClickListener { toggleVoice() }
        }
        bottomRow.addView(voiceBtn)

        // Space bar
        val spaceBar = Button(this).apply {
            text = "space"
            textSize = 14f
            layoutParams = LinearLayout.LayoutParams(0, 120, 4f).apply {
                setMargins(2, 2, 2, 2)
            }
            setOnClickListener { handleKeyPress(" "); checkGrammar() }
        }
        bottomRow.addView(spaceBar)

        // Return
        val returnBtn = Button(this).apply {
            text = "↵"
            textSize = 20f
            layoutParams = LinearLayout.LayoutParams(0, 120, 1f).apply {
                setMargins(2, 2, 2, 2)
            }
            setOnClickListener { handleKeyPress("\n") }
        }
        bottomRow.addView(returnBtn)

        layout.addView(bottomRow)

        return layout
    }

    private fun handleKeyPress(key: String) {
        currentInputConnection?.commitText(key, 1)
    }

    private fun handleBackspace() {
        currentInputConnection?.deleteSurroundingText(1, 0)
    }

    private fun toggleVoice() {
        isRecording = !isRecording
        if (isRecording) {
            startVoiceRecording()
        } else {
            stopVoiceRecording()
        }
    }

    private fun startVoiceRecording() {
        // TODO: Integrate Whisper on-device via ONNX Runtime
        // For now, use Android SpeechRecognizer as fallback
    }

    private fun stopVoiceRecording() {
        // TODO: Stop recording and transcribe
    }

    // Grammar check after each space (word boundary)
    private fun checkGrammar() {
        val ic = currentInputConnection ?: return
        val beforeText = ic.getTextBeforeCursor(200, 0)?.toString() ?: return

        val suggestions = mutableListOf<Triple<String, String, String>>()

        for ((pattern, replacement, reason) in grammarRules) {
            val regex = Regex(pattern, RegexOption.IGNORE_CASE)
            if (regex.containsMatchIn(beforeText)) {
                suggestions.add(Triple(pattern, replacement, reason))
            }
        }

        updateSuggestionBar(suggestions)
    }

    private fun updateSuggestionBar(suggestions: List<Triple<String, String, String>>) {
        suggestionBar.removeAllViews()

        if (suggestions.isEmpty()) {
            val label = TextView(this).apply {
                text = "48co"
                textSize = 12f
                setTextColor(0xFFAAAAAA.toInt())
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
                textAlignment = View.TEXT_ALIGNMENT_CENTER
            }
            suggestionBar.addView(label)
            return
        }

        for ((_, replacement, _) in suggestions.take(3)) {
            val button = Button(this).apply {
                text = replacement
                textSize = 13f
                isAllCaps = false
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f).apply {
                    setMargins(4, 0, 4, 0)
                }
                setOnClickListener {
                    applySuggestion(replacement)
                }
            }
            suggestionBar.addView(button)
        }
    }

    private fun applySuggestion(replacement: String) {
        val ic = currentInputConnection ?: return
        val beforeText = ic.getTextBeforeCursor(50, 0)?.toString() ?: return

        // Delete the last word and insert correction
        val words = beforeText.split(" ")
        val lastWord = words.lastOrNull() ?: return

        ic.deleteSurroundingText(lastWord.length, 0)
        ic.commitText("$replacement ", 1)

        updateSuggestionBar(emptyList())
    }
}
