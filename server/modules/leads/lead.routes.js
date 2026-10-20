// Leads routes - mounted at /api/leads.
const express = require("express");
const { authenticate, authorize } = require("../../utils/auth");
const asyncHandler = require("../../utils/asyncHandler");
const service = require("./lead.service");

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

module.exports = router;
