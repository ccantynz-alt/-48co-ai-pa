export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import { authenticate, checkLimit, recordUsage, initDb } from '../../../lib/db'

/**
 * POST /api/translate — AI-powered translation via Claude
 *
 * The most sophisticated translation in any voice product.
 * Features:
 * - 200+ languages including Te Reo Māori
 * - Domain-aware (legal, medical, finance terminology)
 * - Formality control (formal/informal/auto)
 * - Custom glossary (preserve proper nouns, brand names, legal terms)
 * - Formatting preservation (markdown, lists, etc.)
 * - Multiple alternatives for ambiguous phrases
 * - Segment-level alignment for word-by-word highlighting
 */
export async function POST(request) {
  await initDb()
  const user = await authenticate(request)
  if (!user) return NextResponse.json({ error: 'Please sign in first' }, { status: 401 })

  const withinLimit = await checkLimit(user, 'rewrite') // shares rewrite quota
  if (!withinLimit) {
    return NextResponse.json(
      { error: 'Daily translation limit reached. Upgrade to Pro for unlimited translations.', upgrade: user.plan === 'free' },
      { status: 429 }
    )
  }

  const {
    text,
    sourceLang = 'auto',
    targetLang,
    domain = 'general',
    formality = 'auto',
    glossary = [],
    preserveFormatting = true,
  } = await request.json()

  if (!text) return NextResponse.json({ error: 'Please provide text to translate' }, { status: 400 })
  if (!targetLang) return NextResponse.json({ error: 'Please specify a target language' }, { status: 400 })
  if (text.length > 5000) return NextResponse.json({ error: 'Text exceeds the 5,000 character limit. Please split into smaller sections.' }, { status: 400 })

  const claudeKey = process.env.CLAUDE_API_KEY
  if (!claudeKey) return NextResponse.json({ error: 'Translation service unavailable' }, { status: 503 })

  // Build the translation system prompt
  const systemPrompt = buildTranslationPrompt({
    sourceLang,
    targetLang,
    domain,
    formality,
    glossary,
    preserveFormatting,
  })

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: text }],
      }),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Translation service is temporarily unavailable. Please try again in a moment.' },
        { status: 502 }
      )
    }

    const data = await response.json()
    const content = data.content?.[0]?.text?.trim() || ''

    // Parse the structured response
    let result
    try {
      // Try to parse as JSON first (structured response)
      const jsonStr = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim()
      result = JSON.parse(jsonStr)
    } catch {
      // Fallback: treat the entire response as the translation
      result = {
        translated_text: content,
        detected_language: sourceLang === 'auto' ? 'unknown' : sourceLang,
        confidence: 0.9,
        alternatives: [],
        segments: [],
      }
    }

    await recordUsage(user.user_id, 'translate', data.usage?.output_tokens || 0)

    return NextResponse.json({
      translatedText: result.translated_text || content,
      detectedLanguage: result.detected_language || sourceLang,
      confidence: result.confidence || 0.9,
      alternatives: result.alternatives || [],
      segments: result.segments || [],
    })
  } catch (err) {
    console.error('Translation error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again shortly.' }, { status: 500 })
  }
}

/**
 * Build a sophisticated system prompt for translation.
 * This is what makes our translation the best — context-aware, domain-specific,
 * formality-controlled, glossary-enforced.
 */
function buildTranslationPrompt({ sourceLang, targetLang, domain, formality, glossary, preserveFormatting }) {
  const langNames = {
    en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian',
    pt: 'Portuguese', 'pt-BR': 'Brazilian Portuguese', nl: 'Dutch', ru: 'Russian',
    zh: 'Chinese (Simplified)', 'zh-TW': 'Chinese (Traditional)', ja: 'Japanese',
    ko: 'Korean', ar: 'Arabic', hi: 'Hindi', bn: 'Bengali', tr: 'Turkish',
    vi: 'Vietnamese', th: 'Thai', pl: 'Polish', uk: 'Ukrainian', id: 'Indonesian',
    ms: 'Malay', mi: 'Te Reo Māori', sm: 'Samoan', to: 'Tongan', sv: 'Swedish',
    da: 'Danish', no: 'Norwegian', fi: 'Finnish', el: 'Greek', cs: 'Czech',
    ro: 'Romanian', hu: 'Hungarian', he: 'Hebrew', fa: 'Persian', ur: 'Urdu',
    ta: 'Tamil', af: 'Afrikaans', sw: 'Swahili',
  }

  const targetName = langNames[targetLang] || targetLang
  const sourceDesc = sourceLang === 'auto'
    ? 'Detect the source language automatically.'
    : `The source language is ${langNames[sourceLang] || sourceLang}.`

  const domainInstructions = {
    general: '',
    legal: `\n\nLEGAL DOMAIN: Use precise legal terminology. Translate legal terms of art accurately (e.g., "habeas corpus", "force majeure", "fiduciary duty"). Maintain the formal register expected in legal documents. If a legal term has no direct equivalent in the target language, keep the Latin/English term and add the target-language explanation in parentheses.`,
    medical: `\n\nMEDICAL DOMAIN: Use standard medical terminology. Translate drug names, conditions, and procedures accurately. Use the International Nonproprietary Name (INN) for medications where applicable. Maintain clinical precision — ambiguity in medical translation can be dangerous.`,
    finance: `\n\nFINANCE DOMAIN: Use standard financial terminology. Preserve all numbers, currencies, percentages, and dates EXACTLY as they appear in the source. Translate accounting terms (EBITDA, P/E ratio, amortisation) using the accepted equivalents in the target language.`,
    technical: `\n\nTECHNICAL DOMAIN: Preserve code snippets, variable names, and technical identifiers untranslated. Translate comments, documentation, and UI strings. Use the accepted technical terminology in the target language.`,
  }

  const formalityInstructions = {
    formal: '\n\nUse FORMAL register throughout. Use polite/honorific forms where the target language has them (e.g., usted in Spanish, vous in French, Sie in German, keigo in Japanese).',
    informal: '\n\nUse INFORMAL register throughout. Use familiar forms where appropriate (e.g., tú in Spanish, tu in French, du in German).',
    auto: '\n\nMatch the formality level of the source text.',
  }

  let glossarySection = ''
  if (glossary.length > 0) {
    const entries = glossary
      .filter(g => g.source && g.target)
      .map(g => `  "${g.source}" → "${g.target}"`)
      .join('\n')
    if (entries) {
      glossarySection = `\n\nMANDATORY GLOSSARY — Always use these exact translations:\n${entries}\nThese override any other translation choice. They are non-negotiable.`
    }
  }

  const formattingNote = preserveFormatting
    ? '\n\nPreserve all formatting: markdown, bullet points, numbered lists, headings, bold/italic, code blocks, links. Only translate the text content, not the formatting syntax.'
    : ''

  return `You are the world's most sophisticated translation engine for 48co Voice. You translate text between 200+ languages with domain expertise, formality control, and glossary enforcement.

${sourceDesc} Translate to ${targetName}.

Return a JSON object with this EXACT structure:
{
  "translated_text": "the full translation",
  "detected_language": "ISO 639-1 code of the detected source language",
  "confidence": 0.95,
  "alternatives": ["alternative translation 1", "alternative translation 2"],
  "segments": [
    {"source": "source phrase", "target": "translated phrase", "confidence": 0.95}
  ]
}

RULES:
- Produce natural, fluent ${targetName} — not word-for-word literal translation
- Preserve the tone, intent, and nuance of the original
- Numbers, dates, currencies, and proper nouns should be preserved or correctly localised
- If a phrase is ambiguous, provide alternatives in the "alternatives" array
- Break the translation into meaningful segments for word-level alignment
- NEVER add explanatory notes or translator comments — just translate
- Return ONLY valid JSON, no markdown fences${domainInstructions[domain] || ''}${formalityInstructions[formality] || formalityInstructions.auto}${glossarySection}${formattingNote}`
}
