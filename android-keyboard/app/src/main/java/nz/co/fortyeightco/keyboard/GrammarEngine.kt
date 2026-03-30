package nz.co.fortyeightco.keyboard

/**
 * Local grammar checking engine for 48co Voice Keyboard.
 * 30 production rules covering the most common English writing mistakes.
 * Runs entirely on-device -- zero network, zero latency.
 */
object GrammarEngine {

    data class Correction(
        val original: String,
        val replacement: String,
        val startIndex: Int,
        val endIndex: Int,
        val rule: String
    )

    private data class Rule(
        val pattern: Regex,
        val replacement: String,
        val name: String
    )

    private val rules: List<Rule> = listOf(
        // --- Commonly confused words ---
        Rule(
            Regex("\\btheir\\s+(is|was|are|were|has|have|will|would|should|could|can|may|might)\\b", RegexOption.IGNORE_CASE),
            "there $1", "their/there confusion"
        ),
        Rule(
            Regex("\\bthere\\s+(car|house|dog|cat|phone|name|book|idea|opinion|work|job|problem)\\b", RegexOption.IGNORE_CASE),
            "their $1", "there/their confusion"
        ),
        Rule(
            Regex("\\byour\\s+(welcome|right|wrong|correct|the\\s+best|the\\s+worst|going|coming|doing|making|saying)\\b", RegexOption.IGNORE_CASE),
            "you're $1", "your/you're confusion"
        ),
        Rule(
            Regex("\\bits\\s+a\\s+(good|great|bad|nice|long|short|big|small|new|old)\\b"),
            "it's a $1", "its/it's confusion"
        ),
        Rule(
            Regex("\\bthen\\s+(I|you|we|they|he|she|it)\\s+(would|could|should|will|can|may|might)\\b", RegexOption.IGNORE_CASE),
            "than $1 $2", "then/than confusion"
        ),
        Rule(
            Regex("\\bmore\\s+better\\b", RegexOption.IGNORE_CASE),
            "better", "double comparative"
        ),
        Rule(
            Regex("\\bmost\\s+best\\b", RegexOption.IGNORE_CASE),
            "best", "double superlative"
        ),

        // --- Subject-verb agreement ---
        Rule(
            Regex("\\b(he|she|it)\\s+don't\\b", RegexOption.IGNORE_CASE),
            "$1 doesn't", "subject-verb agreement"
        ),
        Rule(
            Regex("\\b(I|we|they|you)\\s+doesn't\\b", RegexOption.IGNORE_CASE),
            "$1 don't", "subject-verb agreement"
        ),
        Rule(
            Regex("\\beveryone\\s+are\\b", RegexOption.IGNORE_CASE),
            "everyone is", "everyone is singular"
        ),
        Rule(
            Regex("\\bnobody\\s+are\\b", RegexOption.IGNORE_CASE),
            "nobody is", "nobody is singular"
        ),
        Rule(
            Regex("\\beach\\s+of\\s+the\\s+\\w+\\s+are\\b", RegexOption.IGNORE_CASE),
            "each of the ... is", "each is singular"
        ),

        // --- Common misspellings ---
        Rule(Regex("\\brecieve\\b", RegexOption.IGNORE_CASE), "receive", "spelling: receive"),
        Rule(Regex("\\boccured\\b", RegexOption.IGNORE_CASE), "occurred", "spelling: occurred"),
        Rule(Regex("\\bseperate\\b", RegexOption.IGNORE_CASE), "separate", "spelling: separate"),
        Rule(Regex("\\boccassion\\b", RegexOption.IGNORE_CASE), "occasion", "spelling: occasion"),
        Rule(Regex("\\bneccessary\\b", RegexOption.IGNORE_CASE), "necessary", "spelling: necessary"),
        Rule(Regex("\\bnecessary\\b").let { Regex("\\bneccessary\\b|\\bneccesary\\b|\\bnecesary\\b", RegexOption.IGNORE_CASE) }, "necessary", "spelling: necessary"),
        Rule(Regex("\\baccommodate\\b").let { Regex("\\baccomodate\\b|\\baccomidate\\b", RegexOption.IGNORE_CASE) }, "accommodate", "spelling: accommodate"),
        Rule(Regex("\\bdefinately\\b|\\bdefinatly\\b|\\bdefiantely\\b", RegexOption.IGNORE_CASE), "definitely", "spelling: definitely"),
        Rule(Regex("\\bgorvernment\\b|\\bgoverment\\b", RegexOption.IGNORE_CASE), "government", "spelling: government"),
        Rule(Regex("\\benviroment\\b|\\benvirornment\\b", RegexOption.IGNORE_CASE), "environment", "spelling: environment"),

        // --- Punctuation and spacing ---
        Rule(
            Regex("\\bi\\b(?!')"),
            "I", "capitalize I"
        ),
        Rule(
            Regex("\\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\\b"),
            "", "capitalize day names"  // handled specially in apply
        ),
        Rule(
            Regex("\\b(january|february|march|april|may|june|july|august|september|october|november|december)\\b"),
            "", "capitalize month names"  // handled specially in apply
        ),

        // --- Redundancy ---
        Rule(Regex("\\bATM\\s+machine\\b", RegexOption.IGNORE_CASE), "ATM", "redundant: ATM machine"),
        Rule(Regex("\\bPIN\\s+number\\b", RegexOption.IGNORE_CASE), "PIN", "redundant: PIN number"),
        Rule(Regex("\\bfree\\s+gift\\b", RegexOption.IGNORE_CASE), "gift", "redundant: free gift"),

        // --- Professional writing ---
        Rule(Regex("\\balot\\b", RegexOption.IGNORE_CASE), "a lot", "alot -> a lot"),
        Rule(Regex("\\bcould\\s+of\\b", RegexOption.IGNORE_CASE), "could have", "could of -> could have"),
        Rule(Regex("\\bshould\\s+of\\b", RegexOption.IGNORE_CASE), "should have", "should of -> should have"),
        Rule(Regex("\\bwould\\s+of\\b", RegexOption.IGNORE_CASE), "would have", "would of -> would have"),
    )

    /**
     * Check text for grammar issues and return a list of corrections.
     */
    fun check(text: String): List<Correction> {
        if (text.isBlank()) return emptyList()

        val corrections = mutableListOf<Correction>()

        for (rule in rules) {
            // Special handling for capitalization rules
            if (rule.name == "capitalize day names" || rule.name == "capitalize month names") {
                rule.pattern.findAll(text).forEach { match ->
                    val original = match.value
                    val capitalized = original.replaceFirstChar { it.uppercaseChar() }
                    if (original != capitalized) {
                        corrections.add(
                            Correction(
                                original = original,
                                replacement = capitalized,
                                startIndex = match.range.first,
                                endIndex = match.range.last + 1,
                                rule = rule.name
                            )
                        )
                    }
                }
                continue
            }

            // Special handling for "capitalize I" — avoid matching inside words
            if (rule.name == "capitalize I") {
                rule.pattern.findAll(text).forEach { match ->
                    val idx = match.range.first
                    val endIdx = match.range.last
                    // Ensure it's a standalone lowercase "i"
                    val charBefore = if (idx > 0) text[idx - 1] else ' '
                    val charAfter = if (endIdx + 1 < text.length) text[endIdx + 1] else ' '
                    if (!charBefore.isLetter() && !charAfter.isLetter() && match.value == "i") {
                        corrections.add(
                            Correction(
                                original = "i",
                                replacement = "I",
                                startIndex = idx,
                                endIndex = endIdx + 1,
                                rule = rule.name
                            )
                        )
                    }
                }
                continue
            }

            rule.pattern.findAll(text).forEach { match ->
                val replacement = rule.pattern.replaceFirst(match.value, rule.replacement)
                if (replacement != match.value) {
                    corrections.add(
                        Correction(
                            original = match.value,
                            replacement = replacement,
                            startIndex = match.range.first,
                            endIndex = match.range.last + 1,
                            rule = rule.name
                        )
                    )
                }
            }
        }

        // Sort by position (reverse) so corrections can be applied back-to-front
        return corrections.sortedByDescending { it.startIndex }
    }

    /**
     * Apply all corrections to text and return the corrected version.
     */
    fun correct(text: String): String {
        val corrections = check(text)
        if (corrections.isEmpty()) return text

        val sb = StringBuilder(text)
        for (c in corrections) {
            if (c.startIndex >= 0 && c.endIndex <= sb.length) {
                sb.replace(c.startIndex, c.endIndex, c.replacement)
            }
        }
        return sb.toString()
    }
}
