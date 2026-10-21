// server/modules/project/project.repository.js
import { prisma } from '../../lib/prisma.js';

export async function findMany({ where, skip, take, orderBy }) {
  return prisma.project.findMany({
    where,
    skip,
    take,
    orderBy: orderBy || { createdAt: 'desc' },
    include: {
      customer: true,
      salesOrder: {
        include: {
          items: { include: { product: true } },
        },
      },
      owner: { select: { id: true, name: true, email: true } },
      installations: true,
      tasks: true,
      mediaAssets: true,
    },
  });
}

export async function count({ where }) {
  return prisma.project.count({ where });
}

export async function findById(id) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      customer: true,
      salesOrder: {
        include: {
          items: { include: { product: true } },
        },
      },
      owner: { select: { id: true, name: true, email: true } },
      installations: {
        include: { mediaAssets: true },
      },
      tasks: {
        include: { assignedTo: true },
      },
      mediaAssets: true,
    },
  });
}

export async function create(data) {
  return prisma.project.create({
    data,
    include: { customer: true, salesOrder: true },
  });
}

export async function update(id, data) {
  return prisma.project.update({
    where: { id },
    data,
    include: { customer: true, salesOrder: true },
  });
}

export default {
  findMany,
  count,
  findById,
  create,
  update,
};
