// Payment business rules: customer receipts (invoices) and supplier payments
// (vendor bills). One place = balances can never disagree between screens.
import invoiceRepo from "../repositories/invoice.repository.js";
import paymentRepo from "../repositories/payment.repository.js";
import billRepo from "../repositories/vendorBill.repository.js";
import calc from "../utils/paymentCalculator.js";
import { validateReceipt, validateBillPayment } from "../validations/finance.validation.js";
import httpError from "../../../utils/httpError.js";

/** Record a customer receipt and update the invoice balance + status. */
export async function recordReceipt(invoiceId, body) {
  const data = validateReceipt(body);

  const invoice = await invoiceRepo.findById(invoiceId);
  if (!invoice) throw httpError(404, "Invoice not found");
  if (!calc.canApply(invoice.total, invoice.paidAmount, data.amount)) {
    throw httpError(400, "Receipt exceeds the invoice outstanding balance");
  }

  const newPaid = calc.round2(Number(invoice.paidAmount) + data.amount);
  const payment = await paymentRepo.create({
    paymentNo: data.paymentNo || `RCPT-${Date.now()}`,
    invoiceId: invoice.id,
    amount: String(data.amount),
    method: data.method,
    referenceNo: data.referenceNo,
    receivedAt: data.receivedAt,
    notes: data.notes,
  });

  const status = calc.nextStatus(invoice.total, newPaid);
  await invoiceRepo.updateBalance(invoice.id, newPaid.toFixed(2), status);

  return {
    payment,
    paidAmount: newPaid,
    outstanding: calc.outstanding(invoice.total, newPaid),
    status,
  };
}

/** Record a supplier payment and update the bill balance + status. */
export async function recordBillPayment(billId, body) {
  const data = validateBillPayment(body);

  const bill = await billRepo.findById(billId);
  if (!bill) throw httpError(404, "Vendor bill not found");
  if (!calc.canApply(bill.total, bill.paidAmount, data.amount)) {
    throw httpError(400, "Payment exceeds the bill outstanding balance");
  }

  const newPaid = calc.round2(Number(bill.paidAmount) + data.amount);
  const status = calc.nextStatus(bill.total, newPaid);
  const updated = await billRepo.update(bill.id, {
    paidAmount: newPaid.toFixed(2),
    status,
  });

  return {
    billNo: updated.billNo,
    paidAmount: newPaid,
    outstanding: calc.outstanding(updated.total, newPaid),
    status,
  };
}

/** All customer receipts, newest first. */
export async function listReceipts() {
  const rows = await paymentRepo.findAll();
  return rows.map((p) => ({
    id: p.id,
    paymentNo: p.paymentNo,
    invoiceNo: p.invoice.invoiceNo,
    amount: Number(p.amount),
    method: p.method,
    referenceNo: p.referenceNo,
    receivedAt: p.receivedAt,
    notes: p.notes,
  }));
}

export default { recordReceipt, recordBillPayment, listReceipts };
