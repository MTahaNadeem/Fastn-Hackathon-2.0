import { NextRequest, NextResponse } from "next/server";
import { getAllLiveConnections, getLiveConnectorStatus } from "@/lib/fastn-live";
import { CONNECTOR_CATALOG, FastnConnectionRecord, getTenantConnections, setTenantConnectionStatus } from "@/lib/fastn";

/**
 * GET /api/fastn/connections?tenant_id=<id>
 * Fetches the scoped connection status for a specific freelancer tenant,
 * validated directly against Fastn's live workspace connection state.
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
    // 1. Fetch live workspace connections from Fastn
    const liveFastnConnections = await getAllLiveConnections();
    
    // 2. Fetch tenant-scoped connections
    const tenantConnections = getTenantConnections(tenant_id);

    // 3. Reconcile with live Fastn state
    const mergedConnections: FastnConnectionRecord[] = tenantConnections.map((tConn) => {
      const live = liveFastnConnections.find((l) => l.connectorId === tConn.id);
      const isLiveConnected = live ? live.connected : false;
      const effectiveConnected = tConn.connected || isLiveConnected;

      return {
        ...tConn,
        connected: effectiveConnected,
        status: effectiveConnected ? "connected" : "not_connected",
        connectionId: live?.connectionId || tConn.connectionId,
        lastSyncedAt: live?.lastSyncedAt || tConn.lastSyncedAt,
      };
    });

    return NextResponse.json({
      success: true,
      tenant_id,
      connections: mergedConnections,
      liveWorkspaceVerified: true,
      totalConnected: mergedConnections.filter((c) => c.connected).length,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching live Fastn connections:", error);
    // Fallback to tenant local store if MCP is temporarily unreachable
    const connections = getTenantConnections(tenant_id);
    return NextResponse.json({
      success: true,
      tenant_id,
      connections,
      liveWorkspaceVerified: false,
      totalConnected: connections.filter((c) => c.connected).length,
      syncedAt: new Date().toISOString(),
    });
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
