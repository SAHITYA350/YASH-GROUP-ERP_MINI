// server/modules/vendor/vendor.service.js
import { prisma } from '../../lib/prisma.js';
import { toId } from '../../common/utils.js';

export async function listVendors({ search, category, isActive, page = 1, pageSize = 50 } = {}) {
  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
      { contactName: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (category && category !== 'ALL') {
    where.category = { contains: category, mode: 'insensitive' };
  }
  if (isActive !== undefined && isActive !== 'ALL') {
    where.isActive = isActive === 'true' || isActive === true;
  }

  const skip = (Number(page) - 1) * Number(pageSize);
  const take = Number(pageSize);

  const [data, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      skip,
      take,
      orderBy: { id: 'desc' },
      include: {
        vendorItems: {
          include: {
            product: { select: { id: true, name: true, sku: true, unitOfMeasure: true } },
          },
        },
        _count: {
          select: {
            purchaseOrders: true,
            rfqResponses: true,
          },
        },
      },
    }),
    prisma.vendor.count({ where }),
  ]);

  return { data, total, page: Number(page), pageSize: Number(pageSize) };
}

export async function getVendorById(id) {
  const nid = toId(id);
  if (!nid) return null;
  return prisma.vendor.findUnique({
    where: { id: nid },
    include: {
      vendorItems: {
        include: { product: true },
      },
      purchaseOrders: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
      rfqResponses: {
        take: 10,
        orderBy: { quotedAt: 'desc' },
      },
    },
  });
}

export async function createVendor(payload) {
  const code = payload.code || `VND-${Date.now().toString().slice(-4)}`;
  return prisma.vendor.create({
    data: {
      code,
      name: String(payload.name).trim(),
      contactName: payload.contactPerson || payload.contactName || null,
      email: payload.email || null,
      phone: payload.phone || null,
      gstin: payload.gstin || null,
      pan: payload.pan || null,
      city: payload.city || null,
      state: payload.state || null,
      category: payload.category || 'RAW_MATERIAL',
      paymentTerms: payload.paymentTerms || 'Net 30 Days',
      rating: payload.rating ? Number(payload.rating) : 4.0,
      qualityScore: payload.qualityScore ? Number(payload.qualityScore) : 92.0,
      onTimeDeliveryPercent: payload.onTimeDeliveryPercent ? Number(payload.onTimeDeliveryPercent) : 88.0,
      notes: payload.notes || null,
      isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
    },
  });
}

export async function updateVendor(id, payload) {
  const nid = toId(id);
  const data = {};
  if (payload.name) data.name = String(payload.name).trim();
  if (payload.contactPerson !== undefined || payload.contactName !== undefined) {
    data.contactName = payload.contactPerson || payload.contactName;
  }
  if (payload.email !== undefined) data.email = payload.email;
  if (payload.phone !== undefined) data.phone = payload.phone;
  if (payload.gstin !== undefined) data.gstin = payload.gstin;
  if (payload.pan !== undefined) data.pan = payload.pan;
  if (payload.city !== undefined) data.city = payload.city;
  if (payload.state !== undefined) data.state = payload.state;
  if (payload.category !== undefined) data.category = payload.category;
  if (payload.paymentTerms !== undefined) data.paymentTerms = payload.paymentTerms;
  if (payload.rating !== undefined) data.rating = Number(payload.rating);
  if (payload.qualityScore !== undefined) data.qualityScore = Number(payload.qualityScore);
  if (payload.onTimeDeliveryPercent !== undefined) data.onTimeDeliveryPercent = Number(payload.onTimeDeliveryPercent);
  if (payload.isActive !== undefined) data.isActive = Boolean(payload.isActive);
  if (payload.notes !== undefined) data.notes = payload.notes;

  return prisma.vendor.update({
    where: { id: nid },
    data,
  });
}

export default {
  listVendors,
  getVendorById,
  createVendor,
  updateVendor,
};
