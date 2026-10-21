import { Router } from "express";
import { requirePermission } from "../../middleware/authorize.js";

export function createSalesOrderRoutes({ salesOrderController, authenticate, csrf }) {
  const router = Router();

  router.get("/", authenticate, requirePermission("order:read"), salesOrderController.listSalesOrders);
  router.get("/:id", authenticate, requirePermission("order:read"), salesOrderController.getSalesOrder);
  router.post("/:id", authenticate, csrf, requirePermission("order:write"), salesOrderController.createSalesOrder);
  router.post("/:id/invoice", authenticate, csrf, requirePermission("invoice:write"), salesOrderController.generateInvoice);

  return router;
}
