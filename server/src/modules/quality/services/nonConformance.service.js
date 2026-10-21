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
const makeCode = () =>
  `NCR-${Date.now().toString(36).toUpperCase()}-${Math.floor(
    Math.random() * 1000,
  )
    .toString()
    .padStart(3, "0")}`;

export const listNcr = (query = {}) =>
  prisma.nonConformance.findMany({
    where: {
      ...(query.status ? { status: query.status } : {}),
      ...(query.workOrderId
        ? { workOrderId: asId(query.workOrderId, "Work order ID") }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

export const createNcr = (data) =>
  prisma.nonConformance.create({
    data: {
      code: makeCode(),
      title: required(data.title, "Title"),
      description: data.description || null,
      workOrderId: data.workOrderId
        ? asId(data.workOrderId, "Work order ID")
        : null,
      inspectionId: data.inspectionId
        ? asId(data.inspectionId, "Inspection ID")
        : null,
      defectId: data.defectId ? asId(data.defectId, "Defect ID") : null,
      rootCause: data.rootCause || null,
      containmentAction: data.containmentAction || null,
      correctiveAction: data.correctiveAction || null,
      preventiveAction: data.preventiveAction || null,
      ownerId: data.ownerId ? asId(data.ownerId, "Owner ID") : null,
      dueAt: dateOrNull(data.dueAt, "Due date"),
    },
  });

export const updateNcr = async (id, data) => {
  const existing = await prisma.nonConformance.findUnique({
    where: { id: asId(id) },
  });
  if (!existing) throw new Error("Non-conformance record not found.");

  const status = data.status ?? existing.status;
  const flow = {
    OPEN: ["INVESTIGATING", "CLOSED"],
    INVESTIGATING: ["ACTION_REQUIRED", "CLOSED"],
    ACTION_REQUIRED: ["VERIFYING", "INVESTIGATING"],
    VERIFYING: ["CLOSED", "ACTION_REQUIRED"],
    CLOSED: ["OPEN"],
  };
  if (status !== existing.status && !flow[existing.status]?.includes(status)) {
    throw new Error(`Cannot change NCR from ${existing.status} to ${status}.`);
  }
  if (
    status === "VERIFYING" &&
    !(
      (data.correctiveAction ?? existing.correctiveAction) &&
      (data.preventiveAction ?? existing.preventiveAction)
    )
  ) {
    throw new Error(
      "Record corrective and preventive actions before verification.",
    );
  }

  return prisma.nonConformance.update({
    where: { id: existing.id },
    data: {
      status,
      ...(status === "CLOSED" ? { closedAt: new Date() } : {}),
      ...(status === "VERIFYING" ? { verifiedAt: new Date() } : {}),
      ...Object.fromEntries(
        [
          "title",
          "description",
          "rootCause",
          "containmentAction",
          "correctiveAction",
          "preventiveAction",
        ]
          .filter((key) => data[key] !== undefined)
          .map((key) => [key, data[key]]),
      ),
      ...(data.ownerId !== undefined
        ? { ownerId: data.ownerId ? asId(data.ownerId, "Owner ID") : null }
        : {}),
      ...(data.dueAt !== undefined
        ? { dueAt: dateOrNull(data.dueAt, "Due date") }
        : {}),
    },
  });
};
