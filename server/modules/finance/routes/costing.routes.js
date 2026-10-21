// Costing routes - job revenue, costs, profit, margin.
import express from "express";
import { authenticate, authorize } from "../../../utils/auth.js";
import ctrl from "../controllers/costing.controller.js";

const router = express.Router();

// GET /api/finance/jobs           -> costing row per job
router.get("/", authenticate, authorize("finance", "read"), ctrl.list);

// GET /api/finance/jobs/:id/costs -> full breakdown incl. PR/RFQ/PO trail
router.get("/:id/costs", authenticate, authorize("finance", "read"), ctrl.detail);

export default router;
