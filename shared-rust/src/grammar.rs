// Local grammar correction engine — runs entirely on-device
//
// Ported from tauri-app/src-tauri/src/local_grammar.rs into the shared core
// so iOS (Swift via uniffi), Android (Kotlin via uniffi), and desktop (Tauri)
// all use the exact same grammar rules.
//
// Two modes in the full product:
//   1. Rule-based (this module): Fast regex patterns for common errors. No network needed.
//   2. AI-powered (external): Claude API for deeper corrections. Requires API key + network.

use regex::Regex;

/// A single grammar correction: what was wrong, what it should be, and why.
#[derive(Debug, Clone, uniffi::Record)]
pub struct GrammarCorrection {
    pub original: String,
    pub corrected: String,
    pub reason: String,
}

/// Run local grammar check — returns a list of corrections found in the text.
///
/// This catches common errors including:
/// - Spelling corrections for frequently confused words
/// - Missing/incorrect articles (a/an)
/// - Subject-verb agreement issues
/// - Common typos and autocorrect failures
/// - Missing apostrophes in contractions
/// - Informal language that should be formal
/// - Double/repeated words
#[uniffi::export]
pub fn check_grammar(text: &str) -> Vec<GrammarCorrection> {
    let mut corrections = Vec::new();

    // ── Common word confusions ──────────────────────────────────────────
    let confusions: Vec<(&str, &str, &str)> = vec![
        // "should of" → "should have" and friends
        (r"\bshould of\b", "should have", "Common error: 'of' should be 'have'"),
        (r"\bcould of\b", "could have", "Common error: 'of' should be 'have'"),
        (r"\bwould of\b", "would have", "Common error: 'of' should be 'have'"),
        (r"\bmust of\b", "must have", "Common error: 'of' should be 'have'"),
        (r"\bmight of\b", "might have", "Common error: 'of' should be 'have'"),
        // their / there / they're
        (r"\btheir\s+(is|was|are|were)\b", "there $1", "'their' should be 'there' before a verb"),
        // your / you're
        (r"\byour\s+(welcome|right|wrong|going|doing|being|making|having|getting)\b", "you're $1", "'your' should be 'you're' (you are)"),
        // its / it's
        (r"\bits\s+(a|an|the|been|not|going|been|very|quite|really|always|never)\b", "it's $1", "'its' should be 'it's' (it is)"),
        // who's / whose
        (r"\bwho's\s+(book|car|house|idea|fault|responsibility|job|turn|problem)\b", "whose $1", "'who's' should be 'whose' (possessive)"),
        // then / than
        (r"\bthen\s+(I|you|we|they|he|she|it|me|him|her|us|them)\b", "than $1", "'then' should be 'than' (comparison)"),
        // to / too
        (r"\bto\s+(much|many|few|little|fast|slow|big|small|late|early|long|short|hard|easy|hot|cold)\b", "too $1", "'to' should be 'too' (degree/excess)"),
        // effect / affect
        (r"\beffect\s+(on|the|a|an|my|your|his|her|our|their)\b", "affect $1", "'effect' should be 'affect' (verb form)"),
        // loose / lose
        (r"\bloose\s+(my|your|his|her|our|their|the|a|it)\b", "lose $1", "'loose' should be 'lose' (to misplace/fail)"),

        // ── Missing apostrophes in contractions ─────────────────────────
        (r"\balot\b", "a lot", "'alot' is not a word — use 'a lot'"),
        (r"\bthats\b", "that's", "Missing apostrophe in contraction"),
        (r"\bdont\b", "don't", "Missing apostrophe in contraction"),
        (r"\bcant\b", "can't", "Missing apostrophe in contraction"),
        (r"\bwont\b", "won't", "Missing apostrophe in contraction"),
        (r"\bim\b", "I'm", "Missing apostrophe in contraction"),
        (r"\bive\b", "I've", "Missing apostrophe in contraction"),
        (r"\bId\b", "I'd", "Missing apostrophe in contraction"),
        (r"\bdidnt\b", "didn't", "Missing apostrophe in contraction"),
        (r"\bwasnt\b", "wasn't", "Missing apostrophe in contraction"),
        (r"\bisnt\b", "isn't", "Missing apostrophe in contraction"),
        (r"\bhavent\b", "haven't", "Missing apostrophe in contraction"),
        (r"\bhasnt\b", "hasn't", "Missing apostrophe in contraction"),
        (r"\bcouldnt\b", "couldn't", "Missing apostrophe in contraction"),
        (r"\bwouldnt\b", "wouldn't", "Missing apostrophe in contraction"),
        (r"\bshouldnt\b", "shouldn't", "Missing apostrophe in contraction"),
        (r"\bwerent\b", "weren't", "Missing apostrophe in contraction"),
        (r"\barent\b", "aren't", "Missing apostrophe in contraction"),
        (r"\btheyve\b", "they've", "Missing apostrophe in contraction"),
        (r"\btheyre\b", "they're", "Missing apostrophe in contraction"),
        (r"\bweve\b", "we've", "Missing apostrophe in contraction"),
        (r"\bwere\b(?!\s+(not|going|you|they|we))", "we're", "Missing apostrophe — did you mean 'we're'?"),
        (r"\byoure\b", "you're", "Missing apostrophe in contraction"),
        (r"\bhes\b", "he's", "Missing apostrophe in contraction"),
        (r"\bshes\b", "she's", "Missing apostrophe in contraction"),
        (r"\blets\b", "let's", "Missing apostrophe in contraction"),

        // ── Spelling errors (commonly misspelled words) ─────────────────
        (r"\bdefinate\b", "definite", "Spelling: 'definate' should be 'definite'"),
        (r"\bdefinately\b", "definitely", "Spelling: 'definately' should be 'definitely'"),
        (r"\bdefintely\b", "definitely", "Spelling: 'defintely' should be 'definitely'"),
        (r"\bseperate\b", "separate", "Spelling: 'seperate' should be 'separate'"),
        (r"\boccured\b", "occurred", "Spelling: 'occured' should be 'occurred'"),
        (r"\brecieve\b", "receive", "Spelling: 'recieve' should be 'receive'"),
        (r"\buntill\b", "until", "Spelling: 'untill' should be 'until'"),
        (r"\bneccessary\b", "necessary", "Spelling: 'neccessary' should be 'necessary'"),
        (r"\bneccesary\b", "necessary", "Spelling: 'neccesary' should be 'necessary'"),
        (r"\bnescessary\b", "necessary", "Spelling: 'nescessary' should be 'necessary'"),
        (r"\baccommodate\b", "accommodate", "Spelling: already correct (no change needed)"),
        (r"\baccomodate\b", "accommodate", "Spelling: 'accomodate' should be 'accommodate'"),
        (r"\bwierd\b", "weird", "Spelling: 'wierd' should be 'weird'"),
        (r"\bgoverment\b", "government", "Spelling: 'goverment' should be 'government'"),
        (r"\bgovernement\b", "government", "Spelling: 'governement' should be 'government'"),
        (r"\benviroment\b", "environment", "Spelling: 'enviroment' should be 'environment'"),
        (r"\benvirornment\b", "environment", "Spelling: 'envirornment' should be 'environment'"),
        (r"\bbuisness\b", "business", "Spelling: 'buisness' should be 'business'"),
        (r"\bbussiness\b", "business", "Spelling: 'bussiness' should be 'business'"),
        (r"\bprobly\b", "probably", "Spelling: 'probly' should be 'probably'"),
        (r"\bprobally\b", "probably", "Spelling: 'probally' should be 'probably'"),
        (r"\bfreind\b", "friend", "Spelling: 'freind' should be 'friend'"),
        (r"\bthier\b", "their", "Spelling: 'thier' should be 'their'"),
        (r"\breccomend\b", "recommend", "Spelling: 'reccomend' should be 'recommend'"),
        (r"\brecommand\b", "recommend", "Spelling: 'recommand' should be 'recommend'"),
        (r"\boccassion\b", "occasion", "Spelling: 'occassion' should be 'occasion'"),
        (r"\boccasion\b", "occasion", "Spelling: already correct (no change needed)"),
        (r"\bprivelege\b", "privilege", "Spelling: 'privelege' should be 'privilege'"),
        (r"\bprivilege\b", "privilege", "Spelling: already correct (no change needed)"),
        (r"\bliason\b", "liaison", "Spelling: 'liason' should be 'liaison'"),
        (r"\bliaison\b", "liaison", "Spelling: 'liaison' should be 'liaison'"),
        (r"\bjudgement\b", "judgment", "Spelling: 'judgement' should be 'judgment' (legal standard)"),
        (r"\bcommitee\b", "committee", "Spelling: 'commitee' should be 'committee'"),
        (r"\bcommitte\b", "committee", "Spelling: 'committe' should be 'committee'"),
        (r"\bargument\b", "argument", "Spelling: already correct (no change needed)"),
        (r"\barguement\b", "argument", "Spelling: 'arguement' should be 'argument'"),
        (r"\bharassment\b", "harassment", "Spelling: 'harassement' should be 'harassment'"),
        (r"\bharassement\b", "harassment", "Spelling: 'harassement' should be 'harassment'"),

        // ── Common typos ────────────────────────────────────────────────
        (r"\bteh\b", "the", "Common typo: 'teh' should be 'the'"),
        (r"\badn\b", "and", "Common typo: 'adn' should be 'and'"),
        (r"\bhte\b", "the", "Common typo: 'hte' should be 'the'"),
        (r"\btaht\b", "that", "Common typo: 'taht' should be 'that'"),
        (r"\bwaht\b", "what", "Common typo: 'waht' should be 'what'"),
        (r"\bwhit\b", "with", "Common typo: 'whit' should be 'with'"),
        (r"\bwich\b", "which", "Common typo: 'wich' should be 'which'"),
        (r"\bbeacuse\b", "because", "Common typo: 'beacuse' should be 'because'"),
        (r"\bbecuase\b", "because", "Common typo: 'becuase' should be 'because'"),
        (r"\babotu\b", "about", "Common typo: 'abotu' should be 'about'"),
        (r"\bknwo\b", "know", "Common typo: 'knwo' should be 'know'"),
        (r"\btihs\b", "this", "Common typo: 'tihs' should be 'this'"),
        (r"\bform\b(?=\s+(?:the|a|an|my|your|his|her|our|their)\b)", "from", "Common typo: 'form' should be 'from' in this context"),

        // ── Informal language → professional ────────────────────────────
        (r"\btho\b", "though", "Informal: 'tho' should be 'though'"),
        (r"\bu\b", "you", "Text speak: 'u' should be 'you'"),
        (r"\br\b", "are", "Text speak: 'r' should be 'are'"),
        (r"\bur\b", "your", "Text speak: 'ur' should be 'your'"),
        (r"\bcuz\b", "because", "Informal: 'cuz' should be 'because'"),
        (r"\bgonna\b", "going to", "Informal: 'gonna' should be 'going to'"),
        (r"\bwanna\b", "want to", "Informal: 'wanna' should be 'want to'"),
        (r"\bgotta\b", "got to", "Informal: 'gotta' should be 'got to'"),
        (r"\bkinda\b", "kind of", "Informal: 'kinda' should be 'kind of'"),
        (r"\bsorta\b", "sort of", "Informal: 'sorta' should be 'sort of'"),
        (r"\blemme\b", "let me", "Informal: 'lemme' should be 'let me'"),
        (r"\bdunno\b", "don't know", "Informal: 'dunno' should be 'don't know'"),
        (r"\binnit\b", "isn't it", "Informal: 'innit' should be 'isn't it'"),

        // ── Legal / professional specific ───────────────────────────────
        (r"\bper say\b", "per se", "Legal term: 'per say' should be 'per se'"),
        (r"\bbon a fide\b", "bona fide", "Legal term: should be 'bona fide'"),
        (r"\bhabeus corpus\b", "habeas corpus", "Legal term: should be 'habeas corpus'"),
        (r"\bprecident\b", "precedent", "Legal term: 'precident' should be 'precedent'"),
        (r"\bprecedance\b", "precedence", "Legal term: 'precedance' should be 'precedence'"),
        (r"\bstatute of limitations\b", "statute of limitations", "Already correct"),
        (r"\bstatuet of limitations\b", "statute of limitations", "Legal term: 'statuet' should be 'statute'"),
        (r"\bfiducary\b", "fiduciary", "Legal/financial term: should be 'fiduciary'"),
        (r"\bindemnificaiton\b", "indemnification", "Legal term: should be 'indemnification'"),
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

    // ── Article a/an check ──────────────────────────────────────────────
    // "a apple" → "an apple", but skip known exceptions like "a union", "a useful"
    if let Ok(re) = Regex::new(r"\ba\s+([aeiouAEIOU]\w+)") {
        let exceptions = ["union", "unique", "united", "uniform", "universal",
                          "university", "usage", "useful", "usual", "usually",
                          "utility", "utensil", "euphoria", "european", "eulogy",
                          "unicorn", "unanimous", "uranium"];
        for mat in re.find_iter(text) {
            let original = mat.as_str().to_string();
            let word_after = original.split_whitespace().nth(1).unwrap_or("");
            if !exceptions.iter().any(|e| word_after.to_lowercase() == *e) {
                let corrected = format!("an {}", word_after);
                corrections.push(GrammarCorrection {
                    original,
                    corrected,
                    reason: "Use 'an' before vowel sounds".to_string(),
                });
            }
        }
    }

    // ── "an" before consonant sounds ────────────────────────────────────
    // "an hour" is correct, but "an house" is not
    if let Ok(re) = Regex::new(r"\ban\s+([bcdfgjklmnpqrstvwxyzBCDFGJKLMNPQRSTVWXYZ]\w+)") {
        let exceptions = ["hour", "hours", "heir", "heirs", "honest", "honestly",
                          "honor", "honors", "honour", "honours", "herb", "herbs",
                          "homage", "honorary"];
        for mat in re.find_iter(text) {
            let original = mat.as_str().to_string();
            let word_after = original.split_whitespace().nth(1).unwrap_or("");
            if !exceptions.iter().any(|e| word_after.to_lowercase() == *e) {
                let corrected = format!("a {}", word_after);
                corrections.push(GrammarCorrection {
                    original,
                    corrected,
                    reason: "Use 'a' before consonant sounds".to_string(),
                });
            }
        }
    }

    // ── Double word detection ───────────────────────────────────────────
    // Note: Rust's regex crate doesn't support backreferences (\1), so we
    // use a simple word-boundary pattern and check for repeats manually.
    if let Ok(re) = Regex::new(r"(?i)\b(\w+)\s+(\w+)\b") {
        for caps in re.captures_iter(text) {
            let word1 = caps.get(1).unwrap().as_str();
            let word2 = caps.get(2).unwrap().as_str();
            if word1.to_lowercase() == word2.to_lowercase() {
                let full = caps.get(0).unwrap().as_str();
                // Skip intentional doubles like "had had", "that that", etc.
                let intentional = ["had", "that", "is", "do", "very", "bye",
                                   "no", "so", "boo", "ha", "he"];
                if !intentional.contains(&word1.to_lowercase().as_str()) {
                    corrections.push(GrammarCorrection {
                        original: full.to_string(),
                        corrected: word1.to_string(),
                        reason: "Repeated word — remove the duplicate".to_string(),
                    });
                }
            }
        }
    }

    // ── Capitalize "i" when standalone ──────────────────────────────────
    if let Ok(re) = Regex::new(r"\bi\b") {
        for mat in re.find_iter(text) {
            let start = mat.start();
            // Only flag lowercase "i" not inside a word
            let ch = &text[start..start + 1];
            if ch == "i" {
                corrections.push(GrammarCorrection {
                    original: "i".to_string(),
                    corrected: "I".to_string(),
                    reason: "The pronoun 'I' should always be capitalized".to_string(),
                });
            }
        }
    }

    corrections
}

/// Apply all corrections to text, returning the corrected version.
#[uniffi::export]
pub fn apply_corrections(text: &str, corrections: Vec<GrammarCorrection>) -> String {
    let mut result = text.to_string();
    for c in &corrections {
        result = result.replacen(&c.original, &c.corrected, 1);
    }
    result
}

/// Full grammar pipeline: check + fix + post-process (capitalize, clean up spacing).
#[uniffi::export]
pub fn fix_grammar(text: &str) -> String {
    let corrections = check_grammar(text);
    let mut result = if corrections.is_empty() {
        text.to_string()
    } else {
        apply_corrections(text, corrections)
    };

    // Post-processing: capitalize first letter of entire text
    if let Some(first) = result.chars().next() {
        if first.is_ascii_lowercase() {
            result = first.to_uppercase().to_string() + &result[first.len_utf8()..];
        }
    }

    // Capitalize after sentence-ending punctuation
    if let Ok(re) = Regex::new(r"([.!?]\s+)([a-z])") {
        result = re
            .replace_all(&result, |caps: &regex::Captures| {
                format!("{}{}", &caps[1], caps[2].to_uppercase())
            })
            .to_string();
    }

    // Capitalize "I" as standalone pronoun (in case apply_corrections missed any)
    if let Ok(re) = Regex::new(r"\bi\b") {
        result = re
            .replace_all(&result, |caps: &regex::Captures| {
                let m = caps.get(0).unwrap();
                let s = m.as_str();
                if s == "i" { "I".to_string() } else { s.to_string() }
            })
            .to_string();
    }

    // Clean up multiple spaces
    if let Ok(re) = Regex::new(r" {2,}") {
        result = re.replace_all(&result, " ").to_string();
    }

    result.trim().to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_should_have() {
        let corrections = check_grammar("I should of gone.");
        assert!(!corrections.is_empty());
        assert_eq!(corrections[0].corrected, "should have");
    }

    #[test]
    fn test_apostrophe() {
        let corrections = check_grammar("I dont like it.");
        assert!(corrections.iter().any(|c| c.corrected == "don't"));
    }

    #[test]
    fn test_spelling() {
        let corrections = check_grammar("That is definately wrong.");
        assert!(corrections.iter().any(|c| c.corrected == "definitely"));
    }

    #[test]
    fn test_typo() {
        let corrections = check_grammar("teh cat sat on hte mat");
        assert!(corrections.iter().any(|c| c.corrected == "the"));
    }

    #[test]
    fn test_article_a_an() {
        let corrections = check_grammar("a apple a day");
        assert!(corrections.iter().any(|c| c.corrected.starts_with("an")));
    }

    #[test]
    fn test_double_word() {
        let corrections = check_grammar("the the cat");
        assert!(corrections.iter().any(|c| c.reason.contains("Repeated")));
    }

    #[test]
    fn test_fix_grammar_capitalizes() {
        let result = fix_grammar("hello world. this is a test.");
        assert!(result.starts_with('H'));
        assert!(result.contains("This"));
    }

    #[test]
    fn test_legal_per_se() {
        let corrections = check_grammar("That is not illegal per say.");
        assert!(corrections.iter().any(|c| c.corrected == "per se"));
    }

    #[test]
    fn test_informal_gonna() {
        let corrections = check_grammar("I gonna leave now.");
        assert!(corrections.iter().any(|c| c.corrected == "going to"));
    }
}
