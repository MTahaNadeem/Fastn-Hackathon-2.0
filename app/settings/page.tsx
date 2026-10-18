"use client";

import React, { useState, useEffect } from "react";
import { useTenantContext } from "@/lib/tenant-context";
import {
  DEFAULT_EMAIL_TEMPLATE,
  DEFAULT_REMINDER_SCHEDULE,
  EmailTemplateConfig,
  ReminderScheduleConfig,
} from "@/lib/tenant";
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
  { tag: "{amount}", label: "Amount", sample: "5,250.00" },
  { tag: "{currency}", label: "Currency", sample: "USD" },
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
    result = result.replace(/{amount}/g, "5,250.00");
    result = result.replace(/{currency}/g, tenant.currency || "USD");
    result = result.replace(/{due_date}/g, "2026-11-15");
    result = result.replace(/{client_email}/g, "client@acmecorp.com");
    return result;
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Breadcrumb & Tenant Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <TenantSwitcher />
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-violet-900/10 border border-blue-200 dark:border-blue-800/40 rounded-3xl p-6 sm:p-7 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <ShieldCheck className="w-3.5 h-3.5" /> Fastn Multi-Tenant Configuration
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
              Workflow Settings for {tenant.businessName}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Customize email templates and automated Google Calendar reminder schedules.
              Every setting is strictly partitioned to your tenant namespace (<code>{tenant.fastnNamespace}</code>) with zero leak across freelancers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-sm hover:shadow"
            >
              <Check className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>

        {savedToast && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Settings successfully saved and active for {tenant.businessName}!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Configuration Forms */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. EMAIL TEMPLATE CUSTOMIZATION */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Email Delivery Template
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Sent via your connected Gmail account on invoice creation
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                Gmail Connector
              </span>
            </div>

            {/* Placeholders helper bar */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-500" />
                <span>Available Dynamic Placeholders (Click to Insert)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PLACEHOLDER_TAGS.map((p) => (
                  <button
                    key={p.tag}
                    type="button"
                    onClick={() => handleInsertTag(p.tag, "body")}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition"
                    title={`Insert ${p.label}`}
                  >
                    {p.tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Email Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Invoice {invoice_id} from {freelancer_name}"
              />
            </div>

            {/* Body Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Email Message Body
              </label>
              <textarea
                rows={9}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs leading-relaxed"
                placeholder="Write your custom invoice delivery message..."
              />
            </div>
          </div>

          {/* 2. REMINDER SCHEDULE CONFIGURATION */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Automated Calendar Reminders
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Scheduled via Fastn Google Calendar connector before invoice due date
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                Google Calendar
              </span>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
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
                          ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500/40 text-blue-900 dark:text-blue-100 font-semibold"
                          : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                      }`}
                    >
                      <span className="text-xs">{preset.label}</span>
                      {isActive && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
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
                className="w-48 px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Reminder
              </button>
            </form>

            {/* Active Schedule Summary */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-500">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Active Triggers:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {reminderDays.map((day) => (
                  <span
                    key={day}
                    className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono text-[11px]"
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
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 text-xs text-emerald-800 dark:text-emerald-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-500" /> Sensible Defaults Out of the Box
            </div>
            <p className="leading-relaxed">
              If a new freelancer skips custom configuration, Fastn automatically provisions:
            </p>
            <ul className="list-disc list-inside space-y-1 font-mono text-[11px] opacity-90">
              <li>Clean, professional invoice delivery email</li>
              <li>Dual reminders (3 days before & day-of due date)</li>
              <li>Google Sheets row append with status=pending</li>
            </ul>
          </div>

          {/* REAL-TIME LIVE EMAIL PREVIEW */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                <Eye className="w-4 h-4 text-blue-500" /> Live Email Client Preview
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Sample Client View</span>
            </div>

            {/* Email Shell */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 p-4 space-y-3 font-sans text-xs">
              <div className="space-y-1 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3 text-[11px]">
                <div className="flex justify-between text-zinc-500">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">From:</span>
                  <span>{tenant.name} &lt;{tenant.email}&gt;</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">To:</span>
                  <span>Acme FinTech &lt;client@acmecorp.com&gt;</span>
                </div>
                <div className="flex justify-between text-zinc-500 pt-1">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Subject:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {renderPreview(subject)}
                  </span>
                </div>
              </div>

              {/* Rendered Body */}
              <div className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans text-xs pt-1">
                {renderPreview(body)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
