import prisma from "../../../shared/database/prisma.js";

const number = (value, label, { min = 0, nullable = false } = {}) => {
  if ((value === undefined || value === null || value === "") && nullable)
    return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min)
    throw new Error(
      `${label} must be a number greater than or equal to ${min}.`,
    );
  return parsed;
};

// ─────────────────────────────────────────────
// 1. GET All BOM Revisions (optionally by product)
// ─────────────────────────────────────────────
export const getBOMRevisions = async (filters = {}) => {
  const { productId, status } = filters;
  const where = {};
  if (productId) where.productId = Number(productId);
  if (status) where.status = status;

  return await prisma.bOMRevision.findMany({
    where,
    include: {
      product: {
        select: { id: true, sku: true, name: true, unitOfMeasure: true },
      },
      items: {
        include: {
          component: {
            select: { id: true, sku: true, name: true, unitOfMeasure: true },
          },
        },
      },
      operations: true,
      workOrders: { select: { id: true, workOrderNo: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

// ─────────────────────────────────────────────
// 2. GET Single BOM Revision
// ─────────────────────────────────────────────
export const getBOMRevisionById = async (id) => {
  const bom = await prisma.bOMRevision.findUnique({
    where: { id: Number(id) },
    include: {
      product: true,
      items: { include: { component: true } },
      operations: { orderBy: { sequence: "asc" } },
      workOrders: {
        select: {
          id: true,
          workOrderNo: true,
          status: true,
          plannedQuantity: true,
        },
      },
    },
  });
  if (!bom) throw new Error("BOM revision not found.");
  return bom;
};

// ─────────────────────────────────────────────
// 3. CREATE BOM Revision
// ─────────────────────────────────────────────
export const createBOMRevision = async (data) => {
  const {
    productId,
    revision,
    notes,
    materialCost,
    laborCost,
    overheadCost,
    items = [],
    operations = [],
  } = data;

  if (
    !productId ||
    !Number.isInteger(Number(productId)) ||
    Number(productId) < 1
  )
    throw new Error("A valid product ID is required.");
  if (!revision)
    throw new Error("Revision identifier is required (e.g. R1, R2).");
  if (!Array.isArray(items) || !Array.isArray(operations))
    throw new Error("BOM items and operations must be arrays.");

  const product = await prisma.product.findUnique({
    where: { id: Number(productId) },
  });
  if (!product) throw new Error("Product not found.");
  for (const item of items) {
    if (Number(item.componentProductId) === Number(productId))
      throw new Error("A product cannot be a component of its own BOM.");
    number(item.componentProductId, "Component product ID", { min: 1 });
    number(item.quantity, "Component quantity", { min: Number.EPSILON });
    number(item.scrapPercent ?? 0, "Scrap percent");
  }
  for (const [index, operation] of operations.entries()) {
    if (!operation.name?.trim())
      throw new Error(`Operation ${index + 1} requires a name.`);
    number(operation.sequence ?? index + 1, "Operation sequence", { min: 1 });
    if (
      operation.standardMinutes !== undefined &&
      operation.standardMinutes !== null
    )
      number(operation.standardMinutes, "Standard minutes", {
        min: Number.EPSILON,
      });
  }

  const existing = await prisma.bOMRevision.findUnique({
    where: { productId_revision: { productId: Number(productId), revision } },
  });
  if (existing)
    throw new Error(
      `BOM revision '${revision}' already exists for this product.`,
    );

  return await prisma.bOMRevision.create({
    data: {
      productId: Number(productId),
      revision,
      notes: notes || null,
      materialCost: number(materialCost ?? 0, "Material cost"),
      laborCost: number(laborCost ?? 0, "Labor cost"),
      overheadCost: number(overheadCost ?? 0, "Overhead cost"),
      status: "DRAFT",
      items: {
        create: items.map((item) => ({
          componentProductId: Number(item.componentProductId),
          quantity: Number(item.quantity),
          scrapPercent: item.scrapPercent ? Number(item.scrapPercent) : 0,
        })),
      },
      operations: {
        create: operations.map((op, idx) => ({
          sequence: op.sequence ?? idx + 1,
          name: op.name,
          workCenter: op.workCenter || null,
          standardMinutes: op.standardMinutes
            ? Number(op.standardMinutes)
            : null,
          instructions: op.instructions || null,
        })),
      },
    },
    include: {
      product: { select: { sku: true, name: true } },
      items: { include: { component: { select: { sku: true, name: true } } } },
      operations: { orderBy: { sequence: "asc" } },
    },
  });
};

// ─────────────────────────────────────────────
// 4. UPDATE BOM Revision (status / cost / notes)
// ─────────────────────────────────────────────
export const updateBOMRevision = async (id, data) => {
  const existing = await prisma.bOMRevision.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new Error("BOM revision not found.");

  const updatePayload = {};
  let supersededBomId = null;
  if (existing.status === "RELEASED" || existing.status === "SUPERSEDED")
    throw new Error(
      "Released or superseded BOM revisions are locked. Create a new revision to make changes.",
    );
  if (data.notes !== undefined) updatePayload.notes = data.notes;
  if (data.status !== undefined) {
    const transitions = {
      DRAFT: ["IN_REVIEW"],
      IN_REVIEW: ["DRAFT", "RELEASED"],
    };
    if (
      data.status !== existing.status &&
      !transitions[existing.status]?.includes(data.status)
    )
      throw new Error(
        `Cannot transition BOM from ${existing.status} to ${data.status}.`,
      );
    updatePayload.status = data.status;
    if (data.status === "RELEASED") {
      const [itemCount, operationCount, otherReleased] = await Promise.all([
        prisma.bOMItem.count({ where: { bomRevisionId: Number(id) } }),
        prisma.bOMOperation.count({ where: { bomRevisionId: Number(id) } }),
        prisma.bOMRevision.findFirst({
          where: {
            productId: existing.productId,
            status: "RELEASED",
            id: { not: Number(id) },
          },
        }),
      ]);
      if (!itemCount || !operationCount)
        throw new Error(
          "A BOM needs at least one component and one routing operation before release.",
        );
      supersededBomId = otherReleased?.id ?? null;
      updatePayload.releasedAt = new Date();
    }
  }
  for (const key of ["materialCost", "laborCost", "overheadCost"])
    if (data[key] !== undefined) updatePayload[key] = number(data[key], key);

  const updateData = { where: { id: Number(id) }, data: updatePayload };
  if (supersededBomId) {
    await prisma.$transaction([
      prisma.bOMRevision.update({
        where: { id: supersededBomId },
        data: { status: "SUPERSEDED" },
      }),
      prisma.bOMRevision.update(updateData),
    ]);
    return getBOMRevisionById(id);
  }
  return prisma.bOMRevision.update({
    ...updateData,
    include: {
      product: { select: { sku: true, name: true } },
      items: { include: { component: true } },
      operations: { orderBy: { sequence: "asc" } },
    },
  });
};

// ─────────────────────────────────────────────
// 5. DELETE BOM Revision (DRAFT only)
// ─────────────────────────────────────────────
export const deleteBOMRevision = async (id) => {
  const existing = await prisma.bOMRevision.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new Error("BOM revision not found.");
  if (existing.status !== "DRAFT")
    throw new Error("Only DRAFT BOM revisions can be deleted.");
  return await prisma.bOMRevision.delete({ where: { id: Number(id) } });
};

// ─────────────────────────────────────────────
// 6. ADD/REPLACE BOM Items
// ─────────────────────────────────────────────
export const upsertBOMItems = async (bomRevisionId, items) => {
  if (!Array.isArray(items) || !items.length)
    throw new Error("Provide at least one BOM item.");
  const bom = await prisma.bOMRevision.findUnique({
    where: { id: Number(bomRevisionId) },
  });
  if (!bom) throw new Error("BOM revision not found.");
  if (bom.status !== "DRAFT")
    throw new Error("BOM items can only be edited on DRAFT revisions.");
  for (const item of items) {
    if (Number(item.componentProductId) === bom.productId)
      throw new Error("A product cannot be a component of its own BOM.");
    number(item.componentProductId, "Component product ID", { min: 1 });
    number(item.quantity, "Component quantity", { min: Number.EPSILON });
    number(item.scrapPercent ?? 0, "Scrap percent");
  }

  return await prisma.$transaction(
    items.map((item) =>
      prisma.bOMItem.upsert({
        where: {
          bomRevisionId_componentProductId: {
            bomRevisionId: Number(bomRevisionId),
            componentProductId: Number(item.componentProductId),
          },
        },
        update: {
          quantity: Number(item.quantity),
          scrapPercent: item.scrapPercent ? Number(item.scrapPercent) : 0,
        },
        create: {
          bomRevisionId: Number(bomRevisionId),
          componentProductId: Number(item.componentProductId),
          quantity: Number(item.quantity),
          scrapPercent: item.scrapPercent ? Number(item.scrapPercent) : 0,
        },
      }),
    ),
  );
};

// ─────────────────────────────────────────────
// 7. ADD/UPDATE BOM Operations
// ─────────────────────────────────────────────
export const upsertBOMOperations = async (bomRevisionId, operations) => {
  if (!Array.isArray(operations) || !operations.length)
    throw new Error("Provide at least one routing operation.");
  const bom = await prisma.bOMRevision.findUnique({
    where: { id: Number(bomRevisionId) },
  });
  if (!bom) throw new Error("BOM revision not found.");
  if (bom.status !== "DRAFT")
    throw new Error("BOM operations can only be edited on DRAFT revisions.");
  for (const op of operations) {
    if (!op.name?.trim()) throw new Error("Each operation requires a name.");
    number(op.sequence, "Operation sequence", { min: 1 });
    if (op.standardMinutes !== undefined && op.standardMinutes !== null)
      number(op.standardMinutes, "Standard minutes", { min: Number.EPSILON });
  }

  return await prisma.$transaction(
    operations.map((op) =>
      prisma.bOMOperation.upsert({
        where: {
          bomRevisionId_sequence: {
            bomRevisionId: Number(bomRevisionId),
            sequence: Number(op.sequence),
          },
        },
        update: {
          name: op.name,
          workCenter: op.workCenter || null,
          standardMinutes: op.standardMinutes
            ? Number(op.standardMinutes)
            : null,
          instructions: op.instructions || null,
        },
        create: {
          bomRevisionId: Number(bomRevisionId),
          sequence: Number(op.sequence),
          name: op.name,
          workCenter: op.workCenter || null,
          standardMinutes: op.standardMinutes
            ? Number(op.standardMinutes)
            : null,
          instructions: op.instructions || null,
        },
      }),
    ),
  );
};

// ─────────────────────────────────────────────
// 8. BOM STATS
// ─────────────────────────────────────────────
export const getBOMStats = async () => {
  const [statusCounts, costAgg] = await prisma.$transaction([
    prisma.bOMRevision.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.bOMRevision.aggregate({
      _avg: { materialCost: true, laborCost: true, overheadCost: true },
      _count: { id: true },
    }),
  ]);
  return {
    byStatus: Object.fromEntries(
      statusCounts.map((r) => [r.status, r._count.id]),
    ),
    total: costAgg._count.id,
    avgCosts: {
      material: Number(costAgg._avg.materialCost || 0).toFixed(2),
      labor: Number(costAgg._avg.laborCost || 0).toFixed(2),
      overhead: Number(costAgg._avg.overheadCost || 0).toFixed(2),
    },
  };
};
