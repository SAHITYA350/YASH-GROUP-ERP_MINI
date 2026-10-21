// Expense tracking (Payables - workflow B).
// Expenses are vendor bills WITHOUT a purchase order, so they reuse the
// VendorBill model instead of adding a new table.
import repo from "../repositories/vendorBill.repository.js";
import billService from "./vendorBill.service.js";
import calc from "../utils/paymentCalculator.js";

export async function listExpenses() {
  const bills = await repo.findExpenses();
  return bills.map((b) => ({
    id: b.id,
    billNo: b.billNo,
    vendor: b.vendor.name,
    category: b.vendor.category,
    status: b.status,
    billDate: b.billDate,
    dueDate: b.dueDate,
    total: Number(b.total),
    paidAmount: Number(b.paidAmount),
    outstanding: calc.outstanding(b.total, b.paidAmount),
  }));
}

/** Enter a direct expense (transport, consumables, site services...). */
export async function createExpense(body) {
  // purchaseOrderId is forced to null so the record lands in the expense list
  return billService.createBill({ ...body, purchaseOrderId: null });
}

export default { listExpenses, createExpense };
