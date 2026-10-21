import { Router } from "express";
import { requirePermission } from "../../middleware/authorize.js";

export function createUserRoutes({ userController, authenticate, csrf }) {
  const router = Router();

  // All endpoints require authentication
  router.use(authenticate);

  // Meta information for roles & permissions catalogue
  router.get("/meta", requirePermission("user:read"), userController.getMeta);

  // List all users
  router.get("/", requirePermission("user:read"), userController.listUsers);

  // Get specific user details
  router.get("/:id", requirePermission("user:read"), userController.getUser);

  // Alter user role and accessibility (tick & untick permissions)
  router.patch(
    "/:id/accessibility",
    csrf,
    requirePermission("user:manage"),
    userController.updateAccessibility
  );

  return router;
}
