// Receivables routes - summary + ageing.
const express = require("express");
const { authenticate, authorize } = require("../../../utils/auth");
const ctrl = require("../controllers/receivables.controller");

const router = express.Router();

// GET /api/finance/receivables          -> invoiced / received / outstanding / overdue
router.get("/", authenticate, authorize("finance", "read"), ctrl.summary);

// GET /api/finance/receivables/ageing   -> current, 1-30, 31-60, 60+ buckets
router.get("/ageing", authenticate, authorize("finance", "read"), ctrl.ageing);

module.exports = router;
