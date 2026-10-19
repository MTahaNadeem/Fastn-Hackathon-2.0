"use client";

import React, { useState, useEffect } from "react";
import { useTenantContext } from "@/lib/tenant-context";
import { getInvoicesForTenant, Invoice } from "@/lib/invoices";
import { CONNECTOR_CATALOG } from "@/lib/fastn";
import { formatPKR } from "@/lib/currency";
import InvoiceList from "@/components/InvoiceList";
import Link from "next/link";
import {
  Zap,
  Plus,
  Link2,
  Coins,
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
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Welcome Card */}
      <div className="bg-white border border-neutral-100 rounded-3xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Active Fastn Tenant</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A]">
            {tenant.businessName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#737373]">
            <span>Freelancer: <strong className="text-[#1A1A1A]">{tenant.name}</strong></span>
            <span>•</span>
            <span>Fastn Namespace: <code className="font-mono text-[#0F766E] font-bold">{tenant.fastnNamespace}</code></span>
            <span>•</span>
            <span>Currency: <strong className="text-[#1A1A1A]">PKR (Rs.)</strong></span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/invoices/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D5C56] text-white font-semibold text-xs transition shadow-soft"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </Link>
          <Link
            href="/connect-accounts"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-50 text-[#1A1A1A] border border-neutral-200/90 font-semibold text-xs transition shadow-2xs"
          >
            <Link2 className="w-4 h-4" />
            <span>Manage Integrations</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-neutral-100 p-6 rounded-2xl space-y-2 shadow-soft hover:shadow-card transition">
          <div className="flex items-center justify-between text-xs text-[#737373] font-semibold uppercase tracking-wider">
            <span>Total Invoiced</span>
            <Coins className="w-4 h-4 text-[#0F766E]" />
          </div>
          <div className="text-2xl font-bold text-[#1A1A1A] font-mono">
            {formatPKR(totalInvoiced)}
          </div>
          <div className="text-[11px] text-[#737373]">
            {invoices.length} invoices generated
          </div>
        </div>

        <div className="bg-white border border-neutral-100 p-6 rounded-2xl space-y-2 shadow-soft hover:shadow-card transition">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold uppercase tracking-wider">
            <span>Received / Paid</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#1A1A1A] font-mono">
            {formatPKR(totalPaid)}
          </div>
          <div className="text-[11px] text-[#737373]">
            {paidInvoices.length} invoices settled
          </div>
        </div>

        <div className="bg-white border border-neutral-100 p-6 rounded-2xl space-y-2 shadow-soft hover:shadow-card transition">
          <div className="flex items-center justify-between text-xs text-amber-700 font-semibold uppercase tracking-wider">
            <span>Outstanding</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-[#1A1A1A] font-mono">
            {formatPKR(totalPending)}
          </div>
          <div className="text-[11px] text-[#737373]">
            {pendingInvoices.length} pending client payments
          </div>
        </div>

        <div className="bg-white border border-neutral-100 p-6 rounded-2xl space-y-2 shadow-soft hover:shadow-card transition">
          <div className="flex items-center justify-between text-xs text-[#0F766E] font-semibold uppercase tracking-wider">
            <span>Fastn Integrations</span>
            <Zap className="w-4 h-4 text-[#0F766E]" />
          </div>
          <div className="text-2xl font-bold text-[#1A1A1A]">
            {connectedConnectors.length} / 5 Active
          </div>
          <div className="text-[11px] text-[#737373]">
            Isolated to tenant namespace
          </div>
        </div>
      </div>

      {/* Fastn Integrations Ribbon */}
      <div className="bg-white border border-neutral-100 p-4 rounded-2xl shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center text-[#0F766E]">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#1A1A1A]">
              Active Connectors in Namespace [{tenant.fastnNamespace}]
            </div>
            <div className="text-[11px] text-[#737373]">
              {connectedConnectors.length > 0
                ? `Ready to auto-sync with ${connectedConnectors.join(", ")}.`
                : "No integrations connected yet. Connect JazzCash, Sheets, Gmail, Calendar, or Slack."}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {["gmail", "google_calendar", "google_sheets", "slack", "jazzcash"].map((id) => {
            const isConn = connectedConnectors.includes(id);
            return (
              <span
                key={id}
                title={`${id}: ${isConn ? "Connected" : "Not connected"}`}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border transition ${
                  isConn
                    ? "bg-[#F0FDFA] border-[#CCFBF1] text-[#0F766E] shadow-2xs"
                    : "bg-neutral-100 border-neutral-200 text-neutral-400 opacity-60"
                }`}
              >
                {id.charAt(0).toUpperCase()}
              </span>
            );
          })}
          <Link
            href="/connect-accounts"
            className="text-xs font-semibold text-[#0F766E] hover:underline ml-2"
          >
            Configure →
          </Link>
        </div>
      </div>

      {/* Invoices List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A]">
              Invoices & Payment Records
            </h2>
            <p className="text-xs text-[#737373]">
              Manage client billing and view live Fastn synchronization logs.
            </p>
          </div>
          <Link
            href="/invoices/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D5C56] text-white text-xs font-semibold transition shadow-soft"
          >
            <Plus className="w-3.5 h-3.5" /> Create Invoice
          </Link>
        </div>

        <InvoiceList />
      </div>
    </div>
  );
}
