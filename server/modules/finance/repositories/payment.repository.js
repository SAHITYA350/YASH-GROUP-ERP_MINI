// Payment (customer receipt) table access - Prisma queries only.
import prisma from "../../../utils/prisma.js";

export async function findAll() {
  return prisma.payment.findMany({
    include: { invoice: { select: { invoiceNo: true, customerId: true } } },
    orderBy: { receivedAt: "desc" },
  });
}

/** Total money received across all receipts (single source for dashboards). */
export async function sumReceived() {
  const agg = await prisma.payment.aggregate({ _sum: { amount: true } });
  return Number(agg._sum.amount ?? 0);
}

export async function create(data) {
  return prisma.payment.create({ data });
}

export default { findAll, sumReceived, create };
