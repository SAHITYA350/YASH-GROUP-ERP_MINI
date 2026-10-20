// Vendor bill table access - Prisma queries only.
const prisma = require("../../../utils/prisma");

async function findAll() {
  return prisma.vendorBill.findMany({
    include: {
      vendor: { select: { name: true, category: true } },
      purchaseOrder: { select: { poNumber: true, total: true } },
    },
    orderBy: { id: "desc" },
  });
}

/** Expense bills = vendor bills WITHOUT a purchase order. */
async function findExpenses() {
  return prisma.vendorBill.findMany({
    where: { purchaseOrderId: null },
    include: { vendor: { select: { name: true, category: true } } },
    orderBy: { id: "desc" },
  });
}

async function findById(id) {
  return prisma.vendorBill.findUnique({
    where: { id: Number(id) },
    include: {
      vendor: { select: { name: true, category: true } },
      purchaseOrder: { select: { poNumber: true, total: true } },
    },
  });
}

async function findPurchaseOrderByNumber(poNumber) {
  return prisma.purchaseOrder.findUnique({ where: { poNumber } });
}

async function create(data) {
  return prisma.vendorBill.create({ data });
}

async function update(id, data) {
  return prisma.vendorBill.update({ where: { id }, data });
}

module.exports = {
  findAll, findExpenses, findById, findPurchaseOrderByNumber, create, update,
};
