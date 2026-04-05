'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Nav from '../../../components/Nav'
import Footer from '../../../components/Footer'
import { INDUSTRY_ICONS, INDUSTRY_LABELS } from '../../../components/ListingCard'

export default function ListingDetailPage() {
  const { id } = useParams()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/marketplace/${id}`)
        if (res.ok) {
          setListing(await res.json())
        }
      } catch (err) {
        console.error('Failed to load listing:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handlePurchase() {
    setPurchasing(true)
    try {
      const token = localStorage.getItem('session_token')
      if (!token) {
        alert('Please sign in to purchase a website.')
        setPurchasing(false)
        return
      }

      const res = await fetch('/api/marketplace/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ listingId: id }),
      })

      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        alert(data.error || 'Purchase failed. Please try again.')
      }
    } catch (err) {
      alert('Something went wrong. Please try again.')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-navy-950">
        <Nav />
        <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-navy-800 rounded-lg" />
            <div className="h-96 bg-navy-800 rounded-2xl" />
          </div>
        </div>
      </main>
    )
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-navy-950">
        <Nav />
        <div className="pt-32 pb-20 px-6 text-center">
          <h1 className="text-2xl font-bold text-white">Listing not found</h1>
          <a href="/marketplace" className="text-gold-400 text-sm mt-4 inline-block">Back to marketplace</a>
        </div>
        <Footer />
      </main>
    )
  }

  const icon = INDUSTRY_ICONS[listing.industry] || '🌐'
  const label = INDUSTRY_LABELS[listing.industry] || listing.industry
  const cityName = listing.location ? listing.location.charAt(0).toUpperCase() + listing.location.slice(1).replace(/-/g, ' ') : ''
  const countryName = listing.country === 'nz' ? 'New Zealand' : 'Australia'
  const countryFlag = listing.country === 'nz' ? '🇳🇿' : '🇦🇺'

  return (
    <main className="min-h-screen bg-navy-950">
      <Nav />

      <section className="pt-28 pb-20 px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Back link */}
          <a href="/marketplace" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to marketplace
          </a>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{icon}</span>
                <div>
                  <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">{label}</span>
                  <span className="text-white/20 mx-2">·</span>
                  <span className="text-xs text-white/40">{countryFlag} {cityName}, {countryName}</span>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                {listing.title}
              </h1>

              <p className="text-sm text-white/50 font-mono mb-6">{listing.domain}</p>

              <p className="text-base text-white/60 leading-relaxed mb-8">
                {listing.description}
              </p>

              {/* Preview toggle */}
              <div className="mb-8">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-6 py-3 rounded-xl bg-navy-800 border border-white/10 text-sm font-semibold text-white hover:border-gold-400/30 transition-all"
                >
                  {showPreview ? 'Hide Preview' : 'Preview Website'}
                </button>
              </div>

              {/* Site preview iframe */}
              {showPreview && listing.previewHtml && (
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-white mb-8">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 border-b border-gray-200">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="w-3 h-3 rounded-full bg-yellow-400" />
                      <span className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs text-gray-400 font-mono ml-2">{listing.domain}</span>
                  </div>
                  <iframe
                    srcDoc={listing.previewHtml}
                    className="w-full h-[600px] border-0"
                    title={`Preview of ${listing.domain}`}
                    sandbox="allow-scripts"
                  />
                </div>
              )}

              {/* What's included */}
              <div className="rounded-2xl border border-white/10 bg-navy-800/50 p-8">
                <h2 className="text-lg font-bold text-white mb-6">What&apos;s Included</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: '🌐', title: 'Domain Name', desc: listing.domain },
                    { icon: '📱', title: 'Responsive Design', desc: 'Looks perfect on all devices' },
                    { icon: '🔍', title: 'SEO Optimised', desc: 'Meta tags, schema markup, keywords' },
                    { icon: '📄', title: `${listing.pages?.length || 4} Professional Pages`, desc: 'Home, About, Services, Contact' },
                    { icon: '✉️', title: 'Contact Form', desc: 'Ready for customer enquiries' },
                    { icon: '🎨', title: 'Industry Design', desc: `Professional ${label.toLowerCase()} design` },
                    { icon: '⚡', title: 'Fast Loading', desc: 'Optimised for speed' },
                    { icon: '🔒', title: 'SSL Certificate', desc: 'Secure HTTPS included' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                        <p className="text-xs text-white/40">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - Purchase card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-white/10 bg-navy-800/50 p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-white mb-1">
                    ${(listing.price / 100).toLocaleString()}
                    <span className="text-sm text-white/30 font-normal ml-1">NZD</span>
                  </div>
                  <p className="text-xs text-white/40">One-time purchase</p>
                </div>

                <div className="border-t border-white/5 pt-4 mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-white/50">Hosting</span>
                    <span className="text-white font-medium">${(listing.monthlyPrice / 100).toFixed(0)}/mo</span>
                  </div>
                  <p className="text-[11px] text-white/30">Includes hosting, SSL, CDN, and AI maintenance</p>
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={purchasing || listing.status !== 'active'}
                  className="w-full px-6 py-3.5 rounded-xl bg-gold-400 hover:bg-gold-300 text-navy-950 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold-400/20"
                >
                  {purchasing ? 'Processing...' : listing.status === 'active' ? 'Purchase Website' : 'Sold'}
                </button>

                <p className="text-[11px] text-white/30 text-center mt-3">
                  Secure checkout via Stripe. Domain transfer included.
                </p>

                <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Instant access after purchase
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Full ownership of domain and content
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Customise all content after purchase
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Cancel hosting anytime
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
