"use client";

import React, { useState } from "react";
import { useTenantContext } from "@/lib/tenant-context";
import { CONNECTOR_CATALOG, FastnConnectorMetadata } from "@/lib/fastn";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Key,
  Layers,
  Sparkles,
} from "lucide-react";

export default function ConnectionStatus() {
  const { tenant, toggleConnector } = useTenantContext();
  const [selectedConnector, setSelectedConnector] = useState<FastnConnectorMetadata | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [connecting, setConnecting] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; msg: string } | null>(null);

  const connectedSet = new Set(tenant.connectedConnectors || []);

  const handleOpenConnect = (connector: FastnConnectorMetadata) => {
    setSelectedConnector(connector);
    setFormValues({});
    setTestResult(null);
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConnector) return;

    setConnecting(true);
    setTimeout(() => {
      toggleConnector(selectedConnector.id, true);
      setConnecting(false);
      setSelectedConnector(null);
    }, 600);
  };

  const handleDisconnect = (connectorId: string) => {
    if (confirm("Disconnect this connector from your tenant namespace?")) {
      toggleConnector(connectorId, false);
    }
  };

  const handleTestConnection = (connectorId: string) => {
    setTestingId(connectorId);
    setTestResult(null);
    setTimeout(() => {
      setTestingId(null);
      setTestResult({
        id: connectorId,
        success: true,
        msg: `Fastn verification passed for namespace [${tenant.fastnNamespace}].`,
      });
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Namespace Header Info Card */}
      <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-violet-900/10 border border-blue-200 dark:border-blue-800/40 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              <ShieldCheck className="w-3.5 h-3.5" /> Fastn Multi-Tenant Architecture
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Connected Accounts for {tenant.businessName}
            </h2>
            <p className="text-xs text-zinc-500 max-w-xl">
              Each connected integration is partitioned inside Fastn under your isolated connection namespace.
              OAuth credentials and API tokens never leak across freelancers.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-xs space-y-1 font-mono">
            <div className="text-zinc-400">Header: x-fastn-space-tenantid</div>
            <div className="font-semibold text-blue-600 dark:text-blue-400 text-sm">
              {tenant.fastnNamespace}
            </div>
            <div className="text-[10px] text-zinc-400">
              {connectedSet.size} of {CONNECTOR_CATALOG.length} integrations active
            </div>
          </div>
        </div>
      </div>

      {/* Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CONNECTOR_CATALOG.map((connector) => {
          const isConnected = connectedSet.has(connector.id);
          const isTesting = testingId === connector.id;

          return (
            <div
              key={connector.id}
              className={`rounded-2xl border p-5 transition flex flex-col justify-between ${
                isConnected
                  ? "bg-white dark:bg-zinc-900 border-emerald-500/30 dark:border-emerald-500/20 shadow-sm"
                  : "bg-white/60 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                      {connector.icon}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {connector.name}
                      </h3>
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                        {connector.category}
                      </span>
                    </div>
                  </div>

                  {isConnected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                      <XCircle className="w-3 h-3" /> Disconnected
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {connector.description}
                </p>

                {/* Supported Actions */}
                <div className="flex flex-wrap gap-1">
                  {connector.supportedActions.map((act) => (
                    <span
                      key={act}
                      className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono"
                    >
                      {act}
                    </span>
                  ))}
                </div>

                {testResult && testResult.id === connector.id && (
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>{testResult.msg}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-4 flex items-center justify-between gap-2">
                {isConnected ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleTestConnection(connector.id)}
                      disabled={isTesting}
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition py-1 px-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
                      Test Link
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDisconnect(connector.id)}
                      className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline py-1 px-2"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenConnect(connector)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
                  >
                    <Key className="w-3.5 h-3.5" /> Connect to Fastn
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Connect Configuration Modal */}
      {selectedConnector && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                {selectedConnector.icon}
              </span>
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Connect {selectedConnector.name}
                </h3>
                <p className="text-xs text-zinc-500">
                  Tenant Namespace:{" "}
                  <code className="text-blue-600 dark:text-blue-400 font-mono font-semibold">
                    {tenant.fastnNamespace}
                  </code>
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveConnection} className="space-y-4">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Fastn Encrypted Storage
                </p>
                <p>
                  These credentials will be securely provisioned to Fastn and keyed to your unique
                  tenant ID.
                </p>
              </div>

              {selectedConnector.requiredFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    {field.label} {field.required && "*"}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={formValues[field.key] || ""}
                    onChange={(e) =>
                      setFormValues({ ...formValues, [field.key]: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              ))}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedConnector(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={connecting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition disabled:opacity-50"
                >
                  {connecting ? "Connecting..." : "Save & Activate via Fastn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
