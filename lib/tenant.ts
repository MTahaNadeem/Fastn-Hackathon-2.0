/**
 * Tenant Model for InvoiceFlow
 * 
 * In InvoiceFlow, each signed-up freelancer operates as an isolated "tenant".
 * Each tenant receives a unique Fastn connection namespace (fastnNamespace)
 * which maps directly to Fastn's `tenantId` / `x-fastn-space-tenantid` header.
 * 
 * This ensures that credentials, OAuth tokens, and configurations for accounting
 * and payment platforms (QuickBooks, JazzCash, PayPal, Xero, Slack) remain completely
 * siloed per freelancer.
 */

export interface EmailTemplateConfig {
  subject: string;
  body: string;
}

export interface ReminderScheduleConfig {
  daysBeforeDue: number[]; // e.g. [7, 3, 0]
  enableDayOfReminder: boolean;
}

export interface TenantSettings {
  autoSyncAccounting?: boolean;
  autoNotifySlack?: boolean;
  defaultPaymentTermsDays?: number;
  emailTemplate: EmailTemplateConfig;
  reminderSchedule: ReminderScheduleConfig;
}

export const DEFAULT_EMAIL_TEMPLATE: EmailTemplateConfig = {
  subject: "Invoice {invoice_id} from {freelancer_name}",
  body: `Hi there,

Please find attached invoice {invoice_id} for {amount} from {freelancer_name} ({business_name}).

Due Date: {due_date}
Amount Due: {amount}

Thank you for your business! Please reach out if you have any questions.

Best regards,
{freelancer_name}
{business_name}`,
};

export const DEFAULT_REMINDER_SCHEDULE: ReminderScheduleConfig = {
  daysBeforeDue: [3, 0],
  enableDayOfReminder: true,
};

export interface Tenant {
  id: string;
  name: string;
  businessName: string;
  email: string;
  fastnNamespace: string;
  currency: string;
  createdAt: string;
  connectedConnectors: string[];
  settings?: TenantSettings;
}

export const DEFAULT_TENANTS: Tenant[] = [
  {
    id: "tenant-sarah-chen",
    name: "Sarah Chen",
    businessName: "Chen Design Studio",
    email: "sarah@chendesign.io",
    fastnNamespace: "freelancer-sarah-chen",
    currency: "PKR",
    createdAt: "2026-01-15T09:00:00Z",
    connectedConnectors: ["google_calendar", "google_sheets", "slack", "jazzcash"],
    settings: {
      autoSyncAccounting: true,
      autoNotifySlack: true,
      defaultPaymentTermsDays: 14,
      emailTemplate: {
        subject: "Invoice {invoice_id} from Chen Design Studio",
        body: `Dear Client,

Please find your design invoice {invoice_id} for {amount} from Sarah Chen (Chen Design Studio).

Due Date: {due_date}
Amount Due: {amount}

We appreciate your partnership!

Best regards,
Sarah Chen
Chen Design Studio`,
      },
      reminderSchedule: {
        daysBeforeDue: [3, 0],
        enableDayOfReminder: true,
      },
    },
  },
  {
    id: "tenant-alex-rivera",
    name: "Alex Rivera",
    businessName: "Rivera Web Solutions",
    email: "alex@riveradev.com",
    fastnNamespace: "freelancer-alex-rivera",
    currency: "PKR",
    createdAt: "2026-02-01T11:30:00Z",
    connectedConnectors: ["jazzcash", "google_sheets"],
    settings: {
      autoSyncAccounting: true,
      autoNotifySlack: false,
      defaultPaymentTermsDays: 30,
      emailTemplate: {
        subject: "Invoice {invoice_id} from Rivera Web Solutions",
        body: `Hello,

Your invoice {invoice_id} for {amount} is now ready for review.

Amount Due: {amount}
Due Date: {due_date}

Thank you for choosing Rivera Web Solutions!

Alex Rivera`,
      },
      reminderSchedule: {
        daysBeforeDue: [7, 3, 0],
        enableDayOfReminder: true,
      },
    },
  },
  {
    id: "tenant-maya-patel",
    name: "Maya Patel",
    businessName: "Patel Branding & Copy",
    email: "maya@patelbranding.com",
    fastnNamespace: "freelancer-maya-patel",
    currency: "PKR",
    createdAt: "2026-02-20T14:15:00Z",
    connectedConnectors: [],
    settings: {
      autoSyncAccounting: false,
      autoNotifySlack: false,
      defaultPaymentTermsDays: 15,
      emailTemplate: DEFAULT_EMAIL_TEMPLATE,
      reminderSchedule: DEFAULT_REMINDER_SCHEDULE,
    },
  },
];

const TENANTS_STORAGE_KEY = "invoiceflow_tenants";
const ACTIVE_TENANT_ID_KEY = "invoiceflow_active_tenant_id";

let memoryTenants: Tenant[] = JSON.parse(JSON.stringify(DEFAULT_TENANTS));
let memoryActiveTenantId: string = memoryTenants[0].id;

function hasLocalStorage(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      typeof localStorage !== "undefined" &&
      typeof localStorage.getItem === "function"
    );
  } catch (_) {
    return false;
  }
}

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
 * Get all available tenants (from localStorage if in browser, else in-memory defaults)
 */
export function getTenants(): Tenant[] {
  if (!hasLocalStorage()) {
    return memoryTenants;
  }

  try {
    const raw = localStorage.getItem(TENANTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(memoryTenants));
      return memoryTenants;
    }
    return JSON.parse(raw) as Tenant[];
  } catch (error) {
    return memoryTenants;
  }
}

/**
 * Get the currently active freelancer tenant
 */
export function getActiveTenant(): Tenant {
  const tenants = getTenants();
  if (!hasLocalStorage()) {
    return tenants.find((t) => t.id === memoryActiveTenantId) || tenants[0];
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
    return tenants[0];
  }
}

/**
 * Set the currently active freelancer tenant
 */
export function setActiveTenantId(tenantId: string): void {
  memoryActiveTenantId = tenantId;
  if (hasLocalStorage()) {
    try {
      localStorage.setItem(ACTIVE_TENANT_ID_KEY, tenantId);
    } catch (_) {}
  }
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    try {
      window.dispatchEvent(new Event("invoiceflow:tenant_changed"));
    } catch (_) {}
  }
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
    currency: input.currency || "PKR",
    createdAt: new Date().toISOString(),
    connectedConnectors: [],
    settings: {
      autoSyncAccounting: true,
      autoNotifySlack: false,
      defaultPaymentTermsDays: 14,
      emailTemplate: DEFAULT_EMAIL_TEMPLATE,
      reminderSchedule: DEFAULT_REMINDER_SCHEDULE,
    },
  };

  const updated = [newTenant, ...tenants];
  memoryTenants = updated;
  if (hasLocalStorage()) {
    try {
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (_) {}
  }
  setActiveTenantId(newTenant.id);

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
  memoryTenants = tenants;
  if (hasLocalStorage()) {
    try {
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(tenants));
    } catch (_) {}
  }
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    try {
      window.dispatchEvent(new Event("invoiceflow:tenant_updated"));
    } catch (_) {}
  }

  return updatedTenant;
}

/**
 * Update customizable settings (email template, reminder schedule) for a tenant
 */
export function updateTenantSettings(
  tenantId: string,
  newSettings: Partial<TenantSettings>
): Tenant | null {
  const tenants = getTenants();
  const index = tenants.findIndex((t) => t.id === tenantId);
  if (index === -1) return null;

  const current = tenants[index];
  const mergedSettings: TenantSettings = {
    autoSyncAccounting: newSettings.autoSyncAccounting ?? current.settings?.autoSyncAccounting ?? true,
    autoNotifySlack: newSettings.autoNotifySlack ?? current.settings?.autoNotifySlack ?? true,
    defaultPaymentTermsDays:
      newSettings.defaultPaymentTermsDays ?? current.settings?.defaultPaymentTermsDays ?? 14,
    emailTemplate: {
      ...(current.settings?.emailTemplate || DEFAULT_EMAIL_TEMPLATE),
      ...(newSettings.emailTemplate || {}),
    },
    reminderSchedule: {
      ...(current.settings?.reminderSchedule || DEFAULT_REMINDER_SCHEDULE),
      ...(newSettings.reminderSchedule || {}),
    },
  };

  const updatedTenant: Tenant = {
    ...current,
    settings: mergedSettings,
  };

  tenants[index] = updatedTenant;
  memoryTenants = tenants;
  if (hasLocalStorage()) {
    try {
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(tenants));
    } catch (_) {}
  }
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    try {
      window.dispatchEvent(new Event("invoiceflow:tenant_updated"));
    } catch (_) {}
  }

  return updatedTenant;
}

