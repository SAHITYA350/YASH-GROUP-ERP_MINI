// Request validation for the finance module.
// Every function throws httpError(400, ...) with a clear message so the
// controllers stay tiny and every endpoint answers errors the same way.
const httpError = require("../../../utils/httpError");

const PAYMENT_METHODS = ["CASH", "BANK_TRANSFER", "UPI", "CHEQUE", "CREDIT", "OTHER"];

function requiredFields(body, fields) {
  for (const f of fields) {
    if (body[f] === undefined || body[f] === null || body[f] === "") {
      throw httpError(400, `${f} is required`);
    }
  }
}

function nonNegative(value, name) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    throw httpError(400, `${name} must be a number >= 0`);
  }
  return n;
}

function positiveAmount(value, name) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    throw httpError(400, `${name} must be greater than 0`);
  }
  return n;
}

function optionalDate(value, name) {
  if (value === undefined || value === null || value === "") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw httpError(400, `${name} must be a valid date`);
  }
  return d;
}

/** POST /api/finance/invoices */
function validateCreateInvoice(body = {}) {
  requiredFields(body, ["invoiceNo", "customerId", "salesOrderId"]);
  return {
    invoiceNo: String(body.invoiceNo).trim(),
    customerId: Number(body.customerId),
    salesOrderId: Number(body.salesOrderId),
    issueDate: optionalDate(body.issueDate, "issueDate") || new Date(),
    dueDate: optionalDate(body.dueDate, "dueDate"),
    subtotal: nonNegative(body.subtotal ?? 0, "subtotal"),
    taxAmount: nonNegative(body.taxAmount ?? 0, "taxAmount"),
    notes: body.notes ? String(body.notes) : null,
  };
}

/** POST /api/finance/invoices/:id/receipts */
function validateReceipt(body = {}) {
  positiveAmount(body.amount, "amount");
  const method = body.method || "BANK_TRANSFER";
  if (!PAYMENT_METHODS.includes(method)) {
    throw httpError(400, `method must be one of: ${PAYMENT_METHODS.join(", ")}`);
  }
  return {
    amount: Number(body.amount),
    paymentNo: body.paymentNo ? String(body.paymentNo).trim() : null,
    method,
    referenceNo: body.referenceNo ? String(body.referenceNo) : null,
    receivedAt: optionalDate(body.receivedAt, "receivedAt") || new Date(),
    notes: body.notes ? String(body.notes) : null,
  };
}

/** POST /api/finance/vendor-bills and POST /api/finance/expenses */
function validateCreateVendorBill(body = {}) {
  requiredFields(body, ["billNo", "vendorId"]);
  return {
    billNo: String(body.billNo).trim(),
    vendorId: Number(body.vendorId),
    purchaseOrderId: body.purchaseOrderId ? Number(body.purchaseOrderId) : null,
    billDate: optionalDate(body.billDate, "billDate") || new Date(),
    dueDate: optionalDate(body.dueDate, "dueDate"),
    subtotal: nonNegative(body.subtotal ?? 0, "subtotal"),
    taxAmount: nonNegative(body.taxAmount ?? 0, "taxAmount"),
  };
}

/** POST /api/finance/vendor-bills/:id/payments */
function validateBillPayment(body = {}) {
  positiveAmount(body.amount, "amount");
  return { amount: Number(body.amount) };
}

/** POST /api/finance/vendor-bills/:id/match */
function validateMatch(body = {}) {
  requiredFields(body, ["poNumber"]);
  return { poNumber: String(body.poNumber).trim() };
}

module.exports = {
  validateCreateInvoice,
  validateReceipt,
  validateCreateVendorBill,
  validateBillPayment,
  validateMatch,
};
