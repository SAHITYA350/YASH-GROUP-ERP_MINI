# Module 6 — Finance & Commercial

Three workflows, one shared database, RBAC-protected end to end. Built entirely
on the existing Prisma schema — **no new tables were added**.

## A. Billing & Receivables  (Member 1)

- Customer invoices with GST: `total = subtotal + taxAmount`.
- Statuses: `ISSUED` → `PARTIALLY_PAID` → `PAID`, plus `OVERDUE` when past due
  date with money still owed.
- Customer receipts (`Payment`) reduce the invoice balance; over-payment is
  rejected.
- Outstanding = `total − paidAmount`; ageing buckets: current, 1-30, 31-60, 60+.
- Models: `Invoice`, `Payment`, `Customer`, `SalesOrder`.

## B. Payables & Expenses  (Member 2)

- Vendor bills enter as `SUBMITTED`, then `APPROVED` (finance manager/admin),
  then optionally `MATCHED` to a purchase order (2-way match: totals must agree).
- Supplier payments reduce the bill balance (`PARTIALLY_PAID` → `PAID`).
- Expenses are vendor bills **without** a purchase order — same `VendorBill`
  model, filtered by `purchaseOrderId == null`. No separate Expense table.
- Models: `VendorBill`, `Vendor`, `PurchaseOrder`, `GoodsReceipt`.

## C. Costing, Margin & MIS  (Member 3 + Member 4)

- Per job (`Project`): revenue, material cost, logistics cost, other cost,
  gross profit, margin %.
- **Derived, not stored** — follows the chain:
  `Project → SalesOrder → PurchaseRequest → RFQ → PurchaseOrder`, and
  `Project → SalesOrder → Invoice` for revenue.
- Costs are bucketed by `Vendor.category`: contains "material" → material;
  "transport"/"logistic"/"freight" → logistics; anything else → other.
- MIS report rolls every job up into company totals.
- Models (read-only): `Project`, `SalesOrder`, `PurchaseRequest`, `RFQ`,
  `PurchaseOrder`, `Invoice`, `Vendor`.

## Seeded test numbers (`prisma/seed.js`)

| Workflow               | Record             | Amount    |
| ---------------------- | ------------------ | --------- |
| Customer invoice       | INV-TEST-001       | ₹1,18,000 |
| Payment received       | for INV-TEST-001   | ₹50,000   |
| Outstanding receivable | remaining balance  | ₹68,000   |
| Vendor bill            | BILL-TEST-001      | ₹59,000   |
| Vendor payment         | against bill       | ₹20,000   |
| Outstanding payable    | remaining bill     | ₹39,000   |
| Job revenue            | JOB-TEST-001       | ₹2,00,000 |
| Material cost          | JOB-TEST-001       | ₹80,000   |
| Logistics cost         | JOB-TEST-001       | ₹10,000   |
| Other job costs        | JOB-TEST-001       | ₹20,000   |
| Gross profit           | revenue − costs    | ₹90,000   |
| Gross margin           | profit ÷ revenue   | 45%       |

The seed is idempotent (upserts on unique keys) — running it repeatedly never
duplicates rows. Verified: identical counts after 3 consecutive runs.

## Server files

```
server/modules/finance/
├── finance.routes.js            # aggregator
├── routes/       (7 files)      # URLs + role guards
├── controllers/  (7 files)      # HTTP in/out
├── services/     (7 files)      # business rules
├── repositories/ (4 files)      # Prisma queries
├── validations/finance.validation.js
└── utils/        (invoiceNumber, paymentCalculator, taxCalculator)
```

## Client files (scaffold)

```
client/src/modules/finance/
├── pages/        (10 screens)
├── components/   (11 reusable pieces)
├── api/          (7 fetch wrappers)
├── hooks/        (4 data hooks)
├── utils/        (currency, dateFormat, financeCalculations)
├── validation/financeValidation.js
└── index.js      # route table + exports
```

See `docs/api/FINANCE_API.md` for every endpoint and `docs/finance/TEST_CASES.md`
for the acceptance tests.
