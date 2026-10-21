import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

// GET /api/specifications - List all product specifications
router.get("/", async (req, res) => {
  try {
    const { productId, status } = req.query;
    const where = {};
    if (productId) where.productId = parseInt(productId, 10);
    if (status) where.status = status;

    const specs = await prisma.productSpecification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: { id: true, sku: true, name: true, modelName: true, diameter: true, length: true },
        },
      },
    });

    res.json({ success: true, data: specs });
  } catch (err) {
    console.error("Fetch specs error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/specifications/:id - Get single specification
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const spec = await prisma.productSpecification.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });
    if (!spec) return res.status(404).json({ success: false, error: "Specification not found" });
    res.json({ success: true, data: spec });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/specifications - Create new revision specification
router.post("/", async (req, res) => {
  try {
    const { productId, revision, status = "DRAFT", specification, drawingNumber } = req.body;

    if (!productId || !revision) {
      return res.status(400).json({ success: false, error: "Product ID and revision identifier are required." });
    }

    const prodId = parseInt(productId, 10);
    const rev = revision.trim().toUpperCase();

    // Check if duplicate revision for same product
    const existing = await prisma.productSpecification.findUnique({
      where: {
        productId_revision: {
          productId: prodId,
          revision: rev,
        },
      },
    });

    if (existing) {
      return res.status(409).json({ success: false, error: `Revision ${rev} already exists for this product.` });
    }

    const created = await prisma.productSpecification.create({
      data: {
        productId: prodId,
        revision: rev,
        status: status || "DRAFT",
        specification: specification || {},
        drawingNumber: drawingNumber || null,
        releasedAt: status === "RELEASED" ? new Date() : null,
      },
      include: { product: true },
    });

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error("Create spec error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/specifications/:id - Update specification
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { specification, drawingNumber, status } = req.body;

    const existing = await prisma.productSpecification.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, error: "Specification not found" });

    // Protect released specifications from silent overwrites unless creating new revision
    const data = {
      ...(specification && { specification }),
      ...(drawingNumber !== undefined && { drawingNumber }),
      ...(status && {
        status,
        ...(status === "RELEASED" && !existing.releasedAt ? { releasedAt: new Date() } : {}),
      }),
    };

    const updated = await prisma.productSpecification.update({
      where: { id },
      data,
      include: { product: true },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Update spec error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
