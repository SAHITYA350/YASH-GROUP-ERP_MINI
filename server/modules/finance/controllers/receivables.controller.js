// Receivables controller - summary numbers + ageing buckets.
import service from "../services/receivables.service.js";
import asyncHandler from "../../../utils/asyncHandler.js";

// GET /api/finance/receivables
export const summary = asyncHandler(async (req, res) => {
  res.json(await service.getSummary());
});

// GET /api/finance/receivables/ageing
export const ageing = asyncHandler(async (req, res) => {
  res.json(await service.getAgeing());
});

export default { summary, ageing };