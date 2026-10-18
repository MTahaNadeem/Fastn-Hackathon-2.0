/**
 * Fastn Workflow: invoice-lifecycle
 * 
 * Trigger: Webhook "invoice.created"
 * Payload: { tenant_id, invoice_id, client_email, amount, due_date, freelancer_name, email_template?, spreadsheet_id?, slack_channel? }
 * 
 * Connectors (All Multi-Tenant Scoped):
 * 1. Gmail: Sends invoice email to client with configurable template
 * 2. Google Calendar: Creates due date event with 3-day and 0-day reminders
 * 3. Google Sheets: Appends [invoice_id, client_email, amount, due_date, status="pending"]
 * 4. Slack: Notifies tenant channel of new invoice
 * 
 * Error Handling:
 * Retries each connector action up to 3 times with exponential backoff.
 * On failure, logs error and dispatches failure alert to tenant's Slack channel.
 * 
 * Multi-Tenancy:
 * All calls are bound to `endOrgId: tenant_id` / `tenantId: tenant_id` so credentials
 * and tokens are completely isolated per freelancer tenant.
 */

export default async function (ctx) {
  const { input = {}, headers = {} } = ctx;

  const {
    tenant_id,
    invoice_id,
    client_email,
    amount,
    due_date,
    freelancer_name,
    email_template,
    spreadsheet_id,
    slack_channel,
  } = input;

  if (!tenant_id || !invoice_id || !client_email) {
    throw new Error(
      "Missing required input fields: tenant_id, invoice_id, and client_email are mandatory."
    );
  }

  // Multi-tenant Fastn client initialization scoped strictly to tenant_id
  const tenantScopedFastn = new Fastn({
    connectors: {
      gmail: { orgId: "managed" },
      googleCalendar: { orgId: "managed" },
      googleSheets: { orgId: "managed" },
      slack: { orgId: "managed" },
    },
    endOrgId: tenant_id,
    tenantId: tenant_id,
  });

  // Exponential backoff retry utility
  async function retryWithBackoff(operationName, fn, maxAttempts = 3, baseDelayMs = 1000) {
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

  const stepResults = {
    gmail: null,
    calendar: null,
    sheets: null,
    slack: null,
  };

  try {
    // -------------------------------------------------------------------------
    // Step 2: Send Email via Gmail Connector (using tenant's connected Gmail)
    // -------------------------------------------------------------------------
    const defaultBody =
      `Hi,\n\nPlease find attached your invoice ${invoice_id} from ${freelancer_name || "Freelancer"}.\n\n` +
      `Amount Due: $${amount}\n` +
      `Due Date: ${due_date}\n\n` +
      `Thank you for your business!`;

    const emailBody = email_template
      ? email_template
          .replace(/{freelancer_name}/g, freelancer_name || "Freelancer")
          .replace(/{invoice_id}/g, invoice_id)
          .replace(/{amount}/g, String(amount))
          .replace(/{due_date}/g, due_date)
      : defaultBody;

    stepResults.gmail = await retryWithBackoff("Gmail Send Email", async () => {
      const res = await tenantScopedFastn.connector.gmail.sendEmail({
        to: client_email,
        subject: `Invoice from ${freelancer_name || "Freelancer"}`,
        body: emailBody,
      });
      return res.output || res;
    });

    // -------------------------------------------------------------------------
    // Step 3: Create Google Calendar Event (using tenant's connected Calendar)
    // -------------------------------------------------------------------------
    stepResults.calendar = await retryWithBackoff("Google Calendar Event Creation", async () => {
      const res = await tenantScopedFastn.connector.googleCalendar.createEvent({
        summary: `Invoice due: ${client_email}`,
        description: `Invoice ${invoice_id} for $${amount} is due today from ${client_email}. Freelancer: ${freelancer_name || "N/A"}. (Tenant: ${tenant_id})`,
        startDate: `${due_date}T09:00:00Z`,
        endDate: `${due_date}T10:00:00Z`,
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 4320 }, // 3 days before
            { method: "popup", minutes: 0 },    // on due date
          ],
        },
      });
      return res.output || res;
    });

    // -------------------------------------------------------------------------
    // Step 4: Append Row to Google Sheet (using tenant's connected Google Sheet)
    // -------------------------------------------------------------------------
    stepResults.sheets = await retryWithBackoff("Google Sheets Append Row", async () => {
      const res = await tenantScopedFastn.connector.googleSheets.appendRow({
        spreadsheetId: spreadsheet_id || "default",
        sheetName: "Invoices",
        values: [
          invoice_id,
          client_email,
          amount,
          due_date,
          "pending",
        ],
      });
      return res.output || res;
    });

    // -------------------------------------------------------------------------
    // Step 5: Send Slack Notification (using tenant's connected Slack)
    // -------------------------------------------------------------------------
    stepResults.slack = await retryWithBackoff("Slack Message Notification", async () => {
      const res = await tenantScopedFastn.connector.slack.sendMessage({
        channel: slack_channel || "#invoices",
        text: `Invoice ${invoice_id} sent to ${client_email} for ${amount}, due ${due_date}`,
      });
      return res.output || res;
    });

    return {
      success: true,
      workflow: "invoice-lifecycle",
      tenant_id,
      invoice_id,
      stepResults,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    // -------------------------------------------------------------------------
    // Step 6: Log Failure & Dispatch Error Alert to Slack
    // -------------------------------------------------------------------------
    const failureMessage =
      `🚨 *Workflow Failure: invoice-lifecycle*\n` +
      `• *Tenant ID:* \`${tenant_id}\`\n` +
      `• *Invoice ID:* \`${invoice_id}\`\n` +
      `• *Client:* \`${client_email}\`\n` +
      `• *Error Details:* ${error.message || error}\n` +
      `• *Timestamp:* ${new Date().toISOString()}`;

    try {
      await tenantScopedFastn.connector.slack.sendMessage({
        channel: slack_channel || "#invoices-alerts",
        text: failureMessage,
      });
    } catch (slackAlertError) {
      // Do not obscure the primary error if alert delivery also encounters an issue
    }

    return {
      success: false,
      workflow: "invoice-lifecycle",
      tenant_id,
      invoice_id,
      error: error.message || String(error),
      stepResults,
      timestamp: new Date().toISOString(),
    };
  }
}
