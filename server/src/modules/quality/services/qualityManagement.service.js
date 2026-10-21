import prisma from "../../../shared/database/prisma.js";

const positiveId = (value, label = "ID") => {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1)
    throw new Error(`${label} must be a positive integer.`);
  return n;
};
const positiveQty = (value, label = "Quantity") => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0)
    throw new Error(`${label} must be greater than zero.`);
  return n;
};
const defectInclude = {
  inspection: {
    include: {
      workOrder: {
        select: {
          id: true,
          workOrderNo: true,
          status: true,
          salesOrder: { select: { orderNumber: true } },
        },
      },
    },
  },
  reworkOrders: true,
};

export const listDefects = async (filters = {}) => {
  const page = Math.max(1, Number.parseInt(filters.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(filters.limit, 10) || 50),
  );
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.severity) where.severity = filters.severity;
  if (filters.category)
    where.category = { contains: filters.category, mode: "insensitive" };
  const [defects, total] = await prisma.$transaction([
    prisma.qualityDefect.findMany({
      where,
      include: defectInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.qualityDefect.count({ where }),
  ]);
  return { defects, total, page, limit, pages: Math.ceil(total / limit) };
};

export const createDefect = async (inspectionId, data) => {
  const qiId = positiveId(inspectionId, "Inspection ID");
  const quantity = positiveQty(data.quantity ?? 1);
  if (!data.defectCode?.trim() || !data.category?.trim())
    throw new Error("Defect code and category are required.");
  return prisma.$transaction(
    async (tx) => {
      const inspection = await tx.qualityInspection.findUnique({
        where: { id: qiId },
        include: { workOrder: true },
      });
      if (!inspection) throw new Error("Quality inspection not found.");
      if (inspection.status === "RELEASED")
        throw new Error("Cannot add defects to a released inspection.");
      const defects = await tx.qualityDefect.aggregate({
        where: { inspectionId: qiId },
        _sum: { quantity: true },
      });
      if (
        Number(defects._sum.quantity || 0) + quantity >
        Number(inspection.rejectedQuantity)
      )
        throw new Error(
          "Defect quantity exceeds the inspection rejected quantity.",
        );
      return tx.qualityDefect.create({
        data: {
          inspectionId: qiId,
          defectCode: data.defectCode.trim().toUpperCase(),
          category: data.category.trim(),
          description: data.description || null,
          severity: data.severity || "MEDIUM",
          quantity,
          disposition: data.disposition || null,
        },
        include: defectInclude,
      });
    },
    { isolationLevel: "Serializable" },
  );
};

export const updateDefect = async (defectId, data) => {
  const dId = positiveId(defectId, "Defect ID");
  const existing = await prisma.qualityDefect.findUnique({
    where: { id: dId },
  });
  if (!existing) throw new Error("Defect not found.");
  const payload = {};
  for (const key of ["category", "description", "severity", "disposition"])
    if (data[key] !== undefined) payload[key] = data[key];
  if (data.status !== undefined) {
    const allowed = {
      OPEN: ["IN_REWORK", "SCRAPPED"],
      IN_REWORK: ["OPEN", "RESOLVED", "SCRAPPED"],
      RESOLVED: [],
      SCRAPPED: [],
    };
    if (
      data.status !== existing.status &&
      !allowed[existing.status]?.includes(data.status)
    )
      throw new Error(
        `Cannot transition defect from ${existing.status} to ${data.status}.`,
      );
    if (data.status === "RESOLVED" && existing.status === "IN_REWORK")
      throw new Error(
        "Complete an associated rework order to resolve this defect.",
      );
    payload.status = data.status;
  }
  return prisma.qualityDefect.update({
    where: { id: dId },
    data: payload,
    include: defectInclude,
  });
};

export const createReworkOrder = async (defectId, data) => {
  const dId = positiveId(defectId, "Defect ID");
  const quantity = positiveQty(data.quantity, "Rework quantity");
  return prisma.$transaction(
    async (tx) => {
      const defect = await tx.qualityDefect.findUnique({
        where: { id: dId },
        include: { inspection: true, reworkOrders: true },
      });
      if (!defect) throw new Error("Defect not found.");
      if (["RESOLVED", "SCRAPPED"].includes(defect.status))
        throw new Error("This defect is closed and cannot be reworked.");
      const activeOrDone = defect.reworkOrders
        .filter((item) => item.status !== "CANCELLED")
        .reduce((sum, item) => sum + Number(item.quantity), 0);
      if (activeOrDone + quantity > Number(defect.quantity))
        throw new Error("Total rework quantity exceeds the defect quantity.");
      const no = `RW-${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 10)}`;
      if (data.assignedToId) {
        const assignee = await tx.user.findUnique({
          where: { id: positiveId(data.assignedToId, "Assignee ID") },
        });
        if (!assignee?.isActive)
          throw new Error("Active rework assignee not found.");
      }
      const rework = await tx.reworkOrder.create({
        data: {
          reworkNo: no,
          workOrderId: defect.inspection.workOrderId,
          defectId: dId,
          assignedToId: data.assignedToId
            ? positiveId(data.assignedToId, "Assignee ID")
            : null,
          quantity,
          reason: data.reason || defect.description || defect.category,
        },
        include: {
          defect: true,
          workOrder: { select: { id: true, workOrderNo: true } },
          assignedTo: { select: { id: true, name: true } },
        },
      });
      await tx.qualityDefect.update({
        where: { id: dId },
        data: { status: "IN_REWORK" },
      });
      return rework;
    },
    { isolationLevel: "Serializable" },
  );
};

export const listReworkOrders = (filters = {}) =>
  prisma.reworkOrder.findMany({
    where: filters.status ? { status: filters.status } : {},
    include: {
      defect: true,
      workOrder: { select: { id: true, workOrderNo: true, status: true } },
      assignedTo: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

export const updateReworkOrder = async (reworkId, data) => {
  const rId = positiveId(reworkId, "Rework order ID");
  return prisma.$transaction(
    async (tx) => {
      const existing = await tx.reworkOrder.findUnique({
        where: { id: rId },
        include: { defect: true, workOrder: true },
      });
      if (!existing) throw new Error("Rework order not found.");
      const transitions = {
        PLANNED: ["IN_PROGRESS", "CANCELLED"],
        IN_PROGRESS: ["COMPLETED", "CANCELLED"],
        COMPLETED: [],
        CANCELLED: [],
      };
      const status = data.status ?? existing.status;
      if (
        status !== existing.status &&
        !transitions[existing.status]?.includes(status)
      )
        throw new Error(
          `Cannot transition rework from ${existing.status} to ${status}.`,
        );
      const payload = {};
      if (data.assignedToId !== undefined)
        payload.assignedToId = data.assignedToId
          ? positiveId(data.assignedToId, "Assignee ID")
          : null;
      if (data.resolutionNotes !== undefined)
        payload.resolutionNotes = data.resolutionNotes;
      if (data.status !== undefined) payload.status = status;
      if (status === "IN_PROGRESS" && !existing.startedAt)
        payload.startedAt = new Date();
      if (status === "COMPLETED") {
        payload.completedAt = new Date();
        const rework = await tx.reworkOrder.update({
          where: { id: rId },
          data: { ...payload, status },
          include: {
            defect: true,
            workOrder: true,
            assignedTo: { select: { id: true, name: true } },
          },
        });
        await tx.workOrder.update({
          where: { id: existing.workOrderId },
          data: {
            goodQuantity: { increment: existing.quantity },
            rejectedQuantity: { decrement: existing.quantity },
          },
        });
        const completed = await tx.reworkOrder.aggregate({
          where: { defectId: existing.defectId, status: "COMPLETED" },
          _sum: { quantity: true },
        });
        if (
          Number(completed._sum.quantity || 0) >=
          Number(existing.defect.quantity)
        )
          await tx.qualityDefect.update({
            where: { id: existing.defectId },
            data: { status: "RESOLVED", disposition: "Rework completed" },
          });
        return rework;
      }
      return tx.reworkOrder.update({
        where: { id: rId },
        data: payload,
        include: {
          defect: true,
          workOrder: { select: { id: true, workOrderNo: true, status: true } },
          assignedTo: { select: { id: true, name: true } },
        },
      });
    },
    { isolationLevel: "Serializable" },
  );
};

export const getQualityReport = async (filters = {}) => {
  const from = filters.from
    ? new Date(filters.from)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const to = filters.to ? new Date(filters.to) : new Date();
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to < from)
    throw new Error("Report dates must form a valid range.");
  const where = { createdAt: { gte: from, lte: to } };
  const [status, bySeverity, defects, inspectionTotals, recent] =
    await prisma.$transaction([
      prisma.qualityDefect.groupBy({
        by: ["status"],
        where,
        _count: { id: true },
        _sum: { quantity: true },
      }),
      prisma.qualityDefect.groupBy({
        by: ["severity"],
        where,
        _count: { id: true },
      }),
      prisma.qualityDefect.findMany({
        where,
        include: defectInclude,
        orderBy: { createdAt: "desc" },
        take: 12,
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
      prisma.qualityInspection.findMany({
        where: { inspectedAt: { gte: from, lte: to } },
        orderBy: { inspectedAt: "desc" },
        take: 10,
        include: { workOrder: { select: { workOrderNo: true } } },
      }),
    ]);
  const inspected = Number(inspectionTotals._sum.inspectedQuantity || 0);
  const accepted = Number(inspectionTotals._sum.acceptedQuantity || 0);
  const rejected = Number(inspectionTotals._sum.rejectedQuantity || 0);
  return {
    range: { from: from.toISOString(), to: to.toISOString() },
    inspections: {
      count: inspectionTotals._count.id,
      inspected,
      accepted,
      rejected,
      passRate: inspected
        ? Number(((accepted * 100) / inspected).toFixed(2))
        : 0,
    },
    defects: {
      byStatus: Object.fromEntries(
        status.map((r) => [
          r.status,
          { count: r._count.id, quantity: Number(r._sum.quantity || 0) },
        ]),
      ),
      bySeverity: Object.fromEntries(
        bySeverity.map((r) => [r.severity, r._count.id]),
      ),
      recent,
    },
    recentInspections: recent,
  };
};
