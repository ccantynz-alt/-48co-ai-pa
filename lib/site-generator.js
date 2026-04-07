/**
 * SaleOnline.co.nz — AI Site Generator Pipeline
 *
 * Orchestrates the full pipeline:
 * Domain scan → AI content generation → Template assembly → Deploy → List
 *
 * Uses Claude Sonnet 4.6 for content generation (latest, best quality).
 */
import { INDUSTRIES } from './domains.js'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2025-09-01'
const CONTENT_MODEL = 'claude-sonnet-4-6'

/**
 * Generate complete website content for a business using Claude AI
 */
export async function generateSiteContent({ domain, industry, location, country }) {
  const apiKey = process.env.CLAUDE_API_KEY
  if (!apiKey) throw new Error('CLAUDE_API_KEY required')

  const industryData = INDUSTRIES[industry] || { label: industry }
  const countryName = country === 'nz' ? 'New Zealand' : 'Australia'
  const cityName = location.charAt(0).toUpperCase() + location.slice(1).replace(/-/g, ' ')

  const systemPrompt = `You are an expert website copywriter specializing in local business websites for ${countryName}. You write compelling, SEO-optimised content that converts visitors into customers. Your writing is professional, warm, and specific to the local market. Use ${country === 'nz' ? 'New Zealand' : 'Australian'} English spelling (e.g., ${country === 'nz' ? 'specialise, colour, organise' : 'specialise, colour, organise'}).

CRITICAL: Return ONLY valid JSON. No markdown, no code fences, no explanation. Just the JSON object.`

  const userPrompt = `Generate complete website content for a ${industryData.label} business in ${cityName}, ${countryName}.

Domain: ${domain}

Return this exact JSON structure:
{
  "businessName": "A professional, memorable business name based on the domain",
  "tagline": "A compelling tagline (max 10 words)",
  "phone": "placeholder",
  "email": "placeholder",
  "address": "${cityName}, ${countryName}",
  "homepage": {
    "hero": {
      "heading": "Primary headline (max 8 words, attention-grabbing)",
      "subheading": "Supporting text (1-2 sentences, explains the value)",
      "cta": "Call-to-action button text (3-4 words)"
    },
    "services": [
      { "name": "Service name", "description": "2-3 sentence description", "icon": "emoji" }
    ],
    "whyUs": [
      { "title": "Unique selling point", "description": "1-2 sentences" }
    ],
    "stats": [
      { "number": "15+", "label": "Years Experience" },
      { "number": "2000+", "label": "Happy Customers" },
      { "number": "24/7", "label": "Emergency Service" },
      { "number": "100%", "label": "Satisfaction Guarantee" }
    ]
  },
  "aboutPage": {
    "heading": "About page heading",
    "story": "3-4 paragraphs about the business (local, trustworthy, experienced). Reference the local area.",
    "values": [
      { "title": "Value name", "description": "1 sentence" }
    ],
    "team": "Brief description of the team (generic, buyer will customize)"
  },
  "servicesPage": {
    "heading": "Services page heading",
    "intro": "1-2 sentences introducing the services",
    "services": [
      { "name": "Service name", "description": "3-4 sentences with detail", "features": ["feature1", "feature2", "feature3"] }
    ]
  },
  "contactPage": {
    "heading": "Contact page heading",
    "intro": "1-2 sentences encouraging contact",
    "hours": "Mon-Fri: 7am-6pm, Sat: 8am-2pm",
    "emergency": true
  },
  "seo": {
    "title": "SEO page title (50-60 chars)",
    "description": "Meta description (150-160 chars)",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
    "ogTitle": "Social sharing title",
    "ogDescription": "Social sharing description"
  },
  "schema": {
    "@type": "LocalBusiness",
    "priceRange": "$$"
  },
  "colors": {
    "primary": "A hex color that suits the industry (e.g., blue for trades, green for health)",
    "secondary": "A complementary accent color",
    "background": "Light background hex (e.g., #ffffff or #f8fafc)"
  }
}

Generate 5-7 services appropriate for a ${industryData.label} business in ${cityName}. Make it specific to the local market. Reference local landmarks, suburbs, or areas where relevant.`

  const response = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: CONTENT_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Claude API error: ${err}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text?.trim() || '{}'
  const jsonStr = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim()

  try {
    return JSON.parse(jsonStr)
  } catch {
    throw new Error(`Failed to parse AI content: ${jsonStr.substring(0, 200)}`)
  }
}

/**
 * Score a domain opportunity using AI
 * Returns a score 1-100 and reasoning
 */
export async function scoreDomainOpportunity({ domain, industry, location, country }) {
  const apiKey = process.env.CLAUDE_API_KEY
  if (!apiKey) throw new Error('CLAUDE_API_KEY required')

  const countryName = country === 'nz' ? 'New Zealand' : 'Australia'
  const cityName = location.charAt(0).toUpperCase() + location.slice(1).replace(/-/g, ' ')

  const response = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001', // Use Haiku for scoring (cheaper, faster)
      max_tokens: 256,
      system: 'You are a domain valuation expert. Return ONLY valid JSON.',
      messages: [{
        role: 'user',
        content: `Score this domain for commercial website value. Domain: ${domain}, Industry: ${industry}, City: ${cityName}, Country: ${countryName}. Return JSON: { "score": 1-100, "reason": "brief reason", "estimatedMonthlySearches": number, "competitionLevel": "low|medium|high" }`,
      }],
    }),
  })

  if (!response.ok) return { score: 50, reason: 'Scoring unavailable' }

  const data = await response.json()
  const text = data.content?.[0]?.text?.trim() || '{}'
  const jsonStr = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim()

  try {
    return JSON.parse(jsonStr)
  } catch {
    return { score: 50, reason: 'Could not parse score' }
  }
}
