import { NextResponse } from "next/server";
import { isFastnConfigured, getFastnEnvConfig } from "@/lib/fastn";

export async function GET() {
  const configured = isFastnConfigured();
  const config = getFastnEnvConfig("health-check");

  return NextResponse.json({
    status: configured ? "configured" : "development_mock_mode",
    environment: config.environment,
    baseUrl: config.baseUrl,
    workspaceConfigured: Boolean(config.workspaceId && config.workspaceId !== "your_fastn_workspace_id_here"),
    apiKeyConfigured: Boolean(config.apiKey && config.apiKey !== "your_fastn_api_key_here"),
    timestamp: new Date().toISOString(),
  });
}
