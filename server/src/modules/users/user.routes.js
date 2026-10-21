import { Router } from "express";
import { requireAdmin, requirePermission } from "../../middleware/authorize.js";

export function createUserRoutes({ userController, authenticate, csrf }) {
  const router = Router();

  // All endpoints require authentication
  router.use(authenticate);

  // Meta information for roles & permissions catalogue
  router.get("/meta", requirePermission("user:read"), userController.getMeta);

  // List all users (any user with user:read may view the list)
  router.get("/", requirePermission("user:read"), userController.listUsers);

  // Get specific user details
  router.get("/:id", requirePermission("user:read"), userController.getUser);

  // Alter user role and permissions — ADMIN only.
  // requireAdmin is intentionally stricter than requirePermission("user:manage")
  // so that HR_MANAGER and similar roles cannot escalate or modify access.
  router.patch(
    "/:id/accessibility",
    csrf,
    requireAdmin,
    userController.updateAccessibility
  );

  return router;
}
