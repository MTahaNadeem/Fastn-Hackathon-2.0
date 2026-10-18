"use client";

import React, { useState, useEffect } from "react";
import { useTenantContext } from "@/lib/tenant-context";
import { getInvoicesForTenant, Invoice } from "@/lib/invoices";
import { CONNECTOR_CATALOG } from "@/lib/fastn";
import InvoiceList from "@/components/InvoiceList";
import Link from "next/link";
import {
  Zap,
  Plus,
  Link2,
  DollarSign,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const { tenant } = useTenantContext();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const load = () => {
      setInvoices(getInvoicesForTenant(tenant.id));
    };
    load();

    window.addEventListener("invoiceflow:invoices_updated", load);
    window.addEventListener("invoiceflow:tenant_changed", load);
    return () => {
      window.removeEventListener("invoiceflow:invoices_updated", load);
      window.removeEventListener("invoiceflow:tenant_changed", load);
    };
  }, [tenant.id]);

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidInvoices = invoices.filter((i) => i.status === "paid");
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const pendingInvoices = invoices.filter((i) => i.status === "pending" || i.status === "overdue");
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);

  const connectedConnectors = tenant.connectedConnectors || [];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Welcome Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Active Fastn Tenant</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {tenant.businessName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span>Freelancer: <strong className="text-zinc-700 dark:text-zinc-300">{tenant.name}</strong></span>
            <span>•</span>
            <span>Fastn Namespace: <code className="font-mono text-blue-600 dark:text-blue-400 font-bold">{tenant.fastnNamespace}</code></span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/invoices/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </Link>
          <Link
            href="/connect-accounts"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs transition"
          >
            <Link2 className="w-4 h-4" />
            <span>Manage Integrations</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold uppercase tracking-wider">
            <span>Total Invoiced</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
            ${totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-400">
            {invoices.length} invoices generated
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
            <span>Received / Paid</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
            ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-400">
            {paidInvoices.length} invoices settled
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">
            <span>Outstanding</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
            ${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-400">
            {pendingInvoices.length} pending client payments
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">
            <span>Fastn Integrations</span>
            <Zap className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
            {connectedConnectors.length} / {CONNECTOR_CATALOG.length}
          </div>
          <div className="text-[11px] text-zinc-400">
            Isolated to tenant namespace
          </div>
        </div>
      </div>

      {/* Fastn Integrations Ribbon */}
      <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Active Connectors in Namespace [{tenant.fastnNamespace}]
            </div>
            <div className="text-[11px] text-zinc-500">
              {connectedConnectors.length > 0
                ? `Ready to auto-sync with ${connectedConnectors.join(", ")}.`
                : "No integrations connected yet. Connect Stripe or QuickBooks for auto-sync."}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {CONNECTOR_CATALOG.map((c) => {
            const isConn = connectedConnectors.includes(c.id);
            return (
              <span
                key={c.id}
                title={`${c.name}: ${isConn ? "Connected" : "Not connected"}`}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm border transition ${
                  isConn
                    ? "bg-white dark:bg-zinc-800 border-emerald-500/50 shadow-sm"
                    : "bg-zinc-200/50 dark:bg-zinc-800/40 border-transparent opacity-40"
                }`}
              >
                {c.icon}
              </span>
            );
          })}
          <Link
            href="/connect-accounts"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline ml-2"
          >
            Configure →
          </Link>
        </div>
      </div>

      {/* Invoices List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Invoices & Payment Records
            </h2>
            <p className="text-xs text-zinc-500">
              Manage client billing and view live Fastn synchronization logs.
            </p>
          </div>
          <Link
            href="/invoices/create"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" /> Create Invoice
          </Link>
        </div>

        <InvoiceList />
      </div>
    </div>
  );
}
