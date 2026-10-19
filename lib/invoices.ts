/**
 * Invoice Data Model & Tenant-Scoped Store for InvoiceFlow
 */

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type InvoiceStatus = "draft" | "pending" | "paid" | "overdue";

export interface Invoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  currency: string;
  notes?: string;
  status: InvoiceStatus;
  fastnSync: {
    synced: boolean;
    syncedConnectors: string[];
    lastSyncedAt?: string;
    details?: Array<{ connectorId: string; reference?: string; status: string }>;
  };
  createdAt: string;
}

import { formatPKR, DEFAULT_CURRENCY } from "./currency";
export { formatPKR, DEFAULT_CURRENCY };

export const SEED_INVOICES: Invoice[] = [
  {
    id: "inv-001",
    tenantId: "tenant-sarah-chen",
    invoiceNumber: "INV-2026-001",
    clientName: "Acme FinTech Corp",
    clientEmail: "billing@acmefintech.io",
    clientAddress: "100 Market St, San Francisco, CA",
    issueDate: "2026-10-10",
    dueDate: "2026-10-24",
    items: [
      { id: "item-1", description: "Design System Architecture & Figma Tokens", quantity: 30, unitPrice: 12000, total: 360000 },
      { id: "item-2", description: "Mobile App Dark Mode UI Audit", quantity: 10, unitPrice: 14000, total: 140000 },
    ],
    subtotal: 500000,
    taxRate: 5,
    taxAmount: 25000,
    discount: 0,
    total: 525000,
    currency: "PKR",
    notes: "Thank you for your business! Payment due within 14 days.",
    status: "paid",
    fastnSync: {
      synced: true,
      syncedConnectors: ["jazzcash", "quickbooks"],
      lastSyncedAt: "2026-10-10T14:30:00Z",
      details: [
        { connectorId: "jazzcash", reference: "jz_sandbox_887412", status: "success" },
        { connectorId: "quickbooks", reference: "QBO-INV-10924", status: "success" },
      ],
    },
    createdAt: "2026-10-10T14:00:00Z",
  },
  {
    id: "inv-002",
    tenantId: "tenant-sarah-chen",
    invoiceNumber: "INV-2026-002",
    clientName: "Vortex Health",
    clientEmail: "accounts@vortexhealth.co",
    clientAddress: "450 Broadway, New York, NY",
    issueDate: "2026-10-14",
    dueDate: "2026-10-28",
    items: [
      { id: "item-3", description: "Patient Portal Web Experience Redesign", quantity: 25, unitPrice: 12000, total: 300000 },
    ],
    subtotal: 300000,
    taxRate: 0,
    taxAmount: 0,
    discount: 20000,
    total: 280000,
    currency: "PKR",
    notes: "Includes 1 month warranty support.",
    status: "pending",
    fastnSync: {
      synced: true,
      syncedConnectors: ["jazzcash", "slack"],
      lastSyncedAt: "2026-10-14T16:20:00Z",
      details: [
        { connectorId: "jazzcash", reference: "jz_sandbox_992143", status: "success" },
        { connectorId: "slack", status: "success" },
      ],
    },
    createdAt: "2026-10-14T16:00:00Z",
  },
  {
    id: "inv-003",
    tenantId: "tenant-sarah-chen",
    invoiceNumber: "INV-2026-003",
    clientName: "Northstar Robotics",
    clientEmail: "ops@northstarrobotics.com",
    issueDate: "2026-10-17",
    dueDate: "2026-10-31",
    items: [
      { id: "item-4", description: "Brand Identity Guidelines & Iconography", quantity: 1, unitPrice: 185000, total: 185000 },
    ],
    subtotal: 185000,
    taxRate: 0,
    taxAmount: 0,
    discount: 0,
    total: 185000,
    currency: "PKR",
    notes: "Payment link attached.",
    status: "pending",
    fastnSync: {
      synced: false,
      syncedConnectors: [],
    },
    createdAt: "2026-10-17T09:12:00Z",
  },
  {
    id: "inv-004",
    tenantId: "tenant-alex-rivera",
    invoiceNumber: "INV-2026-101",
    clientName: "GreenPulse Energy",
    clientEmail: "ap@greenpulse.io",
    issueDate: "2026-10-05",
    dueDate: "2026-11-05",
    items: [
      { id: "item-5", description: "Next.js 16 Microfrontend Migration", quantity: 40, unitPrice: 11000, total: 440000 },
    ],
    subtotal: 440000,
    taxRate: 0,
    taxAmount: 0,
    discount: 0,
    total: 440000,
    currency: "PKR",
    status: "pending",
    fastnSync: {
      synced: true,
      syncedConnectors: ["jazzcash", "slack"],
      lastSyncedAt: "2026-10-05T10:00:00Z",
    },
    createdAt: "2026-10-05T10:00:00Z",
  },
];

const INVOICES_STORAGE_KEY = "invoiceflow_invoices";

/**
 * Get all invoices stored in the application
 */
export function getAllInvoices(): Invoice[] {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return SEED_INVOICES;
  }

  try {
    const raw = localStorage.getItem(INVOICES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(SEED_INVOICES));
      return SEED_INVOICES;
    }
    return JSON.parse(raw) as Invoice[];
  } catch {
    return SEED_INVOICES;
  }
}

/**
 * Get invoices isolated specifically for a given tenant
 */
export function getInvoicesForTenant(tenantId: string): Invoice[] {
  const all = getAllInvoices();
  return all.filter((inv) => inv.tenantId === tenantId);
}

/**
 * Create a new invoice for a tenant
 */
export function createInvoice(
  tenantId: string,
  invoiceData: Omit<Invoice, "id" | "tenantId" | "createdAt">
): Invoice {
  const all = getAllInvoices();
  const newInvoice: Invoice = {
    ...invoiceData,
    id: `inv-${Date.now()}`,
    tenantId,
    createdAt: new Date().toISOString(),
  };

  const updated = [newInvoice, ...all];
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("invoiceflow:invoices_updated"));
  }

  return newInvoice;
}

/**
 * Update the status of an existing invoice
 */
export function updateInvoiceStatus(
  invoiceId: string,
  status: InvoiceStatus
): Invoice | null {
  const all = getAllInvoices();
  const index = all.findIndex((i) => i.id === invoiceId);
  if (index === -1) return null;

  all[index] = { ...all[index], status };
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event("invoiceflow:invoices_updated"));
  }

  return all[index];
}

/**
 * Mark an invoice as synced to Fastn connectors
 */
export function markInvoiceSynced(
  invoiceId: string,
  connectors: string[],
  details?: Array<{ connectorId: string; reference?: string; status: string }>
): Invoice | null {
  const all = getAllInvoices();
  const index = all.findIndex((i) => i.id === invoiceId);
  if (index === -1) return null;

  const current = all[index];
  const combinedConnectors = Array.from(
    new Set([...current.fastnSync.syncedConnectors, ...connectors])
  );

  all[index] = {
    ...current,
    fastnSync: {
      synced: true,
      syncedConnectors: combinedConnectors,
      lastSyncedAt: new Date().toISOString(),
      details: details || current.fastnSync.details,
    },
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event("invoiceflow:invoices_updated"));
  }

  return all[index];
}
