// Costing controller - job revenue, costs, profit and margin.
const service = require("../services/costing.service");
const asyncHandler = require("../../../utils/asyncHandler");

// GET /api/finance/jobs
const list = asyncHandler(async (req, res) => {
  res.json(await service.listJobCosting());
});

// GET /api/finance/jobs/:id/costs
const detail = asyncHandler(async (req, res) => {
  res.json(await service.getJobCostDetail(req.params.id));
});

module.exports = { list, detail };
