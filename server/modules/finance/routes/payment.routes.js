// Payment routes - customer receipts and supplier payments.
const express = require("express");
const { authenticate, authorize } = require("../../../utils/auth");
const ctrl = require("../controllers/payment.controller");

const router = express.Router();

// GET /api/finance/payments - all customer receipts
router.get("/", authenticate, authorize("finance", "read"), ctrl.list);

module.exports = router;
