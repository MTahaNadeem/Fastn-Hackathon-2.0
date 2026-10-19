import { Suspense } from "react";
import InvoiceForm from "@/components/InvoiceForm";
import Link from "next/link";
import { ArrowLeft, Zap, ShieldCheck } from "lucide-react";

export default function CreateInvoicePage() {
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb / Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#737373] hover:text-[#1A1A1A] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
          <Zap className="w-3.5 h-3.5" />
          <span>Fastn Auto-Sync</span>
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">
          Create New Invoice
        </h1>
        <p className="text-sm text-[#4A4A4A]">
          Issue a client invoice in PKR with automated calculations and instant multi-platform synchronization via Fastn.
        </p>
      </div>

      <Suspense fallback={<div className="p-12 text-center text-xs text-[#737373]">Loading invoice form...</div>}>
        <InvoiceForm />
      </Suspense>
    </div>
  );
}
