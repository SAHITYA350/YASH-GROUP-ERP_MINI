// ============================================================================
// YASH GROUP ERP - API entry point.
//
// Folder layout (each module is self-contained - copy _template to add one):
//   config/permissions.js   -> RBAC map (roles -> modules -> actions)
//   utils/prisma.js         -> shared Prisma client
//   utils/auth.js           -> authenticate + authorize middleware
//   modules/<name>/         -> <name>.routes.js + <name>.service.js
//
// To add a new module:
//   1. Copy modules/_template (see its README).
//   2. Mount it below with one line.
//   3. Add the module name to config/permissions.js for the roles that may
//      open it.
// ============================================================================

import "dotenv/config";
import express from "express";
import cors from "cors";

import financeRoutes from "./modules/finance/finance.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import leadRoutes from "./modules/leads/lead.routes.js";
import serviceRoutes from "./modules/services/service.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    name: "YASH GROUP ERP API",
    status: "running",
    modules: ["finance", "users", "leads", "services"],
  });
});

// ---- Modules (add new ones here) ----
app.use("/api/finance", financeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/services", serviceRoutes);

// ---- 404 ----
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ---- Central error handler (turns thrown httpError(status) into JSON) ----
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[error]", err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`YASH GROUP ERP API running on http://localhost:${PORT}`);
});
