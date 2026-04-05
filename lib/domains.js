/**
 * SaleOnline.co.nz — Domain Availability & Registration
 *
 * Uses GoDaddy Reseller API for domain availability checks and registration.
 * Supports .co.nz, .nz, .com.au, .net.nz, .org.nz TLDs.
 *
 * Required env vars:
 *   GODADDY_API_KEY    — GoDaddy API key
 *   GODADDY_API_SECRET — GoDaddy API secret
 */

const GODADDY_BASE = 'https://api.godaddy.com/v1'

function getHeaders() {
  const key = process.env.GODADDY_API_KEY
  const secret = process.env.GODADDY_API_SECRET
  if (!key || !secret) throw new Error('GODADDY_API_KEY and GODADDY_API_SECRET required')
  return {
    'Authorization': `sso-key ${key}:${secret}`,
    'Content-Type': 'application/json',
  }
}

/**
 * Check if a single domain is available
 * @returns {{ available: boolean, domain: string, price: number|null }}
 */
export async function checkDomain(domain) {
  const res = await fetch(`${GODADDY_BASE}/domains/available?domain=${encodeURIComponent(domain)}`, {
    headers: getHeaders(),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Domain check failed: ${err}`)
  }
  const data = await res.json()
  return {
    available: data.available,
    domain: data.domain,
    price: data.price ? Math.round(data.price / 10000) : null, // GoDaddy returns price in micro-units
    currency: data.currency || 'USD',
  }
}

/**
 * Batch check multiple domains
 * @param {string[]} domains - Array of full domain names
 * @returns {Array<{ available: boolean, domain: string, price: number|null }>}
 */
export async function checkDomainsInBatch(domains) {
  // GoDaddy doesn't have a true batch endpoint, so we check in parallel with rate limiting
  const results = []
  const batchSize = 10
  for (let i = 0; i < domains.length; i += batchSize) {
    const batch = domains.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(async (domain) => {
        try {
          return await checkDomain(domain)
        } catch {
          return { available: false, domain, price: null, error: true }
        }
      })
    )
    results.push(...batchResults)
    // Rate limit: wait 1s between batches
    if (i + batchSize < domains.length) {
      await new Promise(r => setTimeout(r, 1000))
    }
  }
  return results
}

/**
 * Generate domain name candidates for an industry + location
 * Returns an array of domain strings to check
 */
export function generateDomainCandidates(industry, location, country) {
  const tlds = country === 'nz' ? ['.co.nz', '.nz'] : ['.com.au', '.net.au']
  const candidates = []

  // Clean inputs
  const loc = location.toLowerCase().replace(/\s+/g, '')
  const ind = industry.toLowerCase().replace(/\s+/g, '')

  // Pattern: {location}{industry}.tld
  // e.g., aucklandplumber.co.nz, sydneyelectrician.com.au
  for (const tld of tlds) {
    candidates.push(`${loc}${ind}${tld}`)
    candidates.push(`${ind}${loc}${tld}`)
    candidates.push(`${loc}${ind}s${tld}`)
    candidates.push(`${ind}s${loc}${tld}`)
    candidates.push(`best${loc}${ind}${tld}`)
    candidates.push(`${loc}${ind}pro${tld}`)
    candidates.push(`the${loc}${ind}${tld}`)
    candidates.push(`${ind}near${loc}${tld}`)
    candidates.push(`${loc}${ind}experts${tld}`)
    candidates.push(`pro${ind}${loc}${tld}`)
  }

  return candidates
}

/**
 * NZ and AU cities for scanning
 */
export const NZ_CITIES = [
  'auckland', 'wellington', 'christchurch', 'hamilton', 'tauranga',
  'dunedin', 'palmerston-north', 'napier', 'nelson', 'rotorua',
  'new-plymouth', 'whangarei', 'invercargill', 'whanganui', 'gisborne',
  'northshore', 'manukau', 'waitakere', 'kapiti', 'queenstown',
]

export const AU_CITIES = [
  'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide',
  'goldcoast', 'canberra', 'hobart', 'darwin', 'cairns',
  'townsville', 'newcastle', 'wollongong', 'geelong', 'sunshine-coast',
  'toowoomba', 'ballarat', 'bendigo', 'launceston', 'mackay',
]

/**
 * Industries with their search keywords and typical pricing
 */
export const INDUSTRIES = {
  plumber: { label: 'Plumbing', keywords: ['plumber', 'plumbing'], basePrice: 99900 },
  electrician: { label: 'Electrical', keywords: ['electrician', 'electrical'], basePrice: 99900 },
  builder: { label: 'Building & Construction', keywords: ['builder', 'building', 'construction'], basePrice: 149900 },
  painter: { label: 'Painting', keywords: ['painter', 'painting'], basePrice: 79900 },
  landscaper: { label: 'Landscaping', keywords: ['landscaper', 'landscaping'], basePrice: 89900 },
  roofing: { label: 'Roofing', keywords: ['roofer', 'roofing'], basePrice: 99900 },
  hvac: { label: 'HVAC & Air Conditioning', keywords: ['hvac', 'airconditioning', 'heating'], basePrice: 119900 },
  cleaner: { label: 'Cleaning Services', keywords: ['cleaner', 'cleaning'], basePrice: 69900 },
  dentist: { label: 'Dental', keywords: ['dentist', 'dental'], basePrice: 199900 },
  physio: { label: 'Physiotherapy', keywords: ['physio', 'physiotherapy'], basePrice: 149900 },
  lawyer: { label: 'Legal Services', keywords: ['lawyer', 'legal', 'solicitor'], basePrice: 249900 },
  accountant: { label: 'Accounting', keywords: ['accountant', 'accounting'], basePrice: 199900 },
  realestate: { label: 'Real Estate', keywords: ['realestate', 'property'], basePrice: 199900 },
  restaurant: { label: 'Restaurant & Dining', keywords: ['restaurant', 'dining', 'cafe'], basePrice: 99900 },
  hotel: { label: 'Accommodation', keywords: ['hotel', 'motel', 'accommodation'], basePrice: 149900 },
  tourism: { label: 'Tourism & Activities', keywords: ['tours', 'tourism', 'activities'], basePrice: 119900 },
  mining: { label: 'Mining Services', keywords: ['mining', 'miningservices', 'drill'], basePrice: 299900 },
  mechanic: { label: 'Auto Mechanic', keywords: ['mechanic', 'autorepair', 'garage'], basePrice: 89900 },
  vet: { label: 'Veterinary', keywords: ['vet', 'veterinary'], basePrice: 149900 },
  gym: { label: 'Fitness & Gym', keywords: ['gym', 'fitness', 'personaltrainer'], basePrice: 89900 },
}

/**
 * Estimate the commercial value of a domain based on industry and location
 * Returns price in cents (NZD)
 */
export function estimateDomainValue(domain, industry, location) {
  const industryData = INDUSTRIES[industry]
  if (!industryData) return 99900 // default $999

  let value = industryData.basePrice

  // Major cities command higher prices
  const majorCities = ['auckland', 'sydney', 'melbourne', 'wellington', 'brisbane', 'perth']
  if (majorCities.includes(location.toLowerCase())) {
    value = Math.round(value * 1.5)
  }

  // Short domains are more valuable
  const domainWithoutTld = domain.split('.')[0]
  if (domainWithoutTld.length < 15) {
    value = Math.round(value * 1.3)
  }

  return value
}
