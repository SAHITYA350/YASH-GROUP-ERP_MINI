import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getStats,
  issueMaterial,
} from "../controllers/productionOrder.controller.js";
import {
  getAllBOMs,
  getBOMById,
  createBOM,
  updateBOM,
  deleteBOM,
  upsertItems,
  upsertOperations,
  getBOMStatsSummary,
} from "../controllers/bom.controller.js";
import {
  getDashboardStats,
  getTimeline,
} from "../controllers/productionDashboard.controller.js";
import {
  machines,
  createMachine,
  updateMachine,
  workforce,
  allocations,
  addWorker,
  deleteWorker,
  addMachine,
  deleteMachine,
  trackProduction,
  productionTracking,
  consumeMaterial,
  materialConsumption,
  updateOperation,
  salesOrders,
  products,
} from "../controllers/productionOperations.controller.js";
import {
  planningDashboard,
  productionCalendar,
  demandForecast,
  capacityPlan,
  planApproval,
} from "../controllers/productionPlanning.controller.js";
import {
  alerts,
  createAlert,
  updateAlert,
  generateAlerts,
  maintenance,
  createMaintenance,
  updateMaintenance,
  costs,
  costSummary,
  createCost,
  audit,
  recordAudit,
  traceability,
  analytics,
} from "../controllers/productionSupport.controller.js";

const router = express.Router();

// Alerts, equipment maintenance, actual production costs, traceability, and audit history
router.get("/alerts", alerts);
router.post("/alerts/generate", generateAlerts);
router.post("/alerts", createAlert);
router.patch("/alerts/:id", updateAlert);
router.get("/machines/maintenance", maintenance);
router.post("/machines/maintenance", createMaintenance);
router.patch("/machines/maintenance/:id", updateMaintenance);
router.get("/costs", costs);
router.get("/costs/summary", costSummary);
router.post("/costs", createCost);
router.get("/traceability", traceability);
router.get("/analytics", analytics);
router.get("/audit", audit);
router.post("/audit", recordAudit);

// ── Dashboard & Timeline ──────────────────────
// GET  /api/production/dashboard
router.get("/dashboard", getDashboardStats);

// GET  /api/production/timeline
router.get("/timeline", getTimeline);
router.get("/planning/dashboard", planningDashboard);
router.get("/planning/calendar", productionCalendar);
router.get("/planning/forecast", demandForecast);
router.get("/planning/capacity", capacityPlan);

// ── Work Orders (Production Execution) ────────
// GET  /api/production/orders/stats
router.get("/orders/stats", getStats);

// GET  /api/production/orders
router.get("/orders", getAllOrders);

// GET  /api/production/orders/:id
router.get("/orders/:id", getOrderById);

// POST /api/production/orders
router.post("/orders", createOrder);

// PATCH /api/production/orders/:id
router.patch("/orders/:id", updateOrder);
router.patch("/orders/:id/plan-approval", planApproval);

// DELETE /api/production/orders/:id
router.delete("/orders/:id", deleteOrder);

// POST /api/production/orders/:id/issue-material
router.post("/orders/:id/issue-material", issueMaterial);
router.get("/workforce", workforce);
router.get("/sales-orders", salesOrders);
router.get("/products", products);
router.get("/allocations", allocations);
router.post("/orders/:id/workers", addWorker);
router.delete("/allocations/:allocationId", deleteWorker);
router.post("/orders/:id/machines", addMachine);
router.delete("/machine-assignments/:assignmentId", deleteMachine);
router.post("/orders/:id/track", trackProduction);
router.get("/orders/:id/tracking", productionTracking);
router.patch("/operations/:operationId", updateOperation);
router.post("/orders/:id/consume-material", consumeMaterial);
router.get("/orders/:id/material-consumption", materialConsumption);
router.get("/machines", machines);
router.post("/machines", createMachine);
router.patch("/machines/:machineId", updateMachine);

// ── Bill of Materials (Product Planning) ─────
// GET  /api/production/bom/stats
router.get("/bom/stats", getBOMStatsSummary);

// GET  /api/production/bom
router.get("/bom", getAllBOMs);

// GET  /api/production/bom/:id
router.get("/bom/:id", getBOMById);

// POST /api/production/bom
router.post("/bom", createBOM);

// PATCH /api/production/bom/:id
router.patch("/bom/:id", updateBOM);

// DELETE /api/production/bom/:id
router.delete("/bom/:id", deleteBOM);

// POST /api/production/bom/:id/items
router.post("/bom/:id/items", upsertItems);

// POST /api/production/bom/:id/operations
router.post("/bom/:id/operations", upsertOperations);

export default router;
