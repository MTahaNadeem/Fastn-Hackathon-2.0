import { NextRequest, NextResponse } from "next/server";
import { executeInvoiceLifecycleWorkflow, InvoiceLifecyclePayload } from "@/lib/fastn";

/**
 * Webhook Endpoint: invoice.created
 * 
 * Fired when a freelancer creates an invoice in InvoiceFlow.
 * Dispatches the multi-tenant "invoice-lifecycle" workflow across:
 * - Gmail (Tenant-scoped email)
 * - Google Calendar (Tenant-scoped event with 3-day and 0-day reminders)
 * - Google Sheets (Tenant-scoped row append)
 * - Slack (Tenant-scoped channel message)
 * With 3x exponential backoff retries and failure notification to Slack.
 */
export async function POST(request: NextRequest) {
  try {
    const payload: InvoiceLifecyclePayload = await request.json();

    const { tenant_id, invoice_id, client_email, amount, due_date, freelancer_name } = payload;

    if (!tenant_id || !invoice_id || !client_email || amount === undefined || !due_date) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: tenant_id, invoice_id, client_email, amount, due_date",
        },
        { status: 400 }
      );
    }

    // Execute the lifecycle workflow with strict tenant isolation
    const result = await executeInvoiceLifecycleWorkflow(payload);

    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process invoice.created webhook",
      },
      { status: 500 }
    );
  }
}
