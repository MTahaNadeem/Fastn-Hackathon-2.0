export interface FastnLiveConnectionResult {
  connectorId: string;
  slug: string;
  name: string;
  connected: boolean;
  status: "connected" | "not_connected" | "expired" | "needs_reauth";
  connectionId?: string;
  lastSyncedAt?: string;
  authType?: string;
  connectUrl?: string;
}

export const CONNECTOR_MAP: Record<string, { id: string; slug: string; name: string }> = {
  gmail: {
    id: "ec3c1b4a-e281-4c5e-9a6b-90eb4a59882f",
    slug: "googleGmail",
    name: "Gmail",
  },
  google_calendar: {
    id: "867f1fd1-deaa-43e3-aa9f-37780f257017",
    slug: "googleCalendar",
    name: "Google Calendar",
  },
  google_sheets: {
    id: "38d254e2-b92e-44f4-81cd-8251fd9373d9",
    slug: "googleSheets",
    name: "Google Sheets",
  },
  slack: {
    id: "8de5d696-5289-4c9c-ade4-de918d019d06",
    slug: "slack",
    name: "Slack",
  },
  jazzcash: {
    id: "7d9b8df5-cfac-4679-ba7c-5a4c78c2051a",
    slug: "jazzcash",
    name: "JazzCash Sandbox",
  },
};

export const WIDGET_ID = "wgt_191b54f9ba36";

async function getMcpToken(): Promise<string | null> {
  if (process.env.FASTN_MCP_TOKEN) {
    return process.env.FASTN_MCP_TOKEN;
  }
  if (typeof window === "undefined") {
    try {
      const fs = await import("fs");
      const tokenPath = "C:\\Users\\tahap\\.gemini\\antigravity\\mcp_oauth_tokens.json";
      if (fs.existsSync(tokenPath)) {
        const raw = fs.readFileSync(tokenPath, "utf8");
        const data = JSON.parse(raw);
        return data["https://mcp.fastn.dev"]?.token?.access_token || null;
      }
    } catch (err) {
      console.warn("Could not read MCP tokens file:", err);
    }
  }
  return null;
}

async function callMcpTool(toolName: string, args: Record<string, any>): Promise<any> {
  const token = await getMcpToken();
  if (!token) {
    throw new Error("Fastn MCP access token not found");
  }

  const res = await fetch("https://mcp.fastn.dev", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "InvoiceFlow/1.0",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Fastn MCP responded with status ${res.status}`);
  }

  const json = await res.json();
  if (json.error) {
    throw new Error(`Fastn MCP error: ${json.error.message || JSON.stringify(json.error)}`);
  }

  const content = json.result?.content?.[0]?.text;
  if (!content) return null;

  try {
    return JSON.parse(content);
  } catch {
    return content;
  }
}

/**
 * Checks the live connection status of a connector in Fastn's workspace
 */
export async function getLiveConnectorStatus(slugOrId: string): Promise<{
  connected: boolean;
  connectionId?: string;
  status: string;
}> {
  const meta =
    CONNECTOR_MAP[slugOrId] ||
    Object.values(CONNECTOR_MAP).find((c) => c.slug === slugOrId || c.id === slugOrId);

  const slug = meta?.slug || slugOrId;

  try {
    const res = await callMcpTool("fastnPlatform__getConnectorConnectionStatus", {
      connector: slug,
    });
    const data = res?.data || {};
    const connected = Boolean(data.connected);
    const conn = data.connection || {};
    return {
      connected,
      connectionId: conn.id,
      status: conn.status ? conn.status.toLowerCase() : connected ? "connected" : "not_connected",
    };
  } catch (err) {
    console.warn(`Could not check live status for ${slug}:`, err);
    return { connected: false, status: "not_connected" };
  }
}

/**
 * Generates an official Fastn Connect link for an individual connector
 */
export async function createLiveConnectLink(connectorKey: string): Promise<{
  connectUrl: string;
  expiresAt: string;
}> {
  const meta =
    CONNECTOR_MAP[connectorKey] ||
    Object.values(CONNECTOR_MAP).find((c) => c.slug === connectorKey || c.id === connectorKey);

  if (!meta) {
    throw new Error(`Unknown connector ${connectorKey}`);
  }

  const res = await callMcpTool("fastnPlatform__createConnectLink", {
    connectorId: meta.id,
    expiresInMinutes: 60,
  });

  const data = res?.data || {};
  return {
    connectUrl: data.connectUrl,
    expiresAt: data.expiresAt,
  };
}

/**
 * Generates an official Fastn Setup link for a tenant using the InvoiceFlow widget
 */
export async function createLiveSetupLink(
  tenantId: string,
  tenantLabel?: string
): Promise<{
  setupUrl: string;
  setupId: string;
  endOrgId: string;
  expiresAt: string;
}> {
  const res = await callMcpTool("fastnPlatform__createSetupLink", {
    widgetId: WIDGET_ID,
    externalRef: tenantId,
    createIfMissing: true,
    label: tenantLabel || `Tenant ${tenantId}`,
    expiresInMinutes: 1440,
  });

  const data = res?.data || {};
  return {
    setupUrl: data.setupUrl,
    setupId: data.setupId,
    endOrgId: data.endOrgId,
    expiresAt: data.expiresAt,
  };
}

/**
 * Retrieves all 5 connector live statuses from Fastn's workspace
 */
export async function getAllLiveConnections(): Promise<FastnLiveConnectionResult[]> {
  const results: FastnLiveConnectionResult[] = [];

  for (const [key, meta] of Object.entries(CONNECTOR_MAP)) {
    const live = await getLiveConnectorStatus(meta.slug);
    results.push({
      connectorId: key,
      slug: meta.slug,
      name: meta.name,
      connected: live.connected,
      status: (live.status as any) || (live.connected ? "connected" : "not_connected"),
      connectionId: live.connectionId,
      lastSyncedAt: new Date().toISOString(),
    });
  }

  return results;
}
