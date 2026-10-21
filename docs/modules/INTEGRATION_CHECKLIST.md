# Integration Checklist — Module 6

Member 4 owns integration. Run this before merging the four feature branches
into `dev`, and again before `dev` → `main`.

## Backend integration

- [ ] `server/index.js` mounts every module router under `/api/<module>`.
- [ ] `modules/finance/finance.routes.js` mounts all 7 sub-routers
      (invoices, receivables, payments, vendor-bills, expenses, jobs) + the
      dashboard, MIS, receipts and bill-payments endpoints.
- [ ] Every route has `authenticate` **and** `authorize(module, action)`.
      No route trusts the client for permissions.
- [ ] `config/permissions.js` lists each role used by the team, and the role
      names match the `UserRole` enum exactly.
- [ ] No Prisma calls outside `repositories/`.
- [ ] Server boots with no errors: `cd server; npm start`.

## Data & schema

- [ ] `npx prisma validate` passes.
- [ ] No new tables/models were added without the DB owner's sign-off.
- [ ] `npx prisma db seed` runs clean and is idempotent (run twice → same counts).
- [ ] Costing math matches the seeded expectations (see below).

## Cross-member contracts

- [ ] Member 3's costing reads the same invoices Member 1 creates (revenue ties out).
- [ ] Member 4's dashboard totals equal the sum of the underlying invoices/bills —
      a payment or cost is never counted twice.
- [ ] Shared `utils/paymentCalculator.js` is the single source for outstanding/status.

## Automated RBAC + costing test

```powershell
cd server
npm start                                                   # terminal 1
powershell -ExecutionPolicy Bypass -File scripts\test-rbac.ps1   # terminal 2
```

- [ ] Output ends with `RESULT: all tests PASSED`.
- [ ] Job costing check prints:
      `revenue 200000 | material 80000 | logistics 10000 | other 20000 | profit 90000 | margin 45%`.

The script resets the two records it mutates (via `scripts/reset-test-data.js`)
so it can be re-run any number of times.

## Frontend integration

- [ ] `client/src/modules/finance/index.js` exports the finance routes and
      `App.jsx` mounts them.
- [ ] Each page calls its `api/*` wrapper (which attaches the JWT), not `fetch` directly.
- [ ] Role-gated buttons are hidden for read-only users **and** the API still
      returns 403 if called anyway (hiding a button is not security).
- [ ] `cd client; npm run dev` renders the dashboard with live numbers.

## Final gate

- [ ] `git status` shows no `.env` or secrets staged.
- [ ] All four members' branches merged into `dev` with conflicts resolved.
- [ ] This checklist fully ticked by Member 4 + one reviewer.
