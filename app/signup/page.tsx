"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTenantContext } from "@/lib/tenant-context";
import { generateFastnNamespace } from "@/lib/tenant";
import {
  ShieldCheck,
  User,
  Building,
  Mail,
  Zap,
  ArrowRight,
  Sparkles,
  Lock,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { registerTenant } = useTenantContext();

  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [previewNamespace, setPreviewNamespace] = useState("");

  const handleBusinessChange = (val: string) => {
    setBusinessName(val);
    setPreviewNamespace(generateFastnNamespace(val || name || "freelancer"));
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!businessName) {
      setPreviewNamespace(generateFastnNamespace(val || "freelancer"));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !businessName || !email) {
      alert("Please fill in all required fields.");
      return;
    }

    const newTenant = registerTenant({
      name,
      businessName,
      email,
      currency,
    });

    router.push("/dashboard");
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Freelancer Multi-Tenant Onboarding</span>
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
          Create Your Freelancer Tenant
        </h1>
        <p className="text-xs text-zinc-500 max-w-md mx-auto">
          Every signed-up freelancer operates as an isolated tenant with a dedicated Fastn connection namespace.
        </p>
      </div>

      {/* Signup Form */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Freelancer Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. Jordan Blake"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Studio / Business Name *
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. Blake Motion & 3D"
                value={businessName}
                onChange={(e) => handleBusinessChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Billing Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="email"
                placeholder="jordan@blakedesign.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Default Billing Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD ($ - US Dollar)</option>
              <option value="EUR">EUR (€ - Euro)</option>
              <option value="GBP">GBP (£ - British Pound)</option>
              <option value="CAD">CAD ($ - Canadian Dollar)</option>
              <option value="AUD">AUD ($ - Australian Dollar)</option>
            </select>
          </div>

          {/* Fastn Tenant Namespace Preview */}
          <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Assigned Fastn Connection Namespace</span>
            </div>
            <div className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900 py-1.5 px-3 rounded-lg border border-blue-200 dark:border-blue-800">
              {previewNamespace || "freelancer-tenant-preview"}
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Fastn will use this namespace (<code className="font-mono">x-fastn-space-tenantid</code>) to sandbox all your OAuth tokens and accounting configurations.
            </p>
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition"
          >
            <span>Activate Tenant & Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
