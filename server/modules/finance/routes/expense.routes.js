// Expense routes - vendor bills without a purchase order.
const express = require("express");
const { authenticate, authorize } = require("../../../utils/auth");
const ctrl = require("../controllers/expense.controller");

const router = express.Router();

router.get("/", authenticate, authorize("finance", "read"), ctrl.list);

// Record an expense: ADMIN / FINANCE_MANAGER / BANK_OFFICE_EXECUTIVE
router.post("/", authenticate, authorize("finance", "create"), ctrl.create);

module.exports = router;
