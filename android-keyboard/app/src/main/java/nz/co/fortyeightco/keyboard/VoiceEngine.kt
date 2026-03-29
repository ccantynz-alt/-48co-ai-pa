package nz.co.fortyeightco.keyboard

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import androidx.core.content.ContextCompat

/**
 * Voice-to-text engine for 48co Voice Keyboard.
 * Uses Android's built-in SpeechRecognizer for on-device or cloud speech recognition.
 * Streams partial results so words appear as the user speaks.
 */
class VoiceEngine(private val context: Context) {

    interface Listener {
        fun onPartialResult(text: String)
        fun onFinalResult(text: String)
        fun onListeningStarted()
        fun onListeningStopped()
        fun onError(message: String)
    }

    private var speechRecognizer: SpeechRecognizer? = null
    private var listener: Listener? = null
    private var isListening = false

    val isActive: Boolean get() = isListening

    fun setListener(listener: Listener) {
        this.listener = listener
    }

    fun hasPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            context, Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED
    }

    fun isAvailable(): Boolean {
        return SpeechRecognizer.isRecognitionAvailable(context)
    }

    fun startListening() {
        if (isListening) {
            stopListening()
            return
        }

        if (!hasPermission()) {
            listener?.onError("Microphone permission required")
            return
        }

        if (!isAvailable()) {
            listener?.onError("Speech recognition not available on this device")
            return
        }

        try {
            speechRecognizer?.destroy()
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context).apply {
                setRecognitionListener(recognitionListener)
            }

            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-NZ")
                putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
                // Keep listening for longer pauses (professionals dictate with pauses)
                putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 3000L)
                putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 2000L)
                putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 5000L)
            }

            speechRecognizer?.startListening(intent)
            isListening = true
            listener?.onListeningStarted()
        } catch (e: Exception) {
            isListening = false
            listener?.onError("Failed to start voice input: ${e.localizedMessage}")
        }
    }

    fun stopListening() {
        try {
            speechRecognizer?.stopListening()
        } catch (_: Exception) {
            // Ignore — might already be stopped
        }
        isListening = false
        listener?.onListeningStopped()
    }

    fun destroy() {
        stopListening()
        try {
            speechRecognizer?.destroy()
        } catch (_: Exception) {
            // Ignore
        }
        speechRecognizer = null
        listener = null
    }

    private val recognitionListener = object : RecognitionListener {
        override fun onReadyForSpeech(params: Bundle?) {
            // Already notified via onListeningStarted
        }

        override fun onBeginningOfSpeech() {
            // User started speaking
        }

        override fun onRmsChanged(rmsdB: Float) {
            // Could use this for visual feedback (volume meter)
        }

        override fun onBufferReceived(buffer: ByteArray?) {
            // Raw audio buffer — unused
        }

        override fun onEndOfSpeech() {
            // User stopped speaking, waiting for final result
        }

        override fun onError(error: Int) {
            isListening = false
            val message = when (error) {
                SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
                SpeechRecognizer.ERROR_CLIENT -> "Client-side error"
                SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Microphone permission required"
                SpeechRecognizer.ERROR_NETWORK -> "Network error — check your connection"
                SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout"
                SpeechRecognizer.ERROR_NO_MATCH -> "No speech detected — try again"
                SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Recognizer busy — try again"
                SpeechRecognizer.ERROR_SERVER -> "Server error"
                SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No speech detected — try again"
                else -> "Voice input error"
            }
            listener?.onListeningStopped()
            // Don't report NO_MATCH and SPEECH_TIMEOUT as errors — they're normal
            if (error != SpeechRecognizer.ERROR_NO_MATCH && error != SpeechRecognizer.ERROR_SPEECH_TIMEOUT) {
                listener?.onError(message)
            } else {
                listener?.onListeningStopped()
            }
        }

        override fun onResults(results: Bundle?) {
            isListening = false
            val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            val text = matches?.firstOrNull() ?: ""
            if (text.isNotEmpty()) {
                listener?.onFinalResult(text)
            }
            listener?.onListeningStopped()
        }

        override fun onPartialResults(partialResults: Bundle?) {
            val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            val text = matches?.firstOrNull() ?: ""
            if (text.isNotEmpty()) {
                listener?.onPartialResult(text)
            }
        }

        override fun onEvent(eventType: Int, params: Bundle?) {
            // Reserved for future use
        }
    }
}
