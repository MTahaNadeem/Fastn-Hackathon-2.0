/**
 * Tenant Model for InvoiceFlow
 * 
 * In InvoiceFlow, each signed-up freelancer operates as an isolated "tenant".
 * Each tenant receives a unique Fastn connection namespace (fastnNamespace)
 * which maps directly to Fastn's `tenantId` / `x-fastn-space-tenantid` header.
 * 
 * This ensures that credentials, OAuth tokens, and configurations for accounting
 * and payment platforms (QuickBooks, Stripe, PayPal, Xero, Slack) remain completely
 * siloed per freelancer.
 */

export interface Tenant {
  id: string;
  name: string;
  businessName: string;
  email: string;
  fastnNamespace: string;
  currency: string;
  createdAt: string;
  connectedConnectors: string[];
  settings?: {
    autoSyncAccounting?: boolean;
    autoNotifySlack?: boolean;
    defaultPaymentTermsDays?: number;
  };
}

export const DEFAULT_TENANTS: Tenant[] = [
  {
    id: "tenant-sarah-chen",
    name: "Sarah Chen",
    businessName: "Chen Design Studio",
    email: "sarah@chendesign.io",
    fastnNamespace: "freelancer-sarah-chen",
    currency: "USD",
    createdAt: "2026-01-15T09:00:00Z",
    connectedConnectors: ["stripe", "quickbooks", "slack"],
    settings: {
      autoSyncAccounting: true,
      autoNotifySlack: true,
      defaultPaymentTermsDays: 14,
    },
  },
  {
    id: "tenant-alex-rivera",
    name: "Alex Rivera",
    businessName: "Rivera Web Solutions",
    email: "alex@riveradev.com",
    fastnNamespace: "freelancer-alex-rivera",
    currency: "USD",
    createdAt: "2026-02-01T11:30:00Z",
    connectedConnectors: ["stripe", "xero"],
    settings: {
      autoSyncAccounting: true,
      autoNotifySlack: false,
      defaultPaymentTermsDays: 30,
    },
  },
  {
    id: "tenant-maya-patel",
    name: "Maya Patel",
    businessName: "Patel Branding & Copy",
    email: "maya@patelbranding.com",
    fastnNamespace: "freelancer-maya-patel",
    currency: "USD",
    createdAt: "2026-02-20T14:15:00Z",
    connectedConnectors: ["paypal"],
    settings: {
      autoSyncAccounting: false,
      autoNotifySlack: false,
      defaultPaymentTermsDays: 15,
    },
  },
];

const TENANTS_STORAGE_KEY = "invoiceflow_tenants";
const ACTIVE_TENANT_ID_KEY = "invoiceflow_active_tenant_id";

/**
 * Generate a slugified Fastn connection namespace for a tenant
 */
export function generateFastnNamespace(input: string): string {
  const clean = input
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const suffix = Math.random().toString(36).substring(2, 6);
  return `freelancer-${clean || "tenant"}-${suffix}`;
}

/**
 * Get all available tenants (from localStorage if in browser, else defaults)
 */
export function getTenants(): Tenant[] {
  if (typeof window === "undefined") {
    return DEFAULT_TENANTS;
  }

  try {
    const raw = localStorage.getItem(TENANTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(DEFAULT_TENANTS));
      return DEFAULT_TENANTS;
    }
    return JSON.parse(raw) as Tenant[];
  } catch (error) {
    console.error("Failed to read tenants from storage:", error);
    return DEFAULT_TENANTS;
  }
}

/**
 * Get the currently active freelancer tenant
 */
export function getActiveTenant(): Tenant {
  const tenants = getTenants();
  if (typeof window === "undefined") {
    return tenants[0];
  }

  try {
    const activeId = localStorage.getItem(ACTIVE_TENANT_ID_KEY);
    if (activeId) {
      const found = tenants.find((t) => t.id === activeId);
      if (found) return found;
    }
    const defaultTenant = tenants[0];
    localStorage.setItem(ACTIVE_TENANT_ID_KEY, defaultTenant.id);
    return defaultTenant;
  } catch (error) {
    console.error("Failed to get active tenant:", error);
    return tenants[0];
  }
}

/**
 * Set the currently active freelancer tenant
 */
export function setActiveTenantId(tenantId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_TENANT_ID_KEY, tenantId);
  window.dispatchEvent(new Event("invoiceflow:tenant_changed"));
}

/**
 * Register a new freelancer and create their tenant namespace
 */
export function createTenant(input: {
  name: string;
  businessName: string;
  email: string;
  currency?: string;
  customNamespace?: string;
}): Tenant {
  const tenants = getTenants();
  const slugBase = input.businessName || input.name;
  const fastnNamespace =
    input.customNamespace || generateFastnNamespace(slugBase);

  const newTenant: Tenant = {
    id: `tenant-${Date.now()}`,
    name: input.name,
    businessName: input.businessName,
    email: input.email,
    fastnNamespace,
    currency: input.currency || "USD",
    createdAt: new Date().toISOString(),
    connectedConnectors: [],
    settings: {
      autoSyncAccounting: true,
      autoNotifySlack: false,
      defaultPaymentTermsDays: 14,
    },
  };

  const updated = [newTenant, ...tenants];
  if (typeof window !== "undefined") {
    localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(updated));
    setActiveTenantId(newTenant.id);
  }

  return newTenant;
}

/**
 * Update connected connectors for a tenant
 */
export function updateTenantConnectors(
  tenantId: string,
  connectorId: string,
  connected: boolean
): Tenant | null {
  const tenants = getTenants();
  const index = tenants.findIndex((t) => t.id === tenantId);
  if (index === -1) return null;

  const current = tenants[index];
  const list = new Set(current.connectedConnectors || []);
  if (connected) {
    list.add(connectorId);
  } else {
    list.delete(connectorId);
  }

  const updatedTenant: Tenant = {
    ...current,
    connectedConnectors: Array.from(list),
  };

  tenants[index] = updatedTenant;
  if (typeof window !== "undefined") {
    localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(tenants));
    window.dispatchEvent(new Event("invoiceflow:tenant_updated"));
  }

  return updatedTenant;
}
