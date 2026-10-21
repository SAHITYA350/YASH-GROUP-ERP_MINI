import prisma from "../../../shared/database/prisma.js";

const numeric = (value, label, { required = false } = {}) => {
  if (value === undefined || value === null || value === "") {
    if (required) throw new Error(`${label} is required.`);
    return 0;
  }
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0)
    throw new Error(`${label} must be a non-negative number.`);
  return n;
};
const validDate = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime()))
    throw new Error("Inspected at must be a valid date.");
  return d;
};
const resultStatus = (inspected, accepted, rejected) => {
  if (inspected === 0) return "NOT_STARTED";
  if (rejected === 0) return "PASS";
  if (accepted === 0) return "FAIL";
  return "HOLD";
};
const include = {
  workOrder: {
    select: {
      workOrderNo: true,
      status: true,
      plannedQuantity: true,
      goodQuantity: true,
      rejectedQuantity: true,
      salesOrder: {
        select: { orderNumber: true, customer: { select: { name: true } } },
      },
    },
  },
};
const makeInspectionNo = () => {
  const d = new Date();
  return `QI-${String(d.getFullYear()).slice(-2)}${String(d.getMonth() + 1).padStart(2, "0")}-${d.getTime().toString().slice(-6)}${Math.floor(Math.random() * 10)}`;
};

export const createQualityInspection = async (data) => {
  const workOrderId = numeric(data.workOrderId, "Work order ID", {
    required: true,
  });
  if (!Number.isInteger(workOrderId) || workOrderId < 1)
    throw new Error("Work order ID must be a positive integer.");
  const inspectedQuantity = numeric(
    data.inspectedQuantity,
    "Inspected quantity",
    { required: true },
  );
  if (inspectedQuantity <= 0)
    throw new Error("Inspected quantity must be greater than zero.");
  const acceptedQuantity = numeric(data.acceptedQuantity, "Accepted quantity");
  const rejectedQuantity = numeric(data.rejectedQuantity, "Rejected quantity");
  if (acceptedQuantity + rejectedQuantity !== inspectedQuantity)
    throw new Error(
      "Accepted and rejected quantities must add up to the inspected quantity.",
    );
  const inspectedAt = validDate(data.inspectedAt) ?? new Date();
  return prisma.$transaction(
    async (tx) => {
      const wo = await tx.workOrder.findUnique({
        where: { id: workOrderId },
        include: { inspections: true },
      });
      if (!wo) throw new Error("Work order not found.");
      if (["DRAFT", "CANCELLED", "COMPLETED"].includes(wo.status))
        throw new Error(
          "Inspections can only be recorded for active production work orders.",
        );
      const alreadyInspected = wo.inspections.reduce(
        (sum, row) => sum + Number(row.inspectedQuantity),
        0,
      );
      if (alreadyInspected + inspectedQuantity > Number(wo.plannedQuantity))
        throw new Error(
          "Total inspected quantity cannot exceed the work order planned quantity.",
        );
      const inspection = await tx.qualityInspection.create({
        data: {
          inspectionNo: makeInspectionNo(),
          workOrderId,
          status: resultStatus(
            inspectedQuantity,
            acceptedQuantity,
            rejectedQuantity,
          ),
          inspectedQuantity,
          acceptedQuantity,
          rejectedQuantity,
          measurements: data.measurements ?? undefined,
          evidenceNotes: data.evidenceNotes || null,
          inspectedAt,
        },
        include,
      });
      await tx.workOrder.update({
        where: { id: workOrderId },
        data: {
          goodQuantity: { increment: acceptedQuantity },
          rejectedQuantity: { increment: rejectedQuantity },
          ...(rejectedQuantity > 0 ? { status: "QC_HOLD" } : {}),
        },
      });
      return inspection;
    },
    { isolationLevel: "Serializable" },
  );
};

export const getQualityInspections = async (filters = {}) => {
  const page = Math.max(1, Number.parseInt(filters.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(filters.limit, 10) || 50),
  );
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.workOrderId)
    where.workOrderId = numeric(filters.workOrderId, "Work order ID", {
      required: true,
    });
  const [inspections, total] = await Promise.all([
    prisma.qualityInspection.findMany({
      where,
      include,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.qualityInspection.count({ where }),
  ]);
  return { inspections, total, page, limit, pages: Math.ceil(total / limit) };
};

export const getQualityInspectionById = async (id) => {
  const inspection = await prisma.qualityInspection.findUnique({
    where: { id: numeric(id, "Inspection ID", { required: true }) },
    include: {
      ...include,
      workOrder: {
        include: {
          salesOrder: {
            include: { customer: true, items: { include: { product: true } } },
          },
          bomRevision: { include: { operations: true } },
          items: { include: { product: true } },
        },
      },
    },
  });
  if (!inspection) throw new Error("Quality inspection not found.");
  return inspection;
};

export const updateQualityInspection = async (id, data) => {
  const inspectionId = numeric(id, "Inspection ID", { required: true });
  return prisma.$transaction(
    async (tx) => {
      const existing = await tx.qualityInspection.findUnique({
        where: { id: inspectionId },
      });
      if (!existing) throw new Error("Quality inspection not found.");
      if (existing.status === "RELEASED")
        throw new Error(
          "Released inspections are final and cannot be changed.",
        );
      const inspected =
        data.inspectedQuantity === undefined
          ? Number(existing.inspectedQuantity)
          : numeric(data.inspectedQuantity, "Inspected quantity", {
              required: true,
            });
      const accepted =
        data.acceptedQuantity === undefined
          ? Number(existing.acceptedQuantity)
          : numeric(data.acceptedQuantity, "Accepted quantity");
      const rejected =
        data.rejectedQuantity === undefined
          ? Number(existing.rejectedQuantity)
          : numeric(data.rejectedQuantity, "Rejected quantity");
      if (inspected <= 0 || accepted + rejected !== inspected)
        throw new Error(
          "Accepted and rejected quantities must add up to the positive inspected quantity.",
        );
      const inspectedAt = validDate(data.inspectedAt);
      const calculatedStatus = resultStatus(inspected, accepted, rejected);
      if (data.status !== undefined && data.status !== "RELEASED")
        throw new Error(
          "Inspection status is calculated from its quantities; only RELEASED may be set manually.",
        );
      if (data.status === "RELEASED" && calculatedStatus === "FAIL")
        throw new Error("A failed inspection cannot be released.");
      const payload = {
        inspectedQuantity: inspected,
        acceptedQuantity: accepted,
        rejectedQuantity: rejected,
        status: data.status === "RELEASED" ? "RELEASED" : calculatedStatus,
      };
      if (data.measurements !== undefined)
        payload.measurements = data.measurements;
      if (data.evidenceNotes !== undefined)
        payload.evidenceNotes = data.evidenceNotes;
      if (inspectedAt !== undefined) payload.inspectedAt = inspectedAt;
      const wo = await tx.workOrder.findUnique({
        where: { id: existing.workOrderId },
        include: { inspections: true },
      });
      const totalInspected = wo.inspections.reduce(
        (sum, row) =>
          sum +
          (row.id === inspectionId ? inspected : Number(row.inspectedQuantity)),
        0,
      );
      if (totalInspected > Number(wo.plannedQuantity))
        throw new Error(
          "Total inspected quantity cannot exceed the work order planned quantity.",
        );
      const updated = await tx.qualityInspection.update({
        where: { id: inspectionId },
        data: payload,
        include,
      });
      await tx.workOrder.update({
        where: { id: existing.workOrderId },
        data: {
          goodQuantity: {
            increment: accepted - Number(existing.acceptedQuantity),
          },
          rejectedQuantity: {
            increment: rejected - Number(existing.rejectedQuantity),
          },
          ...(rejected > 0 ? { status: "QC_HOLD" } : {}),
        },
      });
      return updated;
    },
    { isolationLevel: "Serializable" },
  );
};

export const getQualityStats = async () => {
  const [statusCounts, totals, recentInspections] = await Promise.all([
    prisma.qualityInspection.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.qualityInspection.aggregate({
      _sum: {
        inspectedQuantity: true,
        acceptedQuantity: true,
        rejectedQuantity: true,
      },
    }),
    prisma.qualityInspection.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include,
    }),
  ]);
  const inspected = Number(totals._sum.inspectedQuantity || 0);
  const accepted = Number(totals._sum.acceptedQuantity || 0);
  const rejected = Number(totals._sum.rejectedQuantity || 0);
  return {
    byStatus: Object.fromEntries(
      statusCounts.map((r) => [r.status, r._count.id]),
    ),
    totals: {
      inspected,
      accepted,
      rejected,
      passRate: inspected
        ? Number(((accepted / inspected) * 100).toFixed(2))
        : 0,
    },
    recentInspections,
  };
};
