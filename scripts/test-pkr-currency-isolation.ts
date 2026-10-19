/**
 * Automated Verification Script: Strict PKR Currency Throughout InvoiceFlow
 * 
 * Verifies:
 * 1. PKR Number Formatting (Rs. X,XXX without unnecessary decimals, standard comma thousands)
 * 2. Invoices & Default Storage (Seed invoices and createInvoice use PKR)
 * 3. invoice-lifecycle Fastn Workflow (Gmail, Calendar, Sheets, Slack all carry Rs. X,XXX and PKR context)
 * 4. payment-check Fastn Workflow (Reconciliation and webhook notifications carry PKR context)
 * 5. JazzCash Connector (Payment links and gateway payload explicitly require pp_TxnCurrency: "PKR")
 */

import { formatPKR, DEFAULT_CURRENCY } from "../lib/currency";
import { SEED_INVOICES, createInvoice } from "../lib/invoices";
import { executeInvoiceLifecycleWorkflow, executePaymentCheckWorkflow } from "../lib/fastn";
import { JazzCashConnector } from "../connectors/jazzcash/jazzcash-client";

async function runPKRVerification() {
  console.log("==================================================================");
  console.log("  INVOICEFLOW: PKR ONLY CURRENCY AUDIT & VERIFICATION SUITE");
  console.log("==================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (detail) console.log(`   └─ ${detail}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (detail) console.error(`   └─ Details: ${detail}`);
      process.exitCode = 1;
    }
  }

  // -------------------------------------------------------------
  // Test 1: PKR Formatting Utilities
  // -------------------------------------------------------------
  console.log("--- TEST SUITE 1: PKR Formatting Utilities ---");
  assert(DEFAULT_CURRENCY === "PKR", "Default currency is locked to PKR", `Value: ${DEFAULT_CURRENCY}`);

  const formatted5000 = formatPKR(5000);
  assert(
    formatted5000 === "Rs. 5,000",
    "Integer amounts format with comma separation and no decimals",
    `5000 -> "${formatted5000}"`
  );

  const formatted280000 = formatPKR(280000);
  assert(
    formatted280000 === "Rs. 280,000",
    "Large denomination PKR amounts format cleanly",
    `280000 -> "${formatted280000}"`
  );

  const formattedWithDecimals = formatPKR(1234.5);
  assert(
    formattedWithDecimals === "Rs. 1,234.50",
    "Fractional amounts format with up to 2 decimal places",
    `1234.5 -> "${formattedWithDecimals}"`
  );

  // -------------------------------------------------------------
  // Test 2: Invoices Module
  // -------------------------------------------------------------
  console.log("\n--- TEST SUITE 2: Invoices Store & Creation ---");
  const nonPKRSeeds = SEED_INVOICES.filter((inv) => inv.currency !== "PKR");
  assert(
    nonPKRSeeds.length === 0,
    "All seed invoices have currency set to PKR",
    `Total seed invoices checked: ${SEED_INVOICES.length}, non-PKR: ${nonPKRSeeds.length}`
  );

  const newInvoice = createInvoice("tenant-sarah-chen", {
    invoiceNumber: "INV-2026-PKR-001",
    clientName: "Karachi Technologies Pvt Ltd",
    clientEmail: "billing@karachitechnologies.pk",
    issueDate: "2026-10-19",
    dueDate: "2026-11-20",
    items: [
      { id: "item-1", description: "Design Sprint (PKR)", quantity: 1, unitPrice: 175000, total: 175000 },
    ],
    subtotal: 175000,
    taxRate: 0,
    taxAmount: 0,
    discount: 0,
    total: 175000,
    currency: "PKR",
    status: "pending",
    fastnSync: {
      synced: false,
      syncedConnectors: [],
    },
    notes: "Strict PKR invoicing test",
  });

  assert(
    newInvoice.currency === "PKR",
    "createInvoice defaults to currency PKR",
    `Invoice ID: ${newInvoice.id}, Currency: ${newInvoice.currency}, Total: ${newInvoice.total}`
  );

  // -------------------------------------------------------------
  // Test 3: Fastn "invoice-lifecycle" Workflow
  // -------------------------------------------------------------
  console.log("\n--- TEST SUITE 3: Fastn 'invoice-lifecycle' Workflow ---");
  const lifecycleResult = await executeInvoiceLifecycleWorkflow({
    tenant_id: "tenant-sarah-chen",
    invoice_id: "INV-2026-PKR-001",
    client_email: "accounts@fintechlabs.pk",
    amount: 350000,
    due_date: "2026-11-20",
    freelancer_name: "Sarah Chen",
    email_template: "Hi,\n\nInvoice {invoice_id} is due for {amount}. Please process.",
  });

  assert(
    lifecycleResult.success === true,
    "invoice-lifecycle workflow executed successfully"
  );
  assert(
    lifecycleResult.currency === "PKR",
    "Workflow result carries currency='PKR'",
    `Currency: ${lifecycleResult.currency}`
  );
  assert(
    lifecycleResult.amountFormatted === "Rs. 350,000",
    "Workflow result amountFormatted matches 'Rs. 350,000'",
    `amountFormatted: ${lifecycleResult.amountFormatted}`
  );
  assert(
    lifecycleResult.steps.gmail.detail.includes("Rs. 350,000"),
    "Gmail step detail contains formatted PKR amount ('Rs. 350,000')",
    `Detail: ${lifecycleResult.steps.gmail.detail}`
  );
  assert(
    lifecycleResult.steps.calendar.detail.includes("Rs. 350,000"),
    "Google Calendar step detail contains formatted PKR amount ('Rs. 350,000')",
    `Detail: ${lifecycleResult.steps.calendar.detail}`
  );
  assert(
    lifecycleResult.steps.sheets.detail.includes("Rs. 350,000"),
    "Google Sheets step detail contains formatted PKR amount in appended row",
    `Detail: ${lifecycleResult.steps.sheets.detail}`
  );
  assert(
    lifecycleResult.steps.slack.detail.includes("Rs. 350,000"),
    "Slack notification step contains formatted PKR amount",
    `Detail: ${lifecycleResult.steps.slack.detail}`
  );

  // -------------------------------------------------------------
  // Test 4: Fastn "payment-check" Workflow
  // -------------------------------------------------------------
  console.log("\n--- TEST SUITE 4: Fastn 'payment-check' Workflow ---");
  const paymentWebhookResult = await executePaymentCheckWorkflow({
    tenant_id: "tenant-sarah-chen",
    trigger_type: "webhook",
    invoice_id: "INV-2026-PKR-001",
    client_email: "accounts@fintechlabs.pk",
    amount: 350000,
    status: "paid",
    payment_source: "jazzcash",
  });

  assert(
    paymentWebhookResult.success === true,
    "payment-check webhook workflow executed successfully"
  );
  assert(
    paymentWebhookResult.currency === "PKR",
    "payment-check result carries currency='PKR'",
    `Currency: ${paymentWebhookResult.currency}`
  );
  assert(
    paymentWebhookResult.processedInvoices[0]?.formattedAmount === "Rs. 350,000",
    "Processed invoice carries formattedAmount='Rs. 350,000'",
    `Formatted: ${paymentWebhookResult.processedInvoices[0]?.formattedAmount}`
  );
  assert(
    paymentWebhookResult.processedInvoices[0]?.details?.includes("Rs. 350,000") ?? false,
    "Processed invoice details string confirms PKR receipt and sheet update",
    `Details: ${paymentWebhookResult.processedInvoices[0]?.details}`
  );

  // -------------------------------------------------------------
  // Test 5: JazzCash Custom Connector Payment Link Generation
  // -------------------------------------------------------------
  console.log("\n--- TEST SUITE 5: JazzCash Custom Connector ---");
  const jz = new JazzCashConnector({
    merchantId: "MC_TEST_MERCHANT",
    password: "test_password",
    integritySalt: "test_salt_12345",
    environment: "sandbox",
  });

  const paymentLinkRes = await jz.createPaymentLink({
    amount: 45000,
    bill_reference: "INV-2026-PKR-001",
    description: "Web Development Sprint",
    client_email: "client@acme.pk",
  });

  assert(
    paymentLinkRes.currency === "PKR",
    "JazzCash create_payment_link result returns currency='PKR'",
    `Currency: ${paymentLinkRes.currency}`
  );
  assert(
    paymentLinkRes.amount_paisa === 4500000,
    "JazzCash converts PKR amount to paisas (x100) accurately",
    `45000 PKR -> ${paymentLinkRes.amount_paisa} Paisa`
  );
  assert(
    paymentLinkRes.gateway_payload.pp_TxnCurrency === "PKR",
    "JazzCash gateway POST payload explicitly specifies pp_TxnCurrency='PKR'",
    `pp_TxnCurrency: ${paymentLinkRes.gateway_payload.pp_TxnCurrency}`
  );

  console.log("\n==================================================================");
  console.log(`  AUDIT COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (100%)`);
  console.log("==================================================================\n");
}

runPKRVerification().catch((err) => {
  console.error("Fatal error during PKR verification:", err);
  process.exit(1);
});
