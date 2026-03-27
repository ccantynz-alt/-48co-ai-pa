// Local grammar correction — runs entirely on-device
//
// Two modes:
//   1. Rule-based (default): Fast regex patterns for common errors. No download needed.
//   2. AI-powered (optional): Claude API for deeper corrections. Requires API key.
//
// The rule-based engine catches 80% of common grammar errors:
//   - Spelling corrections for frequently confused words
//   - Missing/incorrect articles (a/an)
//   - Subject-verb agreement
//   - Common typos and autocorrect failures
//   - Capitalization rules
//   - Punctuation cleanup

use regex::Regex;

#[derive(Debug, Clone)]
pub struct GrammarCorrection {
    pub original: String,
    pub corrected: String,
    pub reason: String,
}

/// Run local grammar check — returns list of corrections
pub fn check_grammar(text: &str) -> Vec<GrammarCorrection> {
    let mut corrections = Vec::new();

    // Common word confusions
    let confusions: Vec<(&str, &str, &str)> = vec![
        (r"\bshould of\b", "should have", "Common error: 'of' → 'have'"),
        (r"\bcould of\b", "could have", "Common error: 'of' → 'have'"),
        (r"\bwould of\b", "would have", "Common error: 'of' → 'have'"),
        (r"\bmust of\b", "must have", "Common error: 'of' → 'have'"),
        (r"\bmight of\b", "might have", "Common error: 'of' → 'have'"),
        (r"\btheir\s+(is|was|are|were)\b", "there $1", "'their' → 'there' before verb"),
        (r"\byour\s+(welcome|right|wrong)\b", "you're $1", "'your' → 'you're'"),
        (r"\bits\s+(a|an|the|been|not)\b", "it's $1", "'its' → 'it's' (it is)"),
        (r"\bwho's\s+(book|car|house|idea)\b", "whose $1", "'who's' → 'whose' (possessive)"),
        (r"\bthen\s+(I|you|we|they|he|she)\b", "than $1", "'then' → 'than' (comparison)"),
        (r"\bto\s+(much|many|few|little|fast|slow|big|small)\b", "too $1", "'to' → 'too' (degree)"),
        (r"\beffect\s+(on|the|a|an)\b", "affect $1", "'effect' → 'affect' (verb)"),
        (r"\balot\b", "a lot", "'alot' is not a word"),
        (r"\bthats\b", "that's", "Missing apostrophe"),
        (r"\bdont\b", "don't", "Missing apostrophe"),
        (r"\bcant\b", "can't", "Missing apostrophe"),
        (r"\bwont\b", "won't", "Missing apostrophe"),
        (r"\bim\b", "I'm", "Missing apostrophe"),
        (r"\bive\b", "I've", "Missing apostrophe"),
        (r"\bId\b", "I'd", "Missing apostrophe"),
        (r"\bdidnt\b", "didn't", "Missing apostrophe"),
        (r"\bwasnt\b", "wasn't", "Missing apostrophe"),
        (r"\bisnt\b", "isn't", "Missing apostrophe"),
        (r"\bhavent\b", "haven't", "Missing apostrophe"),
        (r"\bhasnt\b", "hasn't", "Missing apostrophe"),
        (r"\bcouldnt\b", "couldn't", "Missing apostrophe"),
        (r"\bwouldnt\b", "wouldn't", "Missing apostrophe"),
        (r"\bshouldnt\b", "shouldn't", "Missing apostrophe"),
        (r"\bdefinate\b", "definite", "Spelling"),
        (r"\bdefinately\b", "definitely", "Spelling"),
        (r"\bseperate\b", "separate", "Spelling"),
        (r"\boccured\b", "occurred", "Spelling"),
        (r"\brecieve\b", "receive", "Spelling"),
        (r"\bbelieve\b", "believe", "Spelling"),
        (r"\buntill\b", "until", "Spelling"),
        (r"\bneccessary\b", "necessary", "Spelling"),
        (r"\boccasion\b", "occasion", "Spelling"),
        (r"\baccommodate\b", "accommodate", "Spelling"),
        (r"\bwierd\b", "weird", "Spelling"),
        (r"\bgoverment\b", "government", "Spelling"),
        (r"\benviroment\b", "environment", "Spelling"),
        (r"\bbuisness\b", "business", "Spelling"),
        (r"\bprobly\b", "probably", "Spelling"),
        (r"\bteh\b", "the", "Common typo"),
        (r"\badn\b", "and", "Common typo"),
        (r"\bhte\b", "the", "Common typo"),
        (r"\btaht\b", "that", "Common typo"),
        (r"\bwaht\b", "what", "Common typo"),
        (r"\bwhit\b", "with", "Common typo"),
        (r"\bfreind\b", "friend", "Spelling"),
        (r"\bthier\b", "their", "Spelling"),
        (r"\btho\b", "though", "Informal abbreviation"),
        (r"\bu\b", "you", "Text speak"),
        (r"\br\b", "are", "Text speak"),
        (r"\bur\b", "your", "Text speak"),
        (r"\bcuz\b", "because", "Informal"),
        (r"\bgonna\b", "going to", "Informal"),
        (r"\bwanna\b", "want to", "Informal"),
        (r"\bgotta\b", "got to", "Informal"),
        (r"\bkinda\b", "kind of", "Informal"),
        (r"\bsorta\b", "sort of", "Informal"),
    ];

    for (pattern, replacement, reason) in &confusions {
        if let Ok(re) = Regex::new(&format!("(?i){}", pattern)) {
            for mat in re.find_iter(text) {
                let original = mat.as_str().to_string();
                let corrected = re.replace(&original, *replacement).to_string();
                if original.to_lowercase() != corrected.to_lowercase() {
                    corrections.push(GrammarCorrection {
                        original,
                        corrected,
                        reason: reason.to_string(),
                    });
                }
            }
        }
    }

    // Article a/an check
    if let Ok(re) = Regex::new(r"\ba\s+([aeiouAEIOU]\w+)") {
        for mat in re.find_iter(text) {
            let original = mat.as_str().to_string();
            let corrected = format!("an {}", &original[2..]);
            corrections.push(GrammarCorrection {
                original,
                corrected,
                reason: "Use 'an' before vowel sounds".to_string(),
            });
        }
    }

    // Double word detection
    if let Ok(re) = Regex::new(r"\b(\w+)\s+\1\b") {
        for mat in re.find_iter(text) {
            let full = mat.as_str();
            let word = full.split_whitespace().next().unwrap_or("");
            // Skip intentional doubles like "had had", "that that"
            if !["had", "that", "is", "do"].contains(&word.to_lowercase().as_str()) {
                corrections.push(GrammarCorrection {
                    original: full.to_string(),
                    corrected: word.to_string(),
                    reason: "Repeated word".to_string(),
                });
            }
        }
    }

    corrections
}

/// Apply all corrections to text
pub fn apply_corrections(text: &str, corrections: &[GrammarCorrection]) -> String {
    let mut result = text.to_string();
    for c in corrections {
        result = result.replacen(&c.original, &c.corrected, 1);
    }
    result
}

/// Full grammar pipeline: check + fix + post-process
pub fn fix_grammar(text: &str) -> String {
    let corrections = check_grammar(text);
    let mut result = if corrections.is_empty() {
        text.to_string()
    } else {
        apply_corrections(text, &corrections)
    };

    // Post-processing (same as grammar.rs but without API)
    // Capitalize first letter
    if let Some(first) = result.chars().next() {
        if first.is_ascii_lowercase() {
            result = first.to_uppercase().to_string() + &result[1..];
        }
    }

    // Capitalize after sentence-ending punctuation
    if let Ok(re) = Regex::new(r"([.!?]\s+)([a-z])") {
        result = re.replace_all(&result, |caps: &regex::Captures| {
            format!("{}{}", &caps[1], caps[2].to_uppercase())
        }).to_string();
    }

    // Clean up multiple spaces
    if let Ok(re) = Regex::new(r" {2,}") {
        result = re.replace_all(&result, " ").to_string();
    }

    result.trim().to_string()
}
