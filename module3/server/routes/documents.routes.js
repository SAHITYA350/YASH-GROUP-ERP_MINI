import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

// GET /api/documents - Fetch drawings and documents
router.get("/", async (req, res) => {
  try {
    const { type, productId, search } = req.query;
    const where = {};

    if (type) where.type = type;
    if (productId) where.productId = parseInt(productId, 10);
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { revision: { contains: search, mode: "insensitive" } },
      ];
    }

    const documents = await prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: { id: true, sku: true, name: true, modelName: true },
        },
      },
    });

    res.json({ success: true, data: documents });
  } catch (err) {
    console.error("Fetch documents error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/documents - Register new engineering document or drawing
router.post("/", async (req, res) => {
  try {
    const { title, type = "DRAWING", storageKey, mimeType, fileSize, revision, description, isApproved = false, productId } = req.body;

    if (!title || !storageKey) {
      return res.status(400).json({ success: false, error: "Title and file/storage URL are required." });
    }

    // Default to first user or system engineer
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Lead Systems Engineer",
          email: "lead.engineer@yashgroup.com",
          passwordHash: "hash123",
          department: "Engineering",
          role: "ENGINEER",
        },
      });
    }

    const created = await prisma.mediaAsset.create({
      data: {
        title: title.trim(),
        type: type || "DRAWING",
        storageKey: storageKey.trim(),
        mimeType: mimeType || (type === "DRAWING" ? "application/pdf" : type === "TRAINING" ? "video/mp4" : "application/octet-stream"),
        fileSize: fileSize ? BigInt(fileSize) : null,
        revision: revision ? revision.trim() : "REV-A",
        description: description || null,
        isApproved: Boolean(isApproved),
        productId: productId ? parseInt(productId, 10) : null,
        uploadedById: user.id,
      },
      include: { product: true },
    });

    // Serialize BigInt safely
    const serialized = {
      ...created,
      fileSize: created.fileSize ? created.fileSize.toString() : null,
    };

    res.status(201).json({ success: true, data: serialized });
  } catch (err) {
    console.error("Create document error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/documents/:id - Update document revision or approval
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, revision, description, isApproved, storageKey } = req.body;

    const updated = await prisma.mediaAsset.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(revision !== undefined && { revision }),
        ...(description !== undefined && { description }),
        ...(isApproved !== undefined && { isApproved: Boolean(isApproved) }),
        ...(storageKey && { storageKey: storageKey.trim() }),
      },
      include: { product: true },
    });

    const serialized = {
      ...updated,
      fileSize: updated.fileSize ? updated.fileSize.toString() : null,
    };

    res.json({ success: true, data: serialized });
  } catch (err) {
    console.error("Update document error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/documents/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.mediaAsset.delete({ where: { id } });
    res.json({ success: true, message: "Document removed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
