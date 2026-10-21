// Costing data access - walks the existing chain
// Project -> SalesOrder -> PurchaseRequest -> RFQ -> PurchaseOrder.
// No extra tables: costs are classified by Vendor.category.
import prisma from "../../../utils/prisma.js";

export async function findProjectsWithOrders() {
  return prisma.project.findMany({
    include: {
      customer: { select: { name: true } },
      salesOrder: { include: { invoices: true } },
    },
  });
}

export async function findProjectById(id) {
  return prisma.project.findUnique({
    where: { id: Number(id) },
    include: {
      customer: { select: { name: true } },
      salesOrder: { include: { invoices: true } },
    },
  });
}

/**
 * All purchase orders that belong to a job's sales order,
 * each with vendor category (used to split material / logistics / other)
 * and the PR + RFQ numbers for audit trails.
 */
export async function findCostOrders(salesOrderId) {
  const requests = await prisma.purchaseRequest.findMany({
    where: { salesOrderId },
    select: { id: true },
  });
  const rfqs = await prisma.rFQ.findMany({
    where: { purchaseRequestId: { in: requests.map((r) => r.id) } },
    select: { id: true },
  });
  return prisma.purchaseOrder.findMany({
    where: { rfqId: { in: rfqs.map((r) => r.id) } },
    include: {
      vendor: { select: { name: true, category: true } },
      rfq: { include: { purchaseRequest: { select: { requestNo: true } } } },
    },
  });
}

export default { findProjectsWithOrders, findProjectById, findCostOrders };
