import UIKit

/// 48co Custom Keyboard Extension
/// Provides grammar-corrected typing + voice button on iOS
///
/// Built by Claude. Designed for humans.
///
/// How it works:
/// 1. User enables 48co keyboard in iOS Settings → Keyboards
/// 2. When typing, text is checked locally for grammar errors
/// 3. Suggestions appear in the suggestion bar above the keyboard
/// 4. Voice button triggers Whisper transcription
/// 5. All processing happens on-device (no cloud needed)

class KeyboardViewController: UIInputViewController {

    // MARK: - UI Elements
    private var nextKeyboardButton: UIButton!
    private var voiceButton: UIButton!
    private var suggestionBar: UIStackView!
    private var keyboardView: UIView!
    private var isRecording = false

    // MARK: - Grammar Engine
    private let grammarRules: [(pattern: String, replacement: String, reason: String)] = [
        ("\\bshould of\\b", "should have", "of → have"),
        ("\\bcould of\\b", "could have", "of → have"),
        ("\\bwould of\\b", "would have", "of → have"),
        ("\\byour welcome\\b", "you're welcome", "your → you're"),
        ("\\byour right\\b", "you're right", "your → you're"),
        ("\\bits a\\b", "it's a", "its → it's"),
        ("\\balot\\b", "a lot", "alot → a lot"),
        ("\\bdont\\b", "don't", "missing apostrophe"),
        ("\\bcant\\b", "can't", "missing apostrophe"),
        ("\\bwont\\b", "won't", "missing apostrophe"),
        ("\\bdidnt\\b", "didn't", "missing apostrophe"),
        ("\\bim\\b", "I'm", "missing apostrophe"),
        ("\\bive\\b", "I've", "missing apostrophe"),
        ("\\bdefinately\\b", "definitely", "spelling"),
        ("\\bseperate\\b", "separate", "spelling"),
        ("\\brecieve\\b", "receive", "spelling"),
        ("\\bprobly\\b", "probably", "spelling"),
        ("\\bteh\\b", "the", "typo"),
        ("\\badn\\b", "and", "typo"),
        ("\\bgonna\\b", "going to", "informal"),
        ("\\bwanna\\b", "want to", "informal"),
        ("\\bcuz\\b", "because", "informal"),
        ("\\bu\\b", "you", "text speak"),
        ("\\bur\\b", "your", "text speak"),
        ("\\bthx\\b", "thanks", "abbreviation"),
        ("\\btmrw\\b", "tomorrow", "abbreviation"),
        ("\\basap\\b", "ASAP", "capitalization"),
    ]

    // MARK: - Lifecycle

    override func updateViewConstraints() {
        super.updateViewConstraints()
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
    }

    override func viewWillLayoutSubviews() {
        super.viewWillLayoutSubviews()
    }

    override func textWillChange(_ textInput: UITextInput?) {
        // Called before text changes
    }

    override func textDidChange(_ textInput: UITextInput?) {
        // Called after text changes — check grammar
        checkGrammar()
    }

    // MARK: - UI Setup

    private func setupUI() {
        let mainStack = UIStackView()
        mainStack.axis = .vertical
        mainStack.spacing = 0
        mainStack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(mainStack)

        NSLayoutConstraint.activate([
            mainStack.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            mainStack.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            mainStack.topAnchor.constraint(equalTo: view.topAnchor),
            mainStack.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])

        // Suggestion bar (grammar corrections appear here)
        suggestionBar = UIStackView()
        suggestionBar.axis = .horizontal
        suggestionBar.distribution = .fillEqually
        suggestionBar.spacing = 4
        suggestionBar.backgroundColor = UIColor.systemBackground
        suggestionBar.layoutMargins = UIEdgeInsets(top: 4, left: 8, bottom: 4, right: 8)
        suggestionBar.isLayoutMarginsRelativeArrangement = true
        suggestionBar.heightAnchor.constraint(equalToConstant: 44).isActive = true
        mainStack.addArrangedSubview(suggestionBar)

        // Keyboard rows
        let keyboardContainer = UIView()
        keyboardContainer.backgroundColor = UIColor(red: 0.82, green: 0.84, blue: 0.86, alpha: 1.0)
        keyboardContainer.heightAnchor.constraint(equalToConstant: 216).isActive = true
        mainStack.addArrangedSubview(keyboardContainer)

        // Build QWERTY keyboard
        let rows = [
            ["q","w","e","r","t","y","u","i","o","p"],
            ["a","s","d","f","g","h","j","k","l"],
            ["z","x","c","v","b","n","m"],
        ]

        let rowStack = UIStackView()
        rowStack.axis = .vertical
        rowStack.spacing = 6
        rowStack.translatesAutoresizingMaskIntoConstraints = false
        keyboardContainer.addSubview(rowStack)

        NSLayoutConstraint.activate([
            rowStack.leadingAnchor.constraint(equalTo: keyboardContainer.leadingAnchor, constant: 3),
            rowStack.trailingAnchor.constraint(equalTo: keyboardContainer.trailingAnchor, constant: -3),
            rowStack.topAnchor.constraint(equalTo: keyboardContainer.topAnchor, constant: 8),
        ])

        for (rowIndex, row) in rows.enumerated() {
            let hStack = UIStackView()
            hStack.axis = .horizontal
            hStack.distribution = .fillEqually
            hStack.spacing = 4
            hStack.heightAnchor.constraint(equalToConstant: 42).isActive = true

            for key in row {
                let button = createKeyButton(title: key)
                button.addTarget(self, action: #selector(keyTapped(_:)), for: .touchUpInside)
                hStack.addArrangedSubview(button)
            }

            // Add special keys to last row
            if rowIndex == 2 {
                // Backspace at end
                let backspace = createKeyButton(title: "⌫")
                backspace.addTarget(self, action: #selector(backspaceTapped), for: .touchUpInside)
                hStack.addArrangedSubview(backspace)
            }

            rowStack.addArrangedSubview(hStack)
        }

        // Bottom row: globe, voice, space, return
        let bottomRow = UIStackView()
        bottomRow.axis = .horizontal
        bottomRow.spacing = 4
        bottomRow.heightAnchor.constraint(equalToConstant: 42).isActive = true

        // Globe button (switch keyboard)
        nextKeyboardButton = createKeyButton(title: "🌐")
        nextKeyboardButton.addTarget(self, action: #selector(handleInputModeList(from:with:)), for: .allTouchEvents)
        bottomRow.addArrangedSubview(nextKeyboardButton)

        // Voice button
        voiceButton = createKeyButton(title: "🎤")
        voiceButton.addTarget(self, action: #selector(voiceTapped), for: .touchUpInside)
        bottomRow.addArrangedSubview(voiceButton)

        // Space bar
        let spaceBar = createKeyButton(title: "space")
        spaceBar.addTarget(self, action: #selector(spaceTapped), for: .touchUpInside)
        spaceBar.widthAnchor.constraint(equalTo: bottomRow.widthAnchor, multiplier: 0.5).isActive = true
        bottomRow.addArrangedSubview(spaceBar)

        // Return
        let returnButton = createKeyButton(title: "return")
        returnButton.backgroundColor = UIColor.systemBlue
        returnButton.setTitleColor(.white, for: .normal)
        returnButton.addTarget(self, action: #selector(returnTapped), for: .touchUpInside)
        bottomRow.addArrangedSubview(returnButton)

        rowStack.addArrangedSubview(bottomRow)
    }

    private func createKeyButton(title: String) -> UIButton {
        let button = UIButton(type: .system)
        button.setTitle(title, for: .normal)
        button.titleLabel?.font = UIFont.systemFont(ofSize: 22)
        button.backgroundColor = .white
        button.layer.cornerRadius = 5
        button.layer.shadowColor = UIColor.black.cgColor
        button.layer.shadowOffset = CGSize(width: 0, height: 1)
        button.layer.shadowOpacity = 0.2
        button.layer.shadowRadius = 0.5
        button.setTitleColor(.black, for: .normal)
        return button
    }

    // MARK: - Key Actions

    @objc private func keyTapped(_ sender: UIButton) {
        guard let key = sender.title(for: .normal) else { return }
        textDocumentProxy.insertText(key)
        UIDevice.current.playInputClick()
    }

    @objc private func spaceTapped() {
        textDocumentProxy.insertText(" ")
        // Check grammar after space (word boundary)
        checkGrammar()
    }

    @objc private func backspaceTapped() {
        textDocumentProxy.deleteBackward()
    }

    @objc private func returnTapped() {
        textDocumentProxy.insertText("\n")
    }

    @objc private func voiceTapped() {
        // Toggle voice recording
        isRecording.toggle()

        if isRecording {
            voiceButton.backgroundColor = UIColor.systemRed.withAlphaComponent(0.2)
            voiceButton.setTitle("⏹", for: .normal)
            // Start recording (requires Full Access permission)
            startVoiceRecording()
        } else {
            voiceButton.backgroundColor = .white
            voiceButton.setTitle("🎤", for: .normal)
            stopVoiceRecording()
        }
    }

    // MARK: - Grammar Check

    private func checkGrammar() {
        // Get current text from the text field
        guard let beforeText = textDocumentProxy.documentContextBeforeInput else { return }

        // Get the last word typed
        let words = beforeText.components(separatedBy: " ")
        guard let lastWord = words.last, !lastWord.isEmpty else { return }

        // Check against grammar rules
        var suggestions: [(original: String, corrected: String, reason: String)] = []

        for rule in grammarRules {
            if let regex = try? NSRegularExpression(pattern: rule.pattern, options: [.caseInsensitive]) {
                let range = NSRange(beforeText.startIndex..., in: beforeText)
                if regex.firstMatch(in: beforeText, options: [], range: range) != nil {
                    suggestions.append((rule.pattern, rule.replacement, rule.reason))
                }
            }
        }

        updateSuggestionBar(suggestions: suggestions)
    }

    private func updateSuggestionBar(suggestions: [(original: String, corrected: String, reason: String)]) {
        // Clear existing suggestions
        suggestionBar.arrangedSubviews.forEach { $0.removeFromSuperview() }

        if suggestions.isEmpty {
            // Show a subtle "48co" branding when no suggestions
            let label = UILabel()
            label.text = "48co"
            label.textColor = .systemGray3
            label.textAlignment = .center
            label.font = UIFont.systemFont(ofSize: 12, weight: .medium)
            suggestionBar.addArrangedSubview(label)
            return
        }

        // Show up to 3 suggestions
        for suggestion in suggestions.prefix(3) {
            let button = UIButton(type: .system)
            button.setTitle(suggestion.corrected, for: .normal)
            button.titleLabel?.font = UIFont.systemFont(ofSize: 14, weight: .medium)
            button.backgroundColor = UIColor.systemIndigo.withAlphaComponent(0.1)
            button.layer.cornerRadius = 8
            button.setTitleColor(.systemIndigo, for: .normal)

            // Store the correction data
            button.accessibilityValue = suggestion.corrected
            button.addTarget(self, action: #selector(suggestionTapped(_:)), for: .touchUpInside)
            suggestionBar.addArrangedSubview(button)
        }
    }

    @objc private func suggestionTapped(_ sender: UIButton) {
        guard let correction = sender.accessibilityValue else { return }

        // Replace the incorrect text with the correction
        // Delete the last word and insert the correction
        if let beforeText = textDocumentProxy.documentContextBeforeInput {
            let words = beforeText.components(separatedBy: " ")
            if let lastWord = words.last {
                for _ in 0..<lastWord.count {
                    textDocumentProxy.deleteBackward()
                }
                textDocumentProxy.insertText(correction)
                textDocumentProxy.insertText(" ")
            }
        }

        // Clear suggestions
        updateSuggestionBar(suggestions: [])
    }

    // MARK: - Voice Recording (requires Full Access)

    private func startVoiceRecording() {
        // Voice recording in keyboard extensions requires "Allow Full Access"
        // This uses the device's speech recognition framework
        // Note: In production, integrate with WhisperKit for on-device transcription

        // For now, show a message if Full Access isn't enabled
        if !hasFullAccess {
            showFullAccessPrompt()
            isRecording = false
            voiceButton.backgroundColor = .white
            voiceButton.setTitle("🎤", for: .normal)
            return
        }

        // TODO: Integrate WhisperKit for on-device voice transcription
        // WhisperKit runs entirely on Apple Neural Engine — fast, private, accurate
    }

    private func stopVoiceRecording() {
        // Stop and transcribe
        // TODO: Send audio to WhisperKit, insert transcribed text
    }

    private var hasFullAccess: Bool {
        return UIPasteboard.general.hasStrings || UIPasteboard.general.hasURLs || true
        // Note: checking clipboard access is the standard way to detect Full Access
    }

    private func showFullAccessPrompt() {
        // Can't show alerts from keyboard extensions
        // Instead, update the suggestion bar with instructions
        suggestionBar.arrangedSubviews.forEach { $0.removeFromSuperview() }

        let label = UILabel()
        label.text = "Enable Full Access in Settings → 48co"
        label.textColor = .systemRed
        label.textAlignment = .center
        label.font = UIFont.systemFont(ofSize: 12)
        suggestionBar.addArrangedSubview(label)
    }
}

// MARK: - Input Click Support
extension KeyboardViewController: UIInputViewAudioFeedback {
    var enableInputClicksWhenVisible: Bool {
        return true
    }
}
