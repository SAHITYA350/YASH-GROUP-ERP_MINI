# Team Responsibilities — Module 6 (Finance & Commercial)

Four members, one shared repo, one feature branch each. Work independently,
integrate through `dev`. Assignments below are proposals for Module 6 — if a
member already owns another ERP module, keep that and treat this as their
Module 6 slice.

| Member | Module 6 slice          | Branch                       |
| ------ | ----------------------- | ---------------------------- |
| 1      | Billing & Receivables   | `feature/finance-billing`    |
| 2      | Payables & Expenses     | `feature/finance-payables`   |
| 3      | Costing & MIS           | `feature/finance-costing`    |
| 4      | Integration & Dashboard | `feature/finance-integration`|

## File ownership

"Owns" = you may edit freely. "Coordination" = ask before editing (shared).

### Member 1 — Billing & Receivables
- **Owns (server):** `modules/finance/routes/invoice.routes.js`,
  `routes/receivables.routes.js`, `controllers/invoice.controller.js`,
  `controllers/receivables.controller.js`, `services/invoice.service.js`,
  `services/receivables.service.js`, `repositories/invoice.repository.js`.
- **Owns (client):** `pages/InvoicesPage.jsx`, `InvoiceDetailsPage.jsx`,
  `ReceivablesPage.jsx`, `components/InvoiceTable.jsx`, `InvoiceForm.jsx`,
  `api/invoiceApi.js`, `api/receivablesApi.js`, `hooks/useInvoices.js`.
- **Models used:** `Invoice`, `Payment`, `Customer`, `SalesOrder`.

### Member 2 — Payables & Expenses
- **Owns (server):** `routes/vendorBill.routes.js`, `routes/expense.routes.js`,
  `controllers/vendorBill.controller.js`, `controllers/expense.controller.js`,
  `services/vendorBill.service.js`, `services/expense.service.js`,
  `repositories/vendorBill.repository.js`.
- **Owns (client):** `pages/VendorBillsPage.jsx`, `VendorBillDetailsPage.jsx`,
  `ExpensesPage.jsx`, `components/VendorBillTable.jsx`, `BillApprovalPanel.jsx`,
  `api/vendorBillApi.js`, `api/expenseApi.js`, `hooks/useVendorBills.js`.
- **Models used:** `VendorBill`, `Vendor`, `PurchaseOrder`, `GoodsReceipt`.

### Member 3 — Costing & MIS
- **Owns (server):** `routes/costing.routes.js`,
  `controllers/costing.controller.js`, `services/costing.service.js`,
  `repositories/costing.repository.js`.
- **Owns (client):** `pages/CostingPage.jsx`, `components/CostBreakdown.jsx`,
  `ProfitMarginCard.jsx`, `api/costingApi.js`.
- **Models used (read-only):** `Project`, `SalesOrder`, `PurchaseRequest`,
  `RFQ`, `PurchaseOrder`, `Invoice`, `Vendor`. Costing derives numbers from
  these — it writes nothing.

### Member 4 — Integration, Dashboard, Testing, Docs
- **Owns (server):** `routes/financeReport.routes.js`,
  `controllers/financeReport.controller.js`, `services/financeReport.service.js`,
  `services/payment.service.js`, `routes/payment.routes.js`,
  `controllers/payment.controller.js`, `repositories/payment.repository.js`,
  `scripts/test-rbac.ps1`, `scripts/reset-test-data.js`.
- **Owns (client):** `pages/FinanceDashboard.jsx`, `FinanceReportsPage.jsx`,
  `PaymentsPage.jsx`, `components/FinanceSidebar.jsx`, `FinanceStatCard.jsx`,
  `PaymentForm.jsx`, `DateRangeFilter.jsx`, `StatusBadge.jsx`,
  `api/paymentApi.js`, `api/financeReportApi.js`, `hooks/useFinanceDashboard.js`,
  `hooks/usePayments.js`, `modules/finance/index.js` (route wiring).
- **Also owns:** `docs/`, this file, and the integration checklist.

## Shared files — coordinate before editing (all members)

| File                              | Owner / rule                              |
| --------------------------------- | ----------------------------------------- |
| `prisma/schema.prisma`            | **Team lead only** (DB owner). No silent model/enum changes. |
| `config/permissions.js`           | Member 4 + lead. Adding a role = tell everyone. |
| `utils/auth.js`, `utils/prisma.js`, `utils/httpError.js`, `utils/asyncHandler.js` | Member 4 + lead. |
| `server/index.js`                 | Member 4 (mounts modules).                |
| `modules/finance/finance.routes.js` | Member 4 (aggregator that mounts sub-routers). |
| `modules/finance/validations/finance.validation.js` | whoever adds the field, but announce it. |
| `modules/finance/utils/*` (calculators) | Member 4 + lead — shared math, everyone depends on it. |
| `package.json` (either app)       | Member 4 + lead. New dependency = announce. |

## Dependencies between members

- Member 3 (costing) reads revenue that Member 1's invoices create → agree on
  the `Invoice`/`SalesOrder` link before costing numbers will be right.
- Member 4's dashboard consumes the summary functions from Members 1/2/3 →
  keep service function names stable, or tell Member 4.
- `payment.service.js` (Member 4) updates invoice balances (Member 1) and bill
  balances (Member 2) → the shared `utils/paymentCalculator.js` is the contract.

## How to test your slice before opening a PR

1. Backend: `cd server; npm start`, then hit your endpoints with a token
   (see `docs/api/FINANCE_API.md`).
2. Run the whole matrix: `powershell -ExecutionPolicy Bypass -File scripts\test-rbac.ps1`
   — it must print `RESULT: all tests PASSED`.
3. Frontend: `cd client; npm run dev`, open your page, confirm data renders and
   role-gated buttons match the API's 403 behaviour.
4. `npx prisma validate` if you touched the schema (only the DB owner should).
