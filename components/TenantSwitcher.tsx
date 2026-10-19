"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTenantContext } from "@/lib/tenant-context";
import { ChevronDown, Check, UserPlus, Shield, Sparkles } from "lucide-react";
import Link from "next/link";

export default function TenantSwitcher() {
  const { tenant, tenants, switchTenant } = useTenantContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-neutral-200/90 bg-white hover:bg-neutral-50 transition text-left shadow-2xs"
      >
        <div className="w-6 h-6 rounded-lg bg-[#0F766E] flex items-center justify-center text-white text-[11px] font-bold">
          {tenant.name.charAt(0)}
        </div>
        <div className="hidden sm:block">
          <div className="text-xs font-semibold text-[#1A1A1A] leading-tight">
            {tenant.businessName}
          </div>
          <div className="text-[10px] text-[#737373] font-mono truncate max-w-[140px]">
            {tenant.fastnNamespace}
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-neutral-100 shadow-card z-50 p-2 space-y-1 animate-in fade-in zoom-in-95">
          <div className="px-3 py-2 border-b border-neutral-100">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#737373]">
              Active Freelancer Tenant
            </span>
            <div className="text-[11px] text-[#737373] mt-0.5">
              Isolates Fastn credentials & connected accounting tools.
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 py-1">
            {tenants.map((t) => {
              const isActive = t.id === tenant.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    switchTenant(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start justify-between p-2.5 rounded-xl text-left transition ${
                    isActive
                      ? "bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]"
                      : "hover:bg-neutral-50 text-[#4A4A4A]"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-[#1A1A1A]">{t.businessName}</div>
                    <div className="text-[11px] text-[#737373]">{t.name}</div>
                    <div className="text-[10px] font-mono text-[#0F766E]">
                      {t.fastnNamespace}
                    </div>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>

          <div className="border-t border-neutral-100 pt-1">
            <Link
              href="/signup"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-[#0F766E] hover:bg-[#F0FDFA] transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Sign Up New Freelancer Tenant</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
