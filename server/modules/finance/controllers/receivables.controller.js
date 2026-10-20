// Receivables controller - summary numbers + ageing buckets.
const service = require("../services/receivables.service");
const asyncHandler = require("../../../utils/asyncHandler");

// GET /api/finance/receivables
const summary = asyncHandler(async (req, res) => {
  res.json(await service.getSummary());
});

// GET /api/finance/receivables/ageing
const ageing = asyncHandler(async (req, res) => {
  res.json(await service.getAgeing());
});

module.exports = { summary, ageing };