import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productionRoutes from "./src/modules/production/routes/production.routes.js";
import qualityRoutes from "./src/modules/quality/routes/quality.routes.js";
import {
  errorHandler,
  notFoundHandler,
} from "./src/shared/middleware/errorHandler.js";
import { inspectSchemaReadiness } from "./src/shared/database/schemaReadiness.js";
import prisma from "./src/shared/database/prisma.js";

dotenv.config({});

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────
// Production & Quality Module
app.use("/api/production", productionRoutes);
app.use("/api/quality", qualityRoutes);

// ─── Health Check ────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "YASH-GROUP ERP — Production & Quality API",
    timestamp: new Date().toISOString(),
    endpoints: {
      production: {
        dashboard: "GET  /api/production/dashboard",
        timeline: "GET  /api/production/timeline",
        planning: "GET  /api/production/planning/dashboard",
        calendar: "GET  /api/production/planning/calendar",
        forecast: "GET  /api/production/planning/forecast",
        capacity: "GET  /api/production/planning/capacity",
        planApproval: "PATCH /api/production/orders/:id/plan-approval",
        stats: "GET  /api/production/orders/stats",
        orders: "GET  /api/production/orders",
        createOrder: "POST /api/production/orders",
        updateOrder: "PATCH /api/production/orders/:id",
        deleteOrder: "DELETE /api/production/orders/:id",
        issueMat: "POST /api/production/orders/:id/issue-material",
        bomStats: "GET  /api/production/bom/stats",
        bom: "GET  /api/production/bom",
        createBom: "POST /api/production/bom",
        updateBom: "PATCH /api/production/bom/:id",
        deleteBom: "DELETE /api/production/bom/:id",
        bomItems: "POST /api/production/bom/:id/items",
        bomOperations: "POST /api/production/bom/:id/operations",
        tracking: "GET  /api/production/orders/:id/tracking",
        trackOutput: "POST /api/production/orders/:id/track",
        consume: "POST /api/production/orders/:id/consume-material",
        workers: "GET  /api/production/workforce",
        allocations: "GET  /api/production/allocations",
        machines: "GET  /api/production/machines",
        salesOrders: "GET  /api/production/sales-orders",
        products: "GET  /api/production/products",
      },
      quality: {
        stats: "GET  /api/quality/stats",
        inspections: "GET  /api/quality/inspections",
        createInspection: "POST /api/quality/inspections",
        getInspection: "GET  /api/quality/inspections/:id",
        updateInspection: "PATCH /api/quality/inspections/:id",
        defects: "GET  /api/quality/defects",
        createDefect: "POST /api/quality/inspections/:id/defects",
        rework: "GET  /api/quality/rework",
        createRework: "POST /api/quality/defects/:defectId/rework",
        reports: "GET  /api/quality/reports",
      },
    },
  });
});

app.get("/api/ready", async (_req, res) => {
  try {
    const readiness = await inspectSchemaReadiness(prisma);
    return res.status(readiness.ready ? 200 : 503).json({
      success: readiness.ready,
      status: readiness.ready ? "READY" : "NOT_READY",
      message: readiness.ready
        ? "Database schema and migrations are ready."
        : "Database schema or migration history requires reconciliation.",
      ...readiness,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[READINESS_CHECK_FAILED]", err.message);
    return res.status(503).json({
      success: false,
      status: "NOT_READY",
      database: "unavailable",
      message: "Unable to validate database schema and migration readiness.",
    });
  }
});

app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏭  YASH-GROUP ERP — Production & Quality API`);
  console.log(`🚀  Server running on http://localhost:${PORT}`);
  console.log(`📋  Health: http://localhost:${PORT}/api/health\n`);
});

export default app;
