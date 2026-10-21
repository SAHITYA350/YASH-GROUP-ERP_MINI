// Vendor bill business rules (Payables - workflow B):
// list, enter, approve and 2-way match against a purchase order.
import repo from "../repositories/vendorBill.repository.js";
import calc from "../utils/paymentCalculator.js";
import {
  validateCreateVendorBill,
  validateMatch,
} from "../validations/finance.validation.js";
import httpError from "../../../utils/httpError.js";

export async function listBills() {
  const bills = await repo.findAll();
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
    purchaseOrder: b.purchaseOrder ? b.purchaseOrder.poNumber : null,
    matched: Boolean(
      b.purchaseOrder &&
        Math.abs(Number(b.total) - Number(b.purchaseOrder.total)) < 0.01
    ),
    isExpense: !b.purchaseOrder,
  }));
}

export async function getBill(id) {
  const bill = await repo.findById(id);
  if (!bill) throw httpError(404, "Vendor bill not found");
  return {
    ...bill,
    total: Number(bill.total),
    paidAmount: Number(bill.paidAmount),
    outstanding: calc.outstanding(bill.total, bill.paidAmount),
  };
}

/** Enter a supplier bill - starts as SUBMITTED, waiting for approval. */
export async function createBill(body) {
  const data = validateCreateVendorBill(body);
  const total = calc.round2(data.subtotal + data.taxAmount);

  try {
    return await repo.create({
      billNo: data.billNo,
      vendorId: data.vendorId,
      purchaseOrderId: data.purchaseOrderId,
      status: "SUBMITTED",
      billDate: data.billDate,
      dueDate: data.dueDate,
      subtotal: String(data.subtotal),
      taxAmount: String(data.taxAmount),
      total: String(total),
      paidAmount: "0",
    });
  } catch (err) {
    if (err.code === "P2002") throw httpError(409, `Bill ${data.billNo} already exists`);
    if (err.code === "P2003") throw httpError(400, "vendorId or purchaseOrderId does not exist");
    throw err;
  }
}

/** Approval is a separate permission ("approve") - only ADMIN / FINANCE_MANAGER. */
export async function approveBill(id) {
  const bill = await repo.findById(id);
  if (!bill) throw httpError(404, "Vendor bill not found");
  if (!["DRAFT", "SUBMITTED", "MATCHED"].includes(bill.status)) {
    throw httpError(400, `Cannot approve a bill with status ${bill.status}`);
  }
  return repo.update(bill.id, { status: "APPROVED" });
}

/** 2-way match: the bill total must equal the purchase order total. */
export async function matchBillToPO(id, body) {
  const { poNumber } = validateMatch(body);

  const bill = await repo.findById(id);
  if (!bill) throw httpError(404, "Vendor bill not found");

  const po = await repo.findPurchaseOrderByNumber(poNumber);
  if (!po) throw httpError(404, `Purchase order ${poNumber} not found`);

  if (Math.abs(Number(bill.total) - Number(po.total)) > 0.01) {
    throw httpError(
      400,
      `Bill total (${Number(bill.total)}) does not match PO total (${Number(po.total)})`
    );
  }

  return repo.update(bill.id, { purchaseOrderId: po.id, status: "MATCHED" });
}

export default { listBills, getBill, createBill, approveBill, matchBillToPO };
