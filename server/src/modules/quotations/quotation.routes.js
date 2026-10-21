import { Router } from "express";
import { requirePermission } from "../../middleware/authorize.js";

export function createQuotationRoutes({ quotationController, authenticate, csrf }) {
  const router = Router();

  router.get("/", authenticate, requirePermission("quote:read"), quotationController.listQuotations);
  router.post("/", authenticate, csrf, requirePermission("quote:write"), quotationController.createQuotation);
  router.get("/:id", authenticate, requirePermission("quote:read"), quotationController.getQuotation);
  router.patch(
    "/:id/status",
    authenticate,
    csrf,
    requirePermission("quote:write"),
    quotationController.updateStatus
  );

  return router;
}
