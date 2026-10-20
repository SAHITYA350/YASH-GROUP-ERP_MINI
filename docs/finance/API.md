# Module 6 — API

The full, canonical endpoint reference lives in
[`docs/api/FINANCE_API.md`](../api/FINANCE_API.md) — every route, method,
required action, request body and status code.

This file only summarises the endpoint groups so the `docs/finance/` set stays
self-contained. Do not duplicate the tables here; edit the canonical file.

| Group                | Base path                       | Endpoints |
| -------------------- | ------------------------------- | --------- |
| Dashboard & MIS      | `/api/finance`                  | `GET /dashboard`, `GET /reports/mis` |
| Billing & Receivables| `/api/finance/invoices`, `/receivables`, `/payments` | list, next-number, get, create, receipts, ageing |
| Payables & Expenses  | `/api/finance/vendor-bills`, `/expenses` | list, get, create, approve, match, payments |
| Costing              | `/api/finance/jobs`             | `GET /jobs`, `GET /jobs/:id/costs` |

All endpoints require `Authorization: Bearer <token>` from `POST /api/auth/login`
and are guarded by `authenticate` + `authorize("finance", <action>)`.

Quick test once the server is running:

```powershell
$t = (Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/auth/login `
  -ContentType application/json `
  -Body '{"email":"admin@yash.test","password":"<SEED_TEST_PASSWORD>"}').token
Invoke-RestMethod -Uri http://localhost:5000/api/finance/dashboard -Headers @{Authorization="Bearer $t"}
```
