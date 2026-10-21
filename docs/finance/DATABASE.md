# Module 6 — Database (existing Prisma models, no new tables)

Source of truth: `server/prisma/schema.prisma`. Money fields are
`Decimal @db.Decimal(14,2)`. This module **reuses** the models below — it added
nothing to the schema.

## Invoice
| Field          | Type            | Notes |
| -------------- | --------------- | ----- |
| `id`           | Int (PK)        | autoincrement |
| `invoiceNo`    | String          | **unique** |
| `customerId`   | Int             | → `Customer` (Restrict) |
| `salesOrderId` | Int             | → `SalesOrder` (Restrict) |
| `status`       | `InvoiceStatus` | default `DRAFT` |
| `issueDate`    | DateTime?       | |
| `dueDate`      | DateTime?       | drives overdue + ageing |
| `subtotal`     | Decimal(14,2)   | |
| `taxAmount`    | Decimal(14,2)   | GST |
| `total`        | Decimal(14,2)   | = subtotal + taxAmount (set in service) |
| `paidAmount`   | Decimal(14,2)   | updated when a receipt is applied |
| `notes`        | String?         | |
| relations      |                 | `items InvoiceItem[]`, `payments Payment[]` |

`enum InvoiceStatus { DRAFT ISSUED PARTIALLY_PAID PAID OVERDUE VOID }`

## InvoiceItem
`id, invoiceId → Invoice (Cascade), description, quantity Decimal(12,3),
unitPrice, taxAmount, lineTotal`. Line-level detail for an invoice.

## Payment (customer receipt)
| Field         | Type            | Notes |
| ------------- | --------------- | ----- |
| `id`          | Int (PK)        | |
| `paymentNo`   | String          | **unique** |
| `invoiceId`   | Int             | → `Invoice` (Restrict) |
| `amount`      | Decimal(14,2)   | |
| `method`      | `PaymentMethod` | |
| `referenceNo` | String?         | UTR / cheque no. |
| `receivedAt`  | DateTime        | default now() |
| `notes`       | String?         | |

`enum PaymentMethod` — see schema (CASH, BANK_TRANSFER, UPI, CHEQUE, …). The
validation layer whitelists: CASH, BANK_TRANSFER, UPI, CHEQUE, CREDIT, OTHER.

## VendorBill (supplier bill **and** expense)
| Field             | Type         | Notes |
| ----------------- | ------------ | ----- |
| `id`              | Int (PK)     | |
| `billNo`          | String       | **unique** |
| `vendorId`        | Int          | → `Vendor` (Restrict) |
| `purchaseOrderId` | Int?         | → `PurchaseOrder` (SetNull). **null ⇒ expense** |
| `status`          | `BillStatus` | default `DRAFT` |
| `billDate`        | DateTime?    | |
| `dueDate`         | DateTime?    | |
| `subtotal`        | Decimal(14,2)| |
| `taxAmount`       | Decimal(14,2)| |
| `total`           | Decimal(14,2)| |
| `paidAmount`      | Decimal(14,2)| |

`enum BillStatus { DRAFT SUBMITTED MATCHED APPROVED PARTIALLY_PAID PAID REJECTED }`

> There is **no separate Expense model** — an expense is a `VendorBill` with
> `purchaseOrderId == null`. `expense.service.js` filters on exactly that.

## Costing chain (read-only — costing writes nothing)
`Project` (1) → `SalesOrder` (via project) → `Invoice[]` gives **revenue**.
`SalesOrder` → `PurchaseRequest` → `RFQ` → `PurchaseOrder[]` gives **costs**,
bucketed by `Vendor.category`:
- contains `material` → material cost
- contains `transport` / `logistic` / `freight` → logistics cost
- otherwise → other cost

Gross profit = revenue − (material + logistics + other); margin = profit ÷ revenue × 100.

## Seeding & idempotency
`server/prisma/seed.js` upserts every row on its unique key (`email`,
`invoiceNo`, `billNo`, `poNumber`, project/order codes). Re-running never
duplicates. Run: `npx prisma db seed` (or `npm run seed`).
