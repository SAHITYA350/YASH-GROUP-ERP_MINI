import { Router } from "express";
import { requirePermission } from "../../middleware/authorize.js";

export function createDashboardRoutes({ dashboardController, authenticate }) {
  const router = Router();

  router.get("/", authenticate, requirePermission("dashboard:read"), dashboardController.getDashboard);

  return router;
}
