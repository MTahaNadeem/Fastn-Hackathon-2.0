"use client";

import React, { useState, useEffect } from "react";
import { useTenantContext } from "@/lib/tenant-context";
import {
  DEFAULT_EMAIL_TEMPLATE,
  DEFAULT_REMINDER_SCHEDULE,
  EmailTemplateConfig,
  ReminderScheduleConfig,
} from "@/lib/tenant";
import { formatPKR } from "@/lib/currency";
import TenantSwitcher from "@/components/TenantSwitcher";
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  Mail,
  Calendar,
  Sparkles,
  Check,
  RotateCcw,
  ShieldCheck,
  Eye,
  Info,
  Clock,
  CheckCircle2,
  Tag,
  Plus,
  Trash2,
} from "lucide-react";

const PLACEHOLDER_TAGS = [
  { tag: "{invoice_id}", label: "Invoice ID", sample: "INV-2026-001" },
  { tag: "{freelancer_name}", label: "Freelancer Name", sample: "Sarah Chen" },
  { tag: "{business_name}", label: "Business Name", sample: "Chen Design Studio" },
  { tag: "{amount}", label: "Amount", sample: "Rs. 5,250" },
  { tag: "{currency}", label: "Currency", sample: "PKR" },
  { tag: "{due_date}", label: "Due Date", sample: "2026-11-15" },
  { tag: "{client_email}", label: "Client Email", sample: "client@acmecorp.com" },
];

const PRESET_REMINDERS = [
  { days: 14, label: "14 days before" },
  { days: 7, label: "7 days before" },
  { days: 5, label: "5 days before" },
  { days: 3, label: "3 days before" },
  { days: 1, label: "1 day before" },
  { days: 0, label: "On due date (Day 0)" },
];

export default function SettingsPage() {
  const { tenant, updateSettings } = useTenantContext();

  // Local form state initialized from active tenant or defaults
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [reminderDays, setReminderDays] = useState<number[]>([3, 0]);
  const [customDayInput, setCustomDayInput] = useState("");
  const [savedToast, setSavedToast] = useState(false);

  // Sync state whenever active tenant changes
  useEffect(() => {
    if (tenant) {
      setSubject(tenant.settings?.emailTemplate?.subject || DEFAULT_EMAIL_TEMPLATE.subject);
      setBody(tenant.settings?.emailTemplate?.body || DEFAULT_EMAIL_TEMPLATE.body);
      setReminderDays(
        tenant.settings?.reminderSchedule?.daysBeforeDue || DEFAULT_REMINDER_SCHEDULE.daysBeforeDue
      );
    }
  }, [tenant.id]);

  // Insert placeholder tag into focused or active text field
  const handleInsertTag = (tag: string, target: "subject" | "body") => {
    if (target === "subject") {
      setSubject((prev) => `${prev} ${tag}`);
    } else {
      setBody((prev) => `${prev} ${tag}`);
    }
  };

  // Toggle reminder day preset
  const handleToggleReminderDay = (day: number) => {
    if (reminderDays.includes(day)) {
      if (reminderDays.length === 1) {
        alert("You must keep at least one reminder active.");
        return;
      }
      setReminderDays(reminderDays.filter((d) => d !== day));
    } else {
      const updated = [...reminderDays, day].sort((a, b) => b - a);
      setReminderDays(updated);
    }
  };

  // Add custom day
  const handleAddCustomDay = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customDayInput, 10);
    if (isNaN(parsed) || parsed < 0) {
      alert("Please enter a valid non-negative number of days.");
      return;
    }
    if (!reminderDays.includes(parsed)) {
      const updated = [...reminderDays, parsed].sort((a, b) => b - a);
      setReminderDays(updated);
    }
    setCustomDayInput("");
  };

  // Save Settings for active tenant
  const handleSave = () => {
    updateSettings({
      emailTemplate: {
        subject,
        body,
      },
      reminderSchedule: {
        daysBeforeDue: reminderDays,
        enableDayOfReminder: reminderDays.includes(0),
      },
    });

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  // Reset to Sensible Defaults
  const handleResetToDefaults = () => {
    if (confirm("Reset template and reminder schedule to sensible defaults?")) {
      setSubject(DEFAULT_EMAIL_TEMPLATE.subject);
      setBody(DEFAULT_EMAIL_TEMPLATE.body);
      setReminderDays(DEFAULT_REMINDER_SCHEDULE.daysBeforeDue);

      updateSettings({
        emailTemplate: DEFAULT_EMAIL_TEMPLATE,
        reminderSchedule: DEFAULT_REMINDER_SCHEDULE,
      });

      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    }
  };

  // Real-Time Preview Renderer
  const renderPreview = (text: string) => {
    let result = text;
    result = result.replace(/{invoice_id}/g, "INV-2026-001");
    result = result.replace(/{freelancer_name}/g, tenant.name || "Sarah Chen");
    result = result.replace(/{business_name}/g, tenant.businessName || "Chen Design Studio");
    result = result.replace(/{amount}/g, formatPKR(5250));
    result = result.replace(/{currency}/g, tenant.currency || "PKR");
    result = result.replace(/{due_date}/g, "2026-11-15");
    result = result.replace(/{client_email}/g, "client@acmecorp.com");
    return result;
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Breadcrumb & Tenant Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#737373] hover:text-[#1A1A1A] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <TenantSwitcher />
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-neutral-100 rounded-3xl p-6 sm:p-8 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
              <ShieldCheck className="w-3.5 h-3.5" /> Fastn Multi-Tenant Configuration
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A]">
              Workflow Settings for {tenant.businessName}
            </h1>
            <p className="text-xs sm:text-sm text-[#4A4A4A] max-w-2xl leading-relaxed">
              Customize email delivery templates and automated Google Calendar reminder schedules.
              Every setting is strictly partitioned to your tenant namespace (<code className="font-mono text-[#0F766E]">{tenant.fastnNamespace}</code>) with zero leak across freelancers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-200/90 bg-white hover:bg-neutral-50 text-[#1A1A1A] text-xs font-semibold transition shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D5C56] text-white text-xs font-semibold transition shadow-soft"
            >
              <Check className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>

        {savedToast && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Settings successfully saved and active for {tenant.businessName}!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Configuration Forms */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. EMAIL TEMPLATE CUSTOMIZATION */}
          <div className="bg-white border border-neutral-100 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200/60 text-red-600">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1A1A1A]">
                    Email Delivery Template
                  </h2>
                  <p className="text-xs text-[#737373]">
                    Sent via your connected Gmail account on invoice creation
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full font-mono bg-[#FAFAFA] text-[#737373] border border-neutral-200/60">
                Gmail Connector
              </span>
            </div>

            {/* Placeholders helper bar */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Available Dynamic Placeholders (Click to Insert)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PLACEHOLDER_TAGS.map((p) => (
                  <button
                    key={p.tag}
                    type="button"
                    onClick={() => handleInsertTag(p.tag, "body")}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#FAFAFA] hover:bg-[#F0FDFA] hover:text-[#0F766E] border border-neutral-200/80 text-[#4A4A4A] transition"
                    title={`Insert ${p.label}`}
                  >
                    {p.tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1A1A1A]">
                Email Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 bg-white text-[#1A1A1A] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition shadow-2xs"
                placeholder="Invoice {invoice_id} from {freelancer_name}"
              />
            </div>

            {/* Body Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1A1A1A]">
                Email Message Body
              </label>
              <textarea
                rows={9}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3.5 py-3 text-xs rounded-xl border border-neutral-200 bg-white text-[#1A1A1A] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] font-mono leading-relaxed transition shadow-2xs"
                placeholder="Write your custom invoice delivery message..."
              />
            </div>
          </div>

          {/* 2. REMINDER SCHEDULE CONFIGURATION */}
          <div className="bg-white border border-neutral-100 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] text-[#0F766E]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1A1A1A]">
                    Automated Calendar Reminders
                  </h2>
                  <p className="text-xs text-[#737373]">
                    Scheduled via Fastn Google Calendar connector before invoice due date
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full font-mono bg-[#FAFAFA] text-[#737373] border border-neutral-200/60">
                Google Calendar
              </span>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1A1A1A]">
                Reminder Triggers (Days Prior to Due Date)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PRESET_REMINDERS.map((preset) => {
                  const isActive = reminderDays.includes(preset.days);
                  return (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => handleToggleReminderDay(preset.days)}
                      className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                        isActive
                          ? "bg-[#F0FDFA] border-[#CCFBF1] text-[#0F766E] font-semibold"
                          : "bg-[#FAFAFA] border-neutral-200 text-[#4A4A4A] hover:border-neutral-300"
                      }`}
                    >
                      <span className="text-xs">{preset.label}</span>
                      {isActive && <Check className="w-4 h-4 text-[#0F766E]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Custom Day Form */}
            <form onSubmit={handleAddCustomDay} className="flex items-center gap-3 pt-2">
              <input
                type="number"
                min="0"
                max="90"
                value={customDayInput}
                onChange={(e) => setCustomDayInput(e.target.value)}
                placeholder="Add custom days (e.g. 10)"
                className="w-48 px-3.5 py-2 text-xs rounded-xl border border-neutral-200 bg-white text-[#1A1A1A] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] shadow-2xs"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 text-[#1A1A1A] border border-neutral-200/90 text-xs font-semibold transition shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Reminder
              </button>
            </form>

            {/* Active Schedule Summary */}
            <div className="p-3.5 rounded-2xl bg-[#FAFAFA] border border-neutral-200/70 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#737373]">
                <Clock className="w-4 h-4 text-[#0F766E]" />
                <span>Active Triggers:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {reminderDays.map((day) => (
                  <span
                    key={day}
                    className="px-2.5 py-0.5 rounded-md bg-[#F0FDFA] border border-[#CCFBF1] text-[#0F766E] font-mono text-[11px] font-semibold"
                  >
                    {day === 0 ? "Due Date (0d)" : `${day}d before`}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Preview & Sensible Defaults Callout */}
        <div className="lg:col-span-5 space-y-6">
          {/* Sensible Defaults Info Callout */}
          <div className="bg-[#F0FDFA] border border-[#CCFBF1] rounded-3xl p-6 text-xs text-[#0F766E] space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#0F766E]">
              <Sparkles className="w-4 h-4 text-[#0F766E]" /> Sensible Defaults Out of the Box
            </div>
            <p className="leading-relaxed text-[#4A4A4A]">
              If a new freelancer skips custom configuration, Fastn automatically provisions:
            </p>
            <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-[#0F766E] opacity-90">
              <li>Clean, professional invoice delivery email in PKR</li>
              <li>Dual reminders (3 days before & day-of due date)</li>
              <li>Google Sheets row append with status=pending</li>
            </ul>
          </div>

          {/* REAL-TIME LIVE EMAIL PREVIEW */}
          <div className="bg-white border border-neutral-100 rounded-3xl p-6 sm:p-7 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A]">
                <Eye className="w-4 h-4 text-[#0F766E]" /> Live Email Client Preview
              </div>
              <span className="text-[10px] font-mono text-[#737373]">Sample Client View</span>
            </div>

            {/* Email Shell */}
            <div className="rounded-2xl border border-neutral-200/80 bg-[#FAFAFA] p-4 space-y-3 font-sans text-xs">
              <div className="space-y-1.5 border-b border-neutral-200/80 pb-3 text-[11px]">
                <div className="flex justify-between text-[#737373]">
                  <span className="font-semibold text-[#1A1A1A]">From:</span>
                  <span>{tenant.name} &lt;{tenant.email}&gt;</span>
                </div>
                <div className="flex justify-between text-[#737373]">
                  <span className="font-semibold text-[#1A1A1A]">To:</span>
                  <span>Acme FinTech &lt;client@acmecorp.com&gt;</span>
                </div>
                <div className="flex justify-between text-[#737373] pt-1">
                  <span className="font-semibold text-[#1A1A1A]">Subject:</span>
                  <span className="font-bold text-[#1A1A1A]">
                    {renderPreview(subject)}
                  </span>
                </div>
              </div>

              {/* Rendered Body */}
              <div className="text-[#4A4A4A] whitespace-pre-wrap leading-relaxed font-sans text-xs pt-1">
                {renderPreview(body)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
