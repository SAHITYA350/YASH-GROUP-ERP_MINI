import { Router } from "express";

export function createAuthRoutes({ authController, authenticate, csrf }) {
  const router = Router();

  router.post("/login", authController.login);
  router.get("/me", authenticate, authController.me);
  router.post("/logout", authenticate, csrf, authController.logout);

  return router;
}
