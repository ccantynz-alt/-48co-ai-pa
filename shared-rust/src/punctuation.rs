// Punctuation post-processing for voice-to-text output
//
// When users dictate, they say "full stop" or "comma" instead of typing
// punctuation. This module converts those spoken words into actual
// punctuation marks, then cleans up capitalization and spacing.

use regex::Regex;

/// Convert spoken punctuation words to actual punctuation characters,
/// then clean up capitalization and spacing.
///
/// Examples:
///   "Hello comma how are you full stop" → "Hello, how are you."
///   "What exclamation mark" → "What!"
///   "Is that right question mark" → "Is that right?"
///   "Mr full stop Smith" → "Mr. Smith"
#[uniffi::export]
pub fn process_punctuation(text: &str) -> String {
    let mut result = text.to_string();

    // ── Spoken punctuation → actual punctuation ─────────────────────────
    // Order matters: longer phrases first to avoid partial matches.
    let replacements: Vec<(&str, &str)> = vec![
        // Sentence-ending punctuation
        (r"(?i)\s*\bfull stop\b", "."),
        (r"(?i)\s*\bperiod\b", "."),
        (r"(?i)\s*\bstop\b(?=\s|$)", "."),
        (r"(?i)\s*\bquestion mark\b", "?"),
        (r"(?i)\s*\bexclamation mark\b", "!"),
        (r"(?i)\s*\bexclamation point\b", "!"),
        // Mid-sentence punctuation
        (r"(?i)\s*\bcomma\b", ","),
        (r"(?i)\s*\bsemicolon\b", ";"),
        (r"(?i)\s*\bsemi colon\b", ";"),
        (r"(?i)\s*\bcolon\b", ":"),
        // Dashes and hyphens
        (r"(?i)\s*\bem dash\b\s*", " — "),
        (r"(?i)\s*\ben dash\b\s*", " – "),
        (r"(?i)\s*\bdash\b\s*", " — "),
        (r"(?i)\s*\bhyphen\b\s*", "-"),
        // Quotes
        (r"(?i)\s*\bopen quote\b\s*", " \""),
        (r"(?i)\s*\bclose quote\b\s*", "\" "),
        (r"(?i)\s*\bopen single quote\b\s*", " '"),
        (r"(?i)\s*\bclose single quote\b\s*", "' "),
        (r"(?i)\s*\bquote\b\s*", "\""),
        (r"(?i)\s*\bunquote\b\s*", "\""),
        (r"(?i)\s*\bend quote\b\s*", "\""),
        // Parentheses and brackets
        (r"(?i)\s*\bopen paren\b\s*", " ("),
        (r"(?i)\s*\bclose paren\b\s*", ") "),
        (r"(?i)\s*\bopen parenthesis\b\s*", " ("),
        (r"(?i)\s*\bclose parenthesis\b\s*", ") "),
        (r"(?i)\s*\bopen bracket\b\s*", " ["),
        (r"(?i)\s*\bclose bracket\b\s*", "] "),
        // Special characters
        (r"(?i)\s*\bellipsis\b", "..."),
        (r"(?i)\s*\bdot dot dot\b", "..."),
        (r"(?i)\s*\bampersand\b", " & "),
        (r"(?i)\s*\bat sign\b", "@"),
        (r"(?i)\s*\bhash\b", "#"),
        (r"(?i)\s*\bhashtag\b", "#"),
        (r"(?i)\s*\bslash\b", "/"),
        (r"(?i)\s*\bbackslash\b", "\\"),
        (r"(?i)\s*\basterisk\b", "*"),
        // Line breaks
        (r"(?i)\s*\bnew line\b\s*", "\n"),
        (r"(?i)\s*\bnewline\b\s*", "\n"),
        (r"(?i)\s*\bnew paragraph\b\s*", "\n\n"),
    ];

    for (pattern, replacement) in &replacements {
        if let Ok(re) = Regex::new(pattern) {
            result = re.replace_all(&result, *replacement).to_string();
        }
    }

    // ── Spacing cleanup ─────────────────────────────────────────────────

    // Remove space before punctuation that shouldn't have it
    if let Ok(re) = Regex::new(r"\s+([.,;:!?\)])") {
        result = re.replace_all(&result, "$1").to_string();
    }

    // Ensure space after punctuation (except before newline or end)
    if let Ok(re) = Regex::new(r"([.,;:!?])([A-Za-z])") {
        result = re.replace_all(&result, "$1 $2").to_string();
    }

    // Remove space after opening brackets/quotes
    if let Ok(re) = Regex::new(r#"([\(\["])\s+"#) {
        result = re.replace_all(&result, "$1").to_string();
    }

    // Remove space before closing brackets/quotes
    if let Ok(re) = Regex::new(r#"\s+([\)\]"])"#) {
        result = re.replace_all(&result, "$1").to_string();
    }

    // ── Capitalization ──────────────────────────────────────────────────

    // Capitalize first character of entire text
    let mut chars = result.chars().peekable();
    if let Some(first) = chars.peek() {
        if first.is_ascii_lowercase() {
            let first_upper = first.to_uppercase().to_string();
            result = first_upper + &result[first.len_utf8()..];
        }
    }

    // Capitalize first letter after sentence-ending punctuation
    if let Ok(re) = Regex::new(r"([.!?]\s+)([a-z])") {
        result = re
            .replace_all(&result, |caps: &regex::Captures| {
                format!("{}{}", &caps[1], caps[2].to_uppercase())
            })
            .to_string();
    }

    // Capitalize first letter after newline
    if let Ok(re) = Regex::new(r"(\n\s*)([a-z])") {
        result = re
            .replace_all(&result, |caps: &regex::Captures| {
                format!("{}{}", &caps[1], caps[2].to_uppercase())
            })
            .to_string();
    }

    // ── Final cleanup ───────────────────────────────────────────────────

    // Collapse multiple spaces into one
    if let Ok(re) = Regex::new(r" {2,}") {
        result = re.replace_all(&result, " ").to_string();
    }

    // Remove trailing spaces on each line
    if let Ok(re) = Regex::new(r" +(\n)") {
        result = re.replace_all(&result, "$1").to_string();
    }

    result.trim().to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_full_stop() {
        let result = process_punctuation("Hello world full stop");
        assert_eq!(result, "Hello world.");
    }

    #[test]
    fn test_comma() {
        let result = process_punctuation("Hello comma world");
        assert_eq!(result, "Hello, world");
    }

    #[test]
    fn test_question_mark() {
        let result = process_punctuation("How are you question mark");
        assert_eq!(result, "How are you?");
    }

    #[test]
    fn test_exclamation() {
        let result = process_punctuation("Wow exclamation mark");
        assert_eq!(result, "Wow!");
    }

    #[test]
    fn test_capitalization_after_period() {
        let result = process_punctuation("hello full stop world is great");
        assert_eq!(result, "Hello. World is great");
    }

    #[test]
    fn test_new_paragraph() {
        let result = process_punctuation("First paragraph new paragraph second paragraph");
        assert!(result.contains("\n\n"));
        // Second paragraph should be capitalized
        assert!(result.contains("Second"));
    }

    #[test]
    fn test_multiple_punctuation() {
        let result = process_punctuation("Dear Sir comma thank you for your email full stop I will respond soon full stop");
        assert_eq!(result, "Dear Sir, thank you for your email. I will respond soon.");
    }

    #[test]
    fn test_ellipsis() {
        let result = process_punctuation("Well ellipsis I think so");
        assert!(result.contains("..."));
    }
}
