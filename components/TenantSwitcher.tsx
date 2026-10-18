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
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition text-left"
      >
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold">
          {tenant.name.charAt(0)}
        </div>
        <div className="hidden sm:block">
          <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
            {tenant.businessName}
          </div>
          <div className="text-[10px] text-zinc-400 font-mono truncate max-w-[140px]">
            {tenant.fastnNamespace}
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95">
          <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Active Freelancer Tenant
            </span>
            <div className="text-xs text-zinc-500 mt-0.5">
              Each tenant isolates Fastn credentials & connected accounting tools.
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
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold">{t.businessName}</div>
                    <div className="text-[11px] text-zinc-500">{t.name}</div>
                    <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400">
                      {t.fastnNamespace}
                    </div>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-1">
            <Link
              href="/signup"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
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
