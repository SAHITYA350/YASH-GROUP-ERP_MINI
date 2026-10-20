// ============================================================================
// Module 6 - Finance & Commercial: data access + business calculations.
//
// Routes (finance.routes.js) call these functions; these functions call
// Prisma. Keep every calculation HERE so the dashboard, invoice lists and
// job costing all use the same numbers - nothing is counted twice.
//
// Workflows covered:
//   1. Billing & Receivables  -> Invoice + Payment (outstanding = total - paid)
//   2. Payables & Expenses    -> VendorBill (+ PurchaseOrder matching)
//   3. Costing, Margin & MIS  -> Project -> SalesOrder -> PurchaseRequest
//                                -> RFQ -> PurchaseOrder chain; costs are
//                                classified by Vendor.category.
// ============================================================================

const prisma = require("../../utils/prisma");

/** Convert a Prisma Decimal / number / string to a JS number. */
function toNumber(value) {
  return Number(value ?? 0);
}

/** Build an Error carrying an HTTP status; index.js turns it into a response. */
function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// ---------------------------------------------------------------------------
// 1. Billing & Receivables
// ---------------------------------------------------------------------------

/** Receivables summary: invoiced / received / outstanding / overdue. */
async function getReceivablesSummary() {
  const invoices = await prisma.invoice.findMany({
    select: { total: true, paidAmount: true, dueDate: true, status: true },
  });
  const payments = await prisma.payment.aggregate({ _sum: { amount: true } });

  const now = new Date();
  const invoiced = invoices.reduce((s, i) => s + toNumber(i.total), 0);
  const received = toNumber(payments._sum.amount); // one Payment row = one receipt
  const outstanding = invoices.reduce(
    (s, i) => s + (toNumber(i.total) - toNumber(i.paidAmount)),
    0
  );
  const overdue = invoices
    .filter(
      (i) =>
        i.status === "OVERDUE" ||
        (i.dueDate &&
          new Date(i.dueDate) < now &&
          toNumber(i.total) > toNumber(i.paidAmount))
    )
    .reduce((s, i) => s + (toNumber(i.total) - toNumber(i.paidAmount)), 0);

  return { invoiced, received, outstanding, overdue, invoiceCount: invoices.length };
}

/** All invoices with computed outstanding + overdue flag. */
async function listInvoices() {
  const invoices = await prisma.invoice.findMany({
    include: { customer: { select: { name: true } } },
    orderBy: { id: "desc" },
  });

  const now = new Date();
  return invoices.map((i) => ({
    id: i.id,
    invoiceNo: i.invoiceNo,
    customer: i.customer.name,
    status: i.status,
    issueDate: i.issueDate,
    dueDate: i.dueDate,
    total: toNumber(i.total),
    paidAmount: toNumber(i.paidAmount),
    outstanding: toNumber(i.total) - toNumber(i.paidAmount),
    overdue:
      i.status === "OVERDUE" ||
      (i.dueDate &&
        new Date(i.dueDate) < now &&
        toNumber(i.total) > toNumber(i.paidAmount)),
  }));
}

/** One invoice with its receipts (Payment rows). */
async function getInvoiceById(id) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: Number(id) },
    include: {
      customer: { select: { name: true, gstin: true } },
      salesOrder: { select: { orderNumber: true } },
      payments: true,
    },
  });
  if (!invoice) return null;
  return {
    ...invoice,
    outstanding: toNumber(invoice.total) - toNumber(invoice.paidAmount),
  };
}

/** Create a customer invoice. Total = subtotal + GST. */
async function createInvoice(data) {
  const { invoiceNo, customerId, salesOrderId, issueDate, dueDate, subtotal, taxAmount, notes } = data;
  if (!invoiceNo || !customerId || !salesOrderId) {
    throw httpError(400, "invoiceNo, customerId and salesOrderId are required");
  }
  const total = toNumber(subtotal) + toNumber(taxAmount);

  return prisma.invoice.create({
    data: {
      invoiceNo,
      customerId: Number(customerId),
      salesOrderId: Number(salesOrderId),
      status: "ISSUED",
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      dueDate: dueDate ? new Date(dueDate) : null,
      subtotal: String(subtotal),
      taxAmount: String(taxAmount),
      total: String(total),
      paidAmount: "0",
      notes: notes || null,
    },
  });
}

/** Record a customer receipt and update the invoice balance + status. */
async function recordReceipt(invoiceId, data) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: Number(invoiceId) },
  });
  if (!invoice) throw httpError(404, "Invoice not found");

  const amount = toNumber(data.amount);
  if (!amount || amount <= 0) {
    throw httpError(400, "amount must be greater than 0");
  }

  const newPaid = toNumber(invoice.paidAmount) + amount;
  if (newPaid > toNumber(invoice.total) + 0.01) {
    throw httpError(400, "Receipt exceeds the invoice outstanding balance");
  }

  const payment = await prisma.payment.create({
    data: {
      paymentNo: data.paymentNo || `RCPT-${Date.now()}`,
      invoiceId: invoice.id,
      amount: String(amount),
      method: data.method || "BANK_TRANSFER",
      referenceNo: data.referenceNo || null,
      receivedAt: data.receivedAt ? new Date(data.receivedAt) : new Date(),
      notes: data.notes || null,
    },
  });

  const status = newPaid >= toNumber(invoice.total) - 0.01 ? "PAID" : "PARTIALLY_PAID";
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { paidAmount: String(newPaid.toFixed(2)), status },
  });

  return {
    payment,
    paidAmount: newPaid,
    outstanding: Math.max(0, toNumber(invoice.total) - newPaid),
    status,
  };
}

// ---------------------------------------------------------------------------
// 2. Payables & Expenses
// ---------------------------------------------------------------------------

/** Payables summary: billed / paid / outstanding / pending approval. */
async function getPayablesSummary() {
  const bills = await prisma.vendorBill.findMany({
    select: { total: true, paidAmount: true, status: true },
  });
  const billed = bills.reduce((s, b) => s + toNumber(b.total), 0);
  const paid = bills.reduce((s, b) => s + toNumber(b.paidAmount), 0);
  const pendingApproval = bills.filter(
    (b) => b.status === "SUBMITTED" || b.status === "DRAFT"
  ).length;

  return {
    billed,
    paid,
    outstanding: billed - paid,
    pendingApproval,
    billCount: bills.length,
  };
}

/** All vendor bills with outstanding balance and PO matching info. */
async function listVendorBills() {
  const bills = await prisma.vendorBill.findMany({
    include: {
      vendor: { select: { name: true } },
      purchaseOrder: { select: { poNumber: true, total: true } },
    },
    orderBy: { id: "desc" },
  });

  return bills.map((b) => ({
    id: b.id,
    billNo: b.billNo,
    vendor: b.vendor.name,
    status: b.status,
    billDate: b.billDate,
    dueDate: b.dueDate,
    total: toNumber(b.total),
    paidAmount: toNumber(b.paidAmount),
    outstanding: toNumber(b.total) - toNumber(b.paidAmount),
    purchaseOrder: b.purchaseOrder ? b.purchaseOrder.poNumber : null,
    matched: Boolean(
      b.purchaseOrder &&
        Math.abs(toNumber(b.total) - toNumber(b.purchaseOrder.total)) < 0.01
    ),
    isExpense: !b.purchaseOrder,
  }));
}

/** Enter a vendor bill (status SUBMITTED - waits for approval). */
async function createVendorBill(data) {
  const { billNo, vendorId, purchaseOrderId, billDate, dueDate, subtotal, taxAmount } = data;
  if (!billNo || !vendorId) {
    throw httpError(400, "billNo and vendorId are required");
  }
  const total = toNumber(subtotal) + toNumber(taxAmount);

  return prisma.vendorBill.create({
    data: {
      billNo,
      vendorId: Number(vendorId),
      purchaseOrderId: purchaseOrderId ? Number(purchaseOrderId) : null,
      status: "SUBMITTED",
      billDate: billDate ? new Date(billDate) : new Date(),
      dueDate: dueDate ? new Date(dueDate) : null,
      subtotal: String(subtotal),
      taxAmount: String(taxAmount),
      total: String(total),
      paidAmount: "0",
    },
  });
}

/** Approve a bill (only ADMIN / FINANCE_MANAGER may call - enforced in route). */
async function approveVendorBill(id) {
  const bill = await prisma.vendorBill.findUnique({ where: { id: Number(id) } });
  if (!bill) throw httpError(404, "Vendor bill not found");
  if (!["DRAFT", "SUBMITTED", "MATCHED"].includes(bill.status)) {
    throw httpError(400, `Cannot approve a bill with status ${bill.status}`);
  }
  return prisma.vendorBill.update({
    where: { id: bill.id },
    data: { status: "APPROVED" },
  });
}

/** 2-way match: link a bill to its purchase order (totals must agree). */
async function matchBillToPO(id, poNumber) {
  const bill = await prisma.vendorBill.findUnique({ where: { id: Number(id) } });
  if (!bill) throw httpError(404, "Vendor bill not found");
  if (!poNumber) throw httpError(400, "poNumber is required");

  const po = await prisma.purchaseOrder.findUnique({ where: { poNumber } });
  if (!po) throw httpError(404, "Purchase order not found");

  if (Math.abs(toNumber(bill.total) - toNumber(po.total)) > 0.01) {
    throw httpError(
      400,
      `Bill total (${toNumber(bill.total)}) does not match PO total (${toNumber(po.total)})`
    );
  }

  return prisma.vendorBill.update({
    where: { id: bill.id },
    data: { purchaseOrderId: po.id, status: "MATCHED" },
  });
}

/** Record a vendor payment and update the bill balance + status. */
async function recordBillPayment(id, data) {
  const bill = await prisma.vendorBill.findUnique({ where: { id: Number(id) } });
  if (!bill) throw httpError(404, "Vendor bill not found");

  const amount = toNumber(data.amount);
  if (!amount || amount <= 0) {
    throw httpError(400, "amount must be greater than 0");
  }

  const newPaid = toNumber(bill.paidAmount) + amount;
  if (newPaid > toNumber(bill.total) + 0.01) {
    throw httpError(400, "Payment exceeds the bill outstanding balance");
  }

  const status = newPaid >= toNumber(bill.total) - 0.01 ? "PAID" : "PARTIALLY_PAID";
  return prisma.vendorBill.update({
    where: { id: bill.id },
    data: { paidAmount: String(newPaid.toFixed(2)), status },
  });
}

/** Expense bills = vendor bills WITHOUT a purchase order (direct expenses). */
async function listExpenses() {
  const bills = await prisma.vendorBill.findMany({
    where: { purchaseOrderId: null },
    include: { vendor: { select: { name: true, category: true } } },
    orderBy: { id: "desc" },
  });

  return bills.map((b) => ({
    id: b.id,
    billNo: b.billNo,
    vendor: b.vendor.name,
    category: b.vendor.category,
    status: b.status,
    billDate: b.billDate,
    total: toNumber(b.total),
    paidAmount: toNumber(b.paidAmount),
    outstanding: toNumber(b.total) - toNumber(b.paidAmount),
  }));
}

// ---------------------------------------------------------------------------
// 3. Costing, Margin & MIS
// ---------------------------------------------------------------------------

/**
 * Job costing for every project.
 * revenue  = sum of invoices issued against the job's sales order
 * costs    = purchase orders reached via PR -> RFQ chain of the same order,
 *            classified by Vendor.category:
 *              "Materials"                    -> materialCost
 *              "Transport"/"Logistics"/...    -> logisticsCost
 *              everything else                -> otherCost
 */
async function getJobCosting() {
  const projects = await prisma.project.findMany({
    include: {
      customer: { select: { name: true } },
      salesOrder: { include: { invoices: true } },
    },
  });

  const rows = [];
  for (const p of projects) {
    const revenue = p.salesOrder.invoices.reduce(
      (s, i) => s + toNumber(i.total),
      0
    );

    const prs = await prisma.purchaseRequest.findMany({
      where: { salesOrderId: p.salesOrderId },
      select: { id: true },
    });
    const rfqs = await prisma.rFQ.findMany({
      where: { purchaseRequestId: { in: prs.map((x) => x.id) } },
      select: { id: true },
    });
    const pos = await prisma.purchaseOrder.findMany({
      where: { rfqId: { in: rfqs.map((x) => x.id) } },
      include: { vendor: { select: { category: true } } },
    });

    let materialCost = 0;
    let logisticsCost = 0;
    let otherCost = 0;
    for (const po of pos) {
      const category = (po.vendor?.category || "").toLowerCase();
      if (category.includes("material")) {
        materialCost += toNumber(po.total);
      } else if (
        category.includes("transport") ||
        category.includes("logistic") ||
        category.includes("freight")
      ) {
        logisticsCost += toNumber(po.total);
      } else {
        otherCost += toNumber(po.total);
      }
    }

    const totalCost = materialCost + logisticsCost + otherCost;
    const profit = revenue - totalCost;
    const margin =
      revenue > 0 ? Number(((profit / revenue) * 100).toFixed(2)) : 0;

    rows.push({
      id: p.id,
      projectCode: p.projectCode,
      projectName: p.name,
      status: p.status,
      customer: p.customer.name,
      revenue,
      materialCost,
      logisticsCost,
      otherCost,
      totalCost,
      profit,
      margin,
    });
  }
  return rows;
}

/** Cost breakdown of one job: each purchase order with its chain numbers. */
async function getJobCostDetail(projectId) {
  const project = await prisma.project.findUnique({
    where: { id: Number(projectId) },
    include: {
      customer: { select: { name: true } },
      salesOrder: { include: { invoices: true } },
    },
  });
  if (!project) throw httpError(404, "Project not found");

  const prs = await prisma.purchaseRequest.findMany({
    where: { salesOrderId: project.salesOrderId },
    select: { id: true },
  });
  const rfqs = await prisma.rFQ.findMany({
    where: { purchaseRequestId: { in: prs.map((x) => x.id) } },
    select: { id: true },
  });
  const pos = await prisma.purchaseOrder.findMany({
    where: { rfqId: { in: rfqs.map((x) => x.id) } },
    include: {
      vendor: { select: { name: true, category: true } },
      rfq: { include: { purchaseRequest: { select: { requestNo: true } } } },
    },
  });

  const revenue = project.salesOrder.invoices.reduce(
    (s, i) => s + toNumber(i.total),
    0
  );

  return {
    projectCode: project.projectCode,
    projectName: project.name,
    customer: project.customer.name,
    salesOrder: project.salesOrder.orderNumber,
    revenue,
    costLines: pos.map((po) => ({
      poNumber: po.poNumber,
      rfqNo: po.rfq?.rfqNo ?? null,
      requestNo: po.rfq?.purchaseRequest?.requestNo ?? null,
      vendor: po.vendor?.name,
      category: po.vendor?.category,
      amount: toNumber(po.total),
    })),
  };
}

module.exports = {
  getReceivablesSummary,
  listInvoices,
  getInvoiceById,
  createInvoice,
  recordReceipt,
  getPayablesSummary,
  listVendorBills,
  createVendorBill,
  approveVendorBill,
  matchBillToPO,
  recordBillPayment,
  listExpenses,
  getJobCosting,
  getJobCostDetail,
};
