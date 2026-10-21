import "dotenv/config";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────
// Mount the role-guarded module routers after trusted authentication sets req.user.

// ─── Health Check ────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "YASH-GROUP ERP — Production & Quality API (module routes disabled pending authentication)",
    timestamp: new Date().toISOString(),
    moduleAccess: {
      enabled: false,
      message: "Production and quality routes are disabled until trusted authentication is connected.",
    },
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
    const { default: prisma } = await import("./src/Config/prisma.js");
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({ status: "READY", database: "connected", timestamp: new Date().toISOString() });
  } catch (err) {
    return res.status(503).json({ status: "NOT_READY", database: "unavailable", message: "Database connection failed." });
  }
});

// ─── 404 Handler ─────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global Error Handler ─────────────────────
app.use((err, req, res, _next) => {
  console.error("[ERROR]", err.stack || err.message);
  const status = err.status || (err.type === "entity.parse.failed" ? 400 : 500);
  res.status(status).json({ success: false, message: status >= 500 ? "Internal server error." : err.message });
});

// ─── Start Server ─────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏭  YASH-GROUP ERP — Production & Quality API`);
  console.log(`🚀  Server running on http://localhost:${PORT}`);
  console.log(`📋  Health: http://localhost:${PORT}/api/health\n`);
});

export default app;
