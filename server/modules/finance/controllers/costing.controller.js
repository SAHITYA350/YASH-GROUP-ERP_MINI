// Costing controller - job revenue, costs, profit and margin.
import service from "../services/costing.service.js";
import asyncHandler from "../../../utils/asyncHandler.js";

// GET /api/finance/jobs
export const list = asyncHandler(async (req, res) => {
  res.json(await service.listJobCosting());
});

// GET /api/finance/jobs/:id/costs
export const detail = asyncHandler(async (req, res) => {
  res.json(await service.getJobCostDetail(req.params.id));
});

export default { list, detail };