import Foundation
import Speech
import AVFoundation

protocol VoiceEngineDelegate: AnyObject {
    func voiceEngine(_ engine: VoiceEngine, didRecognize text: String, isFinal: Bool)
    func voiceEngine(_ engine: VoiceEngine, didFailWith error: String)
    func voiceEngineDidStop(_ engine: VoiceEngine)
}

/// Handles speech recognition using Apple's Speech framework.
/// Works entirely on-device when possible (iOS 17+), no data leaves the phone.
class VoiceEngine {

    weak var delegate: VoiceEngineDelegate?
    private(set) var isListening = false

    private var speechRecognizer: SFSpeechRecognizer?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()

    init(delegate: VoiceEngineDelegate?) {
        self.delegate = delegate
    }

    // MARK: - Authorization

    func requestAuthorization(completion: @escaping (Bool) -> Void) {
        SFSpeechRecognizer.requestAuthorization { status in
            DispatchQueue.main.async {
                completion(status == .authorized)
            }
        }
    }

    // MARK: - Start Listening

    func startListening(language: String = "en-NZ") {
        guard !isListening else { return }

        // Check authorization
        guard SFSpeechRecognizer.authorizationStatus() == .authorized else {
            requestAuthorization { [weak self] authorized in
                if authorized {
                    self?.startListening(language: language)
                } else {
                    self?.delegate?.voiceEngine(self!, didFailWith: "Speech recognition not authorised. Enable it in Settings > Privacy > Speech Recognition.")
                }
            }
            return
        }

        // Setup recogniser
        let locale = Locale(identifier: language)
        speechRecognizer = SFSpeechRecognizer(locale: locale)

        guard let recognizer = speechRecognizer, recognizer.isAvailable else {
            delegate?.voiceEngine(self, didFailWith: "Speech recognition is not available for this language.")
            return
        }

        // Prefer on-device recognition for privacy (iOS 13+)
        if recognizer.supportsOnDeviceRecognition {
            recognizer.defaultTaskHint = .dictation
        }

        // Setup audio session
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            delegate?.voiceEngine(self, didFailWith: "Could not start audio session: \(error.localizedDescription)")
            return
        }

        // Create recognition request
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let request = recognitionRequest else {
            delegate?.voiceEngine(self, didFailWith: "Could not create recognition request.")
            return
        }

        request.shouldReportPartialResults = true

        // Use on-device recognition when available
        if #available(iOS 13, *) {
            request.requiresOnDeviceRecognition = recognizer.supportsOnDeviceRecognition
        }

        // Start recognition task
        recognitionTask = recognizer.recognitionTask(with: request) { [weak self] result, error in
            guard let self = self else { return }

            if let result = result {
                let text = result.bestTranscription.formattedString
                let isFinal = result.isFinal
                self.delegate?.voiceEngine(self, didRecognize: text, isFinal: isFinal)

                if isFinal {
                    self.stopListening()
                }
            }

            if let error = error {
                // Don't report cancellation as an error
                let nsError = error as NSError
                if nsError.domain == "kAFAssistantErrorDomain" && nsError.code == 216 {
                    // User cancelled — not an error
                    return
                }
                self.delegate?.voiceEngine(self, didFailWith: error.localizedDescription)
                self.stopListening()
            }
        }

        // Setup audio input
        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)

        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { [weak self] buffer, _ in
            self?.recognitionRequest?.append(buffer)
        }

        do {
            audioEngine.prepare()
            try audioEngine.start()
            isListening = true
        } catch {
            delegate?.voiceEngine(self, didFailWith: "Could not start audio engine: \(error.localizedDescription)")
            stopListening()
        }
    }

    // MARK: - Stop Listening

    func stopListening() {
        guard isListening else { return }

        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()

        recognitionRequest = nil
        recognitionTask = nil
        isListening = false

        // Deactivate audio session
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)

        delegate?.voiceEngineDidStop(self)
    }
}
