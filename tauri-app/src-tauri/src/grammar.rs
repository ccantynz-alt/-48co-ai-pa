// Grammar correction and AI rewrite
// Uses Claude API for intelligent rewriting, with local post-processing fallback

/// Basic post-processing (no API needed)
/// Handles punctuation substitutions, capitalization, whitespace
pub fn post_process(text: &str) -> String {
    let mut result = text.to_string();

    // Punctuation substitutions
    let replacements = [
        ("full stop", "."), ("period", "."),
        ("comma", ","), ("question mark", "?"),
        ("exclamation mark", "!"), ("exclamation point", "!"),
        ("semicolon", ";"), ("colon", ":"),
        ("ellipsis", "..."), ("dash", " — "), ("hyphen", "-"),
        ("new line", "\n"), ("newline", "\n"),
        ("new paragraph", "\n\n"),
        ("open paren", "("), ("close paren", ")"),
        ("open bracket", "["), ("close bracket", "]"),
    ];

    for (word, symbol) in replacements {
        // Case-insensitive word boundary replacement
        let pattern = format!(r"(?i)\b{}\b", regex::escape(word));
        if let Ok(re) = regex::Regex::new(&pattern) {
            result = re.replace_all(&result, symbol).to_string();
        }
    }

    // Clean up spacing around punctuation
    if let Ok(re) = regex::Regex::new(r"\s+([.,;:!?\])])") {
        result = re.replace_all(&result, "$1").to_string();
    }
    if let Ok(re) = regex::Regex::new(r"([.,;:!?])([A-Za-z])") {
        result = re.replace_all(&result, "$1 $2").to_string();
    }

    // Auto-capitalize first letter
    if let Some(first) = result.chars().next() {
        if first.is_ascii_lowercase() {
            result = first.to_uppercase().to_string() + &result[1..];
        }
    }

    // Auto-capitalize after sentence-ending punctuation
    if let Ok(re) = regex::Regex::new(r"([.!?]\s+)([a-z])") {
        result = re.replace_all(&result, |caps: &regex::Captures| {
            format!("{}{}", &caps[1], caps[2].to_uppercase())
        }).to_string();
    }

    // Clean up multiple spaces
    if let Ok(re) = regex::Regex::new(r" {2,}") {
        result = re.replace_all(&result, " ").to_string();
    }

    result.trim().to_string()
}

/// AI rewrite using Claude API
pub async fn rewrite(text: &str, claude_api_key: &str) -> Result<String, String> {
    let client = reqwest::Client::new();

    let body = serde_json::json!({
        "model": "claude-sonnet-4-6",
        "max_tokens": 1024,
        "system": "You are a writing assistant. Rewrite the user's dictated text into clean, professional prose. Fix grammar, remove filler words (um, uh, like, you know), improve clarity. Keep the original meaning and tone. Do NOT add information the user didn't say. Return ONLY the rewritten text, nothing else.",
        "messages": [{"role": "user", "content": text}]
    });

    let response = client
        .post("https://api.anthropic.com/v1/messages")
        .header("Content-Type", "application/json")
        .header("x-api-key", claude_api_key)
        .header("anthropic-version", "2025-09-01")
        .json(&body)
        .timeout(std::time::Duration::from_secs(8))
        .send()
        .await
        .map_err(|e| format!("Claude API error: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Claude API error: {}", response.status()));
    }

    let data: serde_json::Value = response.json().await
        .map_err(|e| format!("Parse error: {}", e))?;

    let rewritten = data["content"][0]["text"]
        .as_str()
        .unwrap_or(text)
        .trim()
        .to_string();

    // Safety: if AI returns empty or nonsense, use original
    if rewritten.is_empty() || rewritten.len() < text.len() / 5 {
        return Ok(text.to_string());
    }

    Ok(rewritten)
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── Punctuation substitutions ────────────────────────
    #[test]
    fn test_full_stop() {
        assert_eq!(post_process("hello full stop"), "Hello.");
    }

    #[test]
    fn test_period() {
        assert_eq!(post_process("hello period"), "Hello.");
    }

    #[test]
    fn test_comma() {
        assert_eq!(post_process("hello comma world"), "Hello, world");
    }

    #[test]
    fn test_question_mark() {
        assert_eq!(post_process("is that right question mark"), "Is that right?");
    }

    #[test]
    fn test_exclamation_mark() {
        assert_eq!(post_process("wow exclamation mark"), "Wow!");
    }

    #[test]
    fn test_exclamation_point() {
        assert_eq!(post_process("wow exclamation point"), "Wow!");
    }

    #[test]
    fn test_semicolon() {
        assert_eq!(post_process("first semicolon second"), "First; second");
    }

    #[test]
    fn test_colon() {
        assert_eq!(post_process("note colon important"), "Note: important");
    }

    #[test]
    fn test_ellipsis() {
        assert_eq!(post_process("wait ellipsis"), "Wait...");
    }

    #[test]
    fn test_dash() {
        let result = post_process("hello dash world");
        assert!(result.contains("—"));
    }

    #[test]
    fn test_hyphen() {
        let result = post_process("well hyphen known");
        assert!(result.contains("-"));
    }

    #[test]
    fn test_new_line() {
        let result = post_process("first new line second");
        assert!(result.contains('\n'));
    }

    #[test]
    fn test_new_paragraph() {
        let result = post_process("first new paragraph second");
        assert!(result.contains("\n\n"));
    }

    #[test]
    fn test_parentheses() {
        let result = post_process("hello open paren note close paren");
        assert!(result.contains('('));
        assert!(result.contains(')'));
    }

    #[test]
    fn test_brackets() {
        let result = post_process("see open bracket ref close bracket");
        assert!(result.contains('['));
        assert!(result.contains(']'));
    }

    // ── Spacing cleanup ──────────────────────────────────
    #[test]
    fn test_no_space_before_punctuation() {
        let result = post_process("hello comma world");
        assert!(!result.contains(" ,"));
    }

    #[test]
    fn test_space_after_punctuation() {
        let result = post_process("hello period world");
        assert!(result.contains(". W"));
    }

    // ── Capitalization ───────────────────────────────────
    #[test]
    fn test_capitalize_first_letter() {
        let result = post_process("hello world");
        assert!(result.starts_with('H'));
    }

    #[test]
    fn test_capitalize_after_sentence_end() {
        let result = post_process("first full stop second");
        assert!(result.contains(". S"));
    }

    #[test]
    fn test_capitalize_after_question() {
        let result = post_process("why question mark because");
        assert!(result.contains("? B"));
    }

    #[test]
    fn test_capitalize_after_exclamation() {
        let result = post_process("wow exclamation mark yes");
        assert!(result.contains("! Y"));
    }

    // ── Multiple spaces cleanup ──────────────────────────
    #[test]
    fn test_multiple_spaces_cleaned() {
        let result = post_process("hello    world");
        assert!(!result.contains("  "));
    }

    // ── Case insensitivity ───────────────────────────────
    #[test]
    fn test_case_insensitive_substitution() {
        let result = post_process("hello Full Stop world");
        assert!(result.contains('.'));
    }

    // ── Already clean text ───────────────────────────────
    #[test]
    fn test_clean_text_unchanged() {
        assert_eq!(post_process("Hello world"), "Hello world");
    }

    // ── Empty / whitespace ───────────────────────────────
    #[test]
    fn test_empty_string() {
        assert_eq!(post_process(""), "");
    }

    #[test]
    fn test_whitespace_only() {
        assert_eq!(post_process("   "), "");
    }
}
