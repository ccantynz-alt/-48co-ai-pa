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

    const token = localStorage.getItem('48co_token')
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

    const token = localStorage.getItem('48co_token')
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
        'iPhone + Android keyboard',
        'Offline mode (privacy-first)',
        'Real-time translation (200+ languages)',
        'Custom vocabulary',
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
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
          message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-navy-50 text-navy-700 border border-navy-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className={`rounded-xl p-6 flex flex-col border ${
            plan.highlight ? 'border-gold-300 bg-gold-50/15 shadow-lg shadow-gold-500/5 relative ring-1 ring-gold-200' : 'border-gray-200'
          }`}>
            {plan.badge && (
              <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-wider px-3 py-1 rounded-full ${
                plan.name === 'Pro' ? 'bg-navy-900 text-white' : 'bg-gold-500 text-white'
              }`}>
                {plan.badge}
              </span>
            )}
            <h2 className="text-lg font-bold text-navy-900 mb-1">{plan.name}</h2>
            <div className="mb-5">
              <span className="text-4xl font-bold text-navy-900">{plan.price}</span>
              <span className="text-[13px] text-gray-400 ml-1">{plan.period}</span>
            </div>
            <ul className="flex-1 space-y-2.5 mb-6">
              {plan.features.map((f, i) => (
                <li key={i} className="text-[13px] text-gray-600 flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={plan.action}
              disabled={loading === plan.planKey}
              className={`block w-full text-center py-3 rounded-lg text-[13px] font-semibold transition-all ${
                plan.highlight
                  ? 'bg-navy-900 text-white hover:bg-navy-800 disabled:bg-navy-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50'
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
          className="text-[13px] text-gray-400 hover:text-navy-700 transition-colors font-medium"
        >
          {loading === 'manage' ? 'Opening billing portal...' : 'Already subscribed? Manage your plan'}
        </button>
      </div>
    </>
  )
}
