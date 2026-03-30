// Custom vocabulary replacement — industry-specific term correction
//
// Professionals use specialist terminology that generic speech-to-text
// engines butcher regularly. A lawyer getting "per say" instead of "per se"
// or a doctor getting "die uh beet ease" instead of "diabetes" loses trust
// in the tool immediately.
//
// This module lets users define custom vocabulary mappings that are applied
// to transcribed text before it reaches the user. Mappings are stored per
// user and synced across devices.
//
// Examples:
//   ("per say", "per se")           — legal
//   ("four tea ate co", "48co")     — brand name
//   ("habeus corpus", "habeas corpus") — legal
//   ("die uh beet ease", "diabetes") — medical

use regex::Regex;

/// A single vocabulary mapping: what the speech engine produces vs what it should be.
#[derive(Debug, Clone, uniffi::Record)]
pub struct VocabEntry {
    /// The incorrect or phonetic form produced by speech recognition
    pub from: String,
    /// The correct form to replace it with
    pub to: String,
}

/// Apply custom vocabulary replacements to text.
///
/// Replacements are case-insensitive and respect word boundaries so
/// partial matches inside longer words are not affected.
///
/// The vocabulary list is processed in order, so earlier entries take
/// priority if there are overlapping patterns.
///
/// # Arguments
/// * `text` — The input text (typically raw transcription output)
/// * `vocab` — List of vocabulary mappings to apply
///
/// # Returns
/// The text with all matching vocabulary terms replaced.
#[uniffi::export]
pub fn apply_vocabulary(text: &str, vocab: Vec<VocabEntry>) -> String {
    let mut result = text.to_string();

    for entry in &vocab {
        if entry.from.is_empty() {
            continue;
        }

        // Build a case-insensitive word-boundary pattern
        // Escape the "from" string so regex special chars don't break the pattern
        let escaped = regex::escape(&entry.from);
        let pattern = format!(r"(?i)\b{}\b", escaped);

        if let Ok(re) = Regex::new(&pattern) {
            // Preserve the case style of the original match where possible
            result = re
                .replace_all(&result, |caps: &regex::Captures| {
                    let matched = &caps[0];
                    apply_case_style(matched, &entry.to)
                })
                .to_string();
        }
    }

    result
}

/// Try to preserve the case style of the original text when substituting.
///
/// - If the original is ALL CAPS, make the replacement ALL CAPS
/// - If the original is Title Case (first letter upper), make replacement Title Case
/// - Otherwise use the replacement as-is
fn apply_case_style(original: &str, replacement: &str) -> String {
    if original.chars().all(|c| !c.is_alphabetic() || c.is_uppercase()) && original.len() > 1 {
        // ALL CAPS
        replacement.to_uppercase()
    } else if original
        .chars()
        .next()
        .map(|c| c.is_uppercase())
        .unwrap_or(false)
    {
        // Title Case — capitalize first letter of replacement
        let mut chars = replacement.chars();
        match chars.next() {
            Some(first) => first.to_uppercase().to_string() + chars.as_str(),
            None => String::new(),
        }
    } else {
        replacement.to_string()
    }
}

/// Create a VocabEntry from two strings (convenience for building vocab lists).
#[uniffi::export]
pub fn create_vocab_entry(from: String, to: String) -> VocabEntry {
    VocabEntry { from, to }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn entry(from: &str, to: &str) -> VocabEntry {
        VocabEntry {
            from: from.to_string(),
            to: to.to_string(),
        }
    }

    #[test]
    fn test_basic_replacement() {
        let vocab = vec![entry("per say", "per se")];
        let result = apply_vocabulary("That is not illegal per say in this context.", vocab);
        assert_eq!(result, "That is not illegal per se in this context.");
    }

    #[test]
    fn test_case_insensitive() {
        let vocab = vec![entry("habeus corpus", "habeas corpus")];
        let result = apply_vocabulary("The HABEUS CORPUS petition was filed.", vocab);
        assert_eq!(result, "The HABEAS CORPUS petition was filed.");
    }

    #[test]
    fn test_title_case_preservation() {
        let vocab = vec![entry("per say", "per se")];
        let result = apply_vocabulary("Per say, the argument fails.", vocab);
        assert_eq!(result, "Per se, the argument fails.");
    }

    #[test]
    fn test_multiple_replacements() {
        let vocab = vec![
            entry("per say", "per se"),
            entry("bon a fide", "bona fide"),
        ];
        let result = apply_vocabulary(
            "This is a bon a fide claim, not per say a frivolous one.",
            vocab,
        );
        assert!(result.contains("bona fide"));
        assert!(result.contains("per se"));
    }

    #[test]
    fn test_word_boundary_respect() {
        // "cat" should not match inside "category"
        let vocab = vec![entry("cat", "feline")];
        let result = apply_vocabulary("The category includes every cat breed.", vocab);
        assert_eq!(result, "The category includes every feline breed.");
    }

    #[test]
    fn test_empty_from() {
        let vocab = vec![entry("", "something")];
        let result = apply_vocabulary("Hello world.", vocab);
        assert_eq!(result, "Hello world.");
    }

    #[test]
    fn test_multiple_occurrences() {
        let vocab = vec![entry("teh", "the")];
        let result = apply_vocabulary("teh cat sat on teh mat.", vocab);
        assert_eq!(result, "the cat sat on the mat.");
    }

    #[test]
    fn test_medical_vocabulary() {
        let vocab = vec![
            entry("die uh beet ease", "diabetes"),
            entry("high per tension", "hypertension"),
        ];
        let result =
            apply_vocabulary("Patient presents with die uh beet ease and high per tension.", vocab);
        assert_eq!(
            result,
            "Patient presents with diabetes and hypertension."
        );
    }

    #[test]
    fn test_brand_names() {
        let vocab = vec![entry("forty eight co", "48co")];
        let result = apply_vocabulary("Welcome to forty eight co voice.", vocab);
        assert_eq!(result, "Welcome to 48co voice.");
    }

    #[test]
    fn test_create_vocab_entry() {
        let e = create_vocab_entry("from".to_string(), "to".to_string());
        assert_eq!(e.from, "from");
        assert_eq!(e.to, "to");
    }
}
