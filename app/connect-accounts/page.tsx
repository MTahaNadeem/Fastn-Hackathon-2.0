import ConnectionStatus from "@/components/ConnectionStatus";
import Link from "next/link";
import { ArrowLeft, Key, ShieldCheck, Zap } from "lucide-react";

export default function ConnectAccountsPage() {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb / Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Key className="w-3.5 h-3.5 text-blue-500" />
          <span>Fastn Connector Marketplace</span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
          Connect External Accounts
        </h1>
        <p className="text-xs text-zinc-500 mt-1 max-w-2xl">
          Connect your payment processing and accounting platforms via Fastn. Every integration is sandboxed to your active freelancer tenant namespace.
        </p>
      </div>

      <ConnectionStatus />
    </div>
  );
}
