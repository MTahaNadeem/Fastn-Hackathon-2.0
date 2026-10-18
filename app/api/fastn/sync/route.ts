import { NextRequest, NextResponse } from "next/server";
import { syncInvoiceViaFastn, FastnSyncPayload } from "@/lib/fastn";

export async function POST(request: NextRequest) {
  try {
    const body: FastnSyncPayload = await request.json();

    if (!body.tenantNamespace || !body.invoice || !body.connectors) {
      return NextResponse.json(
        { success: false, error: "Missing required sync payload parameters" },
        { status: 400 }
      );
    }

    const result = await syncInvoiceViaFastn(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Fastn sync error" },
      { status: 500 }
    );
  }
}
