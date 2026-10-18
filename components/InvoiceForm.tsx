"use client";

import React, { useState } from "react";
import { useTenantContext } from "@/lib/tenant-context";
import { createInvoice, InvoiceItem } from "@/lib/invoices";
import { syncInvoiceViaFastn, CONNECTOR_CATALOG } from "@/lib/fastn";
import { Plus, Trash2, ArrowRight, Zap, CheckCircle2, ShieldCheck, Building, Calendar, DollarSign } from "lucide-react";

interface InvoiceFormProps {
  onSuccess?: (invoiceId: string) => void;
}

export default function InvoiceForm({ onSuccess }: InvoiceFormProps) {
  const { tenant } = useTenantContext();

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("Payment is due upon receipt. Direct bank or credit card via Stripe.");

  React.useEffect(() => {
    const now = new Date();
    setInvoiceNumber(`INV-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setIssueDate(now.toISOString().split("T")[0]);
    const termDays = tenant?.settings?.defaultPaymentTermsDays || 14;
    const due = new Date(Date.now() + termDays * 86400000);
    setDueDate(due.toISOString().split("T")[0]);
  }, [tenant]);

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "item-1",
      description: "UX/UI Design Sprint & Prototype",
      quantity: 1,
      unitPrice: 1500,
      total: 1500,
    },
  ]);

  const [taxRate, setTaxRate] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);

  // Fastn integration toggles for active tenant
  const [syncQuickBooks, setSyncQuickBooks] = useState(tenant?.connectedConnectors.includes("quickbooks") ?? true);
  const [syncStripe, setSyncStripe] = useState(tenant?.connectedConnectors.includes("stripe") ?? true);
  const [notifySlack, setNotifySlack] = useState(tenant?.connectedConnectors.includes("slack") ?? false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncSuccessModal, setSyncSuccessModal] = useState<any>(null);

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * (taxRate || 0)) / 100;
  const total = Math.max(0, subtotal + taxAmount - (discount || 0));

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };

    if (field === "quantity" || field === "unitPrice") {
      const q = field === "quantity" ? Number(value) : current.quantity;
      const p = field === "unitPrice" ? Number(value) : current.unitPrice;
      current.total = Number((q * p).toFixed(2));
    }

    updated[index] = current;
    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail) {
      alert("Please provide client name and email.");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedConnectors: string[] = [];
      if (syncQuickBooks) selectedConnectors.push("quickbooks");
      if (syncStripe) selectedConnectors.push("stripe");
      if (notifySlack) selectedConnectors.push("slack");

      // 1. Create invoice in tenant store
      const newInvoice = createInvoice(tenant.id, {
        invoiceNumber,
        clientName,
        clientEmail,
        clientAddress,
        issueDate,
        dueDate,
        items,
        subtotal,
        taxRate,
        taxAmount,
        discount,
        total,
        currency: tenant.currency || "USD",
        notes,
        status: "pending",
        fastnSync: {
          synced: selectedConnectors.length > 0,
          syncedConnectors: selectedConnectors,
          lastSyncedAt: new Date().toISOString(),
        },
      });

      // 2. Trigger Fastn Multi-Tenant Sync orchestration
      if (selectedConnectors.length > 0) {
        const syncResponse = await syncInvoiceViaFastn({
          tenantNamespace: tenant.fastnNamespace,
          invoice: {
            id: newInvoice.id,
            invoiceNumber: newInvoice.invoiceNumber,
            clientName: newInvoice.clientName,
            clientEmail: newInvoice.clientEmail,
            amount: newInvoice.total,
            currency: newInvoice.currency,
            dueDate: newInvoice.dueDate,
            items: newInvoice.items,
          },
          connectors: selectedConnectors,
        });

        setSyncSuccessModal({
          invoice: newInvoice,
          syncResponse,
        });
      } else {
        if (onSuccess) onSuccess(newInvoice.id);
      }
    } catch (err) {
      console.error("Failed to create invoice:", err);
      alert("Error creating invoice. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Top Banner indicating Tenant Fastn Namespace */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Tenant Fastn Isolation
          </span>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Create Invoice for {tenant.businessName}
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-800/80 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-zinc-500">Fastn Namespace:</span>
          <code className="font-mono font-semibold text-blue-600 dark:text-blue-400">
            {tenant.fastnNamespace}
          </code>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
        {/* Header Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
              Invoice Number
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
              Issue Date
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Client Details */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-zinc-400" /> Client Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Client Name / Organization *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Acme Corporation"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Client Billing Email *
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="billing@client.com"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Billing Address (Optional)
              </label>
              <input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Suite 500, 100 Main St, Austin, TX"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-zinc-400" /> Line Items
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-3 items-center bg-zinc-50/70 dark:bg-zinc-800/40 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800"
              >
                <div className="col-span-12 sm:col-span-6">
                  <input
                    type="text"
                    placeholder="Description of work or deliverables"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                    className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Rate"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                    className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="col-span-3 sm:col-span-1 font-mono text-sm text-right font-medium text-zinc-800 dark:text-zinc-200">
                  ${item.total.toFixed(2)}
                </div>
                <div className="col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length <= 1}
                    className="p-1.5 text-zinc-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-zinc-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Summary */}
          <div className="mt-6 flex flex-col md:flex-row justify-between gap-6">
            <div className="md:w-1/2">
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Payment Terms / Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="md:w-1/3 bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2 text-sm">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Subtotal:</span>
                <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1">Tax (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-16 px-2 py-0.5 text-right border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 font-mono text-xs"
                />
              </div>
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span>Discount ($):</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-20 px-2 py-0.5 text-right border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 font-mono text-xs"
                />
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 flex justify-between text-base font-bold text-zinc-900 dark:text-zinc-100">
                <span>Total Due:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">
                  ${total.toFixed(2)} {tenant.currency}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fastn Integration Actions Box */}
        <div className="border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-5 rounded-xl space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              Fastn Multi-Tenant Integration Automations
            </h4>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Select the platforms to synchronize immediately via Fastn for tenant namespace{" "}
            <code className="text-blue-600 dark:text-blue-400 font-mono font-semibold">
              {tenant.fastnNamespace}
            </code>
            :
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2.5 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer hover:border-blue-400 transition">
              <input
                type="checkbox"
                checked={syncQuickBooks}
                onChange={(e) => setSyncQuickBooks(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                📊 Sync to QuickBooks
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer hover:border-blue-400 transition">
              <input
                type="checkbox"
                checked={syncStripe}
                onChange={(e) => setSyncStripe(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                💳 Generate Stripe Checkout
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer hover:border-blue-400 transition">
              <input
                type="checkbox"
                checked={notifySlack}
                onChange={(e) => setNotifySlack(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                💬 Post to Slack
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition shadow-sm hover:shadow disabled:opacity-50"
          >
            {isSubmitting ? (
              <>Processing Fastn Sync...</>
            ) : (
              <>
                Create & Sync Invoice <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Sync Success Modal */}
      {syncSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  Invoice Created & Fastn Synced!
                </h3>
                <p className="text-xs text-zinc-500">
                  Namespace: <span className="font-mono text-blue-600">{syncSuccessModal.syncResponse.tenantNamespace}</span>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Fastn Workflow Execution Log
              </div>
              {syncSuccessModal.syncResponse.results.map((res: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {res.actionTaken}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                      {res.status}
                    </span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400">{res.message}</p>
                  {res.externalReference && (
                    <p className="font-mono text-[11px] text-zinc-500">
                      Ref: {res.externalReference}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSyncSuccessModal(null);
                  if (onSuccess) onSuccess(syncSuccessModal.invoice.id);
                  else window.location.href = "/dashboard";
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
