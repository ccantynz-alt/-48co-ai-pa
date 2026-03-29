import Foundation

/// Local grammar correction engine for iOS keyboard.
/// Checks for common errors without needing an internet connection.
/// In future this will use the shared Rust core via C FFI bindings.
struct GrammarCorrection {
    let original: String
    let corrected: String
    let reason: String
}

class GrammarEngine {

    /// Check text for grammar errors and return corrections.
    static func check(_ text: String) -> [GrammarCorrection] {
        var corrections: [GrammarCorrection] = []

        for rule in rules {
            let regex = try? NSRegularExpression(pattern: rule.pattern, options: .caseInsensitive)
            let range = NSRange(text.startIndex..., in: text)
            if let match = regex?.firstMatch(in: text, range: range),
               let matchRange = Range(match.range, in: text) {
                let original = String(text[matchRange])
                corrections.append(GrammarCorrection(
                    original: original,
                    corrected: rule.replacement,
                    reason: rule.reason
                ))
            }
        }

        return corrections
    }

    // MARK: - Rules

    private struct Rule {
        let pattern: String
        let replacement: String
        let reason: String
    }

    private static let rules: [Rule] = [
        // Word confusion
        Rule(pattern: #"\btheir\s+(is|are|was|were)\b"#, replacement: "there $1", reason: "their → there (location)"),
        Rule(pattern: #"\bthere\s+(car|house|dog|cat|name|idea|work)\b"#, replacement: "their $1", reason: "there → their (possession)"),
        Rule(pattern: #"\byour\s+(welcome|right|the\s+best|correct)\b"#, replacement: "you're $1", reason: "your → you're (you are)"),
        Rule(pattern: #"\byou're\s+(car|house|dog|cat|name|work|email)\b"#, replacement: "your $1", reason: "you're → your (possession)"),
        Rule(pattern: #"\bits\s+(a\s+)?(been|going|not|important|clear)\b"#, replacement: "it's $1$2", reason: "its → it's (it is)"),
        Rule(pattern: #"\bit's\s+(own|self|way)\b"#, replacement: "its $1", reason: "it's → its (possession)"),
        Rule(pattern: #"\baffect\b"#, replacement: "effect", reason: "Check: affect (verb) vs effect (noun)"),
        Rule(pattern: #"\bthen\s+(I|we|they|he|she)\b"#, replacement: "than $1", reason: "then → than (comparison)"),

        // Common misspellings
        Rule(pattern: #"\brecieve\b"#, replacement: "receive", reason: "Spelling: i before e except after c"),
        Rule(pattern: #"\boccured\b"#, replacement: "occurred", reason: "Spelling: double r"),
        Rule(pattern: #"\bseperate\b"#, replacement: "separate", reason: "Spelling: separate"),
        Rule(pattern: #"\baccommodate\b"#, replacement: "accommodate", reason: "Spelling: double c, double m"),
        Rule(pattern: #"\bneccessary\b"#, replacement: "necessary", reason: "Spelling: one c, double s"),
        Rule(pattern: #"\boccasion\b"#, replacement: "occasion", reason: "Spelling: double c, one s"),
        Rule(pattern: #"\bdefinately\b"#, replacement: "definitely", reason: "Spelling: definitely"),
        Rule(pattern: #"\buntill\b"#, replacement: "until", reason: "Spelling: one l"),

        // Grammar
        Rule(pattern: #"\bcould of\b"#, replacement: "could have", reason: "could of → could have"),
        Rule(pattern: #"\bshould of\b"#, replacement: "should have", reason: "should of → should have"),
        Rule(pattern: #"\bwould of\b"#, replacement: "would have", reason: "would of → would have"),
        Rule(pattern: #"\bmust of\b"#, replacement: "must have", reason: "must of → must have"),
        Rule(pattern: #"\ba\s+(hour|honest|heir|honour)\b"#, replacement: "an $1", reason: "a → an before silent h"),
        Rule(pattern: #"\ba\s+([aeiou]\w+)\b"#, replacement: "an $1", reason: "a → an before vowel"),
        Rule(pattern: #"\balot\b"#, replacement: "a lot", reason: "alot → a lot (two words)"),
        Rule(pattern: #"\bme\s+and\s+(my|the|a)\b"#, replacement: "$1 and I", reason: "me and → [person] and I"),
        Rule(pattern: #"\birregardless\b"#, replacement: "regardless", reason: "irregardless → regardless"),

        // Punctuation
        Rule(pattern: #"\bi\b"#, replacement: "I", reason: "Capitalise I"),

        // Legal terms (common dictation errors)
        Rule(pattern: #"\bper say\b"#, replacement: "per se", reason: "Legal: per se"),
        Rule(pattern: #"\bbonafied\b"#, replacement: "bona fide", reason: "Legal: bona fide"),
        Rule(pattern: #"\bhabeus\b"#, replacement: "habeas", reason: "Legal: habeas corpus"),
    ]
}
