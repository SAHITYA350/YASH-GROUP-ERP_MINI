// Invoice business rules (Billing & Receivables - workflow A).
const repo = require("../repositories/invoice.repository");
const calc = require("../utils/paymentCalculator");
const { suggestInvoiceNo } = require("../utils/invoiceNumber");
const { validateCreateInvoice } = require("../validations/finance.validation");
const httpError = require("../../../utils/httpError");

/** An invoice is overdue when its status says so, or the due date passed
 *  and money is still owed. Used by lists AND the dashboard. */
function isOverdue(invoice, now = new Date()) {
  return (
    invoice.status === "OVERDUE" ||
    (Boolean(invoice.dueDate) &&
      new Date(invoice.dueDate) < now &&
      calc.outstanding(invoice.total, invoice.paidAmount) > 0)
  );
}

async function listInvoices() {
  const invoices = await repo.findAll();
  return invoices.map((i) => ({
    id: i.id,
    invoiceNo: i.invoiceNo,
    customer: i.customer.name,
    status: i.status,
    issueDate: i.issueDate,
    dueDate: i.dueDate,
    total: Number(i.total),
    paidAmount: Number(i.paidAmount),
    outstanding: calc.outstanding(i.total, i.paidAmount),
    overdue: isOverdue(i),
  }));
}

async function getInvoice(id) {
  const invoice = await repo.findById(id);
  if (!invoice) throw httpError(404, "Invoice not found");
  return {
    ...invoice,
    total: Number(invoice.total),
    paidAmount: Number(invoice.paidAmount),
    outstanding: calc.outstanding(invoice.total, invoice.paidAmount),
    overdue: isOverdue(invoice),
  };
}

/** Create a customer invoice. total = subtotal + GST. */
async function createInvoice(body) {
  const data = validateCreateInvoice(body);
  const total = calc.round2(data.subtotal + data.taxAmount);

  try {
    return await repo.create({
      invoiceNo: data.invoiceNo,
      customerId: data.customerId,
      salesOrderId: data.salesOrderId,
      status: "ISSUED",
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      subtotal: String(data.subtotal),
      taxAmount: String(data.taxAmount),
      total: String(total),
      paidAmount: "0",
      notes: data.notes,
    });
  } catch (err) {
    if (err.code === "P2002") throw httpError(409, `Invoice ${data.invoiceNo} already exists`);
    if (err.code === "P2003") throw httpError(400, "customerId or salesOrderId does not exist");
    throw err;
  }
}

/** Suggest the next invoice number for the create form. */
async function nextInvoiceNo() {
  return suggestInvoiceNo(await repo.count());
}

module.exports = { listInvoices, getInvoice, createInvoice, nextInvoiceNo, isOverdue };
