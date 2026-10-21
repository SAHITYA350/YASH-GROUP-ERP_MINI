# Yash Earthing ERP — Module 1

Sales, CRM and order-management foundation for Yash Earthing Solutions. This is
a React/Vite client and Express/Prisma/PostgreSQL API; it never uses browser
storage as its data store.

## Implemented scope

- Cookie-session login/logout, bcrypt hashes, CSRF protection, login rate limit,
  role permissions and immutable audit records.
- Customers, enquiries, manual sales activities/follow-ups, catalogue browsing,
  quotations with Decimal totals, and transactional quotation-to-order conversion.
- Real Excel lead import/export. New leads are auto-assigned server-side to the
  active salesperson with the smallest open-lead workload; the client cannot set owners.
- Server-side filtering/pagination endpoints and a responsive sales dashboard.

## Local setup

1. Copy `.env.example` to `server/.env` and set a PostgreSQL `DATABASE_URL`.
2. In `server/`: `npm install`, `npm run db:generate`, then `npm run db:migrate`.
3. Create the one-time administrator:
   `npm run bootstrap:admin -- admin@example.com "a-long-unique-password" "Admin Name"`.
4. Optional labelled sample data: set `SEED_PASSWORD` (minimum 12 characters),
   then run `npm run db:seed` in `server/`.
5. Start the API: `npm run dev` in `server/`.
6. In `client/`: `npm install` then `npm run dev`.

The client is served on `http://localhost:5173`; the API defaults to port 3001.
Set `CLIENT_ORIGIN` when those origins differ.

## API

All protected routes are versioned under `/api/v1` and return `{ data }` or
`{ error: { code, message } }`.

- `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `GET /dashboard`
- `GET|POST /customers`, `GET|PATCH /customers/:id`
- `GET|POST /enquiries`, `GET|PATCH /enquiries/:id`, `POST /enquiries/:id/activities`
- `POST /enquiries/import` validates browser-parsed Excel rows and auto-assigns each lead.
- `GET /products`, `GET|POST /quotations`, `PATCH /quotations/:id/status`
- `POST /quotations/:id/sales-orders`, `GET /sales-orders`

State-changing requests require the `yash_csrf` token in `X-CSRF-Token`; the
provided client does this automatically.

## Security and operational notes

Use HTTPS and secure environment-specific cookie configuration in production.
The bootstrap command refuses to run after an administrator exists. Seed data is
sample data only. External email, WhatsApp and PDF services are intentionally not
claimed or simulated; interactions are manually recorded until provider adapters
are approved.

## Verification

`node --check` passed for the server source and `vite build` passed for the
client in the implementation environment. Database-backed integration tests need
a reachable PostgreSQL test database; see `docs/IMPLEMENTATION_PLAN.md` for
scope assumptions.
