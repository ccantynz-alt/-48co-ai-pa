/**
 * SaleOnline.co.nz — Domain Availability & Registration
 *
 * Uses FREE WHOIS protocol for domain availability checks.
 * No API keys. No GoDaddy. No third-party accounts needed.
 * Supports .co.nz, .nz, .com.au, .net.au TLDs.
 *
 * Required env vars: NONE for domain checking.
 */
import whois from 'whois-json'

/**
 * Check if a single domain is available via WHOIS lookup.
 * Free. No API key needed.
 *
 * How it works: If WHOIS returns no registrant/status data, the domain is available.
 * .nz domains: NZRS WHOIS returns "query_status: 220 Available" when not registered.
 * .au domains: auDA WHOIS returns no data or "NOT FOUND" when not registered.
 */
export async function checkDomain(domain) {
  try {
    const result = await whois(domain)

    // Check for availability signals
    const raw = JSON.stringify(result).toLowerCase()

    // NZ domains: NZRS returns "220 available" in query_status
    if (raw.includes('220 available') || raw.includes('no match') || raw.includes('not found')) {
      return { available: true, domain, price: null }
    }

    // If there's a registrant or domain name in the result, it's taken
    if (result.domainName || result.registrantName || result.registrant || raw.includes('registered')) {
      return { available: false, domain, price: null }
    }

    // If WHOIS returned empty/minimal data, likely available
    if (Object.keys(result).length < 3) {
      return { available: true, domain, price: null }
    }

    // Default: assume taken (safer)
    return { available: false, domain, price: null }
  } catch (err) {
    // WHOIS errors often mean the domain doesn't exist (available)
    // But could also be a network error, so mark as unknown
    const msg = err.message?.toLowerCase() || ''
    if (msg.includes('no match') || msg.includes('not found') || msg.includes('available')) {
      return { available: true, domain, price: null }
    }
    return { available: false, domain, price: null, error: true }
  }
}

/**
 * Batch check multiple domains via WHOIS.
 * Rate-limited to avoid WHOIS server throttling.
 */
export async function checkDomainsInBatch(domains) {
  const results = []
  const batchSize = 5 // WHOIS servers throttle aggressively, keep batches small
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
    // Rate limit: wait 2s between batches to avoid WHOIS throttling
    if (i + batchSize < domains.length) {
      await new Promise(r => setTimeout(r, 2000))
    }
  }
  return results
}

/**
 * Generate domain name candidates for an industry + location.
 * Returns an array of domain strings to check.
 */
export function generateDomainCandidates(industry, location, country) {
  const tlds = country === 'nz' ? ['.co.nz', '.nz'] : ['.com.au', '.net.au']
  const candidates = []

  // Clean inputs
  const loc = location.toLowerCase().replace(/[\s-]+/g, '')
  const ind = industry.toLowerCase().replace(/[\s-]+/g, '')

  // Generate high-value domain patterns
  for (const tld of tlds) {
    candidates.push(`${loc}${ind}${tld}`)         // aucklandplumber.co.nz
    candidates.push(`${ind}${loc}${tld}`)          // plumberauckland.co.nz
    candidates.push(`${loc}${ind}s${tld}`)         // aucklandplumbers.co.nz
    candidates.push(`${ind}s${loc}${tld}`)         // plumbersauckland.co.nz
    candidates.push(`best${loc}${ind}${tld}`)      // bestaucklandplumber.co.nz
    candidates.push(`${loc}${ind}pro${tld}`)       // aucklandplumberpro.co.nz
    candidates.push(`the${loc}${ind}${tld}`)       // theaucklandplumber.co.nz
    candidates.push(`${ind}near${loc}${tld}`)      // plumbernearauckland.co.nz
    candidates.push(`${loc}${ind}experts${tld}`)   // aucklandplumberexperts.co.nz
    candidates.push(`pro${ind}${loc}${tld}`)       // proplumberauckland.co.nz
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
 * Industries with their search keywords and typical pricing (cents NZD)
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
 * Estimate the commercial value of a domain based on industry and location.
 * Returns price in cents (NZD).
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
