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
        : ["stripe", "quickbooks"];

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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
            <CheckCircle className="w-3 h-3" /> Paid
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case "overdue":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
            <AlertCircle className="w-3 h-3" /> Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <FileText className="w-3 h-3" /> Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by client or invoice #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs overflow-x-auto">
          {["all", "paid", "pending", "overdue"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-lg font-medium capitalize transition ${
                filterStatus === status
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice Table / List */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <div className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">
              No invoices found for {tenant.businessName}
            </div>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Create your first invoice to automatically sync across your connected Fastn payment and accounting tools.
            </p>
            <Link
              href="/invoices/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
            >
              <Zap className="w-3.5 h-3.5" /> Create New Invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
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
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition group"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {inv.clientName}
                      </div>
                      <div className="text-[11px] text-zinc-400">{inv.clientEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400 font-mono">
                      {inv.dueDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      ${inv.total.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(inv.status)}</td>
                    <td className="py-3.5 px-4">
                      {inv.fastnSync?.synced ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                            <Zap className="w-2.5 h-2.5 text-blue-500 fill-blue-500" />
                            {inv.fastnSync.syncedConnectors.join(", ")}
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleFastnSyncNow(inv)}
                          disabled={syncingId === inv.id}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                        >
                          <RefreshCw
                            className={`w-3 h-3 ${syncingId === inv.id ? "animate-spin" : ""}`}
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
                            className="px-2 py-1 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
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
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  {selectedInvoice.invoiceNumber}
                </h3>
                <p className="text-xs text-zinc-500">
                  Tenant: {tenant.businessName} ({tenant.fastnNamespace})
                </p>
              </div>
              <div>{getStatusBadge(selectedInvoice.status)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-zinc-400 block">Billed To:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {selectedInvoice.clientName}
                </span>
                <p className="text-zinc-500">{selectedInvoice.clientEmail}</p>
                {selectedInvoice.clientAddress && (
                  <p className="text-zinc-500">{selectedInvoice.clientAddress}</p>
                )}
              </div>
              <div>
                <span className="text-zinc-400 block">Invoice Terms:</span>
                <p>Issue Date: {selectedInvoice.issueDate}</p>
                <p>Due Date: {selectedInvoice.dueDate}</p>
              </div>
            </div>

            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500">
                  <tr>
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Rate</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {selectedInvoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2">{item.description}</td>
                      <td className="p-2 text-center font-mono">{item.quantity}</td>
                      <td className="p-2 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono font-medium">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <span>Grand Total:</span>
              <span className="text-blue-600 font-mono text-base">
                ${selectedInvoice.total.toFixed(2)} {selectedInvoice.currency}
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-xs font-semibold transition"
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
