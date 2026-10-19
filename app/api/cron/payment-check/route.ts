import { NextRequest, NextResponse } from "next/server";
import { executePaymentCheckWorkflow } from "@/lib/fastn";

/**
 * Scheduled Cron Endpoint: payment-check
 * 
 * Triggers every 1 hour (cron: "0 * * * *")
 * Reads pending invoices from the tenant's Google Sheet,
 * verifies payment status with JazzCash,
 * updates the row to status="paid", sends a receipt via Gmail, and notifies Slack.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenant_id = searchParams.get("tenant_id") || "tenant-sarah-chen";

  try {
    const result = await executePaymentCheckWorkflow({
      tenant_id,
      trigger_type: "schedule",
      payment_source: (searchParams.get("source") as any) || "jazzcash",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute payment-check schedule" },
      { status: 500 }
    );
  }
}
