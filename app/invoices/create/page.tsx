import { Suspense } from "react";
import InvoiceForm from "@/components/InvoiceForm";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";

export default function CreateInvoicePage() {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb / Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Zap className="w-3.5 h-3.5 text-blue-500" />
          <span>Fastn Auto-Sync Enabled</span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
          Create New Invoice
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Issue a client invoice with automated calculations and instant multi-platform synchronization via Fastn.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Loading invoice form...</div>}>
        <InvoiceForm />
      </Suspense>
    </div>
  );
}
