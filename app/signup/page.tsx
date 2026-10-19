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
  const currency = "PKR";
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0FDFA] border border-[#CCFBF1] text-[#0F766E] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Freelancer Multi-Tenant Onboarding</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">
          Create Your Freelancer Tenant
        </h1>
        <p className="text-xs text-[#737373] max-w-md mx-auto leading-relaxed">
          Every signed-up freelancer operates as an isolated tenant with a dedicated Fastn connection namespace.
        </p>
      </div>

      {/* Signup Form */}
      <div className="bg-white border border-neutral-100 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
              Freelancer Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. Jordan Blake"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-neutral-200 rounded-xl bg-white text-[#1A1A1A] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition shadow-2xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
              Studio / Business Name *
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. Blake Motion & 3D"
                value={businessName}
                onChange={(e) => handleBusinessChange(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-neutral-200 rounded-xl bg-white text-[#1A1A1A] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition shadow-2xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
              Billing Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="email"
                placeholder="jordan@blakedesign.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-neutral-200 rounded-xl bg-white text-[#1A1A1A] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition shadow-2xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
              Billing Currency
            </label>
            <div className="w-full px-3.5 py-2.5 text-sm border border-neutral-200 rounded-xl bg-[#FAFAFA] text-[#1A1A1A] font-medium flex items-center justify-between shadow-2xs">
              <span>PKR (Rs. - Pakistani Rupee)</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
                PKR Native
              </span>
            </div>
          </div>

          {/* Fastn Tenant Namespace Preview */}
          <div className="bg-[#F0FDFA] border border-[#CCFBF1] p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-[#0F766E] text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Assigned Fastn Connection Namespace</span>
            </div>
            <div className="font-mono text-xs font-bold text-[#0F766E] bg-white py-1.5 px-3 rounded-lg border border-[#CCFBF1]">
              {previewNamespace || "freelancer-tenant-preview"}
            </div>
            <p className="text-[11px] text-[#737373] leading-relaxed">
              Fastn will use this namespace (<code className="font-mono text-[#0F766E]">x-end-org-id</code>) to sandbox all your OAuth tokens and accounting configurations.
            </p>
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0F766E] hover:bg-[#0D5C56] text-white font-semibold text-sm shadow-soft transition"
          >
            <span>Activate Tenant & Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
