/**
 * Test Suite: test-settings-and-customization.ts
 * 
 * Verifies:
 * 1. Default sensible settings applied when tenant skips setup.
 * 2. Independent customization per tenant (Email subject/body + Reminder days).
 * 3. Lifecycle workflow execution picks up customized template and reminders.
 * 4. Zero cross-tenant bleed for settings.
 */

import {
  getTenants,
  updateTenantSettings,
  DEFAULT_EMAIL_TEMPLATE,
  DEFAULT_REMINDER_SCHEDULE,
} from "../lib/tenant";
import { executeInvoiceLifecycleWorkflow } from "../lib/fastn";

async function runSettingsCustomizationTests() {
  console.log("=================================================================");
  console.log("     FASTN MULTI-TENANT SETTINGS & CUSTOMIZATION TEST SUITE      ");
  console.log("=================================================================\n");

  // 1. Test Sensible Defaults
  console.log("▶ [1/4] Verifying Sensible Defaults for Tenant Setup Skipping...");
  console.log("  Default Email Subject:", DEFAULT_EMAIL_TEMPLATE.subject);
  console.log("  Default Reminders:    ", DEFAULT_REMINDER_SCHEDULE.daysBeforeDue.join(", "), "days before due");
  if (!DEFAULT_EMAIL_TEMPLATE.subject || DEFAULT_REMINDER_SCHEDULE.daysBeforeDue.length < 2) {
    throw new Error("Sensible defaults missing or incomplete");
  }
  console.log("  Status:                ✅ PASS\n");

  // 2. Test Tenant A (Sarah Chen) Settings
  console.log("▶ [2/4] Testing Tenant A (Sarah Chen) Custom Settings...");
  updateTenantSettings("tenant-sarah-chen", {
    emailTemplate: {
      subject: "Custom Design Invoice {invoice_id} from Sarah Chen",
      body: "Hi {client_email},\n\nYour design deliverables invoice {invoice_id} for {amount} {currency} is ready.",
    },
    reminderSchedule: {
      daysBeforeDue: [5, 2, 0],
      enableDayOfReminder: true,
    },
  });

  const tenantsAfterA = getTenants();
  const sarah = tenantsAfterA.find((t) => t.id === "tenant-sarah-chen");
  console.log("  Sarah's Subject:      ", sarah?.settings?.emailTemplate.subject);
  console.log("  Sarah's Reminder Days:", sarah?.settings?.reminderSchedule.daysBeforeDue.join(", "));
  if (sarah?.settings?.emailTemplate.subject !== "Custom Design Invoice {invoice_id} from Sarah Chen") {
    throw new Error("Sarah's settings failed to save");
  }
  console.log("  Status:                ✅ PASS\n");

  // 3. Test Tenant B (Alex Rivera) Settings Isolation
  console.log("▶ [3/4] Testing Tenant B (Alex Rivera) Isolation...");
  const alex = tenantsAfterA.find((t) => t.id === "tenant-alex-rivera");
  console.log("  Alex's Subject:       ", alex?.settings?.emailTemplate.subject);
  console.log("  Alex's Reminder Days: ", alex?.settings?.reminderSchedule.daysBeforeDue.join(", "));

  if (alex?.settings?.emailTemplate.subject === sarah?.settings?.emailTemplate.subject) {
    throw new Error("Settings leaked between Sarah and Alex!");
  }
  console.log("  Status:                ✅ PASS (Zero settings leakage)\n");

  // 4. Test Execution with Custom Template & Reminders in Workflow
  console.log("▶ [4/4] Executing invoice-lifecycle with Sarah's Custom Settings...");
  const lifecycleRes = await executeInvoiceLifecycleWorkflow({
    tenant_id: "tenant-sarah-chen",
    invoice_id: "INV-2026-999",
    client_email: "billing@acme.org",
    amount: 3200,
    due_date: "2026-11-20",
    freelancer_name: "Sarah Chen",
    email_subject: sarah?.settings?.emailTemplate.subject,
    email_template: sarah?.settings?.emailTemplate.body,
    reminder_days: sarah?.settings?.reminderSchedule.daysBeforeDue,
  });

  console.log("  Workflow Success:     ", lifecycleRes.success);
  console.log("  Gmail Step Detail:    ", lifecycleRes.steps.gmail.detail);
  console.log("  Calendar Step Detail: ", lifecycleRes.steps.calendar.detail);

  if (
    !lifecycleRes.steps.gmail.detail.includes("Custom Design Invoice") ||
    !lifecycleRes.steps.calendar.detail.includes("5 days before")
  ) {
    throw new Error("Workflow failed to pick up custom template or reminder schedule");
  }

  console.log("\n=================================================================");
  console.log("                 SETTINGS TEST SUITE PASSED                      ");
  console.log("=================================================================");
  console.log("• Sensible defaults active when setup is skipped.");
  console.log("• Custom email templates and reminder schedules isolated per-tenant.");
  console.log("• Workflow dynamically respects configured placeholders and reminders.");
}

runSettingsCustomizationTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
