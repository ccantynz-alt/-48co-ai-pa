import UIKit

/// The main custom keyboard view controller.
/// This is a system-level keyboard — it appears in EVERY app on iOS.
/// Modelled after Gboard/SwiftKey for professional users (lawyers, accountants, doctors).
class KeyboardViewController: UIInputViewController {

    // MARK: - Properties

    private var keyboardView: UIView!
    private var keysStack: UIStackView!
    private var isShifted = false
    private var isCapsLock = false
    private var isNumberMode = false
    private var voiceEngine: VoiceEngine?
    private var voiceButton: UIButton?
    private var theme = KeyboardTheme.current

    // Standard QWERTY layout
    private let letterRows: [[String]] = [
        ["q","w","e","r","t","y","u","i","o","p"],
        ["a","s","d","f","g","h","j","k","l"],
        ["z","x","c","v","b","n","m"]
    ]

    private let numberRows: [[String]] = [
        ["1","2","3","4","5","6","7","8","9","0"],
        ["-","/",":",";","(",")","$","&","@","\""],
        [".",",","?","!","'"]
    ]

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        voiceEngine = VoiceEngine(delegate: self)
        buildKeyboard()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        theme = KeyboardTheme.current
        applyTheme()
    }

    override func textDidChange(_ textInput: UITextInput?) {
        super.textDidChange(textInput)
        // Update shift state based on context
        if !isCapsLock {
            let proxy = textDocumentProxy
            let shouldShift = proxy.documentContextBeforeInput == nil
                || proxy.documentContextBeforeInput?.hasSuffix(". ") == true
                || proxy.documentContextBeforeInput?.hasSuffix("? ") == true
                || proxy.documentContextBeforeInput?.hasSuffix("! ") == true
                || proxy.documentContextBeforeInput?.hasSuffix("\n") == true
            if shouldShift != isShifted {
                isShifted = shouldShift
                updateKeyLabels()
            }
        }
    }

    // MARK: - Build Keyboard

    private func buildKeyboard() {
        keyboardView = UIView()
        keyboardView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(keyboardView)

        NSLayoutConstraint.activate([
            keyboardView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            keyboardView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            keyboardView.topAnchor.constraint(equalTo: view.topAnchor),
            keyboardView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            keyboardView.heightAnchor.constraint(equalToConstant: 260)
        ])

        keysStack = UIStackView()
        keysStack.axis = .vertical
        keysStack.spacing = 8
        keysStack.distribution = .fillEqually
        keysStack.translatesAutoresizingMaskIntoConstraints = false
        keyboardView.addSubview(keysStack)

        NSLayoutConstraint.activate([
            keysStack.leadingAnchor.constraint(equalTo: keyboardView.leadingAnchor, constant: 3),
            keysStack.trailingAnchor.constraint(equalTo: keyboardView.trailingAnchor, constant: -3),
            keysStack.topAnchor.constraint(equalTo: keyboardView.topAnchor, constant: 8),
            keysStack.bottomAnchor.constraint(equalTo: keyboardView.bottomAnchor, constant: -4)
        ])

        rebuildRows()
        applyTheme()
    }

    private func rebuildRows() {
        keysStack.arrangedSubviews.forEach { $0.removeFromSuperview() }

        let rows = isNumberMode ? numberRows : letterRows

        // Letter/number rows
        for (index, row) in rows.enumerated() {
            let rowStack = UIStackView()
            rowStack.axis = .horizontal
            rowStack.spacing = 5
            rowStack.distribution = .fillEqually

            // Add shift on left of last letter row
            if !isNumberMode && index == 2 {
                let shiftBtn = makeSpecialKey("shift.fill", systemImage: true)
                shiftBtn.addTarget(self, action: #selector(shiftTapped), for: .touchUpInside)
                shiftBtn.widthAnchor.constraint(equalToConstant: 42).isActive = true
                rowStack.addArrangedSubview(shiftBtn)
            }

            for key in row {
                let btn = makeKeyButton(key)
                btn.addTarget(self, action: #selector(keyTapped(_:)), for: .touchUpInside)
                rowStack.addArrangedSubview(btn)
            }

            // Add delete on right of last letter row
            if index == 2 {
                let deleteBtn = makeSpecialKey("delete.left.fill", systemImage: true)
                deleteBtn.addTarget(self, action: #selector(deleteTapped), for: .touchUpInside)
                deleteBtn.widthAnchor.constraint(equalToConstant: 42).isActive = true
                rowStack.addArrangedSubview(deleteBtn)
            }

            keysStack.addArrangedSubview(rowStack)
        }

        // Bottom row: globe, 123/ABC, voice, space, return
        let bottomRow = UIStackView()
        bottomRow.axis = .horizontal
        bottomRow.spacing = 5
        bottomRow.distribution = .fill

        // Globe (switch keyboard) — required by Apple
        let globeBtn = makeSpecialKey("globe", systemImage: true)
        globeBtn.addTarget(self, action: #selector(handleInputModeList(from:with:)), for: .allTouchEvents)
        globeBtn.widthAnchor.constraint(equalToConstant: 42).isActive = true
        bottomRow.addArrangedSubview(globeBtn)

        // 123 / ABC toggle
        let toggleBtn = makeSpecialKey(isNumberMode ? "ABC" : "123", systemImage: false)
        toggleBtn.addTarget(self, action: #selector(toggleNumberMode), for: .touchUpInside)
        toggleBtn.widthAnchor.constraint(equalToConstant: 48).isActive = true
        bottomRow.addArrangedSubview(toggleBtn)

        // Voice button (microphone)
        let micBtn = makeSpecialKey("mic.fill", systemImage: true)
        micBtn.addTarget(self, action: #selector(voiceTapped(_:)), for: .touchUpInside)
        micBtn.widthAnchor.constraint(equalToConstant: 42).isActive = true
        micBtn.tintColor = UIColor(red: 79/255, green: 70/255, blue: 229/255, alpha: 1) // indigo
        voiceButton = micBtn
        bottomRow.addArrangedSubview(micBtn)

        // Space bar
        let spaceBtn = makeKeyButton("space")
        spaceBtn.addTarget(self, action: #selector(spaceTapped), for: .touchUpInside)
        bottomRow.addArrangedSubview(spaceBtn)

        // Return
        let returnBtn = makeSpecialKey("return", systemImage: false)
        returnBtn.addTarget(self, action: #selector(returnTapped), for: .touchUpInside)
        returnBtn.widthAnchor.constraint(equalToConstant: 80).isActive = true
        bottomRow.addArrangedSubview(returnBtn)

        keysStack.addArrangedSubview(bottomRow)
    }

    // MARK: - Key Creation

    private func makeKeyButton(_ title: String) -> UIButton {
        let btn = UIButton(type: .system)
        let displayTitle = (isShifted || isCapsLock) ? title.uppercased() : title
        btn.setTitle(displayTitle, for: .normal)
        btn.titleLabel?.font = UIFont.systemFont(ofSize: title == "space" ? 14 : 22, weight: .regular)
        btn.setTitleColor(theme.keyTextColor, for: .normal)
        btn.backgroundColor = theme.keyBackground
        btn.layer.cornerRadius = 5
        btn.layer.shadowColor = UIColor.black.cgColor
        btn.layer.shadowOffset = CGSize(width: 0, height: 1)
        btn.layer.shadowOpacity = 0.12
        btn.layer.shadowRadius = 0.5
        btn.tag = title.hashValue
        btn.accessibilityLabel = title
        return btn
    }

    private func makeSpecialKey(_ name: String, systemImage: Bool) -> UIButton {
        let btn = UIButton(type: .system)
        if systemImage {
            let img = UIImage(systemName: name)?.withConfiguration(
                UIImage.SymbolConfiguration(pointSize: 18, weight: .medium)
            )
            btn.setImage(img, for: .normal)
        } else {
            btn.setTitle(name, for: .normal)
            btn.titleLabel?.font = UIFont.systemFont(ofSize: 14, weight: .medium)
        }
        btn.tintColor = theme.specialKeyTextColor
        btn.backgroundColor = theme.specialKeyBackground
        btn.layer.cornerRadius = 5
        btn.layer.shadowColor = UIColor.black.cgColor
        btn.layer.shadowOffset = CGSize(width: 0, height: 1)
        btn.layer.shadowOpacity = 0.1
        btn.layer.shadowRadius = 0.5
        return btn
    }

    // MARK: - Key Actions

    @objc private func keyTapped(_ sender: UIButton) {
        guard let title = sender.accessibilityLabel else { return }
        var char = title
        if isShifted || isCapsLock {
            char = char.uppercased()
        }
        textDocumentProxy.insertText(char)
        if isShifted && !isCapsLock {
            isShifted = false
            updateKeyLabels()
        }

        // Haptic feedback
        let feedback = UIImpactFeedbackGenerator(style: .light)
        feedback.impactOccurred()
    }

    @objc private func spaceTapped() {
        textDocumentProxy.insertText(" ")

        // Auto-period: double-space inserts period + space
        let context = textDocumentProxy.documentContextBeforeInput ?? ""
        if context.hasSuffix("  ") {
            textDocumentProxy.deleteBackward()
            textDocumentProxy.deleteBackward()
            textDocumentProxy.insertText(". ")
            isShifted = true
            updateKeyLabels()
        }
    }

    @objc private func deleteTapped() {
        textDocumentProxy.deleteBackward()
        let feedback = UIImpactFeedbackGenerator(style: .light)
        feedback.impactOccurred()
    }

    @objc private func returnTapped() {
        textDocumentProxy.insertText("\n")
    }

    @objc private func shiftTapped() {
        if isShifted && !isCapsLock {
            // Double-tap for caps lock
            isCapsLock = true
        } else if isCapsLock {
            isCapsLock = false
            isShifted = false
        } else {
            isShifted = true
        }
        updateKeyLabels()
    }

    @objc private func toggleNumberMode() {
        isNumberMode.toggle()
        rebuildRows()
        applyTheme()
    }

    @objc private func voiceTapped(_ sender: UIButton) {
        guard let engine = voiceEngine else { return }

        if engine.isListening {
            engine.stopListening()
            sender.tintColor = UIColor(red: 79/255, green: 70/255, blue: 229/255, alpha: 1)
        } else {
            engine.startListening(language: "en-NZ")
            sender.tintColor = .systemRed
        }
    }

    // MARK: - Helpers

    private func updateKeyLabels() {
        func updateStack(_ stack: UIStackView) {
            for view in stack.arrangedSubviews {
                if let btn = view as? UIButton, let label = btn.accessibilityLabel {
                    let display = (isShifted || isCapsLock) ? label.uppercased() : label
                    btn.setTitle(display, for: .normal)
                } else if let innerStack = view as? UIStackView {
                    updateStack(innerStack)
                }
            }
        }
        updateStack(keysStack)
    }

    private func applyTheme() {
        keyboardView?.backgroundColor = theme.backgroundColor

        func styleStack(_ stack: UIStackView) {
            for view in stack.arrangedSubviews {
                if let btn = view as? UIButton {
                    if btn.accessibilityLabel != nil && btn.image(for: .normal) == nil {
                        // Regular key
                        btn.backgroundColor = theme.keyBackground
                        btn.setTitleColor(theme.keyTextColor, for: .normal)
                    } else {
                        // Special key
                        btn.backgroundColor = theme.specialKeyBackground
                    }
                } else if let innerStack = view as? UIStackView {
                    styleStack(innerStack)
                }
            }
        }
        styleStack(keysStack)
    }
}

// MARK: - VoiceEngineDelegate

extension KeyboardViewController: VoiceEngineDelegate {
    func voiceEngine(_ engine: VoiceEngine, didRecognize text: String, isFinal: Bool) {
        if isFinal {
            textDocumentProxy.insertText(text + " ")
        }
    }

    func voiceEngine(_ engine: VoiceEngine, didFailWith error: String) {
        // Reset mic button state
        voiceButton?.tintColor = UIColor(red: 79/255, green: 70/255, blue: 229/255, alpha: 1)
    }

    func voiceEngineDidStop(_ engine: VoiceEngine) {
        voiceButton?.tintColor = UIColor(red: 79/255, green: 70/255, blue: 229/255, alpha: 1)
    }
}
