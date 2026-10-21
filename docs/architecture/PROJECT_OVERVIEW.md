# YASH GROUP ERP MINI — Project Overview

## What this project is

A multi-module ERP for YASH GROUP. One shared repository, two apps:

| App      | Folder    | Stack                                        |
| -------- | --------- | -------------------------------------------- |
| Backend  | `server/` | Node.js, Express 5, Prisma ORM, Neon PostgreSQL |
| Frontend | `client/` | React 19, Vite                               |

## Backend architecture (how a request flows)

```
HTTP request
   │
   ▼
server/index.js                     ← mounts every module under /api/<module>
   │
   ▼
modules/<name>/…routes.js            ← URLs + which role may call them
   │        authenticate  (utils/auth.js — checks the Bearer JWT)
   │        authorize     (config/permissions.js — checks the role)
   ▼
modules/<name>/controllers/…        ← HTTP in / HTTP out, no business logic
   │
   ▼
modules/<name>/services/…           ← business rules + calculations
   │
   ▼
modules/<name>/repositories/…       ← the ONLY files that talk to Prisma
   │
   ▼
Neon PostgreSQL (prisma/schema.prisma)
```

Shared pieces (used by every module — do not duplicate them):

| File                      | Purpose                                             |
| ------------------------- | --------------------------------------------------- |
| `server/utils/prisma.js`  | Single shared Prisma client                          |
| `server/utils/auth.js`    | `authenticate` (JWT) + `authorize(module, action)`   |
| `server/utils/asyncHandler.js` | Wraps async controllers so errors reach the central handler |
| `server/utils/httpError.js`    | `httpError(status, message)` — throw it, JSON comes out |
| `server/config/permissions.js` | The ONE role → module → action map (RBAC truth)  |

## Roles (from `UserRole` enum in `prisma/schema.prisma`)

| Login (seeded)            | Role                    | Finance access                       |
| ------------------------- | ----------------------- | ------------------------------------ |
| `admin@yash.test`         | `ADMIN`                 | everything                           |
| `finance@yash.test`       | `FINANCE_MANAGER`       | read, create, update, **approve**    |
| `accountant@yash.test`    | `BANK_OFFICE_EXECUTIVE` | read, create (no approve/update)     |
| `sales@yash.test`         | `SALES_MANAGER`         | **none** (403 on every finance API)  |
| `viewer@yash.test`        | `BACK_OFFICER`          | read only                            |

All five test accounts use the password in `server/.env` → `SEED_TEST_PASSWORD`.
`.env` is git-ignored — never commit it.

## Existing modules

| Module             | Status                          | Where                                  |
| ------------------ | ------------------------------- | -------------------------------------- |
| Auth               | working (JWT login)             | `server/modules/auth/`                 |
| Module 6 Finance   | working, RBAC-tested (14 cases) | `server/modules/finance/`              |
| Module template    | guide for new modules           | `server/modules/_template/README.md`   |
| Client (React)     | Vite starter, finance scaffold  | `client/src/modules/finance/`          |

## Database

- Neon PostgreSQL, URL in `server/.env` (`DATABASE_URL`).
- Schema was synced with `prisma db push` (no migrations folder yet).
- **The schema is owned by the team lead** — see `docs/team/GIT_WORKFLOW.md`.
- `server/prisma/seed.js` is idempotent (upserts on unique keys): run it as
  often as you like, it never duplicates rows.

## Run it locally

```powershell
# 1. Backend (terminal 1)
cd server
npm install
npx prisma generate
npx prisma db seed        # optional: loads test users + Module 6 data
npm start                 # http://localhost:5000

# 2. Frontend (terminal 2)
cd client
npm install
npm run dev               # http://localhost:5173
```

## Verify it works

```powershell
cd server
npm start                                              # terminal 1
powershell -ExecutionPolicy Bypass -File scripts\test-rbac.ps1   # terminal 2
```

Expected: `RESULT: all tests PASSED` (14 RBAC cases + job-costing math).
