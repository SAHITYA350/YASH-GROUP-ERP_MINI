// Finance dashboard + management reports (MIS).
// Every block reuses the same services the individual pages use, so the
// dashboard can never disagree with the invoice / bill / costing screens.
const receivables = require("./receivables.service");
const vendorBill = require("./vendorBill.service");
const costing = require("./costing.service");
const calc = require("../utils/paymentCalculator");

/** Payables summary derived from the same bill list the UI shows. */
async function getPayablesSummary() {
  const bills = await vendorBill.listBills();
  const billed = bills.reduce((s, b) => s + b.total, 0);
  const paid = bills.reduce((s, b) => s + b.paidAmount, 0);
  const pendingApproval = bills.filter(
    (b) => b.status === "SUBMITTED" || b.status === "DRAFT"
  ).length;

  return {
    billed: calc.round2(billed),
    paid: calc.round2(paid),
    outstanding: calc.round2(billed - paid),
    pendingApproval,
    billCount: bills.length,
  };
}

/** GET /api/finance/dashboard - one call, three blocks. */
async function getDashboard() {
  const [recv, payables, jobs] = await Promise.all([
    receivables.getSummary(),
    getPayablesSummary(),
    costing.listJobCosting(),
  ]);
  return { receivables: recv, payables, jobs };
}

/** GET /api/finance/reports/mis - company roll-up + per-job profit & margin. */
async function getMisReport() {
  const [recv, payables, jobs] = await Promise.all([
    receivables.getSummary(),
    getPayablesSummary(),
    costing.listJobCosting(),
  ]);

  const jobRevenue = jobs.reduce((s, j) => s + j.revenue, 0);
  const jobCost = jobs.reduce((s, j) => s + j.totalCost, 0);
  const grossProfit = calc.round2(jobRevenue - jobCost);

  return {
    generatedAt: new Date(),
    receivables: recv,
    payables,
    jobs,
    totals: {
      jobRevenue: calc.round2(jobRevenue),
      jobCost: calc.round2(jobCost),
      grossProfit,
      grossMargin:
        jobRevenue > 0 ? Number(((grossProfit / jobRevenue) * 100).toFixed(2)) : 0,
    },
  };
}

module.exports = { getDashboard, getMisReport, getPayablesSummary };
