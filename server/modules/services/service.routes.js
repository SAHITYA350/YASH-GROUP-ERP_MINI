// Services routes - mounted at /api/services.
const express = require("express");
const { authenticate, authorize } = require("../../utils/auth");
const asyncHandler = require("../../utils/asyncHandler");
const service = require("./service.service");

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

module.exports = router;
