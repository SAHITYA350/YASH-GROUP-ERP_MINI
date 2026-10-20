// Vendor bill controller (Payables - workflow B): list, enter, approve, match.
const service = require("../services/vendorBill.service");
const asyncHandler = require("../../../utils/asyncHandler");

// GET /api/finance/vendor-bills
const list = asyncHandler(async (req, res) => {
  res.json(await service.listBills());
});

// GET /api/finance/vendor-bills/:id
const getById = asyncHandler(async (req, res) => {
  res.json(await service.getBill(req.params.id));
});

// POST /api/finance/vendor-bills
const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.createBill(req.body));
});

// POST /api/finance/vendor-bills/:id/approve   (ADMIN / FINANCE_MANAGER only)
const approve = asyncHandler(async (req, res) => {
  res.json(await service.approveBill(req.params.id));
});

// POST /api/finance/vendor-bills/:id/match     body: { poNumber }
const match = asyncHandler(async (req, res) => {
  res.json(await service.matchBillToPO(req.params.id, req.body));
});

module.exports = { list, getById, create, approve, match };
