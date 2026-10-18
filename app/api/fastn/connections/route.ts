import { NextRequest, NextResponse } from "next/server";
import { getTenantConnections, setTenantConnectionStatus } from "@/lib/fastn";

/**
 * GET /api/fastn/connections?tenant_id=<id>
 * Fetches the scoped connection status for a specific freelancer tenant.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenant_id =
    searchParams.get("tenant_id") ||
    searchParams.get("endOrgId") ||
    request.headers.get("x-end-org-id") ||
    request.headers.get("x-fastn-space-tenantid") ||
    "tenant-sarah-chen";

  try {
    const connections = getTenantConnections(tenant_id);
    return NextResponse.json({
      success: true,
      tenant_id,
      connections,
      totalConnected: connections.filter((c) => c.connected).length,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve connections" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/fastn/connections
 * Updates connection status (connect / disconnect) scoped to tenant.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenant_id, connector_id, action = "connect", accountEmail } = body;

    if (!tenant_id || !connector_id) {
      return NextResponse.json(
        { success: false, error: "Missing tenant_id or connector_id" },
        { status: 400 }
      );
    }

    const isConnected = action === "connect";
    const updatedConnections = setTenantConnectionStatus(
      tenant_id,
      connector_id,
      isConnected,
      { accountEmail }
    );

    return NextResponse.json({
      success: true,
      tenant_id,
      connector_id,
      action,
      connections: updatedConnections,
      totalConnected: updatedConnections.filter((c) => c.connected).length,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update connection" },
      { status: 500 }
    );
  }
}
