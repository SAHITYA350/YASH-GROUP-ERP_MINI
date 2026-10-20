// Finance report controller - dashboard + MIS management report.
const service = require("../services/financeReport.service");
const asyncHandler = require("../../../utils/asyncHandler");

// GET /api/finance/dashboard
const dashboard = asyncHandler(async (req, res) => {
  res.json(await service.getDashboard());
});

// GET /api/finance/reports/mis
const mis = asyncHandler(async (req, res) => {
  res.json(await service.getMisReport());
});

module.exports = { dashboard, mis };
