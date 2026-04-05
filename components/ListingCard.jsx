'use client'

import Link from 'next/link'

const INDUSTRY_ICONS = {
  plumber: '🔧',
  electrician: '⚡',
  builder: '🏗️',
  painter: '🎨',
  landscaper: '🌿',
  roofing: '🏠',
  hvac: '❄️',
  cleaner: '✨',
  dentist: '🦷',
  physio: '💪',
  lawyer: '⚖️',
  accountant: '📊',
  realestate: '🏡',
  restaurant: '🍽️',
  hotel: '🏨',
  tourism: '🌍',
  mining: '⛏️',
  mechanic: '🔩',
  vet: '🐾',
  gym: '🏋️',
}

const INDUSTRY_LABELS = {
  plumber: 'Plumbing',
  electrician: 'Electrical',
  builder: 'Construction',
  painter: 'Painting',
  landscaper: 'Landscaping',
  roofing: 'Roofing',
  hvac: 'HVAC',
  cleaner: 'Cleaning',
  dentist: 'Dental',
  physio: 'Physiotherapy',
  lawyer: 'Legal',
  accountant: 'Accounting',
  realestate: 'Real Estate',
  restaurant: 'Restaurant',
  hotel: 'Accommodation',
  tourism: 'Tourism',
  mining: 'Mining',
  mechanic: 'Auto Repair',
  vet: 'Veterinary',
  gym: 'Fitness',
}

export default function ListingCard({ listing }) {
  const icon = INDUSTRY_ICONS[listing.industry] || '🌐'
  const label = INDUSTRY_LABELS[listing.industry] || listing.industry
  const cityName = listing.location ? listing.location.charAt(0).toUpperCase() + listing.location.slice(1).replace(/-/g, ' ') : ''
  const countryFlag = listing.country === 'nz' ? '🇳🇿' : '🇦🇺'

  return (
    <Link href={`/marketplace/${listing.id}`} className="group block">
      <div className="rounded-2xl border border-white/10 bg-navy-800/50 overflow-hidden hover:border-gold-400/30 hover:shadow-xl hover:shadow-gold-400/5 transition-all duration-300">
        {/* Preview area */}
        <div className="h-44 bg-gradient-to-br from-navy-700 to-navy-800 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(218,167,59,0.08),transparent_70%)] group-hover:opacity-100 opacity-0 transition-opacity" />
          <div className="text-center relative z-10">
            <span className="text-5xl mb-3 block group-hover:scale-110 transition-transform">{icon}</span>
            <span className="text-xs text-white/40 font-mono">{listing.domain}</span>
          </div>
          {listing.featured && (
            <div className="absolute top-3 right-3 bg-gold-400 text-navy-950 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Featured
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-wider">{label}</span>
            <span className="text-white/20">·</span>
            <span className="text-[11px] text-white/40">{countryFlag} {cityName}</span>
          </div>

          <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-gold-400 transition-colors line-clamp-2">
            {listing.title}
          </h3>

          <p className="text-xs text-white/40 leading-relaxed line-clamp-2 mb-4">
            {listing.description}
          </p>

          <div className="flex items-end justify-between pt-3 border-t border-white/5">
            <div>
              <span className="text-lg font-bold text-white">${(listing.price / 100).toLocaleString()}</span>
              <span className="text-xs text-white/30 ml-1">NZD</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-white/40">+ ${(listing.monthlyPrice / 100).toFixed(0)}/mo hosting</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export { INDUSTRY_ICONS, INDUSTRY_LABELS }
