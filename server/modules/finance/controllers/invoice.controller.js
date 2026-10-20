// Invoice controller (Billing & Receivables - workflow A).
// HTTP in / HTTP out only - all business rules live in services/invoice.service.js
const service = require("../services/invoice.service");
const asyncHandler = require("../../../utils/asyncHandler");

// GET /api/finance/invoices
const list = asyncHandler(async (req, res) => {
  res.json(await service.listInvoices());
});

// GET /api/finance/invoices/next-number
const nextNumber = asyncHandler(async (req, res) => {
  res.json({ invoiceNo: await service.nextInvoiceNo() });
});

// GET /api/finance/invoices/:id
const getById = asyncHandler(async (req, res) => {
  res.json(await service.getInvoice(req.params.id));
});

// POST /api/finance/invoices
const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.createInvoice(req.body));
});

module.exports = { list, getById, create, nextNumber };
