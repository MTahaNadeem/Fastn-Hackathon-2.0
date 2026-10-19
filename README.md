# InvoiceFlow ⚡

> Multi-Tenant Freelancer Invoicing Platform powered by **Fastn 2.0**

InvoiceFlow is a Next.js application built for the **Fastn Hackathon 2.0**. It solves the multi-platform fragmentation freelancers face by pairing a clean invoicing workflow with Fastn's connector marketplace.

Every signed-up freelancer operates as an isolated **tenant** with their own **Fastn connection namespace**, allowing them to connect their own JazzCash, Gmail, Google Calendar, Google Sheets, and Slack accounts without leaking credentials or cross-contaminating accounting records.

---

## 🚀 Key Features

- **Isolated Multi-Tenant Model**:
  - Each signed-up freelancer is assigned a dedicated Fastn connection namespace (`x-fastn-space-tenantid: freelancer-<slug>-<id>`).
  - Integrations, OAuth credentials, and tokens are completely partitioned in Fastn.
  - Interactive **Tenant Switcher** allows seamless toggling between freelancer profiles.
- **Fastn SDK Integration (`/lib/fastn.ts`)**:
  - Built with `@fastn-ai/core` TypeScript SDK.
  - Integration helpers for querying marketplace connectors, configuring credentials, testing connection links, and dispatching invoice sync workflows.
  - Safe Node/SSR guards and development fallback mode for local development.
- **Automated Invoicing & Sync (`/app/invoices/create`)**:
  - Dynamic line items with auto-computed subtotal, customizable tax rate, discounts, and total in PKR.
  - Fastn multi-tenant sync toggles (QuickBooks, JazzCash, Slack).
  - Instant dispatch to accounting ledgers and payment links.
- **Connect Accounts Hub (`/app/connect-accounts`)**:
  - Browse Fastn's designated connector suite (Gmail, Google Calendar, Google Sheets, Slack, JazzCash = 5 integrations).
  - Connection status badges, credential modal, embedded widget launch, and connection testing.
- **Financial Overview Dashboard (`/app/dashboard`)**:
  - Real-time receivables, total invoiced, settled payments, and active Fastn connectors.
  - Filterable invoice table (`InvoiceList`) with status badges and Fastn sync logs.

---

## 📁 Project Structure

```
├── app/
│   ├── page.tsx                  # Landing page with architecture & value prop
│   ├── signup/page.tsx           # Freelancer signup & Fastn tenant provisioning
│   ├── dashboard/page.tsx        # Financial metrics & invoice management
│   ├── invoices/create/page.tsx  # Invoice creation page with InvoiceForm
│   ├── create-invoice/page.tsx   # Convenience redirect route
│   ├── connect-accounts/page.tsx # Fastn connector marketplace & status
│   ├── api/fastn/
│   │   ├── connectors/route.ts   # API endpoint to query tenant connectors
│   │   ├── sync/route.ts         # API endpoint to dispatch Fastn sync events
│   │   └── health/route.ts       # Fastn environment diagnostics
│   ├── layout.tsx                # Root layout with TenantProvider & Navbar
│   └── globals.css               # Tailwind CSS styles
├── components/
│   ├── InvoiceForm.tsx           # Dynamic invoice creation & sync form
│   ├── ConnectionStatus.tsx      # Connector cards, modal & test link button
│   ├── InvoiceList.tsx           # Filterable invoice table with Fastn badges
│   ├── Navbar.tsx                # Header navigation & tenant selector
│   └── TenantSwitcher.tsx        # Tenant switcher dropdown & switcher modal
├── lib/
│   ├── fastn.ts                  # Fastn SDK integration helpers & catalog
│   ├── tenant.ts                 # Multi-tenant model & namespace generator
│   ├── tenant-context.tsx        # React context & hook for tenant state
│   └── invoices.ts               # Invoice data model & tenant-scoped store
├── .env.example                  # Template for FASTN_API_KEY & FASTN_WORKSPACE_ID
├── .env.local                    # Local development configuration
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env.local` file by copying `.env.example`:

```bash
cp .env.example .env.local
```

Configure your Fastn platform credentials:

```env
# Fastn AI Platform Configuration
FASTN_API_KEY=your_fastn_api_key_here
FASTN_WORKSPACE_ID=your_fastn_workspace_id_here
FASTN_ENVIRONMENT=LIVE
FASTN_BASE_URL=https://live.fastn.ai/api

# Optional Next.js Public Flags
NEXT_PUBLIC_FASTN_WORKSPACE_ID=your_fastn_workspace_id_here
NEXT_PUBLIC_FASTN_ENVIRONMENT=LIVE
```

> **Note**: If `FASTN_API_KEY` is not provided, InvoiceFlow runs in high-fidelity mock/development mode with realistic sample tenants and connector simulations, allowing instant evaluation.

---

## 🛠️ Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
npm run start
```

---

## 🔒 The Fastn Tenant Model Explained

In Fastn, every request to fetch or manipulate connectors can be passed the headers:
- `x-fastn-space-id`: Your global Fastn Workspace ID.
- `x-fastn-space-tenantid`: The freelancer's isolated tenant namespace (e.g. `freelancer-sarah-chen`).

When Freelancer A connects their JazzCash merchant account, the secret credentials and IPN webhook endpoints are stored under `tenantId: freelancer-sarah-chen`. When Freelancer B connects their JazzCash account, it is stored under `tenantId: freelancer-alex-rivera`. Fastn ensures complete data partitioning between tenants.
