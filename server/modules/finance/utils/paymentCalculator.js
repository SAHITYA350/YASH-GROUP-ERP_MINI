// Payment maths shared by receipts (invoices) and vendor bill payments.
// Keeping this in one place guarantees the dashboard, invoice list and bill
// list all agree on outstanding balances and statuses.

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

/** Remaining balance of a document. */
function outstanding(total, paidAmount) {
  return round2(Number(total ?? 0) - Number(paidAmount ?? 0));
}

/** True when a payment of `amount` can still be applied. */
function canApply(total, paidAmount, amount) {
  return round2(Number(paidAmount ?? 0) + Number(amount)) <= round2(Number(total ?? 0)) + 0.01;
}

/** Invoice/bill status after applying a payment. */
function nextStatus(total, newPaidAmount) {
  return newPaidAmount >= Number(total) - 0.01 ? "PAID" : "PARTIALLY_PAID";
}

module.exports = { round2, outstanding, canApply, nextStatus };
