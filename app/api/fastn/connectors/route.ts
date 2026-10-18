import { NextRequest, NextResponse } from "next/server";
import { fetchConnectorsForTenant } from "@/lib/fastn";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantNamespace = searchParams.get("namespace") || "default-tenant";

  try {
    const data = await fetchConnectorsForTenant(tenantNamespace);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch connectors" },
      { status: 500 }
    );
  }
}
