// server/modules/module2/module2.service.js
import { prisma } from '../../lib/prisma.js';
import { makeCode, toId } from '../../common/utils.js';

// ==========================================
// 1. VENDOR MANAGEMENT SERVICE
// ==========================================

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
      contactName: payload.contactName || null,
      email: payload.email || null,
      phone: payload.phone || null,
      gstin: payload.gstin || null,
      pan: payload.pan || null,
      city: payload.city || null,
      state: payload.state || null,
      category: payload.category || 'General Supplier',
      paymentTerms: payload.paymentTerms || 'Net 30 Days',
      rating: payload.rating ? Number(payload.rating) : 4.0,
      qualityScore: payload.qualityScore ? Number(payload.qualityScore) : 92.0,
      onTimeDeliveryPercent: payload.onTimeDeliveryPercent ? Number(payload.onTimeDeliveryPercent) : 88.0,
      notes: payload.notes || null,
      isActive: true,
    },
  });
}

export async function updateVendor(id, payload) {
  const nid = toId(id);
  const data = {};
  if (payload.name) data.name = String(payload.name).trim();
  if (payload.contactName !== undefined) data.contactName = payload.contactName;
  if (payload.email !== undefined) data.email = payload.email;
  if (payload.phone !== undefined) data.phone = payload.phone;
  if (payload.gstin !== undefined) data.gstin = payload.gstin;
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

// ==========================================
// 2. PROCUREMENT & PO SERVICE
// ==========================================

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
  const requestNo = payload.requestNo || `PR-${Date.now().toString().slice(-5)}`;
  const salesOrderId = toId(payload.salesOrderId);
  const items = Array.isArray(payload.items) ? payload.items : [];

  return prisma.purchaseRequest.create({
    data: {
      requestNo,
      salesOrderId,
      status: payload.status || 'DRAFT',
      requiredBy: payload.requiredBy ? new Date(payload.requiredBy) : null,
      notes: payload.notes || null,
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

  const total = subtotal + taxAmount;

  return prisma.purchaseOrder.create({
    data: {
      poNumber,
      vendorId,
      rfqId: toId(payload.rfqId),
      status: payload.status || 'DRAFT',
      orderDate: payload.orderDate ? new Date(payload.orderDate) : new Date(),
      expectedDate: payload.expectedDate ? new Date(payload.expectedDate) : null,
      subtotal,
      taxAmount,
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

// ==========================================
// 3. INVENTORY & GOODS RECEIPT (GRN) SERVICE
// ==========================================

export async function listInventory({ search, location } = {}) {
  const where = {};
  if (location && location !== 'ALL') {
    where.warehouseLocation = location;
  }
  if (search) {
    where.product = {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  return prisma.inventory.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      product: {
        select: { id: true, name: true, sku: true, unitOfMeasure: true, category: true },
      },
    },
  });
}

export async function listGoodsReceipts() {
  return prisma.goodsReceipt.findMany({
    orderBy: { receivedAt: 'desc' },
    take: 50,
    include: {
      purchaseOrder: {
        select: {
          id: true,
          poNumber: true,
          vendor: { select: { id: true, name: true, code: true } },
        },
      },
      items: {
        include: {
          product: { select: { id: true, name: true, sku: true, unitOfMeasure: true } },
        },
      },
    },
  });
}

export async function createGoodsReceipt(payload) {
  const grnNumber = payload.grnNumber || `GRN-${Date.now().toString().slice(-6)}`;
  const purchaseOrderId = toId(payload.purchaseOrderId);
  if (!purchaseOrderId) throw new Error('Purchase Order ID is required for Goods Receipt');

  const items = Array.isArray(payload.items) ? payload.items : [];

  // Transaction: Create GRN + update PO status + update/create stock in Inventory + log movement
  return prisma.$transaction(async (tx) => {
    const grn = await tx.goodsReceipt.create({
      data: {
        grnNumber,
        purchaseOrderId,
        status: payload.status || 'RECEIVED',
        receivedAt: payload.receivedAt ? new Date(payload.receivedAt) : new Date(),
        notes: payload.notes || null,
        items: {
          create: items.map((it) => ({
            productId: Number(it.productId),
            orderedQuantity: Number(it.orderedQuantity || it.quantity || 0),
            receivedQuantity: Number(it.receivedQuantity || it.quantity || 0),
            acceptedQuantity: Number(it.acceptedQuantity || it.quantity || 0),
            rejectedQuantity: Number(it.rejectedQuantity || 0),
            batchNumber: it.batchNumber || `BATCH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
          })),
        },
      },
      include: {
        items: true,
        purchaseOrder: true,
      },
    });

    // For each accepted item, update Inventory and create an InventoryMovement
    for (const item of items) {
      const pId = Number(item.productId);
      const acceptedQty = Number(item.acceptedQuantity || item.quantity || 0);

      if (acceptedQty > 0) {
        // Upsert Inventory record
        await tx.inventory.upsert({
          where: { productId: pId },
          update: {
            physicalQuantity: { increment: acceptedQty },
            warehouseLocation: payload.warehouseLocation || 'Central Finished & Raw Stores',
            updatedAt: new Date(),
          },
          create: {
            productId: pId,
            warehouseLocation: payload.warehouseLocation || 'Central Finished & Raw Stores',
            physicalQuantity: acceptedQty,
            reservedQuantity: 0,
            reorderLevel: 10,
          },
        });

        // Log Movement
        await tx.inventoryMovement.create({
          data: {
            productId: pId,
            movementType: 'STOCK_IN',
            referenceType: 'GOODS_RECEIPT',
            referenceId: grn.id,
            goodsReceiptId: grn.id,
            quantity: acceptedQty,
            batchNumber: item.batchNumber || null,
            locationCode: payload.warehouseLocation || 'Central Finished & Raw Stores',
            notes: `Received via GRN ${grnNumber} against PO #${purchaseOrderId}`,
          },
        });
      }
    }

    // Update PO status to PARTIALLY_RECEIVED or RECEIVED
    await tx.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: { status: 'RECEIVED' },
    });

    return grn;
  });
}

export async function listInventoryMovements({ productId } = {}) {
  const where = {};
  if (productId) where.productId = toId(productId);

  return prisma.inventoryMovement.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      product: { select: { id: true, name: true, sku: true } },
      salesOrder: { select: { id: true, orderNumber: true } },
      goodsReceipt: { select: { id: true, grnNumber: true } },
    },
  });
}

export async function recordStockMovement(payload) {
  const productId = toId(payload.productId);
  if (!productId) throw new Error('Product ID is required');

  const quantity = Number(payload.quantity || 0);
  const movementType = payload.movementType || 'ADJUSTMENT';

  return prisma.$transaction(async (tx) => {
    // Log movement
    const movement = await tx.inventoryMovement.create({
      data: {
        productId,
        movementType,
        referenceType: payload.referenceType || 'MANUAL',
        quantity,
        batchNumber: payload.batchNumber || null,
        locationCode: payload.locationCode || 'Central Store',
        notes: payload.notes || null,
      },
    });

    // Adjust inventory
    if (movementType === 'STOCK_IN' || movementType === 'RETURN') {
      await tx.inventory.upsert({
        where: { productId },
        update: { physicalQuantity: { increment: quantity } },
        create: { productId, physicalQuantity: quantity },
      });
    } else if (movementType === 'STOCK_OUT' || movementType === 'ISSUE_TO_WORK_ORDER' || movementType === 'DISPATCH') {
      await tx.inventory.upsert({
        where: { productId },
        update: { physicalQuantity: { decrement: quantity } },
        create: { productId, physicalQuantity: 0 },
      });
    }

    return movement;
  });
}

export default {
  listVendors,
  getVendorById,
  createVendor,
  updateVendor,
  listPurchaseRequests,
  createPurchaseRequest,
  listPurchaseOrders,
  createPurchaseOrder,
  updatePOStatus,
  listInventory,
  listGoodsReceipts,
  createGoodsReceipt,
  listInventoryMovements,
  recordStockMovement,
};
