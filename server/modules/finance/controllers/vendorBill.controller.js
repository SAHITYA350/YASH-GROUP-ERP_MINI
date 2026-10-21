// Vendor bill controller (Payables - workflow B): list, enter, approve, match.
import service from "../services/vendorBill.service.js";
import asyncHandler from "../../../utils/asyncHandler.js";

// GET /api/finance/vendor-bills
export const list = asyncHandler(async (req, res) => {
  res.json(await service.listBills());
});

// GET /api/finance/vendor-bills/:id
export const getById = asyncHandler(async (req, res) => {
  res.json(await service.getBill(req.params.id));
});

// POST /api/finance/vendor-bills
export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.createBill(req.body));
});

// POST /api/finance/vendor-bills/:id/approve   (ADMIN / FINANCE_MANAGER only)
export const approve = asyncHandler(async (req, res) => {
  res.json(await service.approveBill(req.params.id));
});

// POST /api/finance/vendor-bills/:id/match     body: { poNumber }
export const match = asyncHandler(async (req, res) => {
  res.json(await service.matchBillToPO(req.params.id, req.body));
});

export default { list, getById, create, approve, match };
