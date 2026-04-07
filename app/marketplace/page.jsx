'use client'

import { useState, useEffect, useCallback } from 'react'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ListingCard from '../../components/ListingCard'
import IndustryFilter from '../../components/IndustryFilter'

export default function MarketplacePage() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [industry, setIndustry] = useState('')
  const [country, setCountry] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (industry) params.set('industry', industry)
      if (country) params.set('country', country)
      if (search) params.set('search', search)
      if (sort) params.set('sort', sort)
      params.set('page', String(page))
      params.set('limit', '20')

      const res = await fetch(`/api/marketplace?${params}`)
      const data = await res.json()
      setListings(data.listings || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Failed to load listings:', err)
    } finally {
      setLoading(false)
    }
  }, [industry, country, search, sort, page])

  useEffect(() => { fetchListings() }, [fetchListings])

  const handleIndustryChange = (ind) => { setIndustry(ind); setPage(1) }
  const handleCountryChange = (c) => { setCountry(c); setPage(1) }

  return (
    <main className="min-h-screen bg-navy-950">
      <Nav />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 md:px-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(218,167,59,0.12),transparent_70%)]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Ready-Made Websites for
              <span className="text-gold-400"> NZ & Australia</span>
            </h1>
            <p className="text-base text-white/60 max-w-2xl mx-auto leading-relaxed">
              Professional AI-generated websites with domains. Buy today, launch tomorrow.
              Every site is SEO-optimised and mobile-ready.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-10">
            <div className="relative">
              <input
                type="text"
                placeholder="Search domains, industries, locations..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="w-full px-5 py-3.5 pl-12 rounded-xl bg-navy-800 border border-white/10 text-white text-sm placeholder:text-white/30 focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/20 outline-none transition-all"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filters */}
          <IndustryFilter
            selected={industry}
            onSelect={handleIndustryChange}
            countryFilter={country}
            onCountryChange={handleCountryChange}
          />
        </div>
      </section>

      {/* Sort & Results count */}
      <section className="px-6 md:px-8 pb-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-sm text-white/40">
            {total} website{total !== 1 ? 's' : ''} available
          </p>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1) }}
            className="bg-navy-800 border border-white/10 text-white/60 text-xs rounded-lg px-3 py-2 outline-none focus:border-gold-400/30"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Most Viewed</option>
          </select>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="px-6 md:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/5 bg-navy-800/30 h-80 animate-pulse" />
              ))}
            </div>
          ) : listings.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {listings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg bg-navy-800 text-white/50 text-sm disabled:opacity-30 hover:text-white transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-white/40 px-4">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg bg-navy-800 text-white/50 text-sm disabled:opacity-30 hover:text-white transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🌐</div>
              <h2 className="text-xl font-semibold text-white mb-2">No websites found</h2>
              <p className="text-sm text-white/40">
                {search || industry || country
                  ? 'Try adjusting your filters or search terms.'
                  : 'New websites are being generated. Check back soon!'}
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
