# Module 6 — Test Cases

## Automated RBAC + costing matrix

Run it (server must be up on `http://localhost:5000`):

```powershell
cd server
npm start                                                    # terminal 1
powershell -ExecutionPolicy Bypass -File scripts\test-rbac.ps1   # terminal 2
```

The script first calls `scripts/reset-test-data.js` to restore the two records it
mutates, so it is safe to re-run any number of times. Last verified result:
**all 14 cases PASSED**, costing exact.

| # | Test                                              | Expected |
| - | ------------------------------------------------- | -------- |
| 1 | Unauthenticated user opens protected API          | 401 |
| 2 | Admin opens finance dashboard                     | 200 |
| 3 | Finance manager opens dashboard                   | 200 |
| 4 | Accountant opens dashboard                        | 200 |
| 5 | Viewer opens dashboard                            | 200 |
| 6 | Sales manager opens dashboard                     | 403 |
| 7 | Sales manager approves a vendor bill              | 403 |
| 8 | Viewer approves a vendor bill                     | 403 |
| 9 | Accountant approves a vendor bill                 | 403 |
| 10| Finance manager approves a vendor bill            | 200 |
| 11| Viewer creates an invoice                         | 403 |
| 12| Sales manager creates an invoice                  | 403 |
| 13| Accountant creates an invoice                     | 201 |
| 14| Viewer lists invoices (read allowed)              | 200 |

Role → login mapping used by the tests (see `docs/architecture/PROJECT_OVERVIEW.md`):
`ADMIN` = admin@, `FINANCE_MANAGER` = finance@, `BANK_OFFICE_EXECUTIVE` =
accountant@, `SALES_MANAGER` = sales@, `BACK_OFFICER` = viewer@ (all `@yash.test`).

## Job costing assertion (JOB-TEST-001)

| Metric          | Expected |
| --------------- | -------- |
| revenue         | 200000 |
| materialCost    | 80000 |
| logisticsCost   | 10000 |
| otherCost       | 20000 |
| profit          | 90000 |
| margin          | 45% |

## Manual / API smoke tests

| Scenario                                   | Endpoint                          | Expected |
| ------------------------------------------ | --------------------------------- | -------- |
| Receipt larger than outstanding balance    | `POST /invoices/:id/receipts`     | 400 |
| Bill total ≠ PO total on match             | `POST /vendor-bills/:id/match`    | 400 |
| Duplicate invoice number                   | `POST /invoices`                  | 409 |
| Approve an already-PAID bill               | `POST /vendor-bills/:id/approve`  | 400 |
| Receivables summary ties to invoice list   | `GET /receivables`                | sums match |
| Dashboard totals = sum of records          | `GET /dashboard`                  | no double count |
| MIS roll-up                                | `GET /reports/mis`                | `totals.grossMargin = 45` |

## Idempotency test (seed)

```powershell
cd server
npx prisma db seed
npx prisma db seed      # run again
```
Row counts for `user, customer, vendor, salesOrder, invoice, payment,
purchaseOrder, vendorBill, project, purchaseRequest, rFQ` must be identical
after the second run. Verified: unchanged after 3 consecutive runs.
