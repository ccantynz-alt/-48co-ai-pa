import Link from "next/link";
import { Zap, FileText, Receipt, ShieldCheck, Award, ArrowRight, CheckCircle } from "lucide-react";

const FEATURES = [
  {
    icon: FileText,
    title: "AI Quote Generator",
    description: "Describe the job in plain English. Claude generates a fully itemised quote with labour, materials, and GST in seconds.",
  },
  {
    icon: Receipt,
    title: "Invoicing & Payments",
    description: "Convert quotes to invoices instantly. Send payment links and get paid faster with integrated Stripe payments.",
  },
  {
    icon: Award,
    title: "License Tracker",
    description: "Never let a licence expire. Track all your trade licences, certifications, and insurance with expiry alerts.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Checklists",
    description: "NZ and Australian building codes, H&S requirements, and trade-specific compliance — all in one place.",
  },
];

const SOCIAL_PROOF = [
  "AI-native — built for 2025, not 2010",
  "NZ & Australian compliance built-in",
  "Works for sole traders and teams",
  "No lock-in, cancel anytime",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-zinc-900">48co</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
          <Zap className="w-3.5 h-3.5" />
          Built for NZ & Australian Tradespeople
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-zinc-900 leading-tight mb-6">
          Quote, Invoice & Comply
          <br />
          <span className="text-orange-500">powered by AI</span>
        </h1>
        <p className="text-xl text-zinc-500 max-w-2xl mx-auto mb-10">
          48co is the AI-native platform for trades and construction. Generate professional quotes in 30 seconds, track licenses, and stay compliant — all in one place.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors text-lg"
          >
            Start for Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 border border-zinc-200 text-zinc-700 px-6 py-3 rounded-lg font-medium hover:bg-zinc-50 transition-colors text-lg"
          >
            Sign In
          </Link>
        </div>
        <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
          {SOCIAL_PROOF.map((item) => (
            <div key={item} className="flex items-center gap-1.5 text-sm text-zinc-500">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-zinc-900 mb-3">Everything a tradie needs</h2>
          <p className="text-zinc-500 text-lg">One platform. No spreadsheets. No missed invoices.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="p-6 rounded-xl border border-zinc-100 hover:border-orange-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">{title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-zinc-900 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to quote smarter?</h2>
          <p className="text-zinc-400 mb-8 text-lg">Join tradespeople across Australia and New Zealand already saving hours every week.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors text-lg"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8 text-center text-sm text-zinc-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="font-medium text-zinc-600">48co</span>
        </div>
        <p>AI-native platform for trades & construction · Australia & New Zealand</p>
      </footer>
    </div>
  );
}
