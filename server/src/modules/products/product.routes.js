import { Router } from "express";
import { requirePermission } from "../../middleware/authorize.js";

export function createProductRoutes({ productController, authenticate }) {
  const router = Router();

  router.get("/", authenticate, requirePermission("product:read"), productController.listProducts);

  return router;
}
