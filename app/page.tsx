import Link from "next/link";
import {
  Zap,
  ShieldCheck,
  ArrowRight,
  Layers,
  Sparkles,
  CheckCircle2,
  Lock,
  RefreshCw,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="space-y-24 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-6 sm:pt-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-xs font-semibold text-blue-600 dark:text-blue-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fastn Hackathon 2.0 Project</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 max-w-4xl mx-auto leading-tight">
          Automated Freelancer Invoicing with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
            Fastn Multi-Tenant
          </span>{" "}
          Connections
        </h1>

        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          InvoiceFlow equips every freelancer with an isolated Fastn connection namespace.
          Seamlessly link your own QuickBooks, Stripe, Xero, and Slack accounts without
          credential leaks or complex backend setup.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition"
          >
            Open Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 font-semibold text-sm transition"
          >
            Create Freelancer Tenant
          </Link>
          <Link
            href="/connect-accounts"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-sm transition"
          >
            Fastn Connectors Hub
          </Link>
        </div>
      </section>

      {/* Architecture Explainer Card */}
      <section className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white p-8 sm:p-12 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-8">
          <div className="max-w-xl space-y-2">
            <span className="text-xs uppercase font-mono tracking-widest text-blue-400 font-semibold">
              The Tenant Isolation Model
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold">
              How Fastn Connection Namespaces Work
            </h2>
            <p className="text-sm text-zinc-400">
              In traditional SaaS, connecting multiple users to third-party APIs risks credential collisions.
              InvoiceFlow utilizes Fastn&apos;s header-based tenant partitioning to provide absolute isolation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="bg-zinc-800/60 border border-zinc-700/60 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400">Tenant 01</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  ISOLATED
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Sarah Chen</h3>
                <p className="text-xs text-zinc-400 font-mono">freelancer-sarah-chen</p>
              </div>
              <div className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-zinc-700/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Stripe: pk_live_sarah...</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>QuickBooks: Realm 9130...</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-800/60 border border-zinc-700/60 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400">Tenant 02</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  ISOLATED
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Alex Rivera</h3>
                <p className="text-xs text-zinc-400 font-mono">freelancer-alex-rivera</p>
              </div>
              <div className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-zinc-700/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Stripe: pk_live_alex...</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Xero: Org ID 8412...</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-800/60 border border-zinc-700/60 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400">Fastn Core Engine</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800">
                  DISPATCHER
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Header Routing</h3>
                <p className="text-xs text-zinc-400 font-mono">x-fastn-space-tenantid</p>
              </div>
              <p className="text-xs text-zinc-300 pt-2 border-t border-zinc-700/50">
                Every API call and webhook execution carries the tenant identifier, routing tasks strictly to the freelancer&apos;s credential store.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            Multi-Tenant Isolation
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Each signed-up freelancer receives an automatic Fastn tenant namespace. Your financial tokens, QuickBooks ledgers, and Stripe payouts never cross paths.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            Instant Multi-App Sync
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            When you create an invoice in InvoiceFlow, Fastn workflows simultaneously push the entry to QuickBooks, generate a Stripe Checkout link, and ping your Slack channel.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            Zero Backend Hassle
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Forget about maintaining dozens of separate OAuth callbacks and token refreshes. Fastn handles token lifecycles and connector marketplace actions natively.
          </p>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl">
        <h2 className="text-3xl sm:text-4xl font-extrabold max-w-xl mx-auto">
          Ready to experience frictionless freelancer invoicing?
        </h2>
        <p className="text-sm sm:text-base text-blue-100 max-w-lg mx-auto">
          Start as Sarah Chen, Alex Rivera, or register your own business tenant in 5 seconds.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-xl bg-white text-blue-600 font-bold text-sm shadow hover:bg-blue-50 transition"
          >
            Create Your Tenant Account
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-blue-700/70 hover:bg-blue-700 text-white font-semibold text-sm transition"
          >
            Go to Live Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
