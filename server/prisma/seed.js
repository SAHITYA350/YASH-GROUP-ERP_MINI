// ============================================================================
// YASH GROUP ERP - Seed script (Module 6: Finance & Commercial + RBAC)
// ----------------------------------------------------------------------------
// How it works:
//   - Every record is created with `upsert` on a UNIQUE field from schema.prisma
//     (email, code, invoiceNo, billNo, poNumber, ...). Running this script any
//     number of times NEVER duplicates records - it only creates what is missing.
//   - Existing users keep their current password (update does not touch passwordHash).
//   - New users get the password from SEED_TEST_PASSWORD in server/.env
//     (bcrypt, 12 rounds).
//
// Run it with:  npx prisma db seed     (or: npm run seed)
//
// The schema is used EXACTLY as defined in prisma/schema.prisma - no extra
// tables. Job costing is derived from existing records:
//   Project -> SalesOrder -> PurchaseRequest -> RFQ -> PurchaseOrder -> Vendor
// and costs are classified by the Vendor.category text ("Materials",
// "Transport", "Site Services").
// ============================================================================

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

/** Days from now, e.g. daysFromNow(-30) => 30 days ago. */
function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

/** Format a number as Indian Rupees for console output. */
function inr(value) {
  return "\u20B9" + Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

// ---------------------------------------------------------------------------
// Module 6 test data (all figures are fictional test values)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 2. Module 6 test data (all figures are fictional test values)
// ---------------------------------------------------------------------------

// --- Workflow 1: Billing & Receivables -----------------
// Invoice INV-TEST-001: total 1,18,000 | paid 50,000 | outstanding 68,000
// Invoice INV-TEST-002: total 47,200   | overdue (due date 30 days ago)
const SEED_INVOICES = [
  {
    invoiceNo: "INV-TEST-001",
    subtotal: "100000", taxAmount: "18000", total: "118000", paidAmount: "50000",
    status: "PARTIALLY_PAID", issueDaysAgo: 30, dueInDays: 15,
  },
  {
    invoiceNo: "INV-TEST-002",
    subtotal: "40000", taxAmount: "7200", total: "47200", paidAmount: "0",
    status: "OVERDUE", issueDaysAgo: 60, dueInDays: -30,
  },
  // Job invoice for JOB-TEST-001 (used by the costing workflow below):
  {
    invoiceNo: "INV-JOB-001",
    subtotal: "169491.53", taxAmount: "30508.47", total: "200000", paidAmount: "200000",
    status: "PAID", issueDaysAgo: 25, dueInDays: 5,
  },
];

// --- Workflow 2: Payables & Expenses -------------------
// Bill BILL-TEST-001: total 59,000 | paid 20,000 | outstanding 39,000 | matched to PO + GRN
// Expense bills (no purchase order = direct expense):
//   EXP-TRANSPORT-001  10,000  APPROVED
//   EXP-CONSUMABLE-001  5,000  SUBMITTED (waiting for approval)
const SEED_VENDOR_BILLS = [
  {
    billNo: "BILL-TEST-001", vendorCode: "VEND-TEST-001", poNumber: "PO-TEST-001",
    subtotal: "50000", taxAmount: "9000", total: "59000", paidAmount: "20000",
    status: "PARTIALLY_PAID", billDaysAgo: 14, dueInDays: 16,
  },
  {
    billNo: "EXP-TRANSPORT-001", vendorCode: "VEND-LOG-TEST", poNumber: null,
    subtotal: "8474.58", taxAmount: "1525.42", total: "10000", paidAmount: "0",
    status: "APPROVED", billDaysAgo: 5, dueInDays: 25,
  },
  {
    billNo: "EXP-CONSUMABLE-001", vendorCode: "VEND-SVC-TEST", poNumber: null,
    subtotal: "4237.29", taxAmount: "762.71", total: "5000", paidAmount: "0",
    status: "SUBMITTED", billDaysAgo: 2, dueInDays: 28,
  },
];

// --- Workflow 3: Costing, Margin & MIS ------------------
// Job JOB-TEST-001: revenue 2,00,000 | material 80,000 | logistics 10,000
// | other 20,000 -> total cost 1,10,000 | profit 90,000 | margin 45%
// Costs flow through the existing procurement chain and are classified by
// Vendor.category: "Materials" -> material, "Transport" -> logistics,
// everything else -> other costs.
const JOB_COST_POS = [
  {
    // material cost
    pr: { requestNo: "PR-TEST-001", notes: "Material procurement for JOB-TEST-001" },
    rfq: { rfqNo: "RFQ-TEST-001" },
    po: { poNumber: "PO-COST-001", vendorCode: "VEND-TEST-001", subtotal: "67796.61", taxAmount: "12203.39", total: "80000" },
  },
  {
    // logistics cost
    pr: { requestNo: "PR-TEST-002", notes: "Logistics for JOB-TEST-001" },
    rfq: { rfqNo: "RFQ-TEST-002" },
    po: { poNumber: "PO-COST-002", vendorCode: "VEND-LOG-TEST", subtotal: "8474.58", taxAmount: "1525.42", total: "10000" },
  },
  {
    // other job costs
    pr: { requestNo: "PR-TEST-003", notes: "Site services for JOB-TEST-001" },
    rfq: { rfqNo: "RFQ-TEST-003" },
    po: { poNumber: "PO-COST-003", vendorCode: "VEND-SVC-TEST", subtotal: "16949.15", taxAmount: "3050.85", total: "20000" },
  },
];

// ---------------------------------------------------------------------------
// Helper upserts (unique keys come from schema.prisma)
// ---------------------------------------------------------------------------
async function upsert(table, where, create, update = {}) {
  return prisma[table].upsert({ where, update, create });
}

async function main() {
  console.log("======================================================");
  console.log("  YASH GROUP ERP - Module 6 seed (Finance & RBAC)");
  console.log("======================================================\n");

  // Query existing user in DB if any exists (e.g. created by other modules/teammates)
  // or fall back gracefully without seeding users or roles.
  let defaultUser = await prisma.user.findFirst();
  if (!defaultUser) {
    // If no user table entry exists yet, create minimal system user record so relations satisfy constraints
    defaultUser = await prisma.user.create({
      data: {
        name: "System",
        email: "system@yash.internal",
        passwordHash: "system_internal_placeholder",
      },
    });
  }

  // ---------- 3. Customers & vendors ----------
  const customer = await upsert("customer",
    { code: "CUST-TEST-001" },
    {
      code: "CUST-TEST-001",
      name: "Test Customer Pvt Ltd",
      legalName: "Test Customer Private Limited",
      email: "billing@testcustomer.test",
      phone: "+91 90000 00001",
      gstin: "27AABCT1234F1Z5",
      city: "Pune", state: "Maharashtra", country: "India",
    }
  );
  console.log("  [customer]  CUST-TEST-001 - Test Customer Pvt Ltd");

  const vendors = {};
  const VENDOR_DEFS = [
    { code: "VEND-TEST-001", name: "Test Supplier Pvt Ltd", category: "Materials", city: "Mumbai" },
    { code: "VEND-LOG-TEST",  name: "Test Transport Co",    category: "Transport", city: "Pune" },
    { code: "VEND-SVC-TEST",  name: "Test Site Services Co", category: "Site Services", city: "Pune" },
  ];
  for (const v of VENDOR_DEFS) {
    vendors[v.code] = await upsert("vendor",
      { code: v.code },
      {
        code: v.code, name: v.name, category: v.category,
        gstin: "27BBBCS5678G1Z2", city: v.city, state: "Maharashtra",
      }
    );
    console.log(`  [vendor]    ${v.code} - ${v.name} (${v.category})`);
  }
  console.log("");

  // ---------- 4. Sales orders ----------
  // SO-TEST-001 backs the billing workflow invoices (1,18,000 order value).
  const order = await upsert("salesOrder",
    { orderNumber: "SO-TEST-001" },
    {
      orderNumber: "SO-TEST-001",
      customerId: customer.id,
      createdById: defaultUser.id,
      status: "COMPLETED",
      subtotal: "100000", gstAmount: "18000", grandTotal: "118000",
      invoiceStatus: "Issued",
      orderDate: daysFromNow(-45),
    }
  );
  console.log("  [order]     SO-TEST-001  - value " + inr("118000") + " (billing workflow)");

  // SO-COST-001 backs JOB-TEST-001 (2,00,000 job revenue).
  const costOrder = await upsert("salesOrder",
    { orderNumber: "SO-COST-001" },
    {
      orderNumber: "SO-COST-001",
      customerId: customer.id,
      createdById: defaultUser.id,
      status: "DELIVERED",
      subtotal: "169491.53", gstAmount: "30508.47", grandTotal: "200000",
      invoiceStatus: "Issued",
      orderDate: daysFromNow(-40),
    }
  );
  console.log("  [order]     SO-COST-001 - value " + inr("200000") + " (job costing workflow)\n");

  // ---------- 5. Invoices + receipts (Billing & Receivables) ----------
  const invoices = {};
  for (const inv of SEED_INVOICES) {
    const salesOrderId = inv.invoiceNo === "INV-JOB-001" ? costOrder.id : order.id;
    const saved = await upsert("invoice",
      { invoiceNo: inv.invoiceNo },
      {
        invoiceNo: inv.invoiceNo,
        customerId: customer.id,
        salesOrderId,
        status: inv.status,
        issueDate: daysFromNow(-inv.issueDaysAgo),
        dueDate: daysFromNow(inv.dueInDays),
        subtotal: inv.subtotal, taxAmount: inv.taxAmount,
        total: inv.total, paidAmount: inv.paidAmount,
      }
    );
    invoices[inv.invoiceNo] = saved;
    const outstanding = Number(inv.total) - Number(inv.paidAmount);
    console.log(
      `  [invoice]   ${inv.invoiceNo} - ${inv.status.padEnd(16)} total ${inr(inv.total).padEnd(14)} ` +
      `paid ${inr(inv.paidAmount).padEnd(14)} outstanding ${inr(outstanding)}`
    );
  }

  // Receipts (Payment records) - paidAmount on each invoice above matches these.
  const RECEIPTS = [
    { paymentNo: "RCPT-TEST-001", invoiceNo: "INV-TEST-001", amount: "50000",  method: "BANK_TRANSFER", ref: "NEFT-2026-1017", daysAgo: 10 },
    { paymentNo: "RCPT-JOB-001",  invoiceNo: "INV-JOB-001",  amount: "200000", method: "BANK_TRANSFER", ref: "RTGS-2026-1012", daysAgo: 8 },
  ];
  for (const r of RECEIPTS) {
    await upsert("payment",
      { paymentNo: r.paymentNo },
      {
        paymentNo: r.paymentNo,
        invoiceId: invoices[r.invoiceNo].id,
        amount: r.amount,
        method: r.method,
        referenceNo: r.ref,
        receivedAt: daysFromNow(-r.daysAgo),
      }
    );
    console.log(`  [receipt]   ${r.paymentNo} - ${inr(r.amount)} against ${r.invoiceNo} (${r.method})`);
  }
  console.log("");

  // ---------- 6. Payables: PO + GRN + vendor bill (3-way match) ----------
  const po = await upsert("purchaseOrder",
    { poNumber: "PO-TEST-001" },
    {
      poNumber: "PO-TEST-001",
      vendorId: vendors["VEND-TEST-001"].id,
      status: "RECEIVED",
      orderDate: daysFromNow(-20),
      subtotal: "50000", taxAmount: "9000", total: "59000",
    }
  );
  console.log("  [po]        PO-TEST-001  - " + inr("59000") + " (vendor: Test Supplier)");

  await upsert("goodsReceipt",
    { grnNumber: "GRN-TEST-001" },
    {
      grnNumber: "GRN-TEST-001",
      purchaseOrderId: po.id,
      status: "ACCEPTED",
      receivedAt: daysFromNow(-15),
    }
  );
  console.log("  [grn]       GRN-TEST-001 - ACCEPTED against PO-TEST-001");

  // Vendor bill BILL-TEST-001 + the two expense bills.
  for (const b of SEED_VENDOR_BILLS) {
    await upsert("vendorBill",
      { billNo: b.billNo },
      {
        billNo: b.billNo,
        vendorId: vendors[b.vendorCode].id,
        purchaseOrderId: b.poNumber === "PO-TEST-001" ? po.id : null,
        status: b.status,
        billDate: daysFromNow(-b.billDaysAgo),
        dueDate: daysFromNow(b.dueInDays),
        subtotal: b.subtotal, taxAmount: b.taxAmount,
        total: b.total, paidAmount: b.paidAmount,
      }
    );
    const outstanding = Number(b.total) - Number(b.paidAmount);
    const poInfo = b.poNumber ? ` (matched: ${b.poNumber} + GRN-TEST-001)` : " (expense, no PO)";
    console.log(
      `  [bill]      ${b.billNo} - ${b.status.padEnd(16)} total ${inr(b.total).padEnd(12)} ` +
      `paid ${inr(b.paidAmount).padEnd(12)} outstanding ${inr(outstanding)}${poInfo}`
    );
  }
  console.log("");

  // ---------- 7. Costing: project + procurement chain (PR -> RFQ -> PO) ----------
  const project = await upsert("project",
    { projectCode: "JOB-TEST-001" },
    {
      projectCode: "JOB-TEST-001",
      salesOrderId: costOrder.id,
      customerId: customer.id,
      ownerId: defaultUser.id,
      name: "Test Job - Costing Demo",
      status: "IN_PROGRESS",
      plannedStart: daysFromNow(-20),
    }
  );
  console.log("  [project]   JOB-TEST-001 - Test Job - Costing Demo (IN_PROGRESS)");

  for (const c of JOB_COST_POS) {
    const pr = await upsert("purchaseRequest",
      { requestNo: c.pr.requestNo },
      {
        requestNo: c.pr.requestNo,
        salesOrderId: costOrder.id,
        status: "CONVERTED",
        requestedById: defaultUser.id,
        notes: c.pr.notes,
      }
    );
    const rfq = await upsert("rFQ",
      { rfqNo: c.rfq.rfqNo },
      {
        rfqNo: c.rfq.rfqNo,
        purchaseRequestId: pr.id,
        status: "AWARDED",
        sentAt: daysFromNow(-18),
      }
    );
    await upsert("purchaseOrder",
      { poNumber: c.po.poNumber },
      {
        poNumber: c.po.poNumber,
        vendorId: vendors[c.po.vendorCode].id,
        rfqId: rfq.id,
        status: "RECEIVED",
        orderDate: daysFromNow(-18),
        subtotal: c.po.subtotal, taxAmount: c.po.taxAmount, total: c.po.total,
      }
    );
    console.log(
      `  [cost]      ${c.pr.requestNo} -> ${c.rfq.rfqNo} -> ${c.po.poNumber} ` +
      `${inr(c.po.total)} (${vendors[c.po.vendorCode].category})`
    );
  }

  // ---------- 8. CRM leads (+ follow-ups) and service tickets ----------
  const SEED_LEADS = [
    { code: "LEAD-TEST-001", customerName: "Test Customer Pvt Ltd", contactName: "Amit Sharma", email: "amit@testcustomer.test", phone: "+91 90000 11111", city: "Pune", state: "Maharashtra", source: "INDIAN_MART", stage: "QUALIFIED", priority: "HIGH", intent: "Positive", productName: "Industrial Chiller", quantity: 2, expectedValue: "250000", requirement: "2 x 5TR water-cooled chillers for new plant", followUpInDays: 3, note: "Shared catalogue; awaiting site dimensions." },
    { code: "LEAD-TEST-002", customerName: "Sunrise Fabricators", contactName: "Neha Patil", email: "neha@sunrise.test", phone: "+91 90000 22222", city: "Nashik", state: "Maharashtra", source: "REFERRAL", stage: "CONTACTED", priority: "MEDIUM", intent: "Neutral", productName: "Fabrication Job", quantity: 1, expectedValue: "85000", requirement: "Custom MS fabrication, 2-week turnaround", followUpInDays: 7, note: "First call done; sending quotation draft." },
    { code: "LEAD-TEST-003", customerName: "Global Exports Ltd", contactName: "Rohan Mehta", email: "rohan@globalexports.test", phone: "+91 90000 33333", city: "Mumbai", state: "Maharashtra", source: "WEBSITE", stage: "NEW", priority: "LOW", intent: "Positive", productName: "Spare Kit", quantity: 5, expectedValue: "40000", requirement: "Annual spare kit enquiry", followUpInDays: 10, note: "Inbound website form; not yet called." },
  ];
  for (const l of SEED_LEADS) {
    const lead = await upsert("lead",
      { code: l.code },
      {
        code: l.code, customerName: l.customerName, contactName: l.contactName,
        email: l.email, phone: l.phone, city: l.city, state: l.state,
        source: l.source, stage: l.stage, priority: l.priority, intent: l.intent,
        productName: l.productName, quantity: l.quantity, expectedValue: l.expectedValue,
        requirement: l.requirement, customerId: customer.id, assignedToId: defaultUser.id,
        nextFollowUpAt: daysFromNow(l.followUpInDays), lastActivityNote: l.note,
      }
    );
    const comms = await prisma.communication.count({ where: { leadId: lead.id } });
    if (comms === 0) {
      await prisma.communication.create({
        data: {
          leadId: lead.id, userId: defaultUser.id, channel: "CALL",
          direction: "OUTBOUND", subject: "Follow-up", body: l.note,
          status: "DONE", sentAt: daysFromNow(-1), followUpAt: daysFromNow(l.followUpInDays),
        },
      });
    }
    console.log(
      `  [lead]      ${l.code} - ${l.customerName.padEnd(24)} ${l.stage.padEnd(12)} ` +
      `${l.priority.padEnd(8)} value ${inr(l.expectedValue)}`
    );
  }
  console.log("");

  const SEED_TICKETS = [
    { ticketNo: "SVC-TEST-001", issue: "Chiller not cooling below set point", status: "IN_PROGRESS", serialNumber: "SN-CHL-0001", reportedDaysAgo: 4, warrantyEndInDays: 300, assigned: defaultUser },
    { ticketNo: "SVC-TEST-002", issue: "Noise from compressor unit", status: "OPEN", serialNumber: "SN-CMP-0002", reportedDaysAgo: 1, warrantyEndInDays: 120, assigned: null },
    { ticketNo: "SVC-TEST-003", issue: "Annual maintenance visit", status: "CLOSED", serialNumber: "SN-CHL-0003", reportedDaysAgo: 30, warrantyEndInDays: -10, assigned: defaultUser, resolvedDaysAgo: 25, resolution: "Completed AMC; replaced filter and tested." },
  ];
  for (const t of SEED_TICKETS) {
    await upsert("serviceTicket",
      { ticketNo: t.ticketNo },
      {
        ticketNo: t.ticketNo, customerId: customer.id, issue: t.issue, status: t.status,
        serialNumber: t.serialNumber, assignedToId: t.assigned ? t.assigned.id : null,
        reportedAt: daysFromNow(-t.reportedDaysAgo),
        warrantyStart: daysFromNow(-400), warrantyEnd: daysFromNow(t.warrantyEndInDays),
        resolvedAt: t.resolvedDaysAgo != null ? daysFromNow(-t.resolvedDaysAgo) : null,
        resolution: t.resolution || null,
      }
    );
    console.log(
      `  [ticket]    ${t.ticketNo} - ${t.status.padEnd(12)} ${t.issue}`
    );
  }

  // ---------- Summary & self-check ----------
  console.log("");
  console.log("------------------------------------------------------");
  console.log("  SEED COMPLETE - expected dashboard numbers");
  console.log("------------------------------------------------------");
  console.log("  Receivables : invoiced " + inr(118000 + 47200 + 200000) +
    " | received " + inr(250000) + " | outstanding " + inr(68000 + 47200) +
    " | overdue " + inr(47200));
  console.log("  Payables    : billed " + inr(59000 + 10000 + 5000) +
    " | paid " + inr(20000) + " | outstanding " + inr(39000 + 10000 + 5000));
  console.log("  Job JOB-TEST-001: revenue " + inr(200000) +
    " | costs " + inr(110000) + " (material " + inr(80000) + ", logistics " +
    inr(10000) + ", other " + inr(20000) + ")");
  console.log("                  profit " + inr(90000) + " | margin 45%");
  console.log("------------------------------------------------------");
  console.log("  Re-running this seed is safe - no duplicates are created.\n");
}

main()
  .catch((error) => {
    console.error("\nSeed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
