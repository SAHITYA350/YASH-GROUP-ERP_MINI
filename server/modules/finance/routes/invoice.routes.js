// Invoice routes (Billing & Receivables). Mounted under /api/finance.
import express from "express";
import { authenticate, authorize } from "../../../utils/auth.js";
import ctrl from "../controllers/invoice.controller.js";

const router = express.Router();

// View invoices: ADMIN / FINANCE_MANAGER / BANK_OFFICE_EXECUTIVE / BACK_OFFICER
router.get("/", authenticate, authorize("finance", "read"), ctrl.list);
router.get("/next-number", authenticate, authorize("finance", "read"), ctrl.nextNumber);
router.get("/:id", authenticate, authorize("finance", "read"), ctrl.getById);

// Create invoice: ADMIN / FINANCE_MANAGER / BANK_OFFICE_EXECUTIVE
router.post("/", authenticate, authorize("finance", "create"), ctrl.create);

export default router;
