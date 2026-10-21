// server/modules/serviceTicket/serviceTicket.repository.js
import { prisma } from '../../lib/prisma.js';

export async function findMany({ where, skip, take, orderBy }) {
  return prisma.serviceTicket.findMany({
    where,
    skip,
    take,
    orderBy: orderBy || { reportedAt: 'desc' },
    include: {
      customer: true,
      product: true,
      assignedTo: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function count({ where }) {
  return prisma.serviceTicket.count({ where });
}

export async function findById(id) {
  return prisma.serviceTicket.findUnique({
    where: { id },
    include: {
      customer: true,
      product: true,
      assignedTo: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function create(data) {
  return prisma.serviceTicket.create({
    data,
    include: { customer: true, product: true },
  });
}

export async function update(id, data) {
  return prisma.serviceTicket.update({
    where: { id },
    data,
    include: { customer: true, product: true },
  });
}

export default {
  findMany,
  count,
  findById,
  create,
  update,
};
