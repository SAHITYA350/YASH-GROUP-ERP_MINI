import prisma from "../../../shared/database/prisma.js";

const transitions = {
  DRAFT: ["PLANNED", "CANCELLED"],
  PLANNED: ["RELEASED", "CANCELLED"],
  RELEASED: ["MATERIAL_HOLD", "IN_PROGRESS", "CANCELLED"],
  MATERIAL_HOLD: ["RELEASED", "CANCELLED"],
  IN_PROGRESS: ["QC_HOLD", "COMPLETED", "CANCELLED"],
  QC_HOLD: ["IN_PROGRESS", "COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};
const positive = (value, label, { zero = false } = {}) => {
  const n = Number(value);
  if (!Number.isFinite(n) || (zero ? n < 0 : n <= 0))
    throw new Error(
      `${label} must be a ${zero ? "non-negative" : "positive"} number.`,
    );
  return n;
};
const date = (value, label) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime()))
    throw new Error(`${label} must be a valid date.`);
  return parsed;
};
const workOrderInclude = {
  salesOrder: {
    select: {
      orderNumber: true,
      customer: { select: { name: true } },
      items: { include: { product: { select: { name: true, sku: true } } } },
    },
  },
  bomRevision: {
    select: {
      revision: true,
      status: true,
      materialCost: true,
      product: { select: { name: true, sku: true } },
    },
  },
  createdBy: { select: { id: true, name: true } },
  items: {
    include: {
      product: {
        select: { id: true, name: true, sku: true, unitOfMeasure: true },
      },
    },
  },
  inspections: {
    select: {
      id: true,
      inspectionNo: true,
      status: true,
      acceptedQuantity: true,
      rejectedQuantity: true,
    },
  },
};

export const createProductionOrder = async (data, userId) => {
  const salesOrderId = positive(data.salesOrderId, "Sales order ID");
  const plannedQuantity = positive(data.plannedQuantity, "Planned quantity");
  const salesOrder = await prisma.salesOrder.findUnique({
    where: { id: salesOrderId },
    include: { items: true },
  });
  if (!salesOrder) throw new Error("Sales order not found.");
  if (salesOrder.status === "CANCELLED")
    throw new Error("Cannot create a work order for a cancelled sales order.");
  let bom = null;
  if (data.bomRevisionId) {
    bom = await prisma.bOMRevision.findUnique({
      where: { id: positive(data.bomRevisionId, "BOM revision ID") },
      include: { items: true, operations: { orderBy: { sequence: "asc" } } },
    });
    if (!bom) throw new Error("BOM revision not found.");
    if (bom.status !== "RELEASED")
      throw new Error(
        "Only a RELEASED BOM revision can be used for production.",
      );
    if (!salesOrder.items.some((item) => item.productId === bom.productId))
      throw new Error(
        "The selected BOM product is not included in this sales order.",
      );
  }
  const plannedStart = date(data.plannedStart, "Planned start");
  const plannedEnd = date(data.plannedEnd, "Planned end");
  if (plannedStart && plannedEnd && plannedEnd < plannedStart)
    throw new Error("Planned end must be on or after planned start.");
  const now = new Date();
  const workOrderNo = `WO-${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}-${now.getTime().toString().slice(-6)}${Math.floor(Math.random() * 10)}`;
  return prisma.workOrder.create({
    data: {
      workOrderNo,
      salesOrderId,
      bomRevisionId: bom?.id ?? null,
      plannedQuantity,
      plannedStart,
      plannedEnd,
      priority: data.priority || "MEDIUM",
      notes: data.notes || null,
      createdById: userId ? Number(userId) : null,
      items: bom
        ? {
            create: bom.items.map((item) => ({
              productId: item.componentProductId,
              plannedQuantity:
                Number(item.quantity) *
                plannedQuantity *
                (1 + Number(item.scrapPercent) / 100),
            })),
          }
        : undefined,
      operationLogs: bom
        ? {
            create: bom.operations.map((operation) => ({
              operationName: operation.name,
              sequence: operation.sequence,
              status: "PENDING",
            })),
          }
        : undefined,
    },
    include: workOrderInclude,
  });
};

export const getProductionOrders = async (filters = {}) => {
  const page = Math.max(1, Number.parseInt(filters.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(filters.limit, 10) || 50),
  );
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.salesOrderId)
    where.salesOrderId = positive(filters.salesOrderId, "Sales order ID");
  const [orders, total] = await Promise.all([
    prisma.workOrder.findMany({
      where,
      include: workOrderInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.workOrder.count({ where }),
  ]);
  return { orders, total, page, limit, pages: Math.ceil(total / limit) };
};

export const getProductionOrderById = async (id) => {
  const order = await prisma.workOrder.findUnique({
    where: { id: positive(id, "Work order ID") },
    include: {
      salesOrder: {
        include: { customer: true, items: { include: { product: true } } },
      },
      bomRevision: {
        include: {
          items: { include: { component: true } },
          operations: { orderBy: { sequence: "asc" } },
        },
      },
      items: { include: { product: true } },
      inspections: { orderBy: { createdAt: "desc" } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });
  if (!order) throw new Error("Production order not found.");
  return order;
};

export const updateProductionOrder = async (id, data) => {
  const workOrderId = positive(id, "Work order ID");
  const existing = await prisma.workOrder.findUnique({
    where: { id: workOrderId },
    include: { salesOrder: { include: { items: true } }, bomRevision: true },
  });
  if (!existing) throw new Error("Production order not found.");
  if (
    data.status &&
    data.status !== existing.status &&
    !transitions[existing.status]?.includes(data.status)
  ) {
    throw new Error(
      `Cannot transition work order from ${existing.status} to ${data.status}. Allowed: ${transitions[existing.status]?.join(", ") || "none"}`,
    );
  }
  const payload = {};
  for (const key of ["status", "priority", "notes"])
    if (data[key] !== undefined) payload[key] = data[key];
  if (
    data.goodQuantity !== undefined ||
    data.rejectedQuantity !== undefined ||
    data.producedQuantity !== undefined
  )
    throw new Error(
      "Production and quality quantities are maintained through tracking, inspection, and rework entries.",
    );
  if (data.plannedQuantity !== undefined)
    payload.plannedQuantity = positive(data.plannedQuantity, "plannedQuantity");
  for (const key of ["plannedStart", "plannedEnd", "actualStart", "actualEnd"])
    if (data[key] !== undefined) payload[key] = date(data[key], key);
  const planningChanged = [
    "plannedQuantity",
    "plannedStart",
    "plannedEnd",
    "priority",
  ].some(
    (key) =>
      data[key] !== undefined &&
      String(data[key]) !== String(existing[key] ?? ""),
  );
  if (planningChanged && !["DRAFT", "PLANNED"].includes(existing.status))
    throw new Error(
      "A released or active work order cannot be rescheduled or reprioritized here.",
    );
  if (planningChanged && existing.planApprovalStatus === "APPROVED") {
    payload.planApprovalStatus = "DRAFT";
    payload.planApprovedAt = null;
    payload.planApprovedById = null;
    payload.planApprovalNotes = "Plan changed; resubmission required.";
  }
  if (
    ["PLANNED", "RELEASED", "IN_PROGRESS"].includes(payload.status) &&
    (payload.planApprovalStatus || existing.planApprovalStatus) !== "APPROVED"
  ) {
    throw new Error(
      "Submit the production plan for approval before planning or releasing it.",
    );
  }
  if (data.bomRevisionId !== undefined) {
    if (existing.status !== "DRAFT")
      throw new Error(
        "BOM revision can only be changed on a DRAFT work order.",
      );
    if (data.bomRevisionId === null) payload.bomRevisionId = null;
    else {
      const bom = await prisma.bOMRevision.findUnique({
        where: { id: positive(data.bomRevisionId, "BOM revision ID") },
      });
      if (!bom) throw new Error("BOM revision not found.");
      if (bom.status !== "RELEASED")
        throw new Error(
          "Only a RELEASED BOM revision can be used for production.",
        );
      payload.bomRevisionId = bom.id;
    }
  }
  const planned = payload.plannedQuantity ?? Number(existing.plannedQuantity);
  const good = Number(existing.goodQuantity);
  const rejected = Number(existing.rejectedQuantity);
  const produced = Number(existing.producedQuantity);
  if (good + rejected > planned)
    throw new Error(
      "Good and rejected quantity cannot exceed planned quantity.",
    );
  if (
    (payload.plannedStart ?? existing.plannedStart) &&
    (payload.plannedEnd ?? existing.plannedEnd) &&
    (payload.plannedEnd ?? existing.plannedEnd) <
      (payload.plannedStart ?? existing.plannedStart)
  )
    throw new Error("Planned end must be on or after planned start.");
  if (payload.status === "IN_PROGRESS" && !existing.actualStart)
    payload.actualStart = new Date();
  if (payload.status === "COMPLETED") {
    if (produced < planned)
      throw new Error(
        "Record the full planned production quantity before completing the work order.",
      );
    if (good + rejected < planned)
      throw new Error(
        "Inspect and account for all planned production before completing the work order.",
      );
    const openDefects = await prisma.qualityDefect.count({
      where: {
        inspection: { workOrderId },
        status: { in: ["OPEN", "IN_REWORK"] },
      },
    });
    if (openDefects)
      throw new Error(
        "Resolve or scrap all open defects and rework before completing the work order.",
      );
    if (!existing.actualEnd) payload.actualEnd = new Date();
    const productId =
      existing.bomRevision?.productId ??
      (existing.salesOrder.items.length === 1
        ? existing.salesOrder.items[0].productId
        : null);
    if (!productId)
      throw new Error(
        "A released BOM is required to identify the finished product for this work order.",
      );
    return prisma.$transaction(
      async (tx) => {
        const completed = await tx.workOrder.update({
          where: { id: workOrderId },
          data: payload,
          include: workOrderInclude,
        });
        await tx.inventory.upsert({
          where: { productId },
          update: { physicalQuantity: { increment: good } },
          create: {
            productId,
            warehouseLocation: "Finished Goods",
            physicalQuantity: good,
          },
        });
        if (good > 0)
          await tx.inventoryMovement.create({
            data: {
              productId,
              movementType: "STOCK_IN",
              referenceType: "WORK_ORDER",
              referenceId: workOrderId,
              quantity: good,
              notes: `Finished goods received from ${existing.workOrderNo}`,
            },
          });
        return completed;
      },
      { isolationLevel: "Serializable" },
    );
  }
  return prisma.workOrder.update({
    where: { id: workOrderId },
    data: payload,
    include: workOrderInclude,
  });
};

export const deleteProductionOrder = async (id) => {
  const workOrderId = positive(id, "Work order ID");
  const existing = await prisma.workOrder.findUnique({
    where: { id: workOrderId },
    include: { _count: { select: { inspections: true } } },
  });
  if (!existing) throw new Error("Production order not found.");
  if (existing.status !== "DRAFT" || existing._count.inspections)
    throw new Error(
      "Only DRAFT work orders without inspections can be deleted.",
    );
  return prisma.workOrder.delete({ where: { id: workOrderId } });
};

export const getProductionStats = async () => {
  const [statusCounts, priorityCounts, recentOrders, totals] =
    await prisma.$transaction([
      prisma.workOrder.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.workOrder.groupBy({ by: ["priority"], _count: { id: true } }),
      prisma.workOrder.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          salesOrder: {
            select: { orderNumber: true, customer: { select: { name: true } } },
          },
        },
      }),
      prisma.workOrder.aggregate({
        _sum: {
          plannedQuantity: true,
          goodQuantity: true,
          rejectedQuantity: true,
        },
        _count: { id: true },
      }),
    ]);
  return {
    byStatus: Object.fromEntries(
      statusCounts.map((r) => [r.status, r._count.id]),
    ),
    byPriority: Object.fromEntries(
      priorityCounts.map((r) => [r.priority, r._count.id]),
    ),
    recentOrders,
    totals: {
      orders: totals._count.id,
      planned: Number(totals._sum.plannedQuantity || 0),
      produced: Number(totals._sum.goodQuantity || 0),
      rejected: Number(totals._sum.rejectedQuantity || 0),
    },
  };
};

export const issueWorkOrderMaterial = async (id, items) => {
  const workOrderId = positive(id, "Work order ID");
  if (!Array.isArray(items) || !items.length)
    throw new Error("Provide at least one material item to issue.");
  const normalized = items.map((item) => ({
    productId: positive(item.productId, "Product ID"),
    quantity: positive(item.issuedQuantity, "Issued quantity"),
  }));
  if (new Set(normalized.map((i) => i.productId)).size !== normalized.length)
    throw new Error("Each product may only appear once per material issue.");
  return prisma.$transaction(
    async (tx) => {
      const wo = await tx.workOrder.findUnique({
        where: { id: workOrderId },
        include: { items: true },
      });
      if (!wo) throw new Error("Work order not found.");
      if (!["RELEASED", "IN_PROGRESS"].includes(wo.status))
        throw new Error(
          "Material can only be issued to RELEASED or IN_PROGRESS work orders.",
        );
      const result = [];
      for (const item of normalized) {
        const planned = wo.items.find(
          (row) => row.productId === item.productId,
        );
        if (!planned)
          throw new Error(
            `Product ${item.productId} is not a planned component of this work order.`,
          );
        if (
          Number(planned.issuedQuantity) + item.quantity >
          Number(planned.plannedQuantity)
        )
          throw new Error(
            `Issue quantity exceeds the planned requirement for product ${item.productId}.`,
          );
        const stock = await tx.inventory.findUnique({
          where: { productId: item.productId },
        });
        const available = stock
          ? Number(stock.physicalQuantity) - Number(stock.reservedQuantity)
          : 0;
        if (item.quantity > available)
          throw new Error(
            `Insufficient available inventory for product ${item.productId}; available: ${available}.`,
          );
        const stockUpdate = await tx.inventory.updateMany({
          where: {
            productId: item.productId,
            physicalQuantity: {
              gte: item.quantity + Number(stock.reservedQuantity),
            },
          },
          data: { physicalQuantity: { decrement: item.quantity } },
        });
        if (!stockUpdate.count)
          throw new Error(
            `Available inventory for product ${item.productId} changed during issue; retry the transaction.`,
          );
        const row = await tx.workOrderItem.update({
          where: { id: planned.id },
          data: { issuedQuantity: { increment: item.quantity } },
          include: { product: { select: { sku: true, name: true } } },
        });
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            movementType: "ISSUE_TO_WORK_ORDER",
            referenceType: "WORK_ORDER",
            referenceId: workOrderId,
            quantity: item.quantity,
            locationCode: stock.warehouseLocation,
            notes: `Issued to ${wo.workOrderNo}`,
          },
        });
        result.push(row);
      }
      return result;
    },
    { isolationLevel: "Serializable" },
  );
};
