// Leads routes - mounted at /api/leads.
import express from "express";
import { authenticate, authorize } from "../../utils/auth.js";
import asyncHandler from "../../utils/asyncHandler.js";
import service from "./lead.service.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("leads", "read"),
  asyncHandler(async (req, res) => {
    res.json(await service.listLeads());
  })
);

router.get(
  "/:id",
  authenticate,
  authorize("leads", "read"),
  asyncHandler(async (req, res) => {
    res.json(await service.getLead(req.params.id));
  })
);

router.get(
  "/:id/follow-ups",
  authenticate,
  authorize("leads", "read"),
  asyncHandler(async (req, res) => {
    res.json(await service.getLeadFollowUps(req.params.id));
  })
);

export default router;
