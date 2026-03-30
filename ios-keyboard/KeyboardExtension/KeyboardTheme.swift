import UIKit

/// Professional keyboard theming that follows Apple HIG guidelines.
/// Supports light mode, dark mode, and the 48co brand indigo accent.
struct KeyboardTheme {

    // MARK: - Brand Colors

    /// 48co brand indigo
    static let accentColor = UIColor(red: 0.29, green: 0.27, blue: 0.89, alpha: 1.0)
    static let accentColorHighlighted = UIColor(red: 0.22, green: 0.20, blue: 0.75, alpha: 1.0)

    // MARK: - Dimensions (Apple HIG: minimum 44pt touch targets)

    static let keyHeight: CGFloat = 44
    static let keyCornerRadius: CGFloat = 6
    static let keySpacing: CGFloat = 6
    static let rowSpacing: CGFloat = 10
    static let keyboardPadding: CGFloat = 3
    static let keyFontSize: CGFloat = 22
    static let specialKeyFontSize: CGFloat = 16
    static let keyboardTotalHeight: CGFloat = 260

    // MARK: - Appearance

    struct Appearance {
        let keyBackground: UIColor
        let specialKeyBackground: UIColor
        let keyTextColor: UIColor
        let keyboardBackground: UIColor
        let keyShadowColor: UIColor
        let keyShadowOpacity: Float
        let keyShadowOffset: CGSize
        let keyShadowRadius: CGFloat
        let keyHighlightBackground: UIColor
        let suggestionBarBackground: UIColor
        let suggestionTextColor: UIColor
        let dividerColor: UIColor
        let micActiveColor: UIColor
    }

    /// Returns the correct appearance for the current trait collection.
    static func appearance(for traitCollection: UITraitCollection) -> Appearance {
        let isDark = traitCollection.userInterfaceStyle == .dark
        if isDark {
            return darkAppearance
        } else {
            return lightAppearance
        }
    }

    // MARK: - Light Mode

    static let lightAppearance = Appearance(
        keyBackground: .white,
        specialKeyBackground: UIColor(red: 0.68, green: 0.70, blue: 0.74, alpha: 1.0),
        keyTextColor: .black,
        keyboardBackground: UIColor(red: 0.82, green: 0.84, blue: 0.86, alpha: 1.0),
        keyShadowColor: UIColor(red: 0.53, green: 0.54, blue: 0.56, alpha: 1.0),
        keyShadowOpacity: 1.0,
        keyShadowOffset: CGSize(width: 0, height: 1),
        keyShadowRadius: 0,
        keyHighlightBackground: UIColor(red: 0.68, green: 0.70, blue: 0.74, alpha: 1.0),
        suggestionBarBackground: UIColor(red: 0.82, green: 0.84, blue: 0.86, alpha: 1.0),
        suggestionTextColor: .black,
        dividerColor: UIColor(red: 0.70, green: 0.72, blue: 0.74, alpha: 1.0),
        micActiveColor: UIColor.systemRed
    )

    // MARK: - Dark Mode

    static let darkAppearance = Appearance(
        keyBackground: UIColor(red: 0.40, green: 0.41, blue: 0.43, alpha: 1.0),
        specialKeyBackground: UIColor(red: 0.26, green: 0.26, blue: 0.28, alpha: 1.0),
        keyTextColor: .white,
        keyboardBackground: UIColor(red: 0.11, green: 0.11, blue: 0.12, alpha: 1.0),
        keyShadowColor: .black,
        keyShadowOpacity: 0.5,
        keyShadowOffset: CGSize(width: 0, height: 1),
        keyShadowRadius: 0,
        keyHighlightBackground: UIColor(red: 0.55, green: 0.56, blue: 0.58, alpha: 1.0),
        suggestionBarBackground: UIColor(red: 0.16, green: 0.16, blue: 0.17, alpha: 1.0),
        suggestionTextColor: .white,
        dividerColor: UIColor(red: 0.25, green: 0.25, blue: 0.27, alpha: 1.0),
        micActiveColor: UIColor.systemRed
    )

    // MARK: - Key Styling Helper

    /// Applies standard styling to a key button.
    static func styleKey(
        _ button: UIButton,
        appearance: Appearance,
        isSpecial: Bool = false,
        isAccent: Bool = false
    ) {
        button.layer.cornerRadius = keyCornerRadius
        button.clipsToBounds = false
        button.titleLabel?.font = .systemFont(
            ofSize: isSpecial ? specialKeyFontSize : keyFontSize,
            weight: isSpecial ? .medium : .regular
        )

        if isAccent {
            button.backgroundColor = accentColor
            button.setTitleColor(.white, for: .normal)
        } else if isSpecial {
            button.backgroundColor = appearance.specialKeyBackground
            button.setTitleColor(appearance.keyTextColor, for: .normal)
        } else {
            button.backgroundColor = appearance.keyBackground
            button.setTitleColor(appearance.keyTextColor, for: .normal)
        }

        button.layer.shadowColor = appearance.keyShadowColor.cgColor
        button.layer.shadowOpacity = appearance.keyShadowOpacity
        button.layer.shadowOffset = appearance.keyShadowOffset
        button.layer.shadowRadius = appearance.keyShadowRadius
    }
}
