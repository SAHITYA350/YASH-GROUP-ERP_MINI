# Module 6 — Workflows

Step-by-step business flows. Each step names the endpoint and the file that
implements it, so any member can trace a screen back to the code.

## Workflow A — Billing & Receivables (Member 1)

**Issue an invoice**
1. `GET /api/finance/invoices/next-number` → suggested `invoiceNo`.
2. `POST /api/finance/invoices` (create) — service sets `status = ISSUED`,
   `total = subtotal + taxAmount`, `paidAmount = 0`.
   - Files: `routes/invoice.routes.js` → `controllers/invoice.controller.js` →
     `services/invoice.service.js` → `repositories/invoice.repository.js`.

**Record a customer receipt**
3. `POST /api/finance/invoices/:id/receipts` (create) — validates the amount
   does not exceed the outstanding balance, creates a `Payment`, updates the
   invoice `paidAmount`, and sets `PARTIALLY_PAID` or `PAID`.
   - Files: `finance.routes.js` (nested route) → `controllers/payment.controller.js`
     → `services/payment.service.js` → `repositories/payment.repository.js`.

**Track receivables**
4. `GET /api/finance/receivables` → invoiced / received / outstanding / overdue.
5. `GET /api/finance/receivables/ageing` → current, 1-30, 31-60, 60+ buckets.

## Workflow B — Payables & Expenses (Member 2)

**Enter a vendor bill**
1. `POST /api/finance/vendor-bills` (create) — `status = SUBMITTED`,
   `total = subtotal + taxAmount`.

**Approve it** (finance manager / admin only)
2. `POST /api/finance/vendor-bills/:id/approve` (approve) — only allowed from
   `DRAFT`/`SUBMITTED`/`MATCHED`; sets `APPROVED`. A sales manager or viewer gets `403`.

**Match to a purchase order (2-way match)**
3. `POST /api/finance/vendor-bills/:id/match` (update) — body `{ poNumber }`;
   succeeds only when bill total == PO total, else `400`. Sets `MATCHED`.

**Pay the supplier**
4. `POST /api/finance/vendor-bills/:id/payments` (create) — updates `paidAmount`
   and status, same shared calculator as receipts.

**Record a direct expense**
5. `POST /api/finance/expenses` (create) — a `VendorBill` forced to
   `purchaseOrderId = null`; shows under `GET /api/finance/expenses`.

## Workflow C — Costing, Margin & MIS (Members 3 & 4)

**Per-job costing**
1. `GET /api/finance/jobs` → one row per project: revenue, material/logistics/
   other cost, total cost, profit, margin.
2. `GET /api/finance/jobs/:id/costs` → full breakdown incl. the
   PR → RFQ → PO audit trail for each cost line.
   - Files: `routes/costing.routes.js` → `controllers/costing.controller.js` →
     `services/costing.service.js` → `repositories/costing.repository.js`.

**Dashboard & MIS**
3. `GET /api/finance/dashboard` → `{ receivables, payables, jobs }` — assembled
   from the same services above, so it can never disagree with the pages.
4. `GET /api/finance/reports/mis` → company roll-up (`totals`) + per-job rows.
   - Files: `controllers/financeReport.controller.js` → `services/financeReport.service.js`.

## Money-movement guardrails (all workflows)

- Over-payment is rejected (`canApply`) — you can never pay more than the balance.
- `outstanding` and status come from `utils/paymentCalculator.js` only, so the
  dashboard, invoice list and bill list always agree.
- Every endpoint is `authenticate` + `authorize`; a denied role gets `403`, an
  anonymous caller gets `401`.
