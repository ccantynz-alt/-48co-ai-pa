import Link from "next/link";
import { Zap, Check, X, ArrowRight } from "lucide-react";

const PLANS = [
  {
    name: "Standard",
    price: "$29",
    priceNZ: "NZ$35",
    priceLabel: "/user/month",
    description: "Everything a sole trader needs",
    cta: "Start free 14-day trial",
    href: "/register",
    highlight: false,
    features: [
      { label: "Unlimited AI quotes (text, voice, photo)", included: true },
      { label: "Unlimited invoices", included: true },
      { label: "Compliance + licence tracker", included: true },
      { label: "Public marketplace profile", included: true },
      { label: "Marketplace bidding (free leads)", included: true },
      { label: "6% success fee on completed jobs", included: true },
      { label: "Email support", included: true },
      { label: "Multi-user team", included: false },
      { label: "Custom branding", included: false },
    ],
  },
  {
    name: "Pro",
    price: "$59",
    priceNZ: "NZ$69",
    priceLabel: "/user/month",
    description: "For teams and busy operators",
    cta: "Start free 14-day trial",
    href: "/register",
    highlight: true,
    features: [
      { label: "Everything in Standard", included: true },
      { label: "Multi-user team accounts", included: true },
      { label: "Custom invoice & quote branding", included: true },
      { label: "Priority AI quote generation", included: true },
      { label: "Advanced compliance reporting", included: true },
      { label: "Phone & priority email support", included: true },
      { label: "Bulk SMS to clients", included: true },
      { label: "Calendar + scheduling tools", included: true },
      { label: "API access", included: true },
    ],
  },
  {
    name: "Association",
    price: "Custom",
    priceNZ: "",
    priceLabel: "",
    description: "White-label for trade associations",
    cta: "Talk to sales",
    href: "mailto:sales@48co.app",
    highlight: false,
    features: [
      { label: "Everything in Pro", included: true },
      { label: "Branded directory page (/a/your-org)", included: true },
      { label: "Bulk member onboarding", included: true },
      { label: "Group reporting + analytics", included: true },
      { label: "Custom compliance templates", included: true },
      { label: "Member-only marketplace tier", included: true },
      { label: "Volume discount", included: true },
      { label: "Dedicated account manager", included: true },
      { label: "SLA + uptime guarantee", included: true },
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-zinc-900">48co</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 px-4 py-2">Sign In</Link>
          <Link href="/register" className="text-sm font-medium bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">Get Started</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-zinc-900 mb-4">Simple, honest pricing</h1>
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
            Cheaper than Tradify. More AI than ServiceM8. No lead fees, ever. No contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 flex flex-col ${
                plan.highlight ? "border-orange-300 shadow-lg ring-2 ring-orange-100 relative" : "border-zinc-200"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most popular
                </div>
              )}
              <h3 className="text-xl font-bold text-zinc-900">{plan.name}</h3>
              <p className="text-sm text-zinc-500 mt-1 mb-5">{plan.description}</p>
              <div className="mb-1">
                <span className="text-4xl font-bold text-zinc-900">{plan.price}</span>
                {plan.priceLabel && <span className="text-zinc-500 text-sm">{plan.priceLabel}</span>}
              </div>
              {plan.priceNZ && <p className="text-xs text-zinc-400 mb-6">{plan.priceNZ} {plan.priceLabel}</p>}
              {!plan.priceNZ && <p className="text-xs text-zinc-400 mb-6">&nbsp;</p>}

              <Link
                href={plan.href}
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium transition-colors mb-6 ${
                  plan.highlight ? "bg-orange-500 text-white hover:bg-orange-600" : "bg-zinc-900 text-white hover:bg-zinc-800"
                }`}
              >
                {plan.cta} <ArrowRight className="w-4 h-4" />
              </Link>

              <ul className="space-y-2.5 text-sm flex-1">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-start gap-2">
                    {f.included ? (
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-zinc-300 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={f.included ? "text-zinc-700" : "text-zinc-400 line-through"}>{f.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-zinc-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-zinc-900 mb-3">Always free for homeowners</h3>
          <p className="text-zinc-500 mb-6">Posting jobs and getting bids is free for life. No catches.</p>
          <Link href="/post-job" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">
            Post a job free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
