// Invoice table access - Prisma queries only, no business rules here.
// Business rules live in services/invoice.service.js.
const prisma = require("../../../utils/prisma");

async function findAll() {
  return prisma.invoice.findMany({
    include: { customer: { select: { name: true } } },
    orderBy: { id: "desc" },
  });
}

async function findById(id) {
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
async function findBalances() {
  return prisma.invoice.findMany({
    select: {
      id: true, invoiceNo: true, customerId: true, status: true,
      dueDate: true, total: true, paidAmount: true,
    },
  });
}

async function count() {
  return prisma.invoice.count();
}

async function create(data) {
  return prisma.invoice.create({ data });
}

async function updateBalance(id, paidAmount, status) {
  return prisma.invoice.update({
    where: { id },
    data: { paidAmount, status },
  });
}

module.exports = { findAll, findById, findBalances, count, create, updateBalance };
