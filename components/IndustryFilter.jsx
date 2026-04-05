'use client'

import { INDUSTRY_ICONS, INDUSTRY_LABELS } from './ListingCard'

const FILTER_INDUSTRIES = [
  'plumber', 'electrician', 'builder', 'painter', 'landscaper', 'roofing', 'hvac', 'cleaner',
  'dentist', 'physio', 'lawyer', 'accountant', 'realestate', 'restaurant', 'hotel', 'tourism', 'mining',
]

export default function IndustryFilter({ selected, onSelect, countryFilter, onCountryChange }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Country toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onCountryChange('')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${!countryFilter ? 'bg-gold-400 text-navy-950' : 'bg-navy-800 text-white/50 hover:text-white'}`}
        >
          All
        </button>
        <button
          onClick={() => onCountryChange('nz')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${countryFilter === 'nz' ? 'bg-gold-400 text-navy-950' : 'bg-navy-800 text-white/50 hover:text-white'}`}
        >
          🇳🇿 New Zealand
        </button>
        <button
          onClick={() => onCountryChange('au')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${countryFilter === 'au' ? 'bg-gold-400 text-navy-950' : 'bg-navy-800 text-white/50 hover:text-white'}`}
        >
          🇦🇺 Australia
        </button>
      </div>

      {/* Industry pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelect('')}
          className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${!selected ? 'bg-gold-400/20 text-gold-400 ring-1 ring-gold-400/30' : 'bg-navy-800 text-white/40 hover:text-white/70'}`}
        >
          All Industries
        </button>
        {FILTER_INDUSTRIES.map(ind => (
          <button
            key={ind}
            onClick={() => onSelect(ind)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              selected === ind
                ? 'bg-gold-400/20 text-gold-400 ring-1 ring-gold-400/30'
                : 'bg-navy-800 text-white/40 hover:text-white/70'
            }`}
          >
            <span>{INDUSTRY_ICONS[ind]}</span>
            <span>{INDUSTRY_LABELS[ind]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
