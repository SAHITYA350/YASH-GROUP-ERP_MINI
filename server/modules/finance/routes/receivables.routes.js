// Receivables routes - summary + ageing.
import express from "express";
import { authenticate, authorize } from "../../../utils/auth.js";
import ctrl from "../controllers/receivables.controller.js";

const router = express.Router();

// GET /api/finance/receivables          -> invoiced / received / outstanding / overdue
router.get("/", authenticate, authorize("finance", "read"), ctrl.summary);

// GET /api/finance/receivables/ageing   -> current, 1-30, 31-60, 60+ buckets
router.get("/ageing", authenticate, authorize("finance", "read"), ctrl.ageing);

export default router;
