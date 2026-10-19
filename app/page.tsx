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
  TrendingUp,
  FileSpreadsheet,
  Mail,
  Calendar,
  MessageSquare,
  Smartphone,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="space-y-20 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-6 sm:pt-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F0FDFA] border border-[#CCFBF1] text-xs font-semibold text-[#0F766E]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fastn 2.0 Multi-Tenant Freelancer Integration</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#1A1A1A] max-w-4xl mx-auto leading-tight">
          Automated Freelancer Invoicing with{" "}
          <span className="text-[#0F766E]">
            Fastn Tenant Isolation
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#4A4A4A] max-w-2xl mx-auto leading-relaxed">
          InvoiceFlow equips every freelancer with an isolated Fastn connection namespace.
          Seamlessly link your own Gmail, Google Calendar, Google Sheets, Slack, and JazzCash
          with zero cross-tenant leakage.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0F766E] hover:bg-[#0D5C56] text-white font-semibold text-sm shadow-soft transition"
          >
            Open Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-neutral-50 text-[#1A1A1A] border border-neutral-200/90 font-semibold text-sm shadow-2xs transition"
          >
            Create Freelancer Tenant
          </Link>
          <Link
            href="/connect-accounts"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200/70 text-[#4A4A4A] font-semibold text-sm transition"
          >
            Fastn Connectors Hub
          </Link>
        </div>
      </section>

      {/* Architecture Explainer Card (Clean Elevated Light Design) */}
      <section className="bg-white rounded-3xl border border-neutral-100 p-8 sm:p-12 shadow-card space-y-8">
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#F0FDFA] text-[#0F766E] text-xs font-semibold border border-[#CCFBF1]">
            <Lock className="w-3 h-3" />
            <span>The Tenant Isolation Model</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
            How Fastn Connection Namespaces Work
          </h2>
          <p className="text-sm text-[#4A4A4A] leading-relaxed">
            In traditional SaaS, connecting multiple users to third-party APIs risks credential collisions.
            InvoiceFlow utilizes Fastn&apos;s header-based tenant partitioning (`x-end-org-id`) to provide absolute isolation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Tenant 01 Card */}
          <div className="bg-[#FAFAFA] border border-neutral-200/80 p-6 rounded-2xl space-y-4 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#737373]">Tenant 01</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                ISOLATED
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1A1A1A]">Sarah Chen</h3>
              <p className="text-xs text-[#737373] font-mono">tenant-sarah-chen</p>
            </div>
            <div className="space-y-2 text-xs text-[#4A4A4A] pt-3 border-t border-neutral-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>JazzCash: MC12345 (PKR)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Google Sheet: sarah-invoices</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Gmail: sarah@acme.com</span>
              </div>
            </div>
          </div>

          {/* Tenant 02 Card */}
          <div className="bg-[#FAFAFA] border border-neutral-200/80 p-6 rounded-2xl space-y-4 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#737373]">Tenant 02</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                ISOLATED
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1A1A1A]">Alex Rivera</h3>
              <p className="text-xs text-[#737373] font-mono">tenant-alex-rivera</p>
            </div>
            <div className="space-y-2 text-xs text-[#4A4A4A] pt-3 border-t border-neutral-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>JazzCash: MC67890 (PKR)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Google Sheet: alex-ledger</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Gmail: alex@designco.com</span>
              </div>
            </div>
          </div>

          {/* Fastn Dispatcher Card */}
          <div className="bg-[#FAFAFA] border border-neutral-200/80 p-6 rounded-2xl space-y-4 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#737373]">Fastn 2.0 Engine</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
                DISPATCHER
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1A1A1A]">Header Partitioning</h3>
              <p className="text-xs text-[#737373] font-mono">x-end-org-id</p>
            </div>
            <p className="text-xs text-[#4A4A4A] pt-3 border-t border-neutral-200 leading-relaxed">
              Every workflow execution and webhook callback is scoped strictly to the calling freelancer&apos;s credentials. No cross-tenant reads or leakage.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-neutral-100 p-8 rounded-2xl space-y-4 shadow-soft hover:shadow-card transition">
          <div className="w-11 h-11 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center text-[#0F766E]">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-[#1A1A1A]">
            Multi-Tenant Isolation
          </h3>
          <p className="text-sm text-[#4A4A4A] leading-relaxed">
            Each registered freelancer receives an automatic Fastn tenant namespace. Your financial tokens, Google Sheets records, and JazzCash payouts never cross paths.
          </p>
        </div>

        <div className="bg-white border border-neutral-100 p-8 rounded-2xl space-y-4 shadow-soft hover:shadow-card transition">
          <div className="w-11 h-11 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center text-[#0F766E]">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-[#1A1A1A]">
            Automated Workflows
          </h3>
          <p className="text-sm text-[#4A4A4A] leading-relaxed">
            Deploy Fastn&apos;s invoice-lifecycle and payment-check workflows to sync to Google Sheets, send Gmail notices, schedule Google Calendar events, and ping Slack in real time.
          </p>
        </div>

        <div className="bg-white border border-neutral-100 p-8 rounded-2xl space-y-4 shadow-soft hover:shadow-card transition">
          <div className="w-11 h-11 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center text-[#0F766E]">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-[#1A1A1A]">
            PKR & JazzCash Native
          </h3>
          <p className="text-sm text-[#4A4A4A] leading-relaxed">
            Built from the ground up with Pakistani Rupee (Rs. X,XXX) currency formatting and custom JazzCash connector integration for mobile wallets and card checkout.
          </p>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-br from-[#0F766E] to-[#0D5C56] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-card">
        <h2 className="text-3xl sm:text-4xl font-bold max-w-xl mx-auto">
          Ready to experience frictionless freelancer invoicing?
        </h2>
        <p className="text-sm sm:text-base text-teal-50 max-w-lg mx-auto">
          Start as Sarah Chen, Alex Rivera, or register your own business tenant in 5 seconds.
        </p>
        <div className="flex flex-wrap justify-center gap-3.5">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-xl bg-white text-[#0F766E] font-semibold text-sm shadow-soft hover:bg-neutral-50 transition"
          >
            Create Your Tenant Account
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-[#094742] hover:bg-[#073632] text-white font-semibold text-sm transition"
          >
            Go to Live Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
