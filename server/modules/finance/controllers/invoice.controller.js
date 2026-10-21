// Invoice controller (Billing & Receivables - workflow A).
// HTTP in / HTTP out only - all business rules live in services/invoice.service.js
import service from "../services/invoice.service.js";
import asyncHandler from "../../../utils/asyncHandler.js";

// GET /api/finance/invoices
export const list = asyncHandler(async (req, res) => {
  res.json(await service.listInvoices());
});

// GET /api/finance/invoices/next-number
export const nextNumber = asyncHandler(async (req, res) => {
  res.json({ invoiceNo: await service.nextInvoiceNo() });
});

// GET /api/finance/invoices/:id
export const getById = asyncHandler(async (req, res) => {
  res.json(await service.getInvoice(req.params.id));
});

// POST /api/finance/invoices
export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.createInvoice(req.body));
});

export default { list, getById, create, nextNumber };
