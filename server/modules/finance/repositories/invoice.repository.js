// Invoice table access - Prisma queries only, no business rules here.
// Business rules live in services/invoice.service.js.
import prisma from "../../../utils/prisma.js";

export async function findAll() {
  return prisma.invoice.findMany({
    include: { customer: { select: { name: true } } },
    orderBy: { id: "desc" },
  });
}

export async function findById(id) {
  return prisma.invoice.findUnique({
    where: { id: Number(id) },
    include: {
      customer: { select: { name: true, gstin: true } },
      salesOrder: { select: { orderNumber: true } },
      payments: true,
    },
  });
}

/** Lightweight rows for summaries / ageing (no relations). */
export async function findBalances() {
  return prisma.invoice.findMany({
    select: {
      id: true, invoiceNo: true, customerId: true, status: true,
      dueDate: true, total: true, paidAmount: true,
    },
  });
}

export async function count() {
  return prisma.invoice.count();
}

export async function create(data) {
  return prisma.invoice.create({ data });
}

export async function updateBalance(id, paidAmount, status) {
  return prisma.invoice.update({
    where: { id },
    data: { paidAmount, status },
  });
}

export default { findAll, findById, findBalances, count, create, updateBalance };
