# Folder Structure — YASH GROUP ERP MINI

Real paths from the repository. New code goes in the matching layer; do not
invent parallel folders.

```
YASH-GROUP-ERP_MINI/
├── client/                              # React 19 + Vite frontend
│   └── src/
│       ├── App.jsx, main.jsx, index.css  # app shell (Member 4 wires routes here)
│       └── modules/
│           └── finance/                  # MODULE 6 frontend (scaffold present)
│               ├── pages/                # one .jsx per screen
│               ├── components/           # reusable UI pieces
│               ├── api/                  # fetch wrappers (one per resource)
│               ├── hooks/                # data-loading hooks
│               ├── utils/                # currency / date / calc helpers
│               ├── validation/           # client-side form validation
│               └── index.js              # module exports + route table
│
├── server/                              # Express 5 backend
│   ├── index.js                         # entry point; mounts /api/<module>
│   ├── config/
│   │   └── permissions.js               # RBAC map (role → modules → actions)
│   ├── utils/                           # SHARED across all modules
│   │   ├── prisma.js                     # single Prisma client
│   │   ├── auth.js                       # authenticate + authorize middleware
│   │   ├── asyncHandler.js               # async error wrapper
│   │   └── httpError.js                  # httpError(status, message)
│   ├── modules/
│   │   ├── _template/README.md           # copy this to add a new module
│   │   ├── auth/auth.routes.js           # login (JWT)
│   │   └── finance/                      # MODULE 6 backend
│   │       ├── finance.routes.js         # aggregator: mounts the sub-routers
│   │       ├── routes/                   # URLs + role guards (thin)
│   │       │   ├── invoice.routes.js
│   │       │   ├── receivables.routes.js
│   │       │   ├── payment.routes.js
│   │       │   ├── vendorBill.routes.js
│   │       │   ├── expense.routes.js
│   │       │   ├── costing.routes.js
│   │       │   └── financeReport.routes.js
│   │       ├── controllers/              # HTTP in/out, no business logic
│   │       ├── services/                 # business rules + calculations
│   │       ├── repositories/             # the ONLY Prisma calls
│   │       ├── validations/              # request validation → httpError(400)
│   │       │   └── finance.validation.js
│   │       └── utils/                    # module-local helpers
│   │           ├── invoiceNumber.js
│   │           ├── paymentCalculator.js  # shared money math (outstanding, status)
│   │           └── taxCalculator.js
│   ├── prisma/
│   │   ├── schema.prisma                 # shared DB schema (DB owner only)
│   │   └── seed.js                       # idempotent seed (users + Module 6 data)
│   ├── scripts/
│   │   ├── test-rbac.ps1                 # 14-case RBAC matrix + costing check
│   │   └── reset-test-data.js            # resets records the matrix mutates
│   ├── .env                             # DATABASE_URL, JWT_SECRET, SEED_TEST_PASSWORD (git-ignored)
│   └── package.json                      # "prisma": { "seed": "node prisma/seed.js" }
│
├── docs/
│   ├── architecture/                     # PROJECT_OVERVIEW.md, FOLDER_STRUCTURE.md
│   ├── api/                              # FINANCE_API.md
│   ├── team/                             # MEMBER_RESPONSIBILITIES.md, GIT_WORKFLOW.md
│   ├── modules/                          # FINANCE_MODULE_6.md, INTEGRATION_CHECKLIST.md
│   └── finance/                          # PRD.md, WORKFLOWS.md, DATABASE.md, TEST_CASES.md
│
└── README.md                             # how to run everything
```

## The 6-layer backend rule

Every finance feature is split across these layers. Follow the same pattern for
any new module so all four members read code the same way.

| Layer        | Folder          | Responsibility                          | May call                |
| ------------ | --------------- | --------------------------------------- | ----------------------- |
| Route        | `routes/`       | URL + `authenticate` + `authorize`      | controller              |
| Controller   | `controllers/`  | parse req, send res, status codes       | service                 |
| Service      | `services/`     | business rules, calculations            | repository, other services |
| Repository   | `repositories/` | Prisma queries only                     | `utils/prisma.js`       |
| Validation   | `validations/`  | reject bad input with `httpError(400)`  | —                       |
| Utils        | `utils/`        | pure helpers (money, tax, numbering)    | —                       |

**Do not** call Prisma from a controller or route. **Do not** put business rules
in a repository. Keeping this discipline is what lets four people work in the
same module without collisions.

## Adding a new module (e.g. Inventory)

1. Copy `server/modules/_template/` → `server/modules/inventory/` and build the
   six layers inside it.
2. Mount it in `server/index.js`:
   `app.use("/api/inventory", require("./modules/inventory/inventory.routes"));`
3. Add `"inventory"` to the right roles in `server/config/permissions.js`.
4. Mirror the frontend under `client/src/modules/inventory/`.

See `server/modules/_template/README.md` for the full walkthrough.
