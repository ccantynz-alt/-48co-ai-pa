'use client'

import { useState, useEffect } from 'react'
import Nav from '../../components/Nav'

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [listings, setListings] = useState([])
  const [adminSecret, setAdminSecret] = useState('')
  const [authenticated, setAuthenticated] = useState(false)

  // Scan form
  const [scanIndustry, setScanIndustry] = useState('plumber')
  const [scanLocation, setScanLocation] = useState('auckland')
  const [scanCountry, setScanCountry] = useState('nz')
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)

  // Generate form
  const [genDomain, setGenDomain] = useState('')
  const [genIndustry, setGenIndustry] = useState('plumber')
  const [genLocation, setGenLocation] = useState('auckland')
  const [genCountry, setGenCountry] = useState('nz')
  const [generating, setGenerating] = useState(false)
  const [genResult, setGenResult] = useState(null)

  function handleAuth() {
    if (adminSecret) {
      setAuthenticated(true)
      loadData()
    }
  }

  async function loadData() {
    try {
      const res = await fetch('/api/marketplace?limit=50')
      const data = await res.json()
      setListings(data.listings || [])
      setStats({
        totalListings: data.total,
        totalRevenue: data.listings?.reduce((sum, l) => sum + l.price, 0) || 0,
      })
    } catch (err) {
      console.error('Failed to load data:', err)
    }
  }

  async function handleScan() {
    setScanning(true)
    setScanResult(null)
    try {
      const res = await fetch('/api/domains/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({ industry: scanIndustry, location: scanLocation, country: scanCountry }),
      })
      setScanResult(await res.json())
    } catch (err) {
      setScanResult({ error: err.message })
    } finally {
      setScanning(false)
    }
  }

  async function handleGenerate() {
    setGenerating(true)
    setGenResult(null)
    try {
      const res = await fetch('/api/generate/site', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({ domain: genDomain, industry: genIndustry, location: genLocation, country: genCountry }),
      })
      const result = await res.json()
      setGenResult(result)
      if (result.success) loadData()
    } catch (err) {
      setGenResult({ error: err.message })
    } finally {
      setGenerating(false)
    }
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-navy-950">
        <Nav />
        <div className="pt-32 px-6 max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Admin Access</h1>
          <input
            type="password"
            value={adminSecret}
            onChange={e => setAdminSecret(e.target.value)}
            placeholder="Admin secret"
            className="w-full px-4 py-3 rounded-xl bg-navy-800 border border-white/10 text-white text-sm placeholder:text-white/30 outline-none mb-4"
            onKeyDown={e => e.key === 'Enter' && handleAuth()}
          />
          <button onClick={handleAuth} className="w-full px-6 py-3 rounded-xl bg-gold-400 text-navy-950 font-semibold text-sm">
            Enter
          </button>
        </div>
      </main>
    )
  }

  const industries = [
    'plumber', 'electrician', 'builder', 'painter', 'landscaper', 'roofing', 'hvac', 'cleaner',
    'dentist', 'physio', 'lawyer', 'accountant', 'realestate', 'restaurant', 'hotel', 'tourism', 'mining', 'mechanic', 'vet', 'gym',
  ]

  const nzCities = ['auckland', 'wellington', 'christchurch', 'hamilton', 'tauranga', 'dunedin', 'napier', 'nelson', 'rotorua', 'queenstown', 'northshore']
  const auCities = ['sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'goldcoast', 'canberra', 'hobart', 'cairns', 'newcastle']
  const cities = scanCountry === 'nz' ? nzCities : auCities

  return (
    <main className="min-h-screen bg-navy-950">
      <Nav />

      <div className="pt-28 pb-20 px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-8">SaleOnline Admin</h1>

          {/* Stats */}
          {stats && (
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              <div className="rounded-xl border border-white/10 bg-navy-800/50 p-5">
                <p className="text-xs text-white/40 mb-1">Total Listings</p>
                <p className="text-2xl font-bold text-white">{stats.totalListings}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-navy-800/50 p-5">
                <p className="text-xs text-white/40 mb-1">Total Value (if all sold)</p>
                <p className="text-2xl font-bold text-gold-400">${((stats.totalRevenue || 0) / 100).toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-navy-800/50 p-5">
                <p className="text-xs text-white/40 mb-1">Avg Price</p>
                <p className="text-2xl font-bold text-white">
                  ${stats.totalListings > 0 ? Math.round(stats.totalRevenue / stats.totalListings / 100).toLocaleString() : 0}
                </p>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Domain Scanner */}
            <div className="rounded-2xl border border-white/10 bg-navy-800/50 p-6">
              <h2 className="text-lg font-bold text-white mb-4">Domain Scanner</h2>
              <p className="text-xs text-white/40 mb-4">Scan for available domains in a specific industry and location.</p>

              <div className="space-y-3">
                <select value={scanIndustry} onChange={e => setScanIndustry(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-navy-900 border border-white/10 text-white text-sm outline-none">
                  {industries.map(i => <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>)}
                </select>

                <div className="grid grid-cols-2 gap-3">
                  <select value={scanCountry} onChange={e => { setScanCountry(e.target.value); setScanLocation(e.target.value === 'nz' ? 'auckland' : 'sydney') }}
                    className="px-3 py-2.5 rounded-lg bg-navy-900 border border-white/10 text-white text-sm outline-none">
                    <option value="nz">New Zealand</option>
                    <option value="au">Australia</option>
                  </select>
                  <select value={scanLocation} onChange={e => setScanLocation(e.target.value)}
                    className="px-3 py-2.5 rounded-lg bg-navy-900 border border-white/10 text-white text-sm outline-none">
                    {cities.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace(/-/g, ' ')}</option>)}
                  </select>
                </div>

                <button onClick={handleScan} disabled={scanning}
                  className="w-full px-4 py-3 rounded-lg bg-gold-400 text-navy-950 font-semibold text-sm disabled:opacity-50">
                  {scanning ? 'Scanning...' : 'Scan for Domains'}
                </button>
              </div>

              {scanResult && (
                <div className="mt-4 p-4 rounded-lg bg-navy-900 border border-white/5 text-xs">
                  {scanResult.error ? (
                    <p className="text-red-400">{scanResult.error}</p>
                  ) : (
                    <div>
                      <p className="text-white/60">Scanned: {scanResult.scanned} domains</p>
                      <p className="text-green-400">Available: {scanResult.available}</p>
                      <p className="text-gold-400">Stored: {scanResult.stored}</p>
                      {scanResult.domains?.slice(0, 5).map((d, i) => (
                        <p key={i} className="text-white/40 mt-1">{d.domain} — ${(d.estimatedValue / 100).toLocaleString()}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Site Generator */}
            <div className="rounded-2xl border border-white/10 bg-navy-800/50 p-6">
              <h2 className="text-lg font-bold text-white mb-4">AI Website Generator</h2>
              <p className="text-xs text-white/40 mb-4">Generate a complete website with AI content and list it on the marketplace.</p>

              <div className="space-y-3">
                <input
                  type="text"
                  value={genDomain}
                  onChange={e => setGenDomain(e.target.value)}
                  placeholder="Domain (e.g., aucklandplumber.co.nz)"
                  className="w-full px-3 py-2.5 rounded-lg bg-navy-900 border border-white/10 text-white text-sm placeholder:text-white/30 outline-none"
                />

                <select value={genIndustry} onChange={e => setGenIndustry(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-navy-900 border border-white/10 text-white text-sm outline-none">
                  {industries.map(i => <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>)}
                </select>

                <div className="grid grid-cols-2 gap-3">
                  <select value={genCountry} onChange={e => { setGenCountry(e.target.value); setGenLocation(e.target.value === 'nz' ? 'auckland' : 'sydney') }}
                    className="px-3 py-2.5 rounded-lg bg-navy-900 border border-white/10 text-white text-sm outline-none">
                    <option value="nz">New Zealand</option>
                    <option value="au">Australia</option>
                  </select>
                  <select value={genLocation} onChange={e => setGenLocation(e.target.value)}
                    className="px-3 py-2.5 rounded-lg bg-navy-900 border border-white/10 text-white text-sm outline-none">
                    {(genCountry === 'nz' ? nzCities : auCities).map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace(/-/g, ' ')}</option>
                    ))}
                  </select>
                </div>

                <button onClick={handleGenerate} disabled={generating || !genDomain}
                  className="w-full px-4 py-3 rounded-lg bg-gold-400 text-navy-950 font-semibold text-sm disabled:opacity-50">
                  {generating ? 'Generating with AI...' : 'Generate Website'}
                </button>
              </div>

              {genResult && (
                <div className="mt-4 p-4 rounded-lg bg-navy-900 border border-white/5 text-xs">
                  {genResult.error ? (
                    <p className="text-red-400">{genResult.error}</p>
                  ) : (
                    <div>
                      <p className="text-green-400 font-semibold">Website generated!</p>
                      <p className="text-white/60 mt-1">Business: {genResult.businessName}</p>
                      <p className="text-white/60">Pages: {genResult.pages?.join(', ')}</p>
                      <p className="text-gold-400">Listed at ${(genResult.price / 100).toLocaleString()}</p>
                      <a href={`/marketplace/${genResult.listingId}`} className="text-gold-400 underline mt-2 inline-block">
                        View listing →
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recent Listings */}
          {listings.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-bold text-white mb-4">Recent Listings ({listings.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/40 text-xs border-b border-white/5">
                      <th className="text-left py-3 px-2">Domain</th>
                      <th className="text-left py-3 px-2">Industry</th>
                      <th className="text-left py-3 px-2">Location</th>
                      <th className="text-right py-3 px-2">Price</th>
                      <th className="text-right py-3 px-2">Views</th>
                      <th className="text-left py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map(l => (
                      <tr key={l.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="py-3 px-2">
                          <a href={`/marketplace/${l.id}`} className="text-gold-400 hover:underline font-mono text-xs">{l.domain}</a>
                        </td>
                        <td className="py-3 px-2 text-white/50">{l.industry}</td>
                        <td className="py-3 px-2 text-white/50">{l.country === 'nz' ? '🇳🇿' : '🇦🇺'} {l.location}</td>
                        <td className="py-3 px-2 text-right text-white font-medium">${(l.price / 100).toLocaleString()}</td>
                        <td className="py-3 px-2 text-right text-white/40">{l.views}</td>
                        <td className="py-3 px-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${l.status === 'active' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
