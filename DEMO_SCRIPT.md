# 🎬 InvoiceFlow & Fastn Multi-Tenant Isolation Demo Script
## Camera Walkthrough for Video Recording (5 Integrations: Gmail, Calendar, Sheets, Slack, JazzCash)

---

### **Video Overview**
- **Length**: ~3–4 minutes
- **Theme**: Strict Per-Tenant Credential & Ledger Isolation in Fastn 2.0
- **Currency**: PKR (`Rs. X,XXX`)
- **Designated Integrations (5)**:
  1. ✉️ **Gmail** (Client email delivery with custom templates)
  2. 📅 **Google Calendar** (Due date events & automated reminders)
  3. 📊 **Google Sheets** (Dedicated per-tenant ledger spreadsheet)
  4. 💬 **Slack** (Per-tenant invoice & payment alerts)
  5. 📱 **JazzCash** (Custom Pakistani mobile wallet payment gateway connector)

---

### **Scene 1: Introduction & The Architecture (0:00 - 0:45)**

**On Camera:**
> "Hi everyone! Welcome to InvoiceFlow, an invoicing platform built for freelancers, powered by Fastn 2.0.
> 
> As freelancers, we frequently connect our personal accounts—Gmail, Google Sheets, Slack, and JazzCash. In traditional SaaS, storing multiple users' tokens in one place is prone to credential cross-talk.
> 
> With Fastn, every freelancer is an isolated tenant. Fastn provisions a distinct connection namespace (`x-fastn-space-tenantid`) where OAuth tokens, API secrets, and workflow actions remain completely partitioned."

**On Screen:**
- Show the Landing Page (`/`): Highlight the architecture diagram and the 5 designated integrations: **Gmail, Google Calendar, Google Sheets, Slack, and JazzCash**.

---

### **Scene 2: Freelancer A (Sarah Chen) Account Connection (0:45 - 1:30)**

**On Camera:**
> "Let's log in as **Freelancer A: Sarah Chen** (Chen Design Studio, namespace `freelancer-sarah-chen`)."

**On Screen:**
1. Navigate to `/connect-accounts`.
2. Point out the 5 integration cards: **Gmail, Google Calendar, Google Sheets, Slack, and JazzCash**.
3. Click **Connect** on **Gmail** or **JazzCash**:
   - The Fastn embedded connect widget opens inline inside the app.
   - Fastn mints a scoped connect-session token bound to `tenant-sarah-chen`.
   - Complete connection $\rightarrow$ status refreshes to **Connected ✅**.
4. Show that Sarah's Google Sheet ID and JazzCash credentials are saved strictly under Sarah's namespace.

---

### **Scene 3: Freelancer B (Alex Rivera) Account Connection (1:30 - 2:10)**

**On Camera:**
> "Now, let's switch to **Freelancer B: Alex Rivera** (Rivera Web Solutions, namespace `freelancer-alex-rivera`)."

**On Screen:**
1. Click the **Tenant Switcher** dropdown in the navigation bar and select **Alex Rivera**.
2. Navigate to `/connect-accounts`.
3. Notice: Alex's connection cards are completely distinct.
4. Connect Alex's test JazzCash merchant account (`merchant_03001234567`) and Alex's Google Sheet.
5. Emphasize on camera:
   > "Notice that Sarah's accounts and Alex's accounts never overlap. Fastn enforces total multi-tenant sandboxing."

---

### **Scene 4: The Invoice Lifecycle Test (2:10 - 3:00)**

**On Camera:**
> "Now let's test the `invoice-lifecycle` workflow for both freelancers and verify zero cross-tenant contamination."

**On Screen:**
1. Switch back to **Sarah Chen**.
2. Go to `/create-invoice`:
   - Enter Client: `Acme FinTech` (`billing@acmefintech.io`).
   - Line Item: `Brand Identity Design (PKR)` $\rightarrow$ `Rs. 350,000`.
   - Submit the invoice.
3. Show the Fastn Workflow trace:
   - **Gmail**: Dispatched via Sarah's connected Gmail (`Rs. 350,000`).
   - **Google Calendar**: Event created on Sarah's calendar with 3-day reminder.
   - **Google Sheets**: Row appended `[INV-2026-001, billing@acmefintech.io, Rs. 350,000, 2026-11-20, pending]` to Sarah's sheet.
   - **Slack**: Alert posted to Sarah's `#chen-design-invoices` channel.
4. Switch to **Alex Rivera** and create an invoice for `Rs. 440,000`:
   - Fastn executes using Alex's accounts.
   - Show Alex's Google Sheet: **Sarah's invoice NEVER appears here**.
   - Show Sarah's Google Sheet: **Alex's invoice NEVER appears here**.

---

### **Scene 5: The Payment Reconciliation Test (3:00 - 3:45)**

**On Camera:**
> "Finally, let's trigger the `payment-check` workflow when a client completes payment via JazzCash."

**On Screen:**
1. Simulate incoming JazzCash payment callback (`payment.webhook`).
2. Fastn reconciles the payment:
   - Marks Google Sheet status to `paid`.
   - Dispatches payment receipt to client via Gmail.
   - Posts celebration in Slack.
3. Run the automated isolation script on screen:
   ```bash
   npx tsx scripts/test-two-tenant-isolation.ts
   npx tsx scripts/test-payment-check-isolation.ts
   ```
4. Show the green test assertion: **Zero cross-tenant leakage passed (100%)**.

---

### **Scene 6: Wrap-up (3:45 - 4:00)**

**On Camera:**
> "With Fastn 2.0, multi-tenant SaaS integration isn't just easy—it's mathematically isolated, secure, and ready for production. Thank you for watching!"
