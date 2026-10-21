# How to add a new module (copy this folder)

Adding a new ERP module (e.g. Inventory, HR, Production) takes 4 steps.

## 1. Copy this folder

```
modules/_template  ->  modules/inventory
```

## 2. Create two files inside it

**`inventory.service.js`** - all database queries and business logic
(imports the shared client with `import prisma from "../../utils/prisma.js"`).

**`inventory.routes.js`** - HTTP endpoints, each guarded by auth:

```js
import express from "express";
import { authenticate, authorize } from "../../utils/auth.js";
import service from "./inventory.service.js";

const router = express.Router();

// Read allowed for everyone who has the "inventory" module
router.get("/stock", authenticate, authorize("inventory", "read"), async (req, res) => {
  res.json(await service.getStock());
});

// Write actions are checked separately
router.post("/movements", authenticate, authorize("inventory", "create"), async (req, res) => {
  res.status(201).json(await service.recordMovement(req.body));
});

export default router;
```

## 3. Mount it in `index.js` (two lines)

```js
import inventoryRoutes from "./modules/inventory/inventory.routes.js";
app.use("/api/inventory", inventoryRoutes);
```

## 4. Give roles access in `config/permissions.js`

```js
INVENTORY_MANAGER: {
  modules: ["inventory"],
  actions: ["read", "create", "update"],
},
```

That's it. The `authenticate` + `authorize` middleware handles 401 (not
logged in) and 403 (role not allowed) automatically for every route.

## Conventions

- Role names must match the `UserRole` enum in `prisma/schema.prisma`.
- Money values: store as `Decimal`, pass strings to Prisma
  (`total: "118000"`), convert with `Number(...)` when displaying.
- Every number shown on a dashboard must come from the same service
  function, so totals never count the same record twice.
- Do not trust the frontend: every protected endpoint enforces its own
  permission, even if the button is hidden in React.
