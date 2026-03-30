import UIKit

class MainViewController: UIViewController {

    // MARK: - UI Elements

    private let scrollView = UIScrollView()
    private let contentStack = UIStackView()

    private let logoLabel: UILabel = {
        let label = UILabel()
        label.text = "48co Voice"
        label.font = .systemFont(ofSize: 34, weight: .bold)
        label.textAlignment = .center
        return label
    }()

    private let subtitleLabel: UILabel = {
        let label = UILabel()
        label.text = "AI Keyboard with Voice-to-Text"
        label.font = .systemFont(ofSize: 17, weight: .regular)
        label.textColor = .secondaryLabel
        label.textAlignment = .center
        return label
    }()

    private let statusCard = StatusCardView()

    private let stepsHeaderLabel: UILabel = {
        let label = UILabel()
        label.text = "Enable 48co Voice Keyboard"
        label.font = .systemFont(ofSize: 22, weight: .semibold)
        return label
    }()

    private let openSettingsButton: UIButton = {
        let button = UIButton(type: .system)
        button.setTitle("Open Keyboard Settings", for: .normal)
        button.titleLabel?.font = .systemFont(ofSize: 17, weight: .semibold)
        button.backgroundColor = UIColor(red: 0.29, green: 0.27, blue: 0.89, alpha: 1.0) // indigo
        button.setTitleColor(.white, for: .normal)
        button.layer.cornerRadius = 12
        button.heightAnchor.constraint(equalToConstant: 50).isActive = true
        return button
    }()

    private let testField: UITextField = {
        let field = UITextField()
        field.placeholder = "Tap here to test 48co Voice keyboard..."
        field.borderStyle = .none
        field.backgroundColor = .secondarySystemBackground
        field.layer.cornerRadius = 12
        field.font = .systemFont(ofSize: 17)
        field.leftView = UIView(frame: CGRect(x: 0, y: 0, width: 16, height: 0))
        field.leftViewMode = .always
        field.heightAnchor.constraint(equalToConstant: 50).isActive = true
        return field
    }()

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        setupUI()
        setupActions()
        checkKeyboardEnabled()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        checkKeyboardEnabled()
    }

    // MARK: - Setup

    private func setupUI() {
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(scrollView)

        contentStack.axis = .vertical
        contentStack.spacing = 20
        contentStack.alignment = .fill
        contentStack.translatesAutoresizingMaskIntoConstraints = false
        scrollView.addSubview(contentStack)

        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            contentStack.topAnchor.constraint(equalTo: scrollView.topAnchor, constant: 24),
            contentStack.leadingAnchor.constraint(equalTo: scrollView.leadingAnchor, constant: 20),
            contentStack.trailingAnchor.constraint(equalTo: scrollView.trailingAnchor, constant: -20),
            contentStack.bottomAnchor.constraint(equalTo: scrollView.bottomAnchor, constant: -24),
            contentStack.widthAnchor.constraint(equalTo: scrollView.widthAnchor, constant: -40),
        ])

        contentStack.addArrangedSubview(logoLabel)
        contentStack.addArrangedSubview(subtitleLabel)
        contentStack.setCustomSpacing(32, after: subtitleLabel)

        contentStack.addArrangedSubview(statusCard)
        contentStack.setCustomSpacing(32, after: statusCard)

        contentStack.addArrangedSubview(stepsHeaderLabel)

        let steps: [(String, String)] = [
            ("1", "Open Settings > General > Keyboard > Keyboards"),
            ("2", "Tap \"Add New Keyboard...\""),
            ("3", "Select \"48co Voice\" from the list"),
            ("4", "Tap \"48co Voice\" again, then enable \"Allow Full Access\""),
            ("5", "Full Access is needed for voice-to-text and grammar checking"),
        ]

        for (number, text) in steps {
            let stepView = StepView(number: number, text: text)
            contentStack.addArrangedSubview(stepView)
        }

        contentStack.setCustomSpacing(24, after: contentStack.arrangedSubviews.last!)

        contentStack.addArrangedSubview(openSettingsButton)
        contentStack.setCustomSpacing(32, after: openSettingsButton)

        let testLabel = UILabel()
        testLabel.text = "Test Your Keyboard"
        testLabel.font = .systemFont(ofSize: 22, weight: .semibold)
        contentStack.addArrangedSubview(testLabel)

        let testHint = UILabel()
        testHint.text = "Switch to 48co Voice using the globe (🌐) button, then try typing or using the microphone."
        testHint.font = .systemFont(ofSize: 15)
        testHint.textColor = .secondaryLabel
        testHint.numberOfLines = 0
        contentStack.addArrangedSubview(testHint)
        contentStack.setCustomSpacing(8, after: testHint)

        contentStack.addArrangedSubview(testField)
    }

    private func setupActions() {
        openSettingsButton.addTarget(self, action: #selector(openKeyboardSettings), for: .touchUpInside)

        let tap = UITapGestureRecognizer(target: self, action: #selector(dismissKeyboard))
        tap.cancelsTouchesInView = false
        view.addGestureRecognizer(tap)
    }

    // MARK: - Actions

    @objc private func openKeyboardSettings() {
        if let url = URL(string: UIApplication.openSettingsURLString) {
            UIApplication.shared.open(url)
        }
    }

    @objc private func dismissKeyboard() {
        view.endEditing(true)
    }

    // MARK: - Status Check

    private func checkKeyboardEnabled() {
        let bundleID = "nz.co.48co.voice.keyboard" // Update to match your actual bundle ID
        let keyboards = UserDefaults.standard.object(forKey: "AppleKeyboards") as? [String] ?? []
        let isEnabled = keyboards.contains(where: { $0.contains("KeyboardExtension") })

        // Also check via text input mode (more reliable)
        let inputModes = UITextInputMode.activeInputModes
        let hasOurKeyboard = inputModes.contains(where: {
            $0.primaryLanguage?.contains("48co") == true
        })

        let enabled = isEnabled || hasOurKeyboard
        statusCard.update(isEnabled: enabled)
    }
}

// MARK: - Status Card View

class StatusCardView: UIView {

    private let iconLabel = UILabel()
    private let titleLabel = UILabel()
    private let descLabel = UILabel()

    override init(frame: CGRect) {
        super.init(frame: frame)
        setupUI()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    private func setupUI() {
        layer.cornerRadius = 16
        clipsToBounds = true

        let stack = UIStackView()
        stack.axis = .vertical
        stack.spacing = 8
        stack.alignment = .center
        stack.translatesAutoresizingMaskIntoConstraints = false
        addSubview(stack)

        iconLabel.font = .systemFont(ofSize: 40)
        titleLabel.font = .systemFont(ofSize: 18, weight: .semibold)
        descLabel.font = .systemFont(ofSize: 14)
        descLabel.textColor = .secondaryLabel
        descLabel.numberOfLines = 0
        descLabel.textAlignment = .center

        stack.addArrangedSubview(iconLabel)
        stack.addArrangedSubview(titleLabel)
        stack.addArrangedSubview(descLabel)

        NSLayoutConstraint.activate([
            stack.topAnchor.constraint(equalTo: topAnchor, constant: 20),
            stack.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 20),
            stack.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -20),
            stack.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -20),
        ])

        update(isEnabled: false)
    }

    func update(isEnabled: Bool) {
        if isEnabled {
            backgroundColor = UIColor.systemGreen.withAlphaComponent(0.12)
            iconLabel.text = "\u{2705}"
            titleLabel.text = "Keyboard Active"
            titleLabel.textColor = .systemGreen
            descLabel.text = "48co Voice is ready. Switch to it using the globe button on any keyboard."
        } else {
            backgroundColor = UIColor.systemOrange.withAlphaComponent(0.12)
            iconLabel.text = "\u{26A0}\u{FE0F}"
            titleLabel.text = "Keyboard Not Enabled"
            titleLabel.textColor = .systemOrange
            descLabel.text = "Follow the steps below to enable 48co Voice keyboard."
        }
    }
}

// MARK: - Step View

class StepView: UIView {

    init(number: String, text: String) {
        super.init(frame: .zero)

        let numberBadge = UILabel()
        numberBadge.text = number
        numberBadge.font = .systemFont(ofSize: 15, weight: .bold)
        numberBadge.textColor = .white
        numberBadge.textAlignment = .center
        numberBadge.backgroundColor = UIColor(red: 0.29, green: 0.27, blue: 0.89, alpha: 1.0)
        numberBadge.layer.cornerRadius = 14
        numberBadge.clipsToBounds = true
        numberBadge.translatesAutoresizingMaskIntoConstraints = false

        let textLabel = UILabel()
        textLabel.text = text
        textLabel.font = .systemFont(ofSize: 16)
        textLabel.numberOfLines = 0
        textLabel.translatesAutoresizingMaskIntoConstraints = false

        addSubview(numberBadge)
        addSubview(textLabel)

        NSLayoutConstraint.activate([
            numberBadge.leadingAnchor.constraint(equalTo: leadingAnchor),
            numberBadge.topAnchor.constraint(equalTo: topAnchor),
            numberBadge.widthAnchor.constraint(equalToConstant: 28),
            numberBadge.heightAnchor.constraint(equalToConstant: 28),

            textLabel.leadingAnchor.constraint(equalTo: numberBadge.trailingAnchor, constant: 12),
            textLabel.trailingAnchor.constraint(equalTo: trailingAnchor),
            textLabel.centerYAnchor.constraint(equalTo: numberBadge.centerYAnchor),
            textLabel.topAnchor.constraint(greaterThanOrEqualTo: topAnchor),
            textLabel.bottomAnchor.constraint(lessThanOrEqualTo: bottomAnchor),
        ])
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}
