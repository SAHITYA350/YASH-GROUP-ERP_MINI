// Vendor bill table access - Prisma queries only.
import prisma from "../../../utils/prisma.js";

export async function findAll() {
  return prisma.vendorBill.findMany({
    include: {
      vendor: { select: { name: true, category: true } },
      purchaseOrder: { select: { poNumber: true, total: true } },
    },
    orderBy: { id: "desc" },
  });
}

/** Expense bills = vendor bills WITHOUT a purchase order. */
export async function findExpenses() {
  return prisma.vendorBill.findMany({
    where: { purchaseOrderId: null },
    include: { vendor: { select: { name: true, category: true } } },
    orderBy: { id: "desc" },
  });
}

export async function findById(id) {
  return prisma.vendorBill.findUnique({
    where: { id: Number(id) },
    include: {
      vendor: { select: { name: true, category: true } },
      purchaseOrder: { select: { poNumber: true, total: true } },
    },
  });
}

export async function findPurchaseOrderByNumber(poNumber) {
  return prisma.purchaseOrder.findUnique({ where: { poNumber } });
}

export async function create(data) {
  return prisma.vendorBill.create({ data });
}

export async function update(id, data) {
  return prisma.vendorBill.update({ where: { id }, data });
}

export default {
  findAll,
  findExpenses,
  findById,
  findPurchaseOrderByNumber,
  create,
  update,
};
