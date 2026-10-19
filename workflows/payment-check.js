/**
 * Fastn Workflow: payment-check
 * 
 * Triggers:
 * 1. Schedule: Every 1 hour (cron: "0 * * * *")
 * 2. Webhook: "payment.webhook" from JazzCash
 * 
 * Flow:
 * 1. Resolves tenant_id from webhook payload or schedule context.
 * 2. Connects to tenant-isolated Google Sheet to fetch rows with status="pending".
 * 3. Inquires payment status via custom JazzCash connector.
 * 4. If paid:
 *    - Updates Google Sheet row to status="paid"
 *    - Sends "Invoice Paid" confirmation email to client via Gmail
 *    - Dispatches celebration/notification alert to tenant's Slack channel
 * 5. Strict Tenant Isolation:
 *    - Every connector call is pinned to `endOrgId: tenant_id` / `tenantId: tenant_id`.
 *    - Ensures zero cross-tenant reads or cross-tenant token contamination.
 */

export default async function (ctx) {
  const { input = {}, headers = {} } = ctx;

  const triggerType = input.trigger_type || (input.invoice_id ? "webhook" : "schedule");
  const tenant_id = input.tenant_id || headers["x-end-org-id"] || headers["x-fastn-space-tenantid"];

  if (!tenant_id) {
    throw new Error("Missing required tenant_id. Tenant scoping is strictly required for isolation.");
  }

  // Initialize multi-tenant Fastn client strictly scoped to this tenant_id
  const tenantScopedFastn = new Fastn({
    connectors: {
      googleSheets: { orgId: "managed" },
      jazzcash: { orgId: "custom" },
      gmail: { orgId: "managed" },
      slack: { orgId: "managed" },
    },
    endOrgId: tenant_id,
    tenantId: tenant_id,
  });

  // Exponential backoff helper
  async function withRetry(operationName, fn, maxAttempts = 3, baseDelayMs = 1000) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (attempt < maxAttempts) {
          const delay = baseDelayMs * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    throw new Error(`${operationName} failed after ${maxAttempts} attempts: ${lastError?.message || lastError}`);
  }

  const processedInvoices = [];

  // Helper to check payment status via custom JazzCash connector
  async function checkPaymentStatus(invoiceId, paymentSource = "jazzcash", externalRef) {
    // Inquire transaction status via custom JazzCash connector
    const jazzRes = await withRetry(`JazzCash Inquire [${invoiceId}]`, async () => {
      const res = await tenantScopedFastn.connector.jazzcash.inquireTransaction({
        pp_TxnRefNo: externalRef || invoiceId,
        pp_MerchantID: input.jazzcash_merchant_id || "default_merchant",
      });
      return res.output || res;
    });
    const isPaid = jazzRes.pp_ResponseCode === "000" || jazzRes.status === "paid" || jazzRes.paid === true;
    return { isPaid, source: "jazzcash", details: jazzRes };
  }

  // Helper to perform paid actions: Sheet update, Gmail confirmation, Slack alert
  async function handlePaidInvoice(invoice) {
    const { invoice_id, client_email, amount, due_date, rowIndex } = invoice;

    const formattedAmount = typeof amount === "number"
      ? "Rs. " + amount.toLocaleString("en-PK")
      : "Rs. " + (amount || "0");

    // 1. Update Google Sheet row status to "paid"
    await withRetry(`Google Sheets Update [${invoice_id}]`, async () => {
      const res = await tenantScopedFastn.connector.googleSheets.updateRow({
        spreadsheetId: input.spreadsheet_id || "default",
        sheetName: "Invoices",
        rowNumber: rowIndex || 2,
        values: [invoice_id, client_email, formattedAmount, due_date, "paid"],
      });
      return res.output || res;
    });

    // 2. Send "Paid" confirmation email via tenant's Gmail
    await withRetry(`Gmail Payment Receipt [${invoice_id}]`, async () => {
      const subject = `Payment Confirmed: Invoice ${invoice_id}`;
      const body =
        `Dear Customer,\n\n` +
        `We have received your payment of ${formattedAmount} for invoice ${invoice_id}.\n` +
        `Status: PAID\n\n` +
        `Thank you for your prompt payment!`;

      const res = await tenantScopedFastn.connector.gmail.sendEmail({
        to: client_email,
        subject,
        body,
      });
      return res.output || res;
    });

    // 3. Notify tenant's Slack channel
    const slackMessage = `🎉 *Payment Confirmed!* Invoice \`${invoice_id}\` for *${formattedAmount}* paid by \`${client_email}\`.`;
    await withRetry(`Slack Alert [${invoice_id}]`, async () => {
      const res = await tenantScopedFastn.connector.slack.sendMessage({
        channel: input.slack_channel || "#invoices",
        text: slackMessage,
      });
      return res.output || res;
    });

    return {
      invoice_id,
      client_email,
      amount,
      status: "paid",
      sheetUpdated: true,
      emailSent: true,
      slackNotified: true,
    };
  }

  try {
    if (triggerType === "webhook") {
      // -----------------------------------------------------------------------
      // MODE A: Webhook "payment.webhook" triggered for a specific invoice
      // -----------------------------------------------------------------------
      const { invoice_id, client_email, amount, due_date, payment_source, external_reference, status } = input;

      if (!invoice_id) {
        throw new Error("Webhook trigger requires invoice_id in payload");
      }

      // If webhook already carries verified "paid" status or we verify with connector
      let isVerifiedPaid = status === "paid";
      if (!isVerifiedPaid) {
        const check = await checkPaymentStatus(invoice_id, payment_source, external_reference);
        isVerifiedPaid = check.isPaid;
      }

      if (isVerifiedPaid) {
        const outcome = await handlePaidInvoice({
          invoice_id,
          client_email: client_email || "client@example.com",
          amount: amount || 0,
          due_date: due_date || new Date().toISOString().split("T")[0],
          rowIndex: input.row_index || 2,
        });
        processedInvoices.push(outcome);
      } else {
        processedInvoices.push({
          invoice_id,
          status: "pending_unpaid",
          checkedVia: payment_source || "jazzcash",
        });
      }

    } else {
      // -----------------------------------------------------------------------
      // MODE B: Scheduled Trigger (every 1 hour) - Batch checks pending rows
      // -----------------------------------------------------------------------
      // Read rows from tenant's Google Sheet
      const sheetData = await withRetry("Google Sheets Read Invoices", async () => {
        const res = await tenantScopedFastn.connector.googleSheets.readRows({
          spreadsheetId: input.spreadsheet_id || "default",
          sheetName: "Invoices",
        });
        return res.output || res;
      });

      const rows = sheetData.rows || [];
      // Expected columns: [invoice_id, client_email, amount, due_date, status]
      for (let idx = 0; idx < rows.length; idx++) {
        const row = rows[idx];
        const [invId, email, amt, dueDate, currentStatus] = Array.isArray(row)
          ? row
          : [row.invoice_id, row.client_email, row.amount, row.due_date, row.status];

        if (currentStatus === "pending") {
          const check = await checkPaymentStatus(invId, input.payment_source || "jazzcash");
          if (check.isPaid) {
            const outcome = await handlePaidInvoice({
              invoice_id: invId,
              client_email: email,
              amount: amt,
              due_date: dueDate,
              rowIndex: idx + 2, // 1-indexed header offset
            });
            processedInvoices.push(outcome);
          } else {
            processedInvoices.push({
              invoice_id: invId,
              status: "still_pending",
              checkedVia: check.source,
            });
          }
        }
      }
    }

    return {
      success: true,
      workflow: "payment-check",
      triggerType,
      tenant_id,
      currency: "PKR",
      invoicesChecked: processedInvoices.length,
      processedInvoices,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    // Log failure and notify Slack
    const errorAlertText =
      `🚨 *Workflow Failure: payment-check*\n` +
      `• *Tenant ID:* \`${tenant_id}\`\n` +
      `• *Trigger:* \`${triggerType}\`\n` +
      `• *Error:* ${error.message || error}\n` +
      `• *Timestamp:* ${new Date().toISOString()}`;

    try {
      await tenantScopedFastn.connector.slack.sendMessage({
        channel: input.slack_channel || "#invoices-alerts",
        text: errorAlertText,
      });
    } catch {
      // Do not mask original error
    }

    return {
      success: false,
      workflow: "payment-check",
      triggerType,
      tenant_id,
      error: error.message || String(error),
      timestamp: new Date().toISOString(),
    };
  }
}
