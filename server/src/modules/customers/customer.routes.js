import { Router } from "express";
import { requirePermission } from "../../middleware/authorize.js";

export function createCustomerRoutes({ customerController, authenticate, csrf }) {
  const router = Router();

  router.get("/", authenticate, requirePermission("customer:read"), customerController.listCustomers);
  router.post("/", authenticate, csrf, requirePermission("customer:write"), customerController.createCustomer);
  router.get("/:id", authenticate, requirePermission("customer:read"), customerController.getCustomer);
  router.patch("/:id", authenticate, csrf, requirePermission("customer:write"), customerController.updateCustomer);

  return router;
}
