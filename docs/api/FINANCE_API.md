# Finance Module (Module 6) — API Reference

Base URL: `http://localhost:5000/api/finance`
Every endpoint needs `Authorization: Bearer <token>` from `POST /api/auth/login`.

`401` = no/invalid token · `403` = valid token but role not allowed ·
`404` = record not found · `400` = validation/business rule failed.

## Auth (get a token)

```
POST /api/auth/login
Body: { "email": "finance@yash.test", "password": "<SEED_TEST_PASSWORD>" }
→ 200 { "token": "…", "user": { "id", "name", "email", "role" } }
```

## Who can call what

| Action    | ADMIN | FINANCE_MANAGER | BANK_OFFICE_EXECUTIVE | BACK_OFFICER | SALES_MANAGER |
| --------- | :---: | :-------------: | :-------------------: | :----------: | :-----------: |
| `read`    |  ✅   |       ✅        |          ✅           |      ✅      |      ❌       |
| `create`  |  ✅   |       ✅        |          ✅           |      ❌      |      ❌       |
| `update`  |  ✅   |       ✅        |          ❌           |      ❌      |      ❌       |
| `approve` |  ✅   |       ✅        |          ❌           |      ❌      |      ❌       |

Defined in `server/config/permissions.js` — change it there, never in routes.

## Dashboard & MIS

| Method | Path                     | Action | Returns |
| ------ | ------------------------ | ------ | ------- |
| GET    | `/dashboard`             | read   | `{ receivables, payables, jobs }` |
| GET    | `/reports/mis`           | read   | roll-up + per-job profit & `totals` |

## A. Billing & Receivables

| Method | Path                       | Action | Notes |
| ------ | -------------------------- | ------ | ----- |
| GET    | `/invoices`                | read   | list with `outstanding`, `overdue` |
| GET    | `/invoices/next-number`    | read   | suggested invoice no. for the form |
| GET    | `/invoices/:id`            | read   | single invoice |
| POST   | `/invoices`                | create | see body below |
| GET    | `/receivables`             | read   | invoiced / received / outstanding / overdue |
| GET    | `/receivables/ageing`      | read   | buckets: current, 1-30, 31-60, 60+ |
| POST   | `/invoices/:id/receipts`   | create | record a customer payment |
| GET    | `/payments`                | read   | all receipts, newest first |

**POST /invoices**
```json
{ "invoiceNo": "INV-202610-0005", "customerId": 1, "salesOrderId": 1,
  "subtotal": "10000", "taxAmount": "1800", "dueDate": "2026-11-30" }
```
`total` is computed server-side as `subtotal + taxAmount`. → `201`.

**POST /invoices/:id/receipts**
```json
{ "amount": 5000, "method": "BANK_TRANSFER", "referenceNo": "UTR123" }
```
`method` ∈ CASH, BANK_TRANSFER, UPI, CHEQUE, CREDIT, OTHER. Rejects amounts
over the outstanding balance (400). Updates invoice `paidAmount` + `status`.

## B. Payables & Expenses

| Method | Path                          | Action  | Notes |
| ------ | ----------------------------- | ------- | ----- |
| GET    | `/vendor-bills`               | read    | list with `matched`, `isExpense` |
| GET    | `/vendor-bills/:id`           | read    | single bill |
| POST   | `/vendor-bills`               | create  | enters as `SUBMITTED` |
| POST   | `/vendor-bills/:id/approve`   | approve | ADMIN / FINANCE_MANAGER only |
| POST   | `/vendor-bills/:id/match`     | update  | 2-way match to a PO |
| POST   | `/vendor-bills/:id/payments`  | create  | record a supplier payment |
| GET    | `/expenses`                   | read    | bills with no purchase order |
| POST   | `/expenses`                   | create  | direct expense |

**POST /vendor-bills**
```json
{ "billNo": "BILL-2026-001", "vendorId": 2, "purchaseOrderId": 1,
  "subtotal": "50000", "taxAmount": "9000", "dueDate": "2026-11-15" }
```

**POST /vendor-bills/:id/match** → `{ "poNumber": "PO-…" }`
Succeeds only when the bill total equals the PO total (else 400). Sets `MATCHED`.

## C. Costing & MIS

| Method | Path               | Action | Returns |
| ------ | ------------------ | ------ | ------- |
| GET    | `/jobs`            | read   | revenue, material/logistics/other cost, profit, margin per job |
| GET    | `/jobs/:id/costs`  | read   | full breakdown + PR → RFQ → PO audit trail |

Costing is **derived** — no extra tables:
`revenue` = invoices on the job's sales order; `costs` = purchase orders
reached via PurchaseRequest → RFQ of the same sales order, bucketed by
`Vendor.category` (material / transport→logistics / other).

## Example flow (record a receipt, then read the dashboard)

```powershell
$t = (Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/auth/login `
  -ContentType application/json `
  -Body '{"email":"accountant@yash.test","password":"<pw>"}').token
$h = @{ Authorization = "Bearer $t" }

Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/finance/invoices/1/receipts `
  -Headers $h -ContentType application/json -Body '{"amount":5000,"method":"UPI"}'

Invoke-RestMethod -Uri http://localhost:5000/api/finance/dashboard -Headers $h
```
