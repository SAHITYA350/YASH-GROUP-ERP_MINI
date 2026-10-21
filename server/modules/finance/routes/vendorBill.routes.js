// Vendor bill routes (Payables & Expenses).
import express from "express";
import { authenticate, authorize } from "../../../utils/auth.js";
import ctrl from "../controllers/vendorBill.controller.js";

const router = express.Router();

router.get("/", authenticate, authorize("finance", "read"), ctrl.list);
router.get("/:id", authenticate, authorize("finance", "read"), ctrl.getById);

// Enter a bill: ADMIN / FINANCE_MANAGER / BANK_OFFICE_EXECUTIVE
router.post("/", authenticate, authorize("finance", "create"), ctrl.create);

// Approve a bill: ADMIN / FINANCE_MANAGER ONLY ("approve" action)
router.post("/:id/approve", authenticate, authorize("finance", "approve"), ctrl.approve);

// 2-way match against a purchase order: ADMIN / FINANCE_MANAGER ("update")
router.post("/:id/match", authenticate, authorize("finance", "update"), ctrl.match);

export default router;
