# YASH Group ERP: Production and Quality

This repository contains a React/Vite client and an Express API backed by PostgreSQL and Prisma. The production API covers BOM revisions, production work orders, material issue, planning dashboards, and timelines. The quality API covers inspection recording, release decisions, and quality KPIs.

## Start the backend

Use Node.js 22.18 or newer and PostgreSQL. In `server`, create a `.env` file from `.env.example`, set `DATABASE_URL` to a PostgreSQL connection string, then run:

```sh
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

The API listens on port `7001` by default (or the port set by `PORT` in `server/.env`). Set `CLIENT_URL` to the client origin when it differs from `http://localhost:5000`. `GET /api/health` checks the process; `GET /api/ready` checks database connectivity.

## Start the client and load database records

In a second terminal, run the Vite client:

```sh
cd client
npm install
npm run dev
```

The Vite development server runs on port `5000` and proxies `/api` requests to `http://127.0.0.1:7001`, so the browser can load production and quality records from the backend without cross-origin configuration. Set `VITE_API_PROXY_TARGET` in the client environment to use another backend address. For a separately hosted API, set `VITE_API_URL` to its `/api` base URL.

The API reads database records through Prisma using `server/.env`'s `DATABASE_URL`. Production and quality routes are currently disabled until a trusted authentication layer is connected; requests to those module paths return `404` in this state. Once connected, the authentication layer must set `req.user` with the authenticated user's database role before mounting the routers. Production access is limited to `PRODUCTION_MANAGER`, `DISPATCH_OFFICER`, and `ADMIN`; quality access is limited to `QUALITY_INSPECTOR`, `PRODUCTION_MANAGER`, and `ADMIN`. The router-level role guards reject unauthenticated requests with `401` and authenticated users without an allowed role with `403`.

After applying migrations, populate the database with repeatable demo customers, products, work orders, inspections, and related production records by running this from `server`:

```sh
npm run db:seed
```

The seed only creates or refreshes records marked with `DEMO-` identifiers; running it again will not duplicate them. It is not run automatically. Verify `http://localhost:7001/api/ready` reports `READY`; the dashboard, work orders, and quality screens fetch their data from the API.

## Production API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/production/dashboard` | Production, quality, and BOM summary |
| GET | `/api/production/timeline?from=&to=` | Scheduled work orders |
| GET | `/api/production/planning/dashboard?from=&to=` | Planning dashboard, schedule, approvals, demand, capacity, and calendar |
| GET | `/api/production/planning/calendar?from=&to=` | Daily production schedule calendar |
| GET | `/api/production/planning/forecast?from=&to=` | Sales demand against planned production by product |
| GET | `/api/production/planning/capacity?from=&to=` | Machine capacity, assigned load, and unassigned orders |
| GET | `/api/production/orders?page=&limit=&status=&priority=` | Filtered, paginated work orders |
| GET | `/api/production/orders/stats` | Production totals and status breakdown |
| POST | `/api/production/orders` | Create a work order from a sales order and optional released BOM |
| GET | `/api/production/orders/:id` | Work order detail |
| PATCH | `/api/production/orders/:id` | Update dates, quantities, notes, priority, or valid status transition |
| PATCH | `/api/production/orders/:id/plan-approval` | Submit (`SUBMIT`), approve (`APPROVE`), or reject (`REJECT`) a plan |
| DELETE | `/api/production/orders/:id` | Delete a draft work order without inspections |
| POST | `/api/production/orders/:id/issue-material` | Issue planned components against available stock |
| GET | `/api/production/orders/:id/tracking` | Operation routing and production log |
| POST | `/api/production/orders/:id/track` | Record production output and downtime |
| PATCH | `/api/production/operations/:operationId` | Advance or block a routing operation |
| GET | `/api/production/orders/:id/material-consumption` | Work order component issue and consumption details |
| POST | `/api/production/orders/:id/consume-material` | Record consumption against issued components |
| GET | `/api/production/workforce` | Active production and quality workers |
| GET | `/api/production/allocations` | Worker allocations |
| POST | `/api/production/orders/:id/workers` | Allocate a worker to a work order |
| DELETE | `/api/production/allocations/:allocationId` | Remove a worker allocation |
| GET/POST | `/api/production/machines` | List or create machines |
| PATCH | `/api/production/machines/:machineId` | Update machine details or status |
| POST | `/api/production/orders/:id/machines` | Assign a machine to a work order |
| DELETE | `/api/production/machine-assignments/:assignmentId` | Remove a machine assignment |
| GET | `/api/production/sales-orders` | Sales orders available for production planning |
| GET | `/api/production/products` | Active manufactured products |
| GET/POST | `/api/production/bom` | List or create BOM revisions |
| GET/PATCH/DELETE | `/api/production/bom/:id` | BOM detail, update/release, or delete a draft |
| POST | `/api/production/bom/:id/items` | Upsert draft BOM components |
| POST | `/api/production/bom/:id/operations` | Upsert draft routing operations |
| GET | `/api/production/bom/stats` | BOM status and average cost summary |
| GET/POST | `/api/production/alerts` | List and create production/quality alerts |
| PATCH | `/api/production/alerts/:id` | Acknowledge or resolve an alert |
| GET/POST | `/api/production/machines/maintenance` | List and schedule preventive maintenance or breakdown work |
| PATCH | `/api/production/machines/maintenance/:id` | Progress maintenance and synchronize machine availability |
| GET/POST | `/api/production/costs` | List or record actual material, labor, machine, overhead, waste, rework, and scrap costs |
| GET | `/api/production/costs/summary?workOrderId=` | Actual cost totals by work order and cost type |
| GET | `/api/production/analytics?from=&to=` | Production, quality, on-time completion, downtime, and product summaries |
| GET | `/api/production/traceability?productId=&batchNumber=` | Link work-order stock movements to orders, production entries, inspections, and defects |
| GET/POST | `/api/production/audit` | Query or record production-module audit events |

Work order status flow: `DRAFT → PLANNED → RELEASED → IN_PROGRESS → QC_HOLD/COMPLETED`. Material issue is allowed only after release. Stock decrement, work order component quantity, and inventory movement are recorded atomically.

Planning approval flow: `DRAFT → PENDING → APPROVED` or `REJECTED`. Approval sets a draft work order to `PLANNED`; a plan must have start and deadline dates before submission. Changes to an approved plan's quantity, dates, or priority reset its approval and require resubmission. Forecasts use confirmed, processing, and ready-for-dispatch sales orders with expected delivery dates in the selected window, and compare manufactured-product demand with available stock and linked work orders. Capacity compares assigned production quantity to machine capacity-per-shift across one assumed shift per calendar day in the selected window.

## Quality API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/quality/stats` | Inspection totals, pass rate, recent records |
| GET | `/api/quality/inspections?page=&limit=&status=&workOrderId=` | Filtered, paginated inspections |
| POST | `/api/quality/inspections` | Record inspection quantities and evidence |
| GET | `/api/quality/inspections/:id` | Inspection and linked production detail |
| PATCH | `/api/quality/inspections/:id` | Correct an unreleased inspection or release a passing/held result |
| GET | `/api/quality/defects?workOrderId=&status=` | Defect and nonconformance register |
| POST | `/api/quality/inspections/:id/defects` | Record a defect against an inspection |
| PATCH | `/api/quality/defects/:defectId` | Update disposition or resolution |
| GET | `/api/quality/rework?workOrderId=&status=` | Rework queue |
| POST | `/api/quality/defects/:defectId/rework` | Create rework for a defect |
| PATCH | `/api/quality/rework/:reworkId` | Update or complete rework |
| GET | `/api/quality/reports?from=&to=` | Quality report and defect summaries for a date range |
| GET/POST | `/api/quality/ncr` | List or open a non-conformance/CAPA record |
| PATCH | `/api/quality/ncr/:id` | Track investigation, corrective/preventive action, verification, and closure |

Inspection quantities must reconcile exactly (`accepted + rejected = inspected`) and cumulative inspected output cannot exceed the work order plan. Releasing an inspection is final. Production good/rejected quantities are updated in the same transaction as inspection changes.

## API response and development notes

Responses use `{ success, data, message }` with `total`, `page`, `limit`, and `pages` for paginated collections. Errors use HTTP status codes and JSON messages. There is no authentication middleware in this mini project yet; `req.user` is optional, so deployment should add ERP authentication and role authorization before exposing write endpoints.
