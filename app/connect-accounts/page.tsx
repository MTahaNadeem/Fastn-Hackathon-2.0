import ConnectionStatus from "@/components/ConnectionStatus";
import TenantSwitcher from "@/components/TenantSwitcher";
import Link from "next/link";
import { ArrowLeft, Key, ShieldCheck, Zap } from "lucide-react";

export default function ConnectAccountsPage() {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <TenantSwitcher />
        </div>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
          Connect External Accounts
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-2xl">
          Embed Fastn’s customer connection widget scoped to your freelancer tenant.
          Authorize Gmail, Google Calendar, Google Sheets, Slack, Stripe, and JazzCash with strict per-tenant isolation.
        </p>
      </div>

      {/* Connection Status Component */}
      <ConnectionStatus />
    </div>
  );
}
