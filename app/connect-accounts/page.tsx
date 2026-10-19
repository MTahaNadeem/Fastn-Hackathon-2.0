import ConnectionStatus from "@/components/ConnectionStatus";
import TenantSwitcher from "@/components/TenantSwitcher";
import Link from "next/link";
import { ArrowLeft, Key, ShieldCheck, Zap } from "lucide-react";

export default function ConnectAccountsPage() {
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#737373] hover:text-[#1A1A1A] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <TenantSwitcher />
        </div>
      </div>

      {/* Page Title */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Tenant Isolated Integrations</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">
          Connect External Accounts
        </h1>
        <p className="text-sm text-[#4A4A4A] max-w-2xl leading-relaxed">
          Embed Fastn’s customer connection widget scoped to your freelancer tenant.
          Authorize Gmail, Google Calendar, Google Sheets, Slack, and JazzCash with strict per-tenant isolation.
        </p>
      </div>

      {/* Connection Status Component */}
      <ConnectionStatus />
    </div>
  );
}
