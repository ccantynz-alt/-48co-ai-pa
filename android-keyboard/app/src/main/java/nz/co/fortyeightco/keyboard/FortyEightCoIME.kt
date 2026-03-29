package nz.co.fortyeightco.keyboard

import android.inputmethodservice.InputMethodService
import android.view.View
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputConnection

/**
 * 48co Voice InputMethodService — the system-level keyboard.
 * This service runs when the user selects "48co Voice" as their keyboard
 * in Android Settings > System > Languages & input > On-screen keyboard.
 *
 * It creates a KeyboardView for text input and integrates voice-to-text
 * and grammar checking.
 */
class FortyEightCoIME : InputMethodService(), KeyboardView.KeyboardActionListener {

    private lateinit var keyboardView: KeyboardView
    private var voiceEngine: VoiceEngine? = null
    private var isVoiceActive = false

    // MARK: - Lifecycle

    override fun onCreateInputView(): View {
        keyboardView = KeyboardView(this).apply {
            listener = this@FortyEightCoIME
        }

        voiceEngine = VoiceEngine(this).apply {
            onResult = { text, isFinal ->
                if (isFinal && text.isNotBlank()) {
                    currentInputConnection?.commitText(text + " ", 1)
                }
            }
            onError = { error ->
                isVoiceActive = false
                keyboardView.setVoiceActive(false)
            }
            onStopped = {
                isVoiceActive = false
                keyboardView.setVoiceActive(false)
            }
        }

        return keyboardView
    }

    override fun onStartInputView(info: EditorInfo?, restarting: Boolean) {
        super.onStartInputView(info, restarting)
        // Adjust keyboard based on input type
        info?.let { editorInfo ->
            val inputType = editorInfo.inputType and android.text.InputType.TYPE_MASK_CLASS
            when (inputType) {
                android.text.InputType.TYPE_CLASS_NUMBER,
                android.text.InputType.TYPE_CLASS_PHONE -> {
                    keyboardView.switchToNumbers()
                }
                android.text.InputType.TYPE_CLASS_TEXT -> {
                    keyboardView.switchToLetters()
                    // Auto-capitalise at start of field
                    keyboardView.setShifted(true)
                }
                else -> {
                    keyboardView.switchToLetters()
                }
            }
        }
    }

    override fun onFinishInputView(finishingInput: Boolean) {
        super.onFinishInputView(finishingInput)
        if (isVoiceActive) {
            voiceEngine?.stopListening()
            isVoiceActive = false
        }
    }

    // MARK: - KeyboardActionListener

    override fun onKeyPress(char: Char) {
        currentInputConnection?.commitText(char.toString(), 1)

        // Auto-unshift after typing a letter (unless caps lock)
        if (char.isLetter() && keyboardView.isShifted && !keyboardView.isCapsLock) {
            keyboardView.setShifted(false)
        }
    }

    override fun onDelete() {
        val ic = currentInputConnection ?: return
        val selected = ic.getSelectedText(0)
        if (selected != null && selected.isNotEmpty()) {
            // Delete selected text
            ic.commitText("", 1)
        } else {
            ic.deleteSurroundingText(1, 0)
        }
    }

    override fun onSpace() {
        val ic = currentInputConnection ?: return

        // Double-space → period + space (like iOS)
        val before = ic.getTextBeforeCursor(2, 0)?.toString() ?: ""
        if (before == "  ") {
            ic.deleteSurroundingText(2, 0)
            ic.commitText(". ", 1)
            keyboardView.setShifted(true)
            return
        }

        ic.commitText(" ", 1)

        // Auto-capitalise after sentence-ending punctuation
        val context = ic.getTextBeforeCursor(3, 0)?.toString() ?: ""
        if (context.endsWith(". ") || context.endsWith("? ") || context.endsWith("! ")) {
            keyboardView.setShifted(true)
        }
    }

    override fun onReturn() {
        val ic = currentInputConnection ?: return
        val editorInfo = currentInputEditorInfo

        // Check if the editor wants an action (like Send) instead of newline
        val imeOptions = editorInfo?.imeOptions ?: 0
        val actionId = imeOptions and EditorInfo.IME_MASK_ACTION

        when {
            imeOptions and EditorInfo.IME_FLAG_NO_ENTER_ACTION != 0 -> {
                // Multi-line field — insert newline
                ic.commitText("\n", 1)
            }
            actionId == EditorInfo.IME_ACTION_SEND ||
            actionId == EditorInfo.IME_ACTION_SEARCH ||
            actionId == EditorInfo.IME_ACTION_GO -> {
                // Perform the editor action
                ic.performEditorAction(actionId)
            }
            else -> {
                ic.commitText("\n", 1)
                keyboardView.setShifted(true)
            }
        }
    }

    override fun onVoice() {
        if (isVoiceActive) {
            voiceEngine?.stopListening()
            isVoiceActive = false
            keyboardView.setVoiceActive(false)
        } else {
            voiceEngine?.startListening("en-NZ")
            isVoiceActive = true
            keyboardView.setVoiceActive(true)
        }
    }

    override fun onGrammarCheck() {
        val ic = currentInputConnection ?: return
        // Get the current text (up to 3000 chars)
        val text = ic.getTextBeforeCursor(3000, 0)?.toString() ?: return
        if (text.length < 5) return

        val corrections = GrammarEngine.check(text)
        if (corrections.isEmpty()) return

        // Apply the first correction automatically
        val correction = corrections.first()
        val idx = text.lastIndexOf(correction.original)
        if (idx >= 0) {
            val charsAfter = text.length - idx - correction.original.length
            ic.deleteSurroundingText(text.length - idx, charsAfter)
            ic.commitText(correction.corrected, 1)
            // Re-insert the text that was after the correction
            if (charsAfter > 0) {
                val after = text.substring(idx + correction.original.length)
                ic.commitText(after, 1)
            }
        }
    }

    override fun onSwitchKeyboard() {
        switchToNextInputMethod(false)
    }
}
