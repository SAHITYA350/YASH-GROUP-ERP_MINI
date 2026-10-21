import express from "express";
import {
  createInspection,
  getAllInspections,
  getInspectionById,
  updateInspection,
  getStats,
} from "../controllers/qualityInspection.controller.js";
import {
  defects,
  addDefect,
  changeDefect,
  reworkOrders,
  addReworkOrder,
  changeReworkOrder,
  reports,
} from "../controllers/qualityManagement.controller.js";
import {
  ncr,
  createNcrRecord,
  updateNcrRecord,
} from "../controllers/nonConformance.controller.js";

const router = express.Router();

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
router.post("/ncr", createNcrRecord);
router.patch("/ncr/:id", updateNcrRecord);

export default router;
