// Payment controller - customer receipts + supplier payments.
import service from "../services/payment.service.js";
import asyncHandler from "../../../utils/asyncHandler.js";

// GET /api/finance/payments
export const list = asyncHandler(async (req, res) => {
  res.json(await service.listReceipts());
});

// POST /api/finance/invoices/:id/receipts
export const createReceipt = asyncHandler(async (req, res) => {
  res.status(201).json(await service.recordReceipt(req.params.id, req.body));
});

// POST /api/finance/vendor-bills/:id/payments
export const createBillPayment = asyncHandler(async (req, res) => {
  res.status(201).json(await service.recordBillPayment(req.params.id, req.body));
});

export default { list, createReceipt, createBillPayment };
