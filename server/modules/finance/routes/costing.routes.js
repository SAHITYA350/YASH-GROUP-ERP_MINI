// Costing routes - job revenue, costs, profit, margin.
const express = require("express");
const { authenticate, authorize } = require("../../../utils/auth");
const ctrl = require("../controllers/costing.controller");

const router = express.Router();

// GET /api/finance/jobs           -> costing row per job
router.get("/", authenticate, authorize("finance", "read"), ctrl.list);

// GET /api/finance/jobs/:id/costs -> full breakdown incl. PR/RFQ/PO trail
router.get("/:id/costs", authenticate, authorize("finance", "read"), ctrl.detail);

module.exports = router;
