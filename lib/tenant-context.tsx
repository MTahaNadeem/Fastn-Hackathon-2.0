"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Tenant,
  TenantSettings,
  getTenants,
  getActiveTenant,
  setActiveTenantId,
  createTenant,
  updateTenantConnectors,
  updateTenantSettings,
} from "./tenant";

interface TenantContextType {
  tenant: Tenant;
  tenants: Tenant[];
  switchTenant: (tenantId: string) => void;
  registerTenant: (input: {
    name: string;
    businessName: string;
    email: string;
    currency?: string;
  }) => Tenant;
  toggleConnector: (connectorId: string, connected: boolean) => void;
  updateSettings: (newSettings: Partial<TenantSettings>) => void;
  refresh: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenant, setTenant] = useState<Tenant>(getActiveTenant());

  const syncFromStorage = () => {
    const all = getTenants();
    const active = getActiveTenant();
    setTenants(all);
    setTenant(active);
  };

  useEffect(() => {
    syncFromStorage();

    const handleTenantChanged = () => syncFromStorage();
    const handleTenantUpdated = () => syncFromStorage();

    window.addEventListener("invoiceflow:tenant_changed", handleTenantChanged);
    window.addEventListener("invoiceflow:tenant_updated", handleTenantUpdated);

    return () => {
      window.removeEventListener("invoiceflow:tenant_changed", handleTenantChanged);
      window.removeEventListener("invoiceflow:tenant_updated", handleTenantUpdated);
    };
  }, []);

  const switchTenant = (tenantId: string) => {
    setActiveTenantId(tenantId);
    syncFromStorage();
  };

  const registerTenant = (input: {
    name: string;
    businessName: string;
    email: string;
    currency?: string;
  }) => {
    const created = createTenant(input);
    syncFromStorage();
    return created;
  };

  const toggleConnector = (connectorId: string, connected: boolean) => {
    updateTenantConnectors(tenant.id, connectorId, connected);
    syncFromStorage();
  };

  const updateSettings = (newSettings: Partial<TenantSettings>) => {
    updateTenantSettings(tenant.id, newSettings);
    syncFromStorage();
  };

  return (
    <TenantContext.Provider
      value={{
        tenant,
        tenants,
        switchTenant,
        registerTenant,
        toggleConnector,
        updateSettings,
        refresh: syncFromStorage,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenantContext must be used within a TenantProvider");
  }
  return context;
}
