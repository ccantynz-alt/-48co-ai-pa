// Perfect number dictation — converts spoken numbers to formatted digits
//
// This is a key differentiator for 48co Voice. Professionals (lawyers,
// accountants, executives) dictate numbers constantly. Getting this wrong
// is a dealbreaker.
//
// Examples:
//   "twelve million four hundred fifty-three thousand and twenty-two dollars
//    and sixteen cents" → "$12,453,022.16"
//   "twelve point five percent" → "12.5%"
//   "one hundred and fifty New Zealand dollars" → "NZ$150"
//   "three thousand four hundred and fifty-six" → "3,456"

use regex::Regex;

/// Convert spoken numbers in text to their formatted digit equivalents.
///
/// Handles:
/// - Basic number words (one through ninety-nine, hundred, thousand, million, billion, trillion)
/// - Currency: NZD (NZ$), USD ($), GBP (£), EUR (€), AUD (A$)
/// - Cents/pence as decimal fractions
/// - Percentages: "twelve point five percent" → "12.5%"
/// - Decimal numbers: "three point one four" → "3.14"
/// - Ordinals are left as-is (first, second, etc.) — they're not numeric values
#[uniffi::export]
pub fn format_numbers(text: &str) -> String {
    let mut result = text.to_string();

    // Process currency expressions first (most specific patterns)
    result = process_currency_expressions(&result);

    // Process percentage expressions
    result = process_percentage_expressions(&result);

    // Process remaining standalone number expressions
    result = process_standalone_numbers(&result);

    result
}

// ── Word-to-number mapping ──────────────────────────────────────────────

fn word_to_number(word: &str) -> Option<u64> {
    match word.to_lowercase().as_str() {
        "zero" => Some(0),
        "one" | "a" => Some(1),
        "two" => Some(2),
        "three" => Some(3),
        "four" => Some(4),
        "five" => Some(5),
        "six" => Some(6),
        "seven" => Some(7),
        "eight" => Some(8),
        "nine" => Some(9),
        "ten" => Some(10),
        "eleven" => Some(11),
        "twelve" => Some(12),
        "thirteen" => Some(13),
        "fourteen" => Some(14),
        "fifteen" => Some(15),
        "sixteen" => Some(16),
        "seventeen" => Some(17),
        "eighteen" => Some(18),
        "nineteen" => Some(19),
        "twenty" => Some(20),
        "thirty" => Some(30),
        "forty" => Some(40),
        "fifty" => Some(50),
        "sixty" => Some(60),
        "seventy" => Some(70),
        "eighty" => Some(80),
        "ninety" => Some(90),
        _ => None,
    }
}

fn multiplier_value(word: &str) -> Option<u64> {
    match word.to_lowercase().as_str() {
        "hundred" => Some(100),
        "thousand" => Some(1_000),
        "million" => Some(1_000_000),
        "billion" => Some(1_000_000_000),
        "trillion" => Some(1_000_000_000_000),
        _ => None,
    }
}

/// Parse a sequence of number words into a numeric value.
/// Handles compound forms like "twelve million four hundred fifty-three thousand and twenty-two"
fn parse_number_words(words: &[&str]) -> Option<u64> {
    if words.is_empty() {
        return None;
    }

    let mut total: u64 = 0;
    let mut current: u64 = 0;
    let mut has_any_number = false;

    let mut i = 0;
    while i < words.len() {
        let w = words[i].to_lowercase();

        // Skip "and" connectors
        if w == "and" {
            i += 1;
            continue;
        }

        // Handle hyphenated forms like "twenty-two"
        if w.contains('-') {
            let parts: Vec<&str> = w.split('-').collect();
            if parts.len() == 2 {
                if let (Some(tens), Some(ones)) = (word_to_number(parts[0]), word_to_number(parts[1])) {
                    current += tens + ones;
                    has_any_number = true;
                    i += 1;
                    continue;
                }
            }
        }

        if let Some(val) = word_to_number(&w) {
            current += val;
            has_any_number = true;
        } else if let Some(mult) = multiplier_value(&w) {
            has_any_number = true;
            if mult >= 1000 {
                // For thousand/million/billion/trillion: accumulate current into total
                if current == 0 {
                    current = 1;
                }
                current *= mult;
                total += current;
                current = 0;
            } else {
                // For "hundred": multiply current group
                if current == 0 {
                    current = 1;
                }
                current *= mult;
            }
        } else {
            // Not a number word — stop parsing
            break;
        }

        i += 1;
    }

    total += current;

    if has_any_number {
        Some(total)
    } else {
        None
    }
}

/// Format a number with comma separators: 12453022 → "12,453,022"
fn format_with_commas(n: u64) -> String {
    let s = n.to_string();
    if s.len() <= 3 {
        return s;
    }

    let chars: Vec<char> = s.chars().collect();
    let mut parts = Vec::new();
    let mut idx = chars.len();
    while idx > 3 {
        parts.push(chars[idx - 3..idx].iter().collect::<String>());
        idx -= 3;
    }
    parts.push(chars[0..idx].iter().collect::<String>());
    parts.reverse();
    parts.join(",")
}

// ── Number word pattern (regex) ─────────────────────────────────────────

/// Find number word sequences by tokenizing and checking each token.
fn find_number_spans(text: &str) -> Vec<(usize, usize, u64)> {
    let mut spans = Vec::new();

    // Tokenize by whitespace, track positions
    let mut tokens: Vec<(usize, usize, String)> = Vec::new();
    let mut in_word = false;
    let mut word_start = 0;

    for (i, ch) in text.char_indices() {
        if ch.is_alphanumeric() || ch == '-' || ch == '\'' {
            if !in_word {
                word_start = i;
                in_word = true;
            }
        } else {
            if in_word {
                let word = &text[word_start..i];
                tokens.push((word_start, i, word.to_lowercase()));
                in_word = false;
            }
        }
    }
    if in_word {
        tokens.push((word_start, text.len(), text[word_start..].to_lowercase()));
    }

    let mut i = 0;
    while i < tokens.len() {
        let (start, _, ref word) = tokens[i];

        // Check if this token starts a number sequence
        let is_number_start = word_to_number(word).is_some()
            || word.contains('-') && {
                let parts: Vec<&str> = word.split('-').collect();
                parts.len() == 2
                    && word_to_number(parts[0]).is_some()
                    && word_to_number(parts[1]).is_some()
            };

        if !is_number_start {
            i += 1;
            continue;
        }

        // Collect consecutive number words
        let mut j = i;
        let mut num_words: Vec<&str> = Vec::new();
        let mut end = tokens[i].1;

        while j < tokens.len() {
            let ref w = tokens[j].2;

            let is_num_word = word_to_number(w).is_some()
                || multiplier_value(w).is_some()
                || w == "and"
                || (w.contains('-') && {
                    let parts: Vec<&str> = w.split('-').collect();
                    parts.len() == 2
                        && word_to_number(parts[0]).is_some()
                        && word_to_number(parts[1]).is_some()
                });

            // "and" is only valid between number words, not at the start or end
            if w == "and" {
                // Peek ahead to see if next token is a number word
                if j + 1 < tokens.len() {
                    let ref next_w = tokens[j + 1].2;
                    let next_is_num = word_to_number(next_w).is_some()
                        || next_w.contains('-') && {
                            let parts: Vec<&str> = next_w.split('-').collect();
                            parts.len() == 2
                                && word_to_number(parts[0]).is_some()
                                && word_to_number(parts[1]).is_some()
                        };
                    if !next_is_num {
                        break;
                    }
                } else {
                    break;
                }
            }

            if !is_num_word {
                break;
            }

            num_words.push(&tokens[j].2);
            end = tokens[j].1;
            j += 1;
        }

        if !num_words.is_empty() {
            let word_refs: Vec<&str> = num_words.iter().map(|s| &**s).collect();
            if let Some(value) = parse_number_words(&word_refs) {
                // Don't convert "one" or "a" by themselves when they look like articles
                let is_trivial = num_words.len() == 1
                    && (num_words[0] == "one" || num_words[0] == "a");
                if !is_trivial {
                    spans.push((start, end, value));
                }
            }
        }

        i = if j > i { j } else { i + 1 };
    }

    spans
}

// ── Currency processing ─────────────────────────────────────────────────

fn process_currency_expressions(text: &str) -> String {
    let mut result = text.to_string();

    // Patterns: "<number words> <currency> [and <number words> cents/pence]"
    // Also: "<currency> <number words>"
    let currency_patterns: Vec<(&str, &str, &str)> = vec![
        // (spoken name, symbol, cents name)
        ("dollars", "$", "cents"),
        ("dollar", "$", "cents"),
        ("new zealand dollars", "NZ$", "cents"),
        ("nz dollars", "NZ$", "cents"),
        ("nzd", "NZ$", "cents"),
        ("us dollars", "US$", "cents"),
        ("usd", "US$", "cents"),
        ("australian dollars", "A$", "cents"),
        ("aud", "A$", "cents"),
        ("pounds", "£", "pence"),
        ("pound", "£", "pence"),
        ("gbp", "£", "pence"),
        ("euros", "€", "cents"),
        ("euro", "€", "cents"),
        ("eur", "€", "cents"),
    ];

    for (currency_word, symbol, cents_word) in &currency_patterns {
        // Pattern: <number words> <currency> and <number words> <cents>
        let pattern_with_cents = format!(
            r"(?i)((?:(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|trillion|and|(?:(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)-(?:one|two|three|four|five|six|seven|eight|nine)))\s+)+){}\s+and\s+((?:(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|(?:(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)-(?:one|two|three|four|five|six|seven|eight|nine)))\s*)+){}",
            regex::escape(currency_word),
            regex::escape(cents_word)
        );

        if let Ok(re) = Regex::new(&pattern_with_cents) {
            result = re
                .replace_all(&result, |caps: &regex::Captures| {
                    let main_words: Vec<&str> = caps[1].split_whitespace().collect();
                    let cents_words: Vec<&str> = caps[2].split_whitespace().collect();

                    if let Some(main_val) = parse_number_words(&main_words) {
                        let cents_val = parse_number_words(&cents_words).unwrap_or(0);
                        if cents_val > 0 {
                            format!("{}{}.{:02}", symbol, format_with_commas(main_val), cents_val)
                        } else {
                            format!("{}{}", symbol, format_with_commas(main_val))
                        }
                    } else {
                        caps[0].to_string()
                    }
                })
                .to_string();
        }

        // Pattern: <number words> <currency> (without cents)
        let pattern_no_cents = format!(
            r"(?i)((?:(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|trillion|and|(?:(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)-(?:one|two|three|four|five|six|seven|eight|nine)))\s+)+){}",
            regex::escape(currency_word)
        );

        if let Ok(re) = Regex::new(&pattern_no_cents) {
            result = re
                .replace_all(&result, |caps: &regex::Captures| {
                    let words: Vec<&str> = caps[1].split_whitespace().collect();
                    if let Some(val) = parse_number_words(&words) {
                        format!("{}{}", symbol, format_with_commas(val))
                    } else {
                        caps[0].to_string()
                    }
                })
                .to_string();
        }
    }

    result
}

// ── Percentage processing ───────────────────────────────────────────────

fn process_percentage_expressions(text: &str) -> String {
    let mut result = text.to_string();

    // Pattern: <number words> point <number words> percent
    let decimal_pct = r"(?i)((?:(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|and|(?:(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)-(?:one|two|three|four|five|six|seven|eight|nine)))\s*)+)\s+point\s+((?:(?:zero|one|two|three|four|five|six|seven|eight|nine)\s*)+)\s*(?:percent|per\s*cent)";

    if let Ok(re) = Regex::new(decimal_pct) {
        result = re
            .replace_all(&result, |caps: &regex::Captures| {
                let whole_words: Vec<&str> = caps[1].split_whitespace().collect();
                let decimal_words: Vec<&str> = caps[2].split_whitespace().collect();

                if let Some(whole) = parse_number_words(&whole_words) {
                    let decimal_digits: String = decimal_words
                        .iter()
                        .filter_map(|w| word_to_number(w).map(|n| n.to_string()))
                        .collect();
                    format!("{}{}%", whole, if decimal_digits.is_empty() { String::new() } else { format!(".{}", decimal_digits) })
                } else {
                    caps[0].to_string()
                }
            })
            .to_string();
    }

    // Pattern: <number words> percent (no decimal)
    let whole_pct = r"(?i)((?:(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|and|(?:(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)-(?:one|two|three|four|five|six|seven|eight|nine)))\s*)+)\s*(?:percent|per\s*cent)";

    if let Ok(re) = Regex::new(whole_pct) {
        result = re
            .replace_all(&result, |caps: &regex::Captures| {
                let words: Vec<&str> = caps[1].split_whitespace().collect();
                if let Some(val) = parse_number_words(&words) {
                    format!("{}%", val)
                } else {
                    caps[0].to_string()
                }
            })
            .to_string();
    }

    result
}

// ── Standalone number processing ────────────────────────────────────────

fn process_standalone_numbers(text: &str) -> String {
    // Find number word spans and replace them with formatted digits
    let spans = find_number_spans(text);

    if spans.is_empty() {
        return text.to_string();
    }

    // Build result by replacing spans from right to left (to preserve indices)
    let mut result = text.to_string();
    for (start, end, value) in spans.into_iter().rev() {
        let formatted = format_with_commas(value);
        result.replace_range(start..end, &formatted);
    }

    result
}

// ── Decimal number processing (standalone, non-percentage) ──────────────

/// Process "point" decimal expressions like "three point one four" → "3.14"
/// This is called within format_numbers flow.
fn _process_decimal_expressions(text: &str) -> String {
    let mut result = text.to_string();

    let pattern = r"(?i)((?:(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|trillion|and|(?:(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)-(?:one|two|three|four|five|six|seven|eight|nine)))\s*)+)\s+point\s+((?:(?:zero|one|two|three|four|five|six|seven|eight|nine)\s*)+)";

    if let Ok(re) = Regex::new(pattern) {
        result = re
            .replace_all(&result, |caps: &regex::Captures| {
                let whole_words: Vec<&str> = caps[1].split_whitespace().collect();
                let decimal_words: Vec<&str> = caps[2].split_whitespace().collect();

                if let Some(whole) = parse_number_words(&whole_words) {
                    let decimal_digits: String = decimal_words
                        .iter()
                        .filter_map(|w| word_to_number(w).map(|n| n.to_string()))
                        .collect();
                    format!("{}.{}", whole, decimal_digits)
                } else {
                    caps[0].to_string()
                }
            })
            .to_string();
    }

    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_simple_numbers() {
        assert_eq!(parse_number_words(&["five"]), Some(5));
        assert_eq!(parse_number_words(&["twelve"]), Some(12));
        assert_eq!(parse_number_words(&["twenty"]), Some(20));
        assert_eq!(parse_number_words(&["ninety"]), Some(90));
    }

    #[test]
    fn test_parse_compound_numbers() {
        assert_eq!(parse_number_words(&["twenty-one"]), Some(21));
        assert_eq!(parse_number_words(&["fifty-five"]), Some(55));
        assert_eq!(parse_number_words(&["ninety-nine"]), Some(99));
    }

    #[test]
    fn test_parse_hundreds() {
        assert_eq!(parse_number_words(&["one", "hundred"]), Some(100));
        assert_eq!(
            parse_number_words(&["three", "hundred", "and", "forty-two"]),
            Some(342)
        );
        assert_eq!(
            parse_number_words(&["nine", "hundred", "and", "ninety-nine"]),
            Some(999)
        );
    }

    #[test]
    fn test_parse_thousands() {
        assert_eq!(
            parse_number_words(&["five", "thousand"]),
            Some(5_000)
        );
        assert_eq!(
            parse_number_words(&["three", "thousand", "four", "hundred", "and", "fifty-six"]),
            Some(3_456)
        );
    }

    #[test]
    fn test_parse_millions() {
        assert_eq!(
            parse_number_words(&[
                "twelve", "million", "four", "hundred", "fifty-three", "thousand",
                "and", "twenty-two"
            ]),
            Some(12_453_022)
        );
    }

    #[test]
    fn test_format_with_commas() {
        assert_eq!(format_with_commas(0), "0");
        assert_eq!(format_with_commas(999), "999");
        assert_eq!(format_with_commas(1000), "1,000");
        assert_eq!(format_with_commas(12_453_022), "12,453,022");
        assert_eq!(format_with_commas(1_000_000), "1,000,000");
    }

    #[test]
    fn test_currency_dollars_and_cents() {
        let input = "twelve million four hundred fifty-three thousand and twenty-two dollars and sixteen cents";
        let result = format_numbers(input);
        assert_eq!(result, "$12,453,022.16");
    }

    #[test]
    fn test_currency_nzd() {
        let input = "one hundred and fifty new zealand dollars";
        let result = format_numbers(input);
        assert_eq!(result, "NZ$150");
    }

    #[test]
    fn test_currency_pounds() {
        let input = "five thousand pounds";
        let result = format_numbers(input);
        assert_eq!(result, "£5,000");
    }

    #[test]
    fn test_currency_euros() {
        let input = "two hundred euros";
        let result = format_numbers(input);
        assert_eq!(result, "€200");
    }

    #[test]
    fn test_percentage_decimal() {
        let input = "twelve point five percent";
        let result = format_numbers(input);
        assert_eq!(result, "12.5%");
    }

    #[test]
    fn test_percentage_whole() {
        let input = "fifty percent";
        let result = format_numbers(input);
        assert_eq!(result, "50%");
    }

    #[test]
    fn test_standalone_number_in_sentence() {
        let input = "We need three hundred and fifty units";
        let result = format_numbers(input);
        assert_eq!(result, "We need 350 units");
    }

    #[test]
    fn test_no_change_for_articles() {
        // "one" by itself shouldn't be converted when it looks like an article
        let input = "one day at a time";
        let result = format_numbers(input);
        assert_eq!(result, "one day at a time");
    }

    #[test]
    fn test_billion() {
        let input = "two billion dollars";
        let result = format_numbers(input);
        assert_eq!(result, "$2,000,000,000");
    }
}
