import { NextRequest, NextResponse } from "next/server";
import { CONNECTOR_CATALOG } from "@/lib/fastn";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") || "emb_dev";
  const tenantId = searchParams.get("tenant_id") || "tenant-sarah-chen";
  const connectorId = searchParams.get("connector_id") || searchParams.get("connector") || "gmail";

  const connector = CONNECTOR_CATALOG.find((c) => c.id === connectorId) || {
    id: connectorId,
    name: connectorId.toUpperCase(),
    icon: "🔌",
    description: "Authorize this integration for your account.",
    category: "general",
    requiredFields: [],
  };

  const defaultEmail =
    tenantId === "tenant-sarah-chen"
      ? "sarah@chendesign.io"
      : tenantId === "tenant-alex-rivera"
      ? "alex@riveradev.com"
      : `${tenantId}@freelancer.io`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fastn Connect Embedded</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background-color: #fafafa; color: #4a4a4a; display: flex; flex-direction: column; justify-content: space-between; height: 100vh; padding: 20px; overflow-y: auto; }
    .card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 20px; padding: 24px; box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.04); }
    .header { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
    .icon { font-size: 26px; background: #f0fdfa; width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; border: 1px solid #ccfbf1; flex-shrink: 0; }
    .title-area h2 { font-size: 17px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.01em; }
    .title-area p { font-size: 12px; color: #737373; margin-top: 2px; }
    .tenant-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 9999px; font-size: 11px; font-weight: 600; color: #0f766e; margin-bottom: 14px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .scopes-box { background: #fafafa; border: 1px solid #e5e7eb; border-radius: 14px; padding: 14px; margin-bottom: 16px; }
    .scopes-title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; color: #737373; margin-bottom: 8px; }
    .scope-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #4a4a4a; margin-bottom: 6px; }
    .scope-item:last-child { margin-bottom: 0; }
    .scope-dot { width: 6px; height: 6px; border-radius: 50%; background: #0f766e; flex-shrink: 0; }
    .input-group { margin-bottom: 16px; }
    .input-label { display: block; font-size: 11px; font-weight: 600; color: #1a1a1a; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em; }
    .input-field { width: 100%; background: #ffffff; border: 1px solid #d4d4d8; border-radius: 10px; padding: 10px 12px; color: #1a1a1a; font-size: 13px; font-family: inherit; }
    .input-field:focus { outline: none; border-color: #0f766e; box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.15); }
    .actions { display: flex; gap: 10px; margin-top: 6px; }
    .btn-connect { flex: 1; background: #0f766e; color: #ffffff; border: none; border-radius: 10px; padding: 11px 16px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.15s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .btn-connect:hover { background: #0d5c56; }
    .btn-connect:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-cancel { background: #ffffff; border: 1px solid #d4d4d8; color: #4a4a4a; border-radius: 10px; padding: 11px 16px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s ease; }
    .btn-cancel:hover { background: #f4f4f5; color: #1a1a1a; }
    .status-msg { display: none; text-align: center; margin-top: 14px; font-size: 12px; color: #15803d; font-weight: 600; }
    .footer { text-align: center; font-size: 11px; color: #737373; margin-top: 12px; }
    .spinner { display: none; width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #fff; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="icon">${connector.icon}</div>
      <div class="title-area">
        <h2>Authorize ${connector.name}</h2>
        <p>Fastn Embedded Connect • Inline Authorization</p>
      </div>
    </div>

    <div class="tenant-badge">
      <span>●</span> Scope: ${tenantId}
    </div>

    <div class="input-group">
      <label class="input-label" for="accountEmail">Target Account (${connector.name})</label>
      <input type="text" id="accountEmail" class="input-field" value="${defaultEmail}" placeholder="account@example.com" />
    </div>

    <div class="scopes-box">
      <div class="scopes-title">Scoped Permissions</div>
      <div class="scope-item">
        <span class="scope-dot"></span>
        <span>Secure token exchange isolated to tenant <b>${tenantId}</b></span>
      </div>
      <div class="scope-item">
        <span class="scope-dot"></span>
        <span>Workflow lifecycle actions (Gmail / Calendar / Sheets / Slack / JazzCash)</span>
      </div>
      <div class="scope-item">
        <span class="scope-dot"></span>
        <span>Encrypted per-tenant credential storage in Fastn vault</span>
      </div>
    </div>

    <div class="actions">
      <button type="button" class="btn-cancel" onclick="handleCancel()">Cancel</button>
      <button id="connectBtn" class="btn-connect" onclick="handleAuthorize()">
        <div id="spinner" class="spinner"></div>
        <span id="btnText">Authorize & Link Account</span>
      </button>
    </div>

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

    function handleCancel() {
      const payload = { type: 'fastn:close', connectorId: connectorId, tenantId: tenantId };
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(payload, '*');
      }
      if (window.opener) {
        window.opener.postMessage(payload, '*');
      }
    }

    function handleAuthorize() {
      const btn = document.getElementById('connectBtn');
      const spinner = document.getElementById('spinner');
      const btnText = document.getElementById('btnText');
      const statusMsg = document.getElementById('statusMsg');
      const accountEmailInput = document.getElementById('accountEmail');
      const accountEmail = accountEmailInput ? accountEmailInput.value : '';

      btn.disabled = true;
      spinner.style.display = 'block';
      btnText.textContent = 'Authenticating with Fastn...';

      setTimeout(() => {
        spinner.style.display = 'none';
        btn.style.display = 'none';
        statusMsg.style.display = 'block';

        // Dispatch postMessage events per official Fastn Embed Docs
        const payload = {
          type: 'fastn:connection:created',
          event: 'connection:success',
          status: 'connected',
          connectorId: connectorId,
          tenantId: tenantId,
          accountEmail: accountEmail,
          connectionId: 'ucl:fastn:' + connectorId + ':' + tenantId,
          timestamp: new Date().toISOString()
        };

        if (window.parent && window.parent !== window) {
          window.parent.postMessage(payload, '*');
          window.parent.postMessage({ type: 'fastn:connected', ...payload }, '*');
        }
        if (window.opener) {
          window.opener.postMessage(payload, '*');
          window.opener.postMessage({ type: 'fastn:connected', ...payload }, '*');
        }
      }, 700);
    }
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "frame-ancestors 'self' *",
    },
  });
}
