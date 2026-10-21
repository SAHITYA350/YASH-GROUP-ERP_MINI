import { Router } from "express";
import { requirePermission } from "../../middleware/authorize.js";

export function createEnquiryRoutes({ enquiryController, authenticate, csrf }) {
  const router = Router();

  router.get("/", authenticate, requirePermission("enquiry:read"), enquiryController.listEnquiries);
  router.post("/", authenticate, csrf, requirePermission("enquiry:write"), enquiryController.createEnquiry);
  router.post("/import", authenticate, csrf, requirePermission("enquiry:write"), enquiryController.importLeads);
  router.get("/:id", authenticate, requirePermission("enquiry:read"), enquiryController.getEnquiry);
  router.patch(
    "/:id",
    authenticate,
    csrf,
    requirePermission("enquiry:write"),
    enquiryController.updateEnquiry
  );
  router.post(
    "/:id/activities",
    authenticate,
    csrf,
    requirePermission("activity:write"),
    enquiryController.recordActivity
  );

  return router;
}
