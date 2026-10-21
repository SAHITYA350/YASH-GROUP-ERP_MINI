// server/modules/procurement/procurement.service.js
import { prisma } from '../../lib/prisma.js';
import { toId } from '../../common/utils.js';

export async function listPurchaseRequests() {
  return prisma.purchaseRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      salesOrder: {
        select: { id: true, orderNumber: true, customer: { select: { id: true, name: true } } },
      },
      items: {
        include: {
          product: { select: { id: true, name: true, sku: true, unitOfMeasure: true } },
        },
      },
      rfqs: { select: { id: true, rfqNo: true, status: true } },
    },
  });
}

export async function createPurchaseRequest(payload) {
  const requestNo = payload.requestNo || payload.prNumber || `PR-${Date.now().toString().slice(-5)}`;
  const salesOrderId = toId(payload.salesOrderId);
  let items = Array.isArray(payload.items) ? payload.items : [];
  
  if (items.length === 0 && (payload.productId || payload.materialName)) {
    items = [{
      productId: toId(payload.productId) || 54,
      quantity: Number(payload.quantity || 1),
      notes: payload.reason || payload.materialName || null,
    }];
  }

  return prisma.purchaseRequest.create({
    data: {
      requestNo,
      salesOrderId,
      status: payload.status || 'DRAFT',
      requiredBy: payload.requiredBy || payload.requiredDate ? new Date(payload.requiredBy || payload.requiredDate) : null,
      notes: payload.notes || payload.reason || null,
      items: {
        create: items.map((it) => ({
          productId: Number(it.productId),
          quantity: Number(it.quantity || 1),
          notes: it.notes || null,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });
}

export async function listPurchaseOrders({ search, status } = {}) {
  const where = {};
  if (status && status !== 'ALL') where.status = status;
  if (search) {
    where.OR = [
      { poNumber: { contains: search, mode: 'insensitive' } },
      { vendor: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  return prisma.purchaseOrder.findMany({
    where,
    orderBy: { orderDate: 'desc' },
    take: 50,
    include: {
      vendor: { select: { id: true, name: true, code: true, city: true, phone: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, sku: true, unitOfMeasure: true } },
        },
      },
      receipts: { select: { id: true, grnNumber: true, status: true, receivedAt: true } },
      rfq: { select: { id: true, rfqNo: true } },
    },
  });
}

export async function createPurchaseOrder(payload) {
  const poNumber = payload.poNumber || `PO-${Date.now().toString().slice(-6)}`;
  const vendorId = toId(payload.vendorId);
  if (!vendorId) throw new Error('Vendor ID is required for Purchase Order');

  const items = Array.isArray(payload.items) ? payload.items : [];
  let subtotal = 0;
  let taxAmount = 0;

  const itemsData = items.map((it) => {
    const qty = Number(it.quantity || 1);
    const unitPrice = Number(it.unitPrice || 0);
    const taxPct = Number(it.taxPercent || 18);
    const lineBase = qty * unitPrice;
    const lineTax = (lineBase * taxPct) / 100;
    subtotal += lineBase;
    taxAmount += lineTax;

    return {
      productId: Number(it.productId),
      quantity: qty,
      unitPrice,
      taxPercent: taxPct,
    };
  });

  const total = payload.total !== undefined ? Number(payload.total) : subtotal + taxAmount;

  return prisma.purchaseOrder.create({
    data: {
      poNumber,
      vendorId,
      rfqId: toId(payload.rfqId),
      status: payload.status || 'DRAFT',
      orderDate: payload.orderDate ? new Date(payload.orderDate) : new Date(),
      expectedDate: payload.expectedDate ? new Date(payload.expectedDate) : null,
      subtotal: payload.subtotal !== undefined ? Number(payload.subtotal) : subtotal,
      taxAmount: payload.taxAmount !== undefined ? Number(payload.taxAmount) : taxAmount,
      total,
      notes: payload.notes || null,
      items: {
        create: itemsData,
      },
    },
    include: {
      vendor: true,
      items: { include: { product: true } },
    },
  });
}

export async function updatePOStatus(id, status) {
  const nid = toId(id);
  return prisma.purchaseOrder.update({
    where: { id: nid },
    data: { status },
    include: { vendor: true },
  });
}

export default {
  listPurchaseRequests,
  createPurchaseRequest,
  listPurchaseOrders,
  createPurchaseOrder,
  updatePOStatus,
};
