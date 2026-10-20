// Payment controller - customer receipts + supplier payments.
const service = require("../services/payment.service");
const asyncHandler = require("../../../utils/asyncHandler");

// GET /api/finance/payments
const list = asyncHandler(async (req, res) => {
  res.json(await service.listReceipts());
});

// POST /api/finance/invoices/:id/receipts
const createReceipt = asyncHandler(async (req, res) => {
  res.status(201).json(await service.recordReceipt(req.params.id, req.body));
});

// POST /api/finance/vendor-bills/:id/payments
const createBillPayment = asyncHandler(async (req, res) => {
  res.status(201).json(await service.recordBillPayment(req.params.id, req.body));
});

module.exports = { list, createReceipt, createBillPayment };
