// Job costing (workflow C): revenue, material / logistics / other costs,
// gross profit and margin - derived from existing tables only.
//
//   revenue = invoices issued against the job's sales order
//   costs   = purchase orders reached via PR -> RFQ of the same sales order,
//             classified by Vendor.category
const repo = require("../repositories/costing.repository");
const calc = require("../utils/paymentCalculator");
const httpError = require("../../../utils/httpError");

/** Map a vendor category onto a cost bucket. */
function classify(vendorCategory) {
  const c = (vendorCategory || "").toLowerCase();
  if (c.includes("material")) return "material";
  if (c.includes("transport") || c.includes("logistic") || c.includes("freight")) {
    return "logistics";
  }
  return "other";
}

async function costingFor(project) {
  const revenue = project.salesOrder.invoices.reduce(
    (s, i) => s + Number(i.total),
    0
  );
  const orders = await repo.findCostOrders(project.salesOrderId);

  let materialCost = 0;
  let logisticsCost = 0;
  let otherCost = 0;
  for (const po of orders) {
    const amount = Number(po.total);
    const kind = classify(po.vendor?.category);
    if (kind === "material") materialCost += amount;
    else if (kind === "logistics") logisticsCost += amount;
    else otherCost += amount;
  }

  const totalCost = calc.round2(materialCost + logisticsCost + otherCost);
  const profit = calc.round2(revenue - totalCost);
  const margin = revenue > 0 ? Number(((profit / revenue) * 100).toFixed(2)) : 0;

  return {
    revenue: calc.round2(revenue),
    materialCost: calc.round2(materialCost),
    logisticsCost: calc.round2(logisticsCost),
    otherCost: calc.round2(otherCost),
    totalCost,
    profit,
    margin,
    orders,
  };
}

/** Costing row for every job (used by the dashboard and Costing page). */
async function listJobCosting() {
  const projects = await repo.findProjectsWithOrders();
  const rows = [];
  for (const p of projects) {
    const c = await costingFor(p);
    rows.push({
      id: p.id,
      projectCode: p.projectCode,
      projectName: p.name,
      status: p.status,
      customer: p.customer.name,
      revenue: c.revenue,
      materialCost: c.materialCost,
      logisticsCost: c.logisticsCost,
      otherCost: c.otherCost,
      totalCost: c.totalCost,
      profit: c.profit,
      margin: c.margin,
    });
  }
  return rows;
}

/** Full cost breakdown of one job, including the PR / RFQ / PO audit trail. */
async function getJobCostDetail(projectId) {
  const project = await repo.findProjectById(projectId);
  if (!project) throw httpError(404, "Project not found");

  const c = await costingFor(project);
  return {
    projectCode: project.projectCode,
    projectName: project.name,
    customer: project.customer.name,
    salesOrder: project.salesOrder.orderNumber,
    revenue: c.revenue,
    materialCost: c.materialCost,
    logisticsCost: c.logisticsCost,
    otherCost: c.otherCost,
    totalCost: c.totalCost,
    profit: c.profit,
    margin: c.margin,
    costLines: c.orders.map((po) => ({
      poNumber: po.poNumber,
      rfqNo: po.rfq?.rfqNo ?? null,
      requestNo: po.rfq?.purchaseRequest?.requestNo ?? null,
      vendor: po.vendor?.name,
      category: po.vendor?.category,
      kind: classify(po.vendor?.category),
      amount: Number(po.total),
    })),
  };
}

module.exports = { listJobCosting, getJobCostDetail };
