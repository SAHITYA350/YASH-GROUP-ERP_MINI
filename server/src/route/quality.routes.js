import express from "express";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import {
  createInspection,
  getAllInspections,
  getInspectionById,
  updateInspection,
  getStats,
} from "../controller/qualityInspection.controller.js";
import { defects, addDefect, changeDefect, reworkOrders, addReworkOrder, changeReworkOrder, reports } from "../controller/qualityManagement.controller.js";
import { ncr, createNcr, updateNcr } from "../controller/productionSupport.controller.js";

const router = express.Router();

router.use(authorizeRoles(["QUALITY_INSPECTOR", "PRODUCTION_MANAGER", "ADMIN"]));

// ── Quality & Finished Goods ──────────────────

// GET  /api/quality/stats
router.get("/stats", getStats);

// GET  /api/quality/inspections
router.get("/inspections", getAllInspections);

// GET  /api/quality/inspections/:id
router.get("/inspections/:id", getInspectionById);

// POST /api/quality/inspections
router.post("/inspections", createInspection);

// PATCH /api/quality/inspections/:id
router.patch("/inspections/:id", updateInspection);
router.get("/reports", reports);
router.get("/defects", defects);
router.post("/inspections/:id/defects", addDefect);
router.patch("/defects/:defectId", changeDefect);
router.get("/rework", reworkOrders);
router.post("/defects/:defectId/rework", addReworkOrder);
router.patch("/rework/:reworkId", changeReworkOrder);
router.get("/ncr", ncr);
router.post("/ncr", createNcr);
router.patch("/ncr/:id", updateNcr);

export default router;
