// Expense routes - vendor bills without a purchase order.
import express from "express";
import { authenticate, authorize } from "../../../utils/auth.js";
import ctrl from "../controllers/expense.controller.js";

const router = express.Router();

router.get("/", authenticate, authorize("finance", "read"), ctrl.list);

// Record an expense: ADMIN / FINANCE_MANAGER / BANK_OFFICE_EXECUTIVE
router.post("/", authenticate, authorize("finance", "create"), ctrl.create);

export default router;
