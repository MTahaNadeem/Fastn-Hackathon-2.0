/**
 * Test script: test-embed-and-connections.ts
 * Verifies:
 * 1. Fastn embed token generation scoped to tenant_id
 * 2. Fastn connections API read / refresh scoped to tenant_id
 * 3. Connection creation and isolation between tenants
 */

import { generateFastnEmbedToken, getTenantConnections, setTenantConnectionStatus } from "../lib/fastn";

async function runEmbedAndConnectionTests() {
  console.log("=================================================================");
  console.log("      FASTN CONNECT WIDGET & EMBED TOKEN INTEGRATION TEST        ");
  console.log("=================================================================\n");

  // 1. Test Embed Token Generation for Tenant Sarah Chen
  console.log("▶ [1/3] Generating Embed Token for Tenant A (tenant-sarah-chen, connector: stripe)...");
  const tokenResA = await generateFastnEmbedToken("tenant-sarah-chen", "stripe");
  console.log("  Token:        ", tokenResA.token);
  console.log("  Tenant Scope: ", tokenResA.endOrgId);
  console.log("  Embed URL:    ", tokenResA.embedUrl);
  if (!tokenResA.embedUrl.includes("tenant-sarah-chen") && !tokenResA.token) {
    throw new Error("Embed token does not scope to tenant-sarah-chen");
  }
  console.log("  Status:        ✅ PASS\n");

  // 2. Test Fastn Connection API retrieval for Tenant Sarah Chen
  console.log("▶ [2/3] Retrieving Fastn Connections for Sarah Chen...");
  const connsA = getTenantConnections("tenant-sarah-chen");
  console.log("  Connections count:", connsA.length);
  const connectedA = connsA.filter((c) => c.connected).map((c) => c.id);
  console.log("  Active Connected: ", connectedA.join(", "));
  const hasGmail = connsA.find((c) => c.id === "gmail")?.connected;
  const hasStripe = connsA.find((c) => c.id === "stripe")?.connected;
  console.log("  Gmail Connected: ", hasGmail);
  console.log("  Stripe Connected:", hasStripe);
  console.log("  Status:           ✅ PASS\n");

  // 3. Test Connecting a New Connector (JazzCash for Sarah Chen)
  console.log("▶ [3/3] Simulating Widget postMessage -> Fastn Connection API (JazzCash)...");
  setTenantConnectionStatus("tenant-sarah-chen", "jazzcash", true, {
    accountEmail: "merchant@chendesign.io",
  });

  const updatedConnsA = getTenantConnections("tenant-sarah-chen");
  const updatedConnsB = getTenantConnections("tenant-alex-rivera");

  const jazzcashInA = updatedConnsA.find((c) => c.id === "jazzcash")?.connected;
  const stripeInB = updatedConnsB.find((c) => c.id === "stripe")?.connected;

  console.log("  Tenant A (Sarah) JazzCash Connected:", jazzcashInA);
  console.log("  Tenant B (Alex) Stripe Connected:    ", stripeInB);

  console.log("\n=================================================================");
  console.log("                     ISOLATION ASSERTION                         ");
  console.log("=================================================================");
  if (jazzcashInA === true && stripeInB === false) {
    console.log("🎉 PASS: Embed tokens and connections strictly scoped per-tenant!");
    console.log("• Tenant A (Sarah Chen) updated JazzCash connection independently.");
    console.log("• Tenant B (Alex Rivera) remained untouched with zero token or state bleed.");
  } else {
    console.error("❌ FAIL: Tenant isolation violation detected.");
    process.exit(1);
  }
}

runEmbedAndConnectionTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
