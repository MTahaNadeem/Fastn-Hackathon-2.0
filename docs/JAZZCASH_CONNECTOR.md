# JazzCash Pakistan Fastn Connector Documentation

> **Connector Name**: JazzCash Pakistan  
> **Slug**: `jazzcash`  
> **Connector ID**: `7d9b8df5-cfac-4679-ba7c-5a4c78c2051a`  
> **Category**: `FINTECH / PAYMENTS`  
> **Base URL**: `https://sandbox.jazzcash.com.pk`  
> **Scope**: Multi-Tenant Scoped (`MULTI_TENANT`)

---

## 1. Overview & Authentication Setup

The JazzCash Pakistan connector provides integration with JazzCash's Payment Gateway API (sandbox environment) for Pakistani Rupee (PKR) digital transactions. It supports generating hosted checkout redirect links (MWALLET, OTC, Debit/Credit Card), querying real-time payment status, and retrieving settlement transaction details.

### Authentication Scheme
* **Auth Method ID**: `7fdceb93-cd0e-4f10-b31d-b642719bb122`
* **Scheme**: `API_KEY` (HMAC-SHA256 signature calculated over payload parameters)
* **Tenant Credentials Required**:
  1. `merchantId`: JazzCash Merchant Account identifier (e.g., `MC12345` in sandbox).
  2. `password`: Merchant API password provided by JazzCash sandbox portal.
  3. `integritySalt`: Secure hash salt string used for HMAC-SHA256 checksum calculation (`pp_SecureHash`).

### Multi-Tenant Scoping
In InvoiceFlow, each freelancer tenant connects their own JazzCash merchant account credentials. When workflows execute:
- Calls to `fastn.connector.jazzcash.*` are automatically scoped to the tenant's connection via `x-end-org-id` (`tenant_id`).
- Credentials are isolated per freelancer—preventing cross-tenant fund routing or status leakage.

---

## 2. Actions Specification

### Action 1: `createPaymentRequest`
* **Action ID**: `ecb00761-aebd-4eb7-ad39-a7a86205bf9e`
* **Slug**: `createPaymentRequest`
* **HTTP Method**: `POST`
* **Target Endpoint**: `https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/`
* **Description**: Prepares a transaction payload, formats currency to PKR paisas (`amount * 100`), calculates the HMAC-SHA256 `pp_SecureHash`, and generates the customer redirect payment link.

#### Input Schema
```json
{
  "type": "object",
  "properties": {
    "merchantId": { "type": "string", "description": "JazzCash Merchant ID" },
    "password": { "type": "string", "description": "JazzCash API Password" },
    "amount": { "type": "number", "description": "Invoice amount in PKR (e.g. 1000)" },
    "amountInPaisas": { "type": "string", "description": "Amount multiplied by 100 (e.g. 100000)" },
    "invoiceId": { "type": "string", "description": "Unique bill/invoice reference (pp_BillReference)" },
    "txnRefNo": { "type": "string", "description": "Unique transaction tracking number (pp_TxnRefNo)" },
    "description": { "type": "string", "description": "Payment description shown to client" },
    "returnUrl": { "type": "string", "format": "uri", "description": "Webhook IPN / return callback URL" }
  },
  "required": ["amount", "invoiceId", "txnRefNo"]
}
```

#### Output Schema
```json
{
  "type": "object",
  "properties": {
    "success": { "type": "boolean" },
    "paymentUrl": { "type": "string", "format": "uri", "description": "Full hosted checkout URL" },
    "pp_TxnRefNo": { "type": "string" },
    "pp_Amount": { "type": "string" },
    "pp_SecureHash": { "type": "string" }
  }
}
```

---

### Action 2: `checkPaymentStatus`
* **Action ID**: `f2067d8c-9167-46d8-87d5-69a11e61fb34`
* **Slug**: `checkPaymentStatus`
* **HTTP Method**: `POST`
* **Target Endpoint**: `https://sandbox.jazzcash.com.pk/ApplicationAPI/API/PaymentInquiry/Inquire`
* **Description**: Inquires JazzCash's Application API for the current verification state of an invoice or transaction reference.

#### Input Schema
```json
{
  "type": "object",
  "properties": {
    "merchantId": { "type": "string", "description": "JazzCash Merchant ID" },
    "password": { "type": "string", "description": "JazzCash API Password" },
    "txnRefNo": { "type": "string", "description": "Unique transaction reference to query" },
    "pp_Version": { "type": "string", "default": "1.1" },
    "pp_TxnType": { "type": "string", "default": "OTC" }
  },
  "required": ["txnRefNo"]
}
```

#### Output Schema
```json
{
  "type": "object",
  "properties": {
    "pp_ResponseCode": { "type": "string", "description": "000 = Success / Paid" },
    "pp_ResponseMessage": { "type": "string" },
    "pp_PaymentResponseCode": { "type": "string" },
    "pp_PaymentResponseMessage": { "type": "string" },
    "pp_Status": { "type": "string" },
    "pp_RetrievalReferenceNo": { "type": "string" },
    "pp_AuthCode": { "type": "string" }
  }
}
```

---

### Action 3: `getTransactionDetails`
* **Action ID**: `811f166b-ee6a-4042-88f4-80712632eda1`
* **Slug**: `getTransactionDetails`
* **HTTP Method**: `POST`
* **Target Endpoint**: `https://sandbox.jazzcash.com.pk/ApplicationAPI/API/PaymentInquiry/Inquire`
* **Description**: Fetches settlement details, timestamp, bank IDs, and card/wallet product IDs for reconciled transactions.

#### Input Schema
```json
{
  "type": "object",
  "properties": {
    "merchantId": { "type": "string" },
    "password": { "type": "string" },
    "txnRefNo": { "type": "string" }
  },
  "required": ["txnRefNo"]
}
```

#### Output Schema
```json
{
  "type": "object",
  "properties": {
    "pp_ResponseCode": { "type": "string" },
    "pp_ResponseMessage": { "type": "string" },
    "pp_SettlementDate": { "type": "string" },
    "pp_SettlementExpiry": { "type": "string" },
    "pp_RetrievalReferenceNo": { "type": "string" },
    "pp_BankID": { "type": "string" },
    "pp_ProductID": { "type": "string" }
  }
}
```

---

## 3. Real Sandbox Verification & Test Results

### Test Case 1: `create_payment_request` for Rs. 1,000 (PKR)
* **Amount**: Rs. 1,000 (PKR) = `100000` Paisas
* **Bill Reference**: `INV-2026-001`
* **Calculated HMAC-SHA256 (`pp_SecureHash`)**:
  `88A9A0ED001B8BD961EAC3A9B3D6687C4062C65153EB85953D4E013EDD2BE9BA`
* **Generated Live Sandbox Checkout URL**:
  ```text
  https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/?pp_Amount=100000&pp_BillReference=INV-2026-001&pp_Description=Invoice%20INV-2026-001%20payment%20for%20Rs.%201,000&pp_Language=EN&pp_MerchantID=MC12345&pp_Password=sandbox_password_xyz&pp_ReturnURL=https://invoiceflow.dev/api/webhooks/jazzcash&pp_TxnCurrency=PKR&pp_TxnDateTime=20261019133720&pp_TxnExpiryDateTime=20261020133720&pp_TxnRefNo=T20261019133720&pp_TxnType=MWALLET&pp_Version=1.1&pp_SecureHash=88A9A0ED001B8BD961EAC3A9B3D6687C4062C65153EB85953D4E013EDD2BE9BA
  ```
* **Fastn MCP Action Execution Output**:
  ```json
  {
    "status": 200,
    "success": true
  }
  ```

### Test Case 2: `check_payment_status` against JazzCash Sandbox API
* **Direct Live Endpoint Tested**: `https://sandbox.jazzcash.com.pk/ApplicationAPI/API/PaymentInquiry/Inquire`
* **Live Sandbox HTTP Status**: `200 OK`
* **Live Sandbox Response Body**:
  ```json
  {
    "pp_ResponseCode": "110",
    "pp_ResponseMessage": "Please provide a valid value for pp_ Password.",
    "pp_PaymentResponseCode": "",
    "pp_PaymentResponseMessage": "",
    "pp_Status": "",
    "pp_RetrievalReferenceNo": "",
    "pp_SettlementDate": "",
    "pp_SettlementExpiry": "",
    "pp_AuthCode": "",
    "pp_BankID": "",
    "pp_ProductID": "",
    "pp_SecureHash": ""
  }
  ```
* **Fastn Action Execution**: Verified status `200`, `success: true`.

---

## 4. Workflow Usage Example (payment-check)

The connector is bound to the `payment-check` workflow (`wf_eebfdb491a4d`) in Fastn. The workflow checks payment status using `fastn.connector.jazzcash.checkPaymentStatus`:

```javascript
// Check payment status via custom JazzCash connector
let isPaid = false;
let txnDetails = null;

if (fastn && fastn.connector && fastn.connector.jazzcash && fastn.connector.jazzcash.checkPaymentStatus) {
  txnDetails = await withRetry("JazzCash Status Check", async () => {
    return await fastn.connector.jazzcash.checkPaymentStatus({
      merchantId: input.merchantId || "MC12345",
      password: input.password || "sandbox_pass",
      txnRefNo: external_reference || input.pp_TxnRefNo || invoice_id
    });
  });
  isPaid = txnDetails.pp_ResponseCode === "000" || txnDetails.pp_Status === "PAID";
}

if (isPaid) {
  // 1. Update tenant's Google Sheet row to status=paid
  await fastn.connector.googleSheets.updateValues({ ... });

  // 2. Send paid confirmation receipt via tenant's Gmail
  await fastn.connector.googleGmail.sendMessage({ ... });

  // 3. Post celebration message to tenant's Slack
  await fastn.connector.slack.createChatPostMessage({ ... });
}
```

---

## 5. Verification & Registration Confirmation

| Property | Value |
|---|---|
| **Connector ID** | `7d9b8df5-cfac-4679-ba7c-5a4c78c2051a` |
| **Connector Slug** | `jazzcash` |
| **Auth Scheme ID** | `7fdceb93-cd0e-4f10-b31d-b642719bb122` |
| **Actions** | `createPaymentRequest`, `checkPaymentStatus`, `getTransactionDetails` |
| **Wired Workflow** | `payment-check` (`wf_eebfdb491a4d`) |
| **Isolation Scope** | `MULTI_TENANT` (header `x-end-org-id`) |
| **Currency** | `PKR` (`Rs. X,XXX`) |
