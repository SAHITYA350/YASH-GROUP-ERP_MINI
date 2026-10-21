import { Router } from "express";
import { requirePermission } from "../../middleware/authorize.js";

export function createInvoiceRoutes({ invoiceController, authenticate, csrf }) {
  const router = Router();

  router.get("/", authenticate, requirePermission("invoice:read"), invoiceController.listInvoices);
  router.get("/:id", authenticate, requirePermission("invoice:read"), invoiceController.getInvoice);
  router.post("/:id/payments", authenticate, csrf, requirePermission("invoice:write"), invoiceController.recordPayment);

  return router;
}
