import Link from "next/link";
import { Zap, FileText, Receipt, ShieldCheck, Award, ArrowRight, CheckCircle, Search, Hammer, HomeIcon } from "lucide-react";

const TRADIE_FEATURES = [
  { icon: FileText, title: "AI Quote Generator", description: "Voice, photo, or text → itemised quote with NZ/AU pricing in 60 seconds. Beats every template tool on the market." },
  { icon: Receipt, title: "Invoicing & Payments", description: "Convert quotes to invoices. Get paid faster with Stripe integration." },
  { icon: Award, title: "Licence Autopilot", description: "EWRB, state licensing, insurance — auto-tracked with renewal alerts. Nobody else does this." },
  { icon: ShieldCheck, title: "Compliance Built-in", description: "Region-aware H&S, building consent, and certificate-of-compliance checklists per job." },
];

const HOMEOWNER_FEATURES = [
  { icon: Search, title: "Find Verified Tradies", description: "Browse licensed local tradies. Every profile shows real licences, real reviews, real jobs completed." },
  { icon: Hammer, title: "Post a Job, Get Bids", description: "Describe your job. Multiple verified tradies bid. You pick. No spam, no dead-end calls." },
  { icon: ShieldCheck, title: "Verified Licences", description: "Every tradie's electrical, plumbing, gas, or building licence is tracked and verified by the platform." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-zinc-900">48co</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/find-tradies" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 px-3 py-2 hidden sm:block">Find a Tradie</Link>
          <Link href="/jobs-board" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 px-3 py-2 hidden sm:block">Jobs Board</Link>
          <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 px-3 py-2">Sign In</Link>
          <Link href="/register" className="text-sm font-medium bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
          <Zap className="w-3.5 h-3.5" />
          Built for NZ & Australian trades
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-zinc-900 leading-tight mb-6">
          The AI-native platform
          <br />
          <span className="text-orange-500">where tradies and homeowners meet</span>
        </h1>
        <p className="text-xl text-zinc-500 max-w-2xl mx-auto mb-10">
          Tradies get AI quoting, compliance autopilot, and license tracking.
          Homeowners post jobs and get bids from verified locals — free.
        </p>
      </section>

      {/* Two-sided CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-8">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
              <Hammer className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">I&apos;m a Tradie</h2>
            <p className="text-zinc-600 mb-5">Free profile listing forever. Run your whole business from one app. No lead fees, ever.</p>
            <ul className="space-y-2 mb-6 text-sm text-zinc-700">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> AI quoting via voice, photo, or text</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> Compliance + licence autopilot</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> Free public profile + marketplace bids</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> 6% success fee — only on completed jobs</li>
            </ul>
            <Link href="/register" className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors w-full justify-center">
              Sign up free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
              <HomeIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">I&apos;m a Homeowner</h2>
            <p className="text-zinc-600 mb-5">Find a verified, licensed tradie for any job. Post once, get multiple bids in 24 hours.</p>
            <ul className="space-y-2 mb-6 text-sm text-zinc-700">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> Free to post a job</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> Every tradie&apos;s licences verified</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> Real reviews from past customers</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> No spam phone calls — ever</li>
            </ul>
            <Link href="/post-job" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors w-full justify-center">
              Post a job free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Tradie features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-orange-600 mb-2">For Tradies</span>
          <h2 className="text-3xl font-bold text-zinc-900 mb-3">Run your whole business from one app</h2>
          <p className="text-zinc-500 text-lg">Cheaper than Tradify. More AI than ServiceM8. More NZ/AU compliance than anyone.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRADIE_FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="p-6 rounded-xl border border-zinc-100 hover:border-orange-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 mb-2">{title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Homeowner features */}
      <section className="bg-zinc-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">For Homeowners</span>
            <h2 className="text-3xl font-bold text-zinc-900 mb-3">Stop guessing who to hire</h2>
            <p className="text-zinc-500 text-lg">No more dodgy referrals or no-show tradies. Real licences, real reviews, real bids.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {HOMEOWNER_FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="p-6 rounded-xl border border-zinc-100 bg-white">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 mb-2">{title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-zinc-900 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">No leads. No contracts. No monthly fees on the marketplace.</h2>
          <p className="text-zinc-400 mb-8 text-lg">Just AI tools that work and tradies you can trust.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/register" className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors text-lg">
              I&apos;m a Tradie <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/post-job" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-lg">
              I&apos;m a Homeowner <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

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
