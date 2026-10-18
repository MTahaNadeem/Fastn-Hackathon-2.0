import { NextRequest, NextResponse } from "next/server";
import { generateFastnEmbedToken } from "@/lib/fastn";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tenant_id =
      body.tenant_id ||
      body.endOrgId ||
      request.headers.get("x-end-org-id") ||
      request.headers.get("x-fastn-space-tenantid") ||
      "tenant-sarah-chen";
    const connector_id = body.connector_id || body.connector || undefined;

    const result = await generateFastnEmbedToken(tenant_id, connector_id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate embed token" },
      { status: 500 }
    );
  }
}
