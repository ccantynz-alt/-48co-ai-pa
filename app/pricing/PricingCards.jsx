'use client'

import { useState } from 'react'

export default function PricingCards() {
  const [loading, setLoading] = useState(null)
  const [message, setMessage] = useState(null)

  // Check URL params for success/cancel from Stripe redirect
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true' && !message) {
      setMessage({ type: 'success', text: 'Welcome to Pro! Your 7-day free trial has started.' })
      window.history.replaceState({}, '', '/pricing')
    }
    if (params.get('canceled') === 'true' && !message) {
      setMessage({ type: 'info', text: 'No worries — you can upgrade anytime.' })
      window.history.replaceState({}, '', '/pricing')
    }
  }

  async function handleCheckout(plan) {
    setLoading(plan)
    setMessage(null)

    const token = localStorage.getItem('alecrae_token')
    if (!token) {
      setMessage({ type: 'error', text: 'Please sign in first, then come back to upgrade.' })
      setLoading(null)
      return
    }

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      })

      const data = await res.json()
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Something went wrong. Try again.' })
        setLoading(null)
        return
      }

      window.location.href = data.url
    } catch {
      setMessage({ type: 'error', text: 'Network error. Check your connection and try again.' })
      setLoading(null)
    }
  }

  async function handleManage() {
    setLoading('manage')

    const token = localStorage.getItem('alecrae_token')
    if (!token) {
      setMessage({ type: 'error', text: 'Please sign in first.' })
      setLoading(null)
      return
    }

    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await res.json()
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Could not open billing portal.' })
        setLoading(null)
        return
      }

      window.location.href = data.url
    } catch {
      setMessage({ type: 'error', text: 'Network error. Try again.' })
      setLoading(null)
    }
  }

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      highlight: false,
      features: [
        '10 AI grammar corrections per day',
        'Basic voice dictation (60 min/mo)',
        'Chrome extension',
        'Works on any website',
        'Spelling + punctuation fixes',
      ],
      cta: 'Get Started Free',
      action: () => { window.location.href = '/download' },
    },
    {
      name: 'Pro',
      price: '$12',
      period: '/month or $99/year',
      highlight: true,
      badge: 'MOST POPULAR',
      features: [
        'Unlimited AI grammar corrections',
        'Unlimited voice-to-text dictation',
        'AI Rewrite Mode (tone + polish)',
        'Preserve My Voice (learns your style)',
        'Context-aware (email, Slack, code)',
        'Desktop app (Mac + Windows)',
        'Chrome extension (all websites)',
        'iPhone + Android keyboard (coming soon)',
        'Offline mode (privacy-first)',
        'Real-time translation (coming soon)',
        'Custom vocabulary (coming soon)',
      ],
      cta: 'Start 7-Day Free Trial',
      action: () => handleCheckout('pro'),
      planKey: 'pro',
    },
    {
      name: 'Business',
      price: '$29',
      period: '/month — up to 10 users',
      highlight: false,
      badge: 'BEST VALUE',
      features: [
        'Everything in Pro for up to 10 users',
        'Team style guide enforcement',
        'Shared vocabulary across team',
        'Admin dashboard + usage analytics',
        'Priority support',
        'Invoice billing',
        'That\u2019s just $2.90 per user',
      ],
      cta: 'Start Business Trial',
      action: () => handleCheckout('business'),
      planKey: 'business',
    },
  ]

  return (
    <>
      {message && (
        <div className={`mb-8 p-4 rounded-xl text-center text-[14px] font-medium ${
          message.type === 'success' ? 'bg-white/[0.04] text-gold-400 border border-gold-400/20' :
          message.type === 'error' ? 'bg-white/[0.04] text-red-400 border border-red-400/20' :
          'bg-white/[0.04] text-white/50 border border-white/[0.06]'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className={`rounded-xl p-6 flex flex-col border ${
            plan.highlight ? 'border-gold-400/30 bg-gold-400/[0.04] shadow-lg shadow-gold-400/5 relative ring-1 ring-gold-400/20' : 'border-white/[0.06] bg-white/[0.03]'
          }`}>
            {plan.badge && (
              <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-wider px-3 py-1 rounded-full ${
                plan.name === 'Pro' ? 'bg-gold-400 text-navy-950' : 'bg-gold-400 text-navy-950'
              }`}>
                {plan.badge}
              </span>
            )}
            <h2 className="text-lg font-bold text-white mb-1">{plan.name}</h2>
            <div className="mb-5">
              <span className="text-4xl font-bold text-white">{plan.price}</span>
              <span className="text-[13px] text-white/30 ml-1">{plan.period}</span>
            </div>
            <ul className="flex-1 space-y-2.5 mb-6">
              {plan.features.map((f, i) => (
                <li key={i} className="text-[13px] text-white/40 flex items-start gap-2.5">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="#daa73b" viewBox="0 0 24 24" strokeWidth="2"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={plan.action}
              disabled={loading === plan.planKey}
              className={`block w-full text-center py-3 rounded-lg text-[13px] font-semibold transition-all ${
                plan.highlight
                  ? 'bg-gold-400 text-navy-950 hover:bg-gold-300 disabled:bg-gold-400/50'
                  : 'border border-white/8 text-white/40 hover:text-white/70 hover:border-white/20 disabled:opacity-50'
              }`}
            >
              {loading === plan.planKey ? 'Redirecting to checkout...' : plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Manage subscription link for existing customers */}
      <div className="text-center mt-8">
        <button
          onClick={handleManage}
          disabled={loading === 'manage'}
          className="text-[13px] text-white/30 hover:text-white/60 transition-colors font-medium"
        >
          {loading === 'manage' ? 'Opening billing portal...' : 'Already subscribed? Manage your plan'}
        </button>
      </div>
    </>
  )
}
