/**
 * AlecRae Voice Stripe Configuration
 *
 * Central Stripe setup. All Stripe operations go through this module.
 * Required env vars:
 *   STRIPE_SECRET_KEY       — from Stripe Dashboard > Developers > API keys
 *   STRIPE_WEBHOOK_SECRET   — from Stripe Dashboard > Developers > Webhooks
 *   STRIPE_PRO_PRICE_ID     — Price ID for Pro plan ($12/mo)
 *   STRIPE_PRO_YEAR_PRICE_ID — Price ID for Pro annual ($99/year)
 *   STRIPE_BIZ_PRICE_ID     — Price ID for Business plan ($29/mo)
 *   NEXT_PUBLIC_APP_URL     — Your domain (https://alecrae.ai)
 */
import Stripe from 'stripe'

// Don't throw at import time — this crashes the Next.js build.
// Instead, create a lazy getter that throws only when actually used.
let _stripe = null

export function getStripe() {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required. Add it to your Vercel environment variables.')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    })
  }
  return _stripe
}

// Keep backward compat — but won't crash at build time
export const stripe = typeof process !== 'undefined' && process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null

export const PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRO_PRICE_ID,
  pro_annual: process.env.STRIPE_PRO_YEAR_PRICE_ID,
  business_monthly: process.env.STRIPE_BIZ_PRICE_ID,
}

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://alecrae.ai'
