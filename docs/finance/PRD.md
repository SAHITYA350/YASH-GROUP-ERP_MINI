# Module 6 — Finance & Commercial — PRD

## Goal
Give YASH GROUP one place to see money in (receivables), money out (payables &
expenses), and whether each job made a profit (costing & MIS) — with strict
role-based access so people only reach what their job allows.

## Users & access
| Role (enum)             | Login                 | Can do in Finance |
| ----------------------- | --------------------- | ----------------- |
| `ADMIN`                 | admin@yash.test       | everything |
| `FINANCE_MANAGER`       | finance@yash.test     | read, create, update, approve |
| `BANK_OFFICE_EXECUTIVE` | accountant@yash.test  | read, create (invoices, receipts, bills) |
| `SALES_MANAGER`         | sales@yash.test       | **no finance access** |
| `BACK_OFFICER`          | viewer@yash.test      | read only |

Access is enforced server-side on every route (`config/permissions.js` +
`utils/auth.js`). Hiding a button in React is not security.

## Functional requirements

### A. Billing & Receivables
- FR-A1 Create a customer invoice with GST; `total = subtotal + tax`.
- FR-A2 Record partial/full customer receipts; reject over-payment.
- FR-A3 Show outstanding balance and overdue flag per invoice.
- FR-A4 Receivables summary + ageing buckets (current, 1-30, 31-60, 60+).

### B. Payables & Expenses
- FR-B1 Enter a supplier bill (starts `SUBMITTED`).
- FR-B2 Approve a bill (finance manager/admin only).
- FR-B3 2-way match a bill to its purchase order (totals must agree).
- FR-B4 Record supplier payments; track outstanding payable.
- FR-B5 Track direct expenses (vendor bills with no PO).

### C. Costing, Margin & MIS
- FR-C1 Per job: revenue, material, logistics, other cost, gross profit, margin.
- FR-C2 Derive all figures from existing tables — no new schema.
- FR-C3 Company-level MIS roll-up and finance dashboard.
- FR-C4 Dashboard totals must equal the underlying records (no double counting).

## Non-functional requirements
- **No schema changes** — reuse existing Prisma models only.
- **Idempotent seed** — safe to re-run; never duplicates.
- **Layered code** — routes/controllers/services/repositories so 4 members can
  work in one module without collisions.
- **Consistent errors** — every failure returns `{ message }` with the right
  status (400/401/403/404/409).

## Out of scope (for now)
- Multi-currency, tax filing/export, budgeting vs actuals beyond derived MIS,
  invoice PDF generation, and a separate Expense table.

## Acceptance
See `docs/finance/TEST_CASES.md`. The automated RBAC matrix must print
`RESULT: all tests PASSED` and the costing check must show margin 45%.
