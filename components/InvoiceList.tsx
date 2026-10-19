"use client";

import React, { useState, useEffect } from "react";
import { useTenantContext } from "@/lib/tenant-context";
import {
  Invoice,
  InvoiceStatus,
  getInvoicesForTenant,
  updateInvoiceStatus,
  markInvoiceSynced,
} from "@/lib/invoices";
import { syncInvoiceViaFastn } from "@/lib/fastn";
import { formatPKR } from "@/lib/currency";
import {
  Search,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
  Send,
  Eye,
} from "lucide-react";
import Link from "next/link";

export default function InvoiceList() {
  const { tenant } = useTenantContext();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const loadInvoices = () => {
    const list = getInvoicesForTenant(tenant.id);
    setInvoices(list);
  };

  useEffect(() => {
    loadInvoices();

    const handleUpdate = () => loadInvoices();
    window.addEventListener("invoiceflow:invoices_updated", handleUpdate);
    window.addEventListener("invoiceflow:tenant_changed", handleUpdate);

    return () => {
      window.removeEventListener("invoiceflow:invoices_updated", handleUpdate);
      window.removeEventListener("invoiceflow:tenant_changed", handleUpdate);
    };
  }, [tenant.id]);

  const handleMarkPaid = (inv: Invoice) => {
    updateInvoiceStatus(inv.id, "paid");
    loadInvoices();
  };

  const handleFastnSyncNow = async (inv: Invoice) => {
    setSyncingId(inv.id);
    try {
      const connectors = tenant.connectedConnectors.length > 0
        ? tenant.connectedConnectors
        : ["jazzcash", "google_sheets"];

      const res = await syncInvoiceViaFastn({
        tenantNamespace: tenant.fastnNamespace,
        invoice: {
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          clientName: inv.clientName,
          clientEmail: inv.clientEmail,
          amount: inv.total,
          currency: inv.currency,
          dueDate: inv.dueDate,
          items: inv.items,
        },
        connectors,
      });

      markInvoiceSynced(
        inv.id,
        connectors,
        res.results.map((r) => ({
          connectorId: r.connectorId,
          reference: r.externalReference,
          status: r.status,
        }))
      );
      loadInvoices();
    } catch (err) {
      console.error("Fastn manual sync failed:", err);
    } finally {
      setSyncingId(null);
    }
  };

  const filtered = invoices.filter((inv) => {
    if (filterStatus !== "all" && inv.status !== filterStatus) return false;
    if (
      searchQuery &&
      !inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Paid
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/70">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending
          </span>
        );
      case "overdue":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/70">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
            <FileText className="w-3.5 h-3.5 text-neutral-400" /> Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by client or invoice #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-neutral-200 rounded-xl bg-white text-[#1A1A1A] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] shadow-2xs transition"
          />
        </div>

        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl text-xs overflow-x-auto">
          {["all", "paid", "pending", "overdue"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg font-medium capitalize transition ${
                filterStatus === status
                  ? "bg-white text-[#0F766E] font-semibold shadow-2xs border border-neutral-200/50"
                  : "text-[#4A4A4A] hover:text-[#1A1A1A]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice Table / List */}
      <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-soft">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-neutral-300 mx-auto" />
            <div className="text-[#1A1A1A] text-sm font-semibold">
              No invoices found for {tenant.businessName}
            </div>
            <p className="text-xs text-[#737373] max-w-sm mx-auto leading-relaxed">
              Create your first invoice to automatically sync across your connected Fastn payment and accounting tools.
            </p>
            <Link
              href="/invoices/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D5C56] text-white text-xs font-semibold shadow-soft transition"
            >
              <Zap className="w-3.5 h-3.5" /> Create New Invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] border-b border-neutral-100 text-[#737373] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Fastn Multi-Tenant Sync</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-neutral-50/70 transition group"
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#1A1A1A]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#1A1A1A]">
                        {inv.clientName}
                      </div>
                      <div className="text-[11px] text-[#737373]">{inv.clientEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#4A4A4A] font-mono">
                      {inv.dueDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1A1A1A]">
                      {formatPKR(inv.total)}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(inv.status)}</td>
                    <td className="py-3.5 px-4">
                      {inv.fastnSync?.synced ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
                            <Zap className="w-3 h-3 text-[#0F766E]" />
                            {inv.fastnSync.syncedConnectors.join(", ")}
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleFastnSyncNow(inv)}
                          disabled={syncingId === inv.id}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F766E] hover:underline disabled:opacity-50"
                        >
                          <RefreshCw
                            className={`w-3 h-3 text-[#0F766E] ${syncingId === inv.id ? "animate-spin" : ""}`}
                          />
                          Sync now via Fastn
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {inv.status !== "paid" && (
                          <button
                            type="button"
                            onClick={() => handleMarkPaid(inv)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200/60"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-1 rounded-lg text-neutral-400 hover:text-[#1A1A1A] transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-100 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-card animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-neutral-100 pb-4">
              <div>
                <h3 className="font-bold text-lg text-[#1A1A1A]">
                  {selectedInvoice.invoiceNumber}
                </h3>
                <p className="text-xs text-[#737373]">
                  Tenant: {tenant.businessName} ({tenant.fastnNamespace})
                </p>
              </div>
              <div>{getStatusBadge(selectedInvoice.status)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#737373] block mb-0.5">Billed To:</span>
                <span className="font-semibold text-[#1A1A1A]">
                  {selectedInvoice.clientName}
                </span>
                <p className="text-[#737373]">{selectedInvoice.clientEmail}</p>
                {selectedInvoice.clientAddress && (
                  <p className="text-[#737373]">{selectedInvoice.clientAddress}</p>
                )}
              </div>
              <div>
                <span className="text-[#737373] block mb-0.5">Invoice Terms:</span>
                <p className="text-[#4A4A4A]">Issue Date: {selectedInvoice.issueDate}</p>
                <p className="text-[#4A4A4A]">Due Date: {selectedInvoice.dueDate}</p>
              </div>
            </div>

            <div className="border border-neutral-200/80 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-[#FAFAFA] text-[#737373] font-semibold border-b border-neutral-100">
                  <tr>
                    <th className="p-2.5 text-left">Item</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Rate</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {selectedInvoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2.5 text-[#1A1A1A]">{item.description}</td>
                      <td className="p-2.5 text-center font-mono text-[#4A4A4A]">{item.quantity}</td>
                      <td className="p-2.5 text-right font-mono text-[#4A4A4A]">{formatPKR(item.unitPrice)}</td>
                      <td className="p-2.5 text-right font-mono font-medium text-[#1A1A1A]">{formatPKR(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center text-sm font-bold pt-3 border-t border-neutral-100">
              <span className="text-[#1A1A1A]">Grand Total:</span>
              <span className="text-[#0F766E] font-mono text-lg">
                {formatPKR(selectedInvoice.total)}
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#1A1A1A] text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
