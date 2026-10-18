# JazzCash Sandbox Payment Gateway (Fastn Custom Connector)

A production-grade, multi-tenant Fastn custom connector for **JazzCash**—Pakistan’s leading mobile wallet and payment gateway. This connector enables freelancers and businesses to accept Pakistani Rupee (PKR) payments via JazzCash Mobile Accounts, debit/credit cards, and direct bank transfers, complete with automated webhook notifications and real-time transaction reconciliation.

---

## 1. Authentication Setup Steps

JazzCash uses an **API-Key & Cryptographic Hash** authentication mechanism. Each merchant account generates three primary credentials in the JazzCash Merchant Sandbox Portal:

1. **`merchantId` (`pp_MerchantID`)**:
   - Issued upon sandbox account registration at [https://sandbox.jazzcash.com.pk](https://sandbox.jazzcash.com.pk).
   - Format: Usually starts with `MC...` or `Test...` (e.g. `MC123456`).
2. **`password` (`pp_Password`)**:
   - The API password generated under **Settings > API Credentials** in the JazzCash merchant portal.
3. **`integritySalt` (HashKey / Salt)**:
   - The private HMAC integrity salt used to calculate tamper-proof `pp_SecureHash` signatures using **SHA-256**.
   - Kept strictly secret and stored in Fastn's per-tenant credential vault.
4. **`environment`**:
   - Set to `sandbox` for testing and staging (`https://sandbox.jazzcash.com.pk/Application`).
   - Set to `production` for live traffic (`https://payments.jazzcash.com.pk/Application`).

### Configuring in Fastn Connection Sandbox:
When connecting a freelancer tenant (e.g., via the embedded `/connect-accounts` widget), Fastn scopes these credentials under the tenant namespace:
```json
{
  "connector": "jazzcash",
  "endOrgId": "tenant-alex-rivera",
  "credentials": {
    "merchantId": "MC123456",
    "password": "sandbox_password_here",
    "integritySalt": "sandbox_integrity_salt_here",
    "environment": "sandbox"
  }
}
```

---

## 2. Actions Reference

### Action 1: `create_payment_link`
Generates a signed, tamper-proof hosted checkout URL that can be embedded in invoice delivery emails or shared with clients.

#### Inputs:
| Parameter | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `amount` | `number` | **Yes** | Total invoice amount in PKR | `4500.00` |
| `bill_reference` | `string` | **Yes** | Invoice ID or bill reference number | `"INV-2026-101"` |
| `description` | `string` | No | Short invoice line-item summary | `"Logo & Brand Identity Sprint"` |
| `client_email` | `string` | No | Customer's email for receipts | `"client@acmecorp.com"` |
| `client_mobile` | `string` | No | Pakistani mobile number (03xx) | `"03001234567"` |
| `return_url` | `string` | No | Callback URL for IPN webhook | `"https://app.invoiceflow.io/api/webhooks/payment"` |
| `expiry_hours` | `number` | No | Validity duration in hours (default: 24) | `24` |

#### Outputs:
```json
{
  "success": true,
  "payment_url": "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/?pp_Version=1.1&pp_TxnType=MPAY&...",
  "txn_ref_no": "T20261018235084",
  "bill_reference": "INV-2026-101",
  "amount": 4500,
  "amount_paisa": 450000,
  "currency": "PKR",
  "status": "pending",
  "expires_at": "2026-10-19T23:50:00.000Z",
  "secure_hash": "6E8A1F4C9D2E..."
}
```

---

### Action 2: `check_payment_status`
Queries the JazzCash Status Inquiry REST API (`/API/REST/QueryTransaction`) using `pp_TxnRefNo` to determine whether funds have been successfully debited from the customer's wallet or card.

#### Inputs:
| Parameter | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `txn_ref_no` | `string` | **Yes** | Unique transaction reference number | `"T20261018235084"` |
| `bill_reference` | `string` | No | Associated merchant invoice ID | `"INV-2026-101"` |

#### Outputs:
```json
{
  "success": true,
  "txn_ref_no": "T20261018235084",
  "bill_reference": "INV-2026-101",
  "status": "paid",
  "response_code": "000",
  "payment_response_code": "121",
  "response_message": "Transaction has been marked confirmed by Merchant.",
  "amount": 4500,
  "currency": "PKR",
  "paid_at": "2026-10-18T23:51:10.000Z",
  "retrieval_ref_no": "RRN89347102"
}
```
*Note: `status: "paid"` is derived when `response_code === "000"` and `payment_response_code === "121"`.*

---

### Action 3: `get_transaction`
Retrieves detailed financial audit logs, merchant discount fees, customer masked phone, and bank Retrieval Reference Number (RRN).

#### Inputs:
| Parameter | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `txn_ref_no` | `string` | No | Transaction reference number | `"T20261018235084"` |
| `retrieval_ref_no` | `string` | No | Bank RRN | `"RRN89347102"` |

#### Outputs:
```json
{
  "success": true,
  "txn_ref_no": "T20261018235084",
  "retrieval_ref_no": "RRN89347102",
  "bill_reference": "INV-2026-101",
  "amount": 4500,
  "fee": 45.0,
  "net_amount": 4455.0,
  "currency": "PKR",
  "status": "paid",
  "channel": "MOBILE_WALLET",
  "customer_mobile": "0300****567",
  "settlement_date": "2026-10-18T23:51:10.000Z"
}
```

---

## 3. Cryptographic Signature Calculation (`pp_SecureHash`)

JazzCash enforces SHA-256 HMAC integrity checks for all API requests and webhook callbacks. The hash is computed as follows:

1. Exclude `pp_SecureHash`, empty fields, and null parameters.
2. Sort parameter keys alphabetically in ascending order (`A-Z`).
3. Concatenate the merchant `integritySalt` followed by the sorted values joined by `&`:
   $$\text{StringToHash} = \text{IntegritySalt} + \text{"\&"} + v_1 + \text{"\&"} + v_2 + \dots$$
4. Compute the SHA-256 digest and convert to uppercase hexadecimal string.

---

## 4. Usage in Fastn Workflows

Inside any Fastn workflow (such as `payment-check` or `invoice-lifecycle`), invoke the connector via ambient `fastn` bindings:

```javascript
// Step 1: Generate payment link when an invoice is created
const linkResult = await fastn.connector.jazzcash.create_payment_link({
  amount: 4500,
  bill_reference: "INV-2026-101",
  description: "Web Development Services",
  client_mobile: "03001234567",
  return_url: "https://invoiceflow.io/api/webhooks/payment"
});

// Step 2: Check status during hourly reconciliation or IPN webhook
const checkResult = await fastn.connector.jazzcash.check_payment_status({
  txn_ref_no: "T20261018235084",
  bill_reference: "INV-2026-101"
});

if (checkResult.status === "paid") {
  // Update Google Sheet, send Gmail confirmation, post to Slack
}

// Step 3: Audit transaction settlement
const audit = await fastn.connector.jazzcash.get_transaction({
  txn_ref_no: "T20261018235084"
});
```

---

## 5. Multi-Tenant Scoping

Because InvoiceFlow is multi-tenant, Fastn executes all calls with `endOrgId: tenant_id`:
- Freelancer A (Sarah Chen) can have her own JazzCash merchant account (`MC_SARAH`).
- Freelancer B (Alex Rivera) has an independent merchant account (`MC_ALEX`).
- No keys, salts, or transaction logs cross tenant boundaries.
