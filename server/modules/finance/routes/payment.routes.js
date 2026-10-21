// Payment routes - customer receipts and supplier payments.
import express from "express";
import { authenticate, authorize } from "../../../utils/auth.js";
import ctrl from "../controllers/payment.controller.js";

const router = express.Router();

// GET /api/finance/payments - all customer receipts
router.get("/", authenticate, authorize("finance", "read"), ctrl.list);

export default router;
