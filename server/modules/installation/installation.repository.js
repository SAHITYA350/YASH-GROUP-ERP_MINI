// server/modules/installation/installation.repository.js
import { prisma } from '../../lib/prisma.js';

export async function findMany({ where, skip, take, orderBy }) {
  return prisma.installation.findMany({
    where,
    skip,
    take,
    orderBy: orderBy || { createdAt: 'desc' },
    include: {
      project: {
        include: {
          customer: true,
          salesOrder: true,
        },
      },
      mediaAssets: true,
    },
  });
}

export async function count({ where }) {
  return prisma.installation.count({ where });
}

export async function findById(id) {
  return prisma.installation.findUnique({
    where: { id },
    include: {
      project: {
        include: {
          customer: true,
          salesOrder: true,
        },
      },
      mediaAssets: true,
    },
  });
}

export async function create(data) {
  return prisma.installation.create({
    data,
    include: { project: true },
  });
}

export async function update(id, data) {
  return prisma.installation.update({
    where: { id },
    data,
    include: { project: true },
  });
}

export default {
  findMany,
  count,
  findById,
  create,
  update,
};
