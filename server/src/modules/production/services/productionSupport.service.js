import prisma from "../../../shared/database/prisma.js";

const asId = (value, label = "ID") => {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1)
    throw new Error(`${label} must be a positive integer.`);
  return id;
};
const required = (value, label) => {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`${label} is required.`);
  return value.trim();
};
const dateOrNull = (value, label) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime()))
    throw new Error(`${label} must be a valid date.`);
  return date;
};
const code = (prefix) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.floor(
    Math.random() * 1000,
  )
    .toString()
    .padStart(3, "0")}`;

export const listAlerts = (query = {}) =>
  prisma.productionAlert.findMany({
    where: {
      ...(query.status ? { status: query.status } : {}),
      ...(query.type ? { type: query.type } : {}),
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: Math.min(200, Math.max(1, Number(query.limit) || 100)),
  });
export const createAlert = (data) =>
  prisma.productionAlert.create({
    data: {
      code: code("ALT"),
      type: required(data.type, "Alert type"),
      title: required(data.title, "Title"),
      message: required(data.message, "Message"),
      severity: data.severity || "MEDIUM",
      workOrderId: data.workOrderId
        ? asId(data.workOrderId, "Work order ID")
        : null,
      machineId: data.machineId ? asId(data.machineId, "Machine ID") : null,
      productId: data.productId ? asId(data.productId, "Product ID") : null,
    },
  });
export const updateAlert = async (id, data) => {
  const existing = await prisma.productionAlert.findUnique({
    where: { id: asId(id) },
  });
  if (!existing) throw new Error("Alert not found.");
  const status = data.status ?? existing.status;
  const allowed = {
    OPEN: ["ACKNOWLEDGED", "RESOLVED"],
    ACKNOWLEDGED: ["OPEN", "RESOLVED"],
    RESOLVED: [],
  };
  if (status !== existing.status && !allowed[existing.status]?.includes(status))
    throw new Error(
      `Cannot change alert from ${existing.status} to ${status}.`,
    );
  return prisma.productionAlert.update({
    where: { id: existing.id },
    data: {
      status,
      ...(status === "ACKNOWLEDGED"
        ? {
            acknowledgedAt: new Date(),
            acknowledgedById: data.userId ? asId(data.userId, "User ID") : null,
          }
        : {}),
      ...(status === "RESOLVED" ? { resolvedAt: new Date() } : {}),
    },
  });
};
export const generateOperationalAlerts = async () => {
  const [overdue, lowStock, pendingInspections, criticalDefects] =
    await Promise.all([
      prisma.workOrder.findMany({
        where: {
          plannedEnd: { lt: new Date() },
          status: { notIn: ["COMPLETED", "CANCELLED"] },
        },
        select: { id: true, workOrderNo: true, plannedEnd: true },
      }),
      prisma.inventory.findMany({
        include: { product: { select: { id: true, sku: true, name: true } } },
        take: 500,
      }),
      prisma.qualityInspection.findMany({
        where: { status: "PENDING" },
        select: { id: true, inspectionNo: true, workOrderId: true },
      }),
      prisma.qualityDefect.findMany({
        where: { severity: "CRITICAL", status: { in: ["OPEN", "IN_REWORK"] } },
        select: {
          id: true,
          defectCode: true,
          inspection: { select: { workOrderId: true } },
        },
        take: 100,
      }),
    ]);
  const candidates = [
    ...overdue.map((row) => ({
      type: "PRODUCTION_OVERDUE",
      severity: "HIGH",
      title: `Work order ${row.workOrderNo} is overdue`,
      message: `Planned deadline was ${row.plannedEnd.toISOString()}.`,
      workOrderId: row.id,
    })),
    ...lowStock
      .filter((row) => Number(row.physicalQuantity) <= Number(row.reorderLevel))
      .map((row) => ({
        type: "MATERIAL_SHORTAGE",
        severity: "HIGH",
        title: `Low stock: ${row.product.sku}`,
        message: `${row.product.name} has ${row.physicalQuantity} on hand; reorder threshold is ${row.reorderLevel}.`,
        productId: row.productId,
      })),
    ...pendingInspections.map((row) => ({
      type: "INSPECTION_PENDING",
      severity: "MEDIUM",
      title: `Inspection ${row.inspectionNo} is pending`,
      message: "Quality inspection requires a recorded disposition.",
      workOrderId: row.workOrderId,
    })),
    ...criticalDefects.map((row) => ({
      type: "CRITICAL_DEFECT",
      severity: "CRITICAL",
      title: `Critical defect ${row.defectCode} is unresolved`,
      message: "Review containment and corrective actions.",
      workOrderId: row.inspection.workOrderId,
    })),
  ];
  let created = 0;
  for (const candidate of candidates) {
    const duplicate = await prisma.productionAlert.findFirst({
      where: {
        type: candidate.type,
        title: candidate.title,
        status: { in: ["OPEN", "ACKNOWLEDGED"] },
      },
    });
    if (!duplicate) {
      await createAlert(candidate);
      created += 1;
    }
  }
  return {
    evaluated: candidates.length,
    created,
    alerts: await listAlerts({ status: "OPEN", limit: 200 }),
  };
};

export const listMaintenance = (query = {}) =>
  prisma.machineMaintenance.findMany({
    where: {
      ...(query.machineId
        ? { machineId: asId(query.machineId, "Machine ID") }
        : {}),
      ...(query.status ? { status: query.status } : {}),
    },
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
    take: 200,
  });
export const createMaintenance = (data) =>
  prisma.machineMaintenance.create({
    data: {
      machineId: asId(data.machineId, "Machine ID"),
      title: required(data.title, "Title"),
      description: data.description || null,
      maintenanceType: data.maintenanceType || "PREVENTIVE",
      scheduledAt: dateOrNull(data.scheduledAt, "Scheduled date"),
      downtimeMinutes: Math.max(0, Number(data.downtimeMinutes) || 0),
      cost: Math.max(0, Number(data.cost) || 0),
      reportedById: data.reportedById
        ? asId(data.reportedById, "Reporter ID")
        : null,
      notes: data.notes || null,
    },
  });
export const updateMaintenance = async (id, data) => {
  const existing = await prisma.machineMaintenance.findUnique({
    where: { id: asId(id) },
  });
  if (!existing) throw new Error("Maintenance record not found.");
  const status = data.status ?? existing.status;
  const allowed = {
    OPEN: ["SCHEDULED", "IN_PROGRESS", "CANCELLED"],
    SCHEDULED: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["COMPLETED", "CANCELLED"],
    COMPLETED: [],
    CANCELLED: [],
  };
  if (status !== existing.status && !allowed[existing.status]?.includes(status))
    throw new Error(
      `Cannot change maintenance from ${existing.status} to ${status}.`,
    );
  return prisma.$transaction(async (tx) => {
    const record = await tx.machineMaintenance.update({
      where: { id: existing.id },
      data: {
        status,
        ...(data.title !== undefined
          ? { title: required(data.title, "Title") }
          : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.scheduledAt !== undefined
          ? { scheduledAt: dateOrNull(data.scheduledAt, "Scheduled date") }
          : {}),
        ...(data.downtimeMinutes !== undefined
          ? { downtimeMinutes: Math.max(0, Number(data.downtimeMinutes) || 0) }
          : {}),
        ...(data.cost !== undefined
          ? { cost: Math.max(0, Number(data.cost) || 0) }
          : {}),
        ...(status === "IN_PROGRESS" && !existing.startedAt
          ? { startedAt: new Date() }
          : {}),
        ...(status === "COMPLETED" ? { completedAt: new Date() } : {}),
      },
    });
    if (status === "IN_PROGRESS")
      await tx.machine.update({
        where: { id: existing.machineId },
        data: { status: "MAINTENANCE" },
      });
    if (["COMPLETED", "CANCELLED"].includes(status))
      await tx.machine.updateMany({
        where: { id: existing.machineId, status: "MAINTENANCE" },
        data: { status: "AVAILABLE" },
      });
    return record;
  });
};

export const listCosts = (query = {}) =>
  prisma.productionCostEntry.findMany({
    where: {
      ...(query.workOrderId
        ? { workOrderId: asId(query.workOrderId, "Work order ID") }
        : {}),
      ...(query.type ? { type: query.type } : {}),
    },
    orderBy: { occurredAt: "desc" },
    take: 500,
  });
export const createCost = async (data, userId) => {
  const workOrderId = asId(data.workOrderId, "Work order ID");
  if (
    !(await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      select: { id: true },
    }))
  )
    throw new Error("Work order not found.");
  const unitCost = Number(data.unitCost ?? 0),
    quantity = data.quantity == null ? null : Number(data.quantity);
  if (
    !Number.isFinite(unitCost) ||
    unitCost < 0 ||
    (quantity !== null && (!Number.isFinite(quantity) || quantity < 0))
  )
    throw new Error("Cost and quantity must be non-negative numbers.");
  const totalCost =
    data.totalCost === undefined
      ? unitCost * (quantity ?? 1)
      : Number(data.totalCost);
  if (!Number.isFinite(totalCost) || totalCost < 0)
    throw new Error("Total cost must be non-negative.");
  return prisma.productionCostEntry.create({
    data: {
      workOrderId,
      type: data.type,
      productId: data.productId ? asId(data.productId, "Product ID") : null,
      quantity,
      unitCost,
      totalCost,
      notes: data.notes || null,
      recordedById: userId ? asId(userId, "User ID") : null,
      occurredAt: dateOrNull(data.occurredAt, "Occurrence date") || new Date(),
    },
  });
};
export const costSummary = async (query = {}) => {
  const where = query.workOrderId
    ? { workOrderId: asId(query.workOrderId, "Work order ID") }
    : {};
  const rows = await prisma.productionCostEntry.groupBy({
    by: ["workOrderId", "type"],
    where,
    _sum: { totalCost: true },
    _count: { id: true },
  });
  const byOrder = {};
  for (const row of rows) {
    const key = row.workOrderId;
    byOrder[key] ||= { workOrderId: key, total: 0, byType: {} };
    byOrder[key].byType[row.type] = Number(row._sum.totalCost || 0);
    byOrder[key].total += Number(row._sum.totalCost || 0);
  }
  return {
    orders: Object.values(byOrder),
    total: Object.values(byOrder).reduce((sum, row) => sum + row.total, 0),
  };
};

export const recordAuditEvent = (data, userId) =>
  prisma.productionAuditEvent.create({
    data: {
      entityType: required(data.entityType, "Entity type"),
      entityId: asId(data.entityId, "Entity ID"),
      action: required(data.action, "Action"),
      fromValue: data.fromValue ?? undefined,
      toValue: data.toValue ?? undefined,
      userId: userId ? asId(userId, "User ID") : null,
      notes: data.notes || null,
    },
  });
export const listAuditEvents = (query = {}) =>
  prisma.productionAuditEvent.findMany({
    where: {
      ...(query.entityType ? { entityType: query.entityType } : {}),
      ...(query.entityId
        ? { entityId: asId(query.entityId, "Entity ID") }
        : {}),
      ...(query.userId ? { userId: asId(query.userId, "User ID") } : {}),
    },
    orderBy: { occurredAt: "desc" },
    take: Math.min(500, Math.max(1, Number(query.limit) || 100)),
  });

export const traceability = async (query = {}) => {
  const productId = query.productId
    ? asId(query.productId, "Product ID")
    : undefined;
  const batchNumber = query.batchNumber ? String(query.batchNumber) : undefined;
  const movements = await prisma.inventoryMovement.findMany({
    where: {
      ...(productId ? { productId } : {}),
      ...(batchNumber ? { batchNumber } : {}),
      referenceType: "WORK_ORDER",
    },
    include: { product: { select: { id: true, sku: true, name: true } } },
    orderBy: { createdAt: "asc" },
    take: 500,
  });
  const workOrderIds = [
    ...new Set(movements.map((m) => m.referenceId).filter(Boolean)),
  ];
  const workOrders = workOrderIds.length
    ? await prisma.workOrder.findMany({
        where: { id: { in: workOrderIds } },
        include: {
          salesOrder: { select: { orderNumber: true } },
          bomRevision: { select: { revision: true, productId: true } },
          inspections: {
            include: { defects: true },
            orderBy: { createdAt: "asc" },
          },
          productionEntries: { orderBy: { recordedAt: "asc" } },
        },
      })
    : [];
  return {
    productId: productId ?? null,
    batchNumber: batchNumber ?? null,
    movements,
    workOrders,
  };
};

export const productionAnalytics = async (query = {}) => {
  const from =
    dateOrNull(query.from, "From date") ||
    new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const to = dateOrNull(query.to, "To date") || new Date();
  if (to < from)
    throw new Error("The report end date must be after its start date.");
  const [orders, entries, inspections, defects, maintenance] =
    await Promise.all([
      prisma.workOrder.findMany({
        where: { createdAt: { gte: from, lte: to } },
        include: {
          bomRevision: {
            select: {
              product: { select: { id: true, sku: true, name: true } },
            },
          },
          salesOrder: { select: { orderNumber: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.productionEntry.findMany({
        where: { recordedAt: { gte: from, lte: to } },
        select: {
          quantity: true,
          downtimeMinutes: true,
          recordedAt: true,
          workOrderId: true,
        },
      }),
      prisma.qualityInspection.aggregate({
        where: { inspectedAt: { gte: from, lte: to } },
        _sum: {
          inspectedQuantity: true,
          acceptedQuantity: true,
          rejectedQuantity: true,
        },
        _count: { id: true },
      }),
      prisma.qualityDefect.aggregate({
        where: { createdAt: { gte: from, lte: to } },
        _sum: { quantity: true },
        _count: { id: true },
      }),
      prisma.machineMaintenance.aggregate({
        where: { createdAt: { gte: from, lte: to } },
        _sum: { downtimeMinutes: true, cost: true },
        _count: { id: true },
      }),
    ]);
  const inspected = Number(inspections._sum.inspectedQuantity || 0),
    accepted = Number(inspections._sum.acceptedQuantity || 0),
    rejected = Number(inspections._sum.rejectedQuantity || 0);
  const completed = orders.filter((order) => order.status === "COMPLETED");
  const onTime = completed.filter(
    (order) =>
      order.actualEnd &&
      order.plannedEnd &&
      order.actualEnd <= order.plannedEnd,
  ).length;
  const buckets = new Map();
  for (const entry of entries) {
    const day = entry.recordedAt.toISOString().slice(0, 10);
    const bucket = buckets.get(day) || {
      date: day,
      output: 0,
      downtimeMinutes: 0,
      entries: 0,
    };
    bucket.output += Number(entry.quantity);
    bucket.downtimeMinutes += entry.downtimeMinutes;
    bucket.entries += 1;
    buckets.set(day, bucket);
  }
  const byProduct = {};
  for (const order of orders) {
    const product = order.bomRevision?.product;
    if (!product) continue;
    byProduct[product.id] ||= {
      productId: product.id,
      sku: product.sku,
      product: product.name,
      orders: 0,
      planned: 0,
      produced: 0,
      good: 0,
      rejected: 0,
    };
    const row = byProduct[product.id];
    row.orders += 1;
    row.planned += Number(order.plannedQuantity);
    row.produced += Number(order.producedQuantity);
    row.good += Number(order.goodQuantity);
    row.rejected += Number(order.rejectedQuantity);
  }
  const output = entries.reduce(
    (sum, entry) => sum + Number(entry.quantity),
    0,
  );
  const downtimeMinutes = entries.reduce(
    (sum, entry) => sum + entry.downtimeMinutes,
    0,
  );
  return {
    range: { from, to },
    production: {
      orders: orders.length,
      completed: completed.length,
      open:
        orders.length -
        completed.length -
        orders.filter((order) => order.status === "CANCELLED").length,
      onTimeCompletionRate: completed.length
        ? Number(((onTime * 100) / completed.length).toFixed(2))
        : 0,
      planned: orders.reduce(
        (sum, order) => sum + Number(order.plannedQuantity),
        0,
      ),
      produced: orders.reduce(
        (sum, order) => sum + Number(order.producedQuantity),
        0,
      ),
      accepted: orders.reduce(
        (sum, order) => sum + Number(order.goodQuantity),
        0,
      ),
      rejected: orders.reduce(
        (sum, order) => sum + Number(order.rejectedQuantity),
        0,
      ),
      outputEntries: entries.length,
      output,
      downtimeMinutes,
    },
    quality: {
      inspections: inspections._count.id,
      inspected,
      accepted,
      rejected,
      firstPassYield: inspected
        ? Number(((accepted * 100) / inspected).toFixed(2))
        : 0,
      defectRecords: defects._count.id,
      defectQuantity: Number(defects._sum.quantity || 0),
    },
    equipment: {
      maintenanceRecords: maintenance._count.id,
      maintenanceDowntimeMinutes: Number(maintenance._sum.downtimeMinutes || 0),
      maintenanceCost: Number(maintenance._sum.cost || 0),
    },
    daily: [...buckets.values()].sort((a, b) => a.date.localeCompare(b.date)),
    byProduct: Object.values(byProduct),
  };
};
