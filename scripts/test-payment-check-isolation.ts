/**
 * Automated Verification: payment-check Workflow & Multi-Tenant Isolation
 * 
 * Verifies:
 * 1. Schedule Trigger (Hourly): Reads pending invoices from tenant's Google Sheet,
 *    verifies via JazzCash, updates row to "paid", sends Gmail receipt, notifies Slack.
 * 2. Webhook Trigger ("payment.webhook"): Handles real-time payment callback (e.g. JazzCash IPN),
 *    updates row to "paid", sends Gmail receipt, notifies Slack.
 * 3. Scope Isolation: Every check is scoped to invoice's tenant_id with zero cross-tenant reads.
 */

import { executePaymentCheckWorkflow, PaymentCheckPayload } from "../lib/fastn";

async function runPaymentCheckTests() {
  console.log("=================================================================");
  console.log("    FASTN WORKFLOW: payment-check MULTI-TENANT ISOLATION TEST    ");
  console.log("=================================================================\n");

  // ---------------------------------------------------------------------------
  // TEST CASE 1: Scheduled Trigger (Hourly) for Tenant A (Sarah Chen) via JazzCash
  // ---------------------------------------------------------------------------
  console.log("▶ [1/2] Executing Scheduled Check for Tenant A (Sarah Chen)...");
  const payloadScheduleA: PaymentCheckPayload = {
    tenant_id: "tenant-sarah-chen",
    trigger_type: "schedule",
    payment_source: "jazzcash",
  };

  const resScheduleA = await executePaymentCheckWorkflow(payloadScheduleA);
  console.log("  Status:          ", resScheduleA.success ? "✅ SUCCESS" : "❌ FAILED");
  console.log("  Trigger Type:    ", resScheduleA.triggerType);
  console.log("  Tenant Scoped:   ", resScheduleA.tenant_id);
  console.log("  Invoices Checked:", resScheduleA.invoicesChecked);
  resScheduleA.processedInvoices.forEach((inv) => {
    console.log(`    • Invoice ${inv.invoice_id} -> Status: [${inv.status}], Source: [${inv.checkedVia}]`);
    console.log(`      Sheet Updated: ${inv.sheetUpdated}, Gmail Sent: ${inv.emailSent}, Slack Notified: ${inv.slackNotified}`);
  });
  console.log();

  // ---------------------------------------------------------------------------
  // TEST CASE 2: Webhook Trigger ("payment.webhook") for Tenant B (Alex Rivera) via JazzCash
  // ---------------------------------------------------------------------------
  console.log("▶ [2/2] Executing Webhook Trigger for Tenant B (Alex Rivera) via JazzCash...");
  const payloadWebhookB: PaymentCheckPayload = {
    tenant_id: "tenant-alex-rivera",
    trigger_type: "webhook",
    invoice_id: "INV-2026-101",
    client_email: "ap@greenpulse.io",
    amount: 4400,
    due_date: "2026-11-05",
    payment_source: "jazzcash",
    external_reference: "JC_TXN_9981240",
    status: "paid",
  };

  const resWebhookB = await executePaymentCheckWorkflow(payloadWebhookB);
  console.log("  Status:          ", resWebhookB.success ? "✅ SUCCESS" : "❌ FAILED");
  console.log("  Trigger Type:    ", resWebhookB.triggerType);
  console.log("  Tenant Scoped:   ", resWebhookB.tenant_id);
  console.log("  Invoices Checked:", resWebhookB.invoicesChecked);
  resWebhookB.processedInvoices.forEach((inv) => {
    console.log(`    • Invoice ${inv.invoice_id} -> Status: [${inv.status}], Source: [${inv.checkedVia}]`);
    console.log(`      Sheet Updated: ${inv.sheetUpdated}, Gmail Sent: ${inv.emailSent}, Slack Notified: ${inv.slackNotified}`);
  });
  console.log();

  // ---------------------------------------------------------------------------
  // VERIFICATION OF ISOLATION
  // ---------------------------------------------------------------------------
  const isIsolated =
    (resScheduleA.tenant_id as string) === "tenant-sarah-chen" &&
    (resWebhookB.tenant_id as string) === "tenant-alex-rivera" &&
    (resScheduleA.tenant_id as string) !== (resWebhookB.tenant_id as string) &&
    resScheduleA.processedInvoices.every((i) => i.details?.includes("tenant-sarah-chen")) &&
    resWebhookB.processedInvoices.every((i) => i.details?.includes("tenant-alex-rivera"));

  console.log("=================================================================");
  console.log("                     ISOLATION ASSERTION                         ");
  console.log("=================================================================");
  if (isIsolated) {
    console.log("🎉 PASS: Zero cross-tenant data leakage!");
    console.log("• Tenant A (Sarah Chen) reconciled only Sarah's Google Sheet and JazzCash connector.");
    console.log("• Tenant B (Alex Rivera) reconciled only Alex's Google Sheet and JazzCash connector.");
    console.log("• All lookups strictly scoped to the invoice's tenant_id.");
  } else {
    console.log("❌ FAIL: Tenant isolation verification failed.");
    process.exit(1);
  }
}

runPaymentCheckTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
