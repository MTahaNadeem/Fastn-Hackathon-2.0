import { NextRequest, NextResponse } from "next/server";
import { executePaymentCheckWorkflow, PaymentCheckPayload } from "@/lib/fastn";

/**
 * Webhook Endpoint: payment.webhook
 * 
 * Fired when JazzCash dispatches an IPN/payment webhook event.
 * Reconciles the invoice under the tenant's isolated namespace,
 * updates Google Sheet status to "paid", sends Gmail receipt, and notifies Slack.
 */
export async function POST(request: NextRequest) {
  try {
    const payload: PaymentCheckPayload = await request.json();

    if (!payload.tenant_id) {
      return NextResponse.json(
        { success: false, error: "Missing required tenant_id for tenant credential isolation." },
        { status: 400 }
      );
    }

    const result = await executePaymentCheckWorkflow({
      ...payload,
      trigger_type: "webhook",
    });

    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process payment.webhook" },
      { status: 500 }
    );
  }
}
