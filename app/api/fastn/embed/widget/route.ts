import { NextRequest, NextResponse } from "next/server";
import { CONNECTOR_CATALOG } from "@/lib/fastn";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") || "emb_dev";
  const tenantId = searchParams.get("tenant_id") || "tenant-default";
  const connectorId = searchParams.get("connector_id") || "stripe";

  const connector = CONNECTOR_CATALOG.find((c) => c.id === connectorId) || {
    id: connectorId,
    name: connectorId.toUpperCase(),
    icon: "🔌",
    description: "Authorize this integration for your account.",
    category: "general",
    requiredFields: [],
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fastn Connect Widget</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: #09090b; color: #f4f4f5; display: flex; flex-direction: column; height: 100vh; justify-content: space-between; padding: 24px; }
    .card { background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); }
    .header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
    .icon { font-size: 32px; background: #27272a; width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; border: 1px solid #3f3f46; }
    .title-area h2 { font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em; }
    .title-area p { font-size: 12px; color: #a1a1aa; margin-top: 2px; }
    .tenant-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 9999px; font-size: 11px; font-weight: 600; color: #60a5fa; margin-bottom: 16px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .scopes-box { background: #121215; border: 1px solid #27272a; border-radius: 12px; padding: 14px; margin-bottom: 20px; }
    .scopes-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; color: #71717a; margin-bottom: 8px; }
    .scope-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #d4d4d8; margin-bottom: 6px; }
    .scope-item:last-child { margin-bottom: 0; }
    .scope-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; }
    .btn-connect { width: 100%; background: #2563eb; color: #ffffff; border: none; border-radius: 12px; padding: 12px 18px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.15s ease; }
    .btn-connect:hover { background: #1d4ed8; }
    .btn-connect:disabled { opacity: 0.6; cursor: not-allowed; }
    .status-msg { display: none; text-align: center; margin-top: 14px; font-size: 12px; color: #10b981; }
    .footer { text-align: center; font-size: 11px; color: #52525b; margin-top: 16px; }
    .spinner { display: none; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #fff; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="icon">${connector.icon}</div>
      <div class="title-area">
        <h2>Authorize ${connector.name}</h2>
        <p>Embedded Connect Authorization Flow</p>
      </div>
    </div>

    <div class="tenant-badge">
      <span>●</span> Scope: ${tenantId}
    </div>

    <div class="scopes-box">
      <div class="scopes-title">Requested Permissions</div>
      <div class="scope-item">
        <span class="scope-dot"></span>
        <span>Secure token exchange scoped to tenant namespace</span>
      </div>
      <div class="scope-item">
        <span class="scope-dot"></span>
        <span>Workflow automation triggers and actions execution</span>
      </div>
      <div class="scope-item">
        <span class="scope-dot"></span>
        <span>Encrypted key storage in Fastn vault</span>
      </div>
    </div>

    <button id="connectBtn" class="btn-connect" onclick="handleAuthorize()">
      <div id="spinner" class="spinner"></div>
      <span id="btnText">Authorize & Link Account</span>
    </button>

    <div id="statusMsg" class="status-msg">
      ✅ Connected successfully! Syncing with InvoiceFlow...
    </div>
  </div>

  <div class="footer">
    End-to-End Encrypted • Scoped per Freelancer Tenant
  </div>

  <script>
    const tenantId = ${JSON.stringify(tenantId)};
    const connectorId = ${JSON.stringify(connectorId)};

    function handleAuthorize() {
      const btn = document.getElementById('connectBtn');
      const spinner = document.getElementById('spinner');
      const btnText = document.getElementById('btnText');
      const statusMsg = document.getElementById('statusMsg');

      btn.disabled = true;
      spinner.style.display = 'block';
      btnText.textContent = 'Authenticating with Fastn...';

      setTimeout(() => {
        spinner.style.display = 'none';
        btn.style.display = 'none';
        statusMsg.style.display = 'block';

        // Dispatch postMessage events per Fastn Embed Docs
        const payload = {
          type: 'fastn:connection:created',
          event: 'connection:success',
          status: 'connected',
          connectorId: connectorId,
          tenantId: tenantId,
          connectionId: 'ucl:fastn:' + connectorId + ':' + tenantId,
          timestamp: new Date().toISOString()
        };

        if (window.parent) {
          window.parent.postMessage(payload, '*');
          // Also post generic fastn:connected event
          window.parent.postMessage({ type: 'fastn:connected', ...payload }, '*');
        }
      }, 700);
    }
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
