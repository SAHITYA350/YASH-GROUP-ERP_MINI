// Invoice routes (Billing & Receivables). Mounted under /api/finance.
const express = require("express");
const { authenticate, authorize } = require("../../../utils/auth");
const ctrl = require("../controllers/invoice.controller");

const router = express.Router();

// View invoices: ADMIN / FINANCE_MANAGER / BANK_OFFICE_EXECUTIVE / BACK_OFFICER
router.get("/", authenticate, authorize("finance", "read"), ctrl.list);
router.get("/next-number", authenticate, authorize("finance", "read"), ctrl.nextNumber);
router.get("/:id", authenticate, authorize("finance", "read"), ctrl.getById);

// Create invoice: ADMIN / FINANCE_MANAGER / BANK_OFFICE_EXECUTIVE
router.post("/", authenticate, authorize("finance", "create"), ctrl.create);

module.exports = router;
