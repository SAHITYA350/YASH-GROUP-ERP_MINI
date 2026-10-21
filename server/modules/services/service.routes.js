// Services routes - mounted at /api/services.
import express from "express";
import { authenticate, authorize } from "../../utils/auth.js";
import asyncHandler from "../../utils/asyncHandler.js";
import service from "./service.service.js";

const router = express.Router();

// GET /api/services/tickets
router.get(
  "/tickets",
  authenticate,
  authorize("services", "read"),
  asyncHandler(async (req, res) => {
    res.json(await service.listTickets());
  })
);

// GET /api/services/schedule  (technician workload)
router.get(
  "/schedule",
  authenticate,
  authorize("services", "read"),
  asyncHandler(async (req, res) => {
    res.json(await service.getSchedule());
  })
);

// GET /api/services/tickets/:id
router.get(
  "/tickets/:id",
  authenticate,
  authorize("services", "read"),
  asyncHandler(async (req, res) => {
    res.json(await service.getTicket(req.params.id));
  })
);

export default router;
