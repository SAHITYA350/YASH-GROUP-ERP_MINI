// Finance report controller - dashboard + MIS management report.
import service from "../services/financeReport.service.js";
import asyncHandler from "../../../utils/asyncHandler.js";

// GET /api/finance/dashboard
export const dashboard = asyncHandler(async (req, res) => {
  res.json(await service.getDashboard());
});

// GET /api/finance/reports/mis
export const mis = asyncHandler(async (req, res) => {
  res.json(await service.getMisReport());
});

export default { dashboard, mis };
