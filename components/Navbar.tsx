"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TenantSwitcher from "./TenantSwitcher";
import {
  Zap,
  LayoutDashboard,
  FilePlus,
  Link2,
  Settings,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Create Invoice", href: "/invoices/create", icon: FilePlus },
    { label: "Connect Accounts", href: "/connect-accounts", icon: Link2 },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#0F766E] hover:bg-[#0D5C56] flex items-center justify-center text-white shadow-soft transition">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-[#1A1A1A]">
                  InvoiceFlow
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
                  Fastn 2.0
                </span>
              </div>
              <p className="text-[10px] text-[#737373] font-normal">
                Multi-Tenant Freelancer Invoicing
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? "bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1] shadow-2xs"
                      : "text-[#4A4A4A] hover:text-[#1A1A1A] hover:bg-neutral-50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Section: Tenant Switcher & Auth */}
        <div className="flex items-center gap-3">
          <TenantSwitcher />

          <Link
            href="/signup"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0F766E] hover:bg-[#0D5C56] text-white transition shadow-soft"
          >
            <Sparkles className="w-3 h-3" />
            <span>Join as Freelancer</span>
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-500 hover:text-neutral-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white p-4 space-y-2 shadow-lg">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]"
                    : "text-[#4A4A4A] hover:bg-neutral-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/signup"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-center w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-[#0F766E] text-white mt-2 shadow-soft"
          >
            Join as Freelancer
          </Link>
        </div>
      )}
    </nav>
  );
}
