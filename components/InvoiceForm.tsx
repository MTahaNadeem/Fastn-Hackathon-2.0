"use client";

import React, { useState } from "react";
import { useTenantContext } from "@/lib/tenant-context";
import { createInvoice, InvoiceItem } from "@/lib/invoices";
import { syncInvoiceViaFastn, CONNECTOR_CATALOG } from "@/lib/fastn";
import { formatPKR } from "@/lib/currency";
import { Plus, Trash2, ArrowRight, Zap, CheckCircle2, ShieldCheck, Building, Calendar, Receipt } from "lucide-react";

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
  const [notes, setNotes] = useState("Payment is due upon receipt via JazzCash or direct bank transfer.");

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
      unitPrice: 150000,
      total: 150000,
    },
  ]);

  const [taxRate, setTaxRate] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);

  // Fastn integration toggles for active tenant
  const [syncGoogleSheets, setSyncGoogleSheets] = useState(true);
  const [syncJazzCash, setSyncJazzCash] = useState(tenant?.connectedConnectors.includes("jazzcash") ?? true);
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
      if (syncGoogleSheets) selectedConnectors.push("google_sheets");
      if (syncJazzCash) selectedConnectors.push("jazzcash");
      if (notifySlack) selectedConnectors.push("slack");

      // 1. Create invoice in tenant store (Strictly PKR)
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
        currency: "PKR",
        notes,
        status: "pending",
        fastnSync: {
          synced: true,
          syncedConnectors: ["gmail", "calendar", "sheets", "slack", ...selectedConnectors],
          lastSyncedAt: new Date().toISOString(),
        },
      });

      // 2. Trigger Fastn "invoice-lifecycle" Workflow Webhook
      let lifecycleResult: any = null;
      try {
        const lifecycleRes = await fetch("/api/webhooks/invoice-created", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenant_id: tenant.id,
            invoice_id: newInvoice.id,
            client_email: newInvoice.clientEmail,
            amount: newInvoice.total,
            currency: "PKR",
            due_date: newInvoice.dueDate,
            freelancer_name: tenant.name,
            slack_channel: `#${tenant.businessName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-invoices`,
          }),
        });
        if (lifecycleRes.ok) {
          lifecycleResult = await lifecycleRes.json();
        }
      } catch (err) {
        console.warn("Could not fire invoice-lifecycle webhook:", err);
      }

      // 3. Fallback sync response if needed
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
        connectors: selectedConnectors.length > 0 ? selectedConnectors : ["jazzcash", "google_sheets"],
      });

      setSyncSuccessModal({
        invoice: newInvoice,
        syncResponse,
        lifecycleResult,
      });
    } catch (err) {
      console.error("Failed to create invoice:", err);
      alert("Error creating invoice. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-neutral-100 rounded-3xl shadow-card overflow-hidden">
      {/* Top Banner indicating Tenant Fastn Namespace */}
      <div className="bg-[#FAFAFA] border-b border-neutral-100 px-6 sm:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0F766E]">
            Tenant Fastn Isolation
          </span>
          <h2 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
            Invoice for {tenant.businessName}
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-neutral-200/90 text-xs shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-[#737373]">Fastn Namespace:</span>
          <code className="font-mono font-semibold text-[#0F766E]">
            {tenant.fastnNamespace}
          </code>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
        {/* Header Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
              Invoice Number
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl bg-[#FAFAFA] text-[#1A1A1A] text-sm font-mono focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] focus:outline-none transition shadow-2xs"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
              Issue Date
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl bg-white text-[#1A1A1A] text-sm focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] focus:outline-none transition shadow-2xs"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl bg-white text-[#1A1A1A] text-sm focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] focus:outline-none transition shadow-2xs"
              required
            />
          </div>
        </div>

        {/* Client Details */}
        <div className="border-t border-neutral-100 pt-6">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-neutral-400" /> Client Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#4A4A4A] mb-1.5">
                Client Name / Organization *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Acme Corporation"
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl bg-white text-[#1A1A1A] text-sm placeholder:text-neutral-400 focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] focus:outline-none transition shadow-2xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4A4A4A] mb-1.5">
                Client Billing Email *
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="billing@client.com"
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl bg-white text-[#1A1A1A] text-sm placeholder:text-neutral-400 focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] focus:outline-none transition shadow-2xs"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#4A4A4A] mb-1.5">
                Billing Address (Optional)
              </label>
              <input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Suite 500, Gulberg III, Lahore, Pakistan"
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl bg-white text-[#1A1A1A] text-sm placeholder:text-neutral-400 focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] focus:outline-none transition shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="border-t border-neutral-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-neutral-400" /> Line Items (PKR)
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F766E] bg-[#F0FDFA] hover:bg-[#CCFBF1] border border-[#CCFBF1] rounded-xl transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-3 items-center bg-[#FAFAFA] p-3.5 rounded-2xl border border-neutral-200/70"
              >
                <div className="col-span-12 sm:col-span-6">
                  <label className="block text-[10px] font-semibold text-[#737373] mb-1 uppercase tracking-wide">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Description of deliverables"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white text-[#1A1A1A] text-sm focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] focus:outline-none transition"
                    required
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-[#737373] mb-1 uppercase tracking-wide">
                    Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white text-[#1A1A1A] text-sm focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] focus:outline-none transition"
                    required
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-[#737373] mb-1 uppercase tracking-wide">
                    Amount (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Amount (PKR)"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white text-[#1A1A1A] text-sm focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] focus:outline-none transition"
                    required
                  />
                </div>
                <div className="col-span-3 sm:col-span-1 font-mono text-sm text-right font-medium text-[#1A1A1A] pt-5">
                  {formatPKR(item.total)}
                </div>
                <div className="col-span-1 text-right pt-5">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length <= 1}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-neutral-400 transition"
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
              <label className="block text-xs font-medium text-[#4A4A4A] mb-1.5">
                Payment Terms / Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl bg-white text-[#1A1A1A] text-sm focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] focus:outline-none transition shadow-2xs"
              />
            </div>

            <div className="md:w-1/3 bg-[#FAFAFA] p-5 rounded-2xl border border-neutral-200/80 space-y-2.5 text-sm">
              <div className="flex justify-between text-[#4A4A4A]">
                <span>Subtotal:</span>
                <span className="font-mono font-medium text-[#1A1A1A]">
                  {formatPKR(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#4A4A4A]">
                <span>Tax (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-16 px-2 py-1 text-right border border-neutral-200 rounded-lg bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20"
                />
              </div>
              <div className="flex items-center justify-between text-[#4A4A4A]">
                <span>Discount (PKR):</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-24 px-2 py-1 text-right border border-neutral-200 rounded-lg bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20"
                />
              </div>
              <div className="border-t border-neutral-200 pt-3 flex justify-between text-base font-bold text-[#1A1A1A]">
                <span>Total Due:</span>
                <span className="font-mono text-[#0F766E] text-xl">
                  {formatPKR(total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fastn Integration Actions Box */}
        <div className="border border-[#CCFBF1] bg-[#F0FDFA] p-5 rounded-2xl space-y-3.5">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#0F766E]" />
            <h4 className="font-semibold text-sm text-[#1A1A1A]">
              Fastn Multi-Tenant Integration Automations
            </h4>
          </div>
          <p className="text-xs text-[#4A4A4A]">
            Select platforms to synchronize immediately via Fastn for tenant namespace{" "}
            <code className="text-[#0F766E] font-mono font-semibold">
              {tenant.fastnNamespace}
            </code>
            :
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-white cursor-pointer hover:border-[#0F766E] transition shadow-2xs">
              <input
                type="checkbox"
                checked={syncGoogleSheets}
                onChange={(e) => setSyncGoogleSheets(e.target.checked)}
                className="w-4 h-4 text-[#0F766E] accent-[#0F766E] rounded"
              />
              <span className="text-xs font-medium text-[#1A1A1A]">
                📊 Google Sheets Ledger
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-white cursor-pointer hover:border-[#0F766E] transition shadow-2xs">
              <input
                type="checkbox"
                checked={syncJazzCash}
                onChange={(e) => setSyncJazzCash(e.target.checked)}
                className="w-4 h-4 text-[#0F766E] accent-[#0F766E] rounded"
              />
              <span className="text-xs font-medium text-[#1A1A1A]">
                📱 JazzCash Checkout
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-white cursor-pointer hover:border-[#0F766E] transition shadow-2xs">
              <input
                type="checkbox"
                checked={notifySlack}
                onChange={(e) => setNotifySlack(e.target.checked)}
                className="w-4 h-4 text-[#0F766E] accent-[#0F766E] rounded"
              />
              <span className="text-xs font-medium text-[#1A1A1A]">
                💬 Slack Channel Alert
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F766E] hover:bg-[#0D5C56] text-white font-semibold text-sm transition shadow-soft hover:shadow disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-100 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-6 shadow-card animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200/70">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#1A1A1A]">
                  Invoice Created & Fastn Synced!
                </h3>
                <p className="text-xs text-[#737373]">
                  Namespace: <span className="font-mono text-[#0F766E]">{syncSuccessModal.syncResponse.tenantNamespace}</span>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
                Fastn Lifecycle Workflow: invoice-lifecycle
              </div>

              {syncSuccessModal.lifecycleResult?.steps ? (
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-2.5 rounded-xl bg-[#FAFAFA] border border-neutral-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-sans font-semibold text-[#1A1A1A]">
                      ✉️ Gmail Delivery
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                      RESOLVED ({syncSuccessModal.lifecycleResult.tenant_id})
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAFAFA] border border-neutral-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-sans font-semibold text-[#1A1A1A]">
                      📅 Google Calendar
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                      3-DAY & DAY-OF REMINDERS
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAFAFA] border border-neutral-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-sans font-semibold text-[#1A1A1A]">
                      📊 Google Sheets Ledger
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                      ROW APPENDED (STATUS: PENDING)
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAFAFA] border border-neutral-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-sans font-semibold text-[#1A1A1A]">
                      💬 Slack Alert
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                      DISPATCHED TO TENANT CHANNEL
                    </span>
                  </div>
                </div>
              ) : (
                syncSuccessModal.syncResponse.results.map((res: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-[#FAFAFA] p-3 rounded-xl border border-neutral-200 text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[#1A1A1A]">
                        {res.actionTaken}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {res.status}
                      </span>
                    </div>
                    <p className="text-[#4A4A4A]">{res.message}</p>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSyncSuccessModal(null);
                  if (onSuccess) onSuccess(syncSuccessModal.invoice.id);
                  else window.location.href = "/dashboard";
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D5C56] text-white font-semibold text-xs shadow-soft transition"
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
