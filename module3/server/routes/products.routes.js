import { Router } from "express";
import { prisma } from "../db.js";
import { validateProductCreate } from "../validators/engineering.validator.js";

const router = Router();

// GET /api/products - List products with filter, search, and pagination
router.get("/", async (req, res) => {
  try {
    const { search, categoryId, isManufactured, page = 1, limit = 50, sortBy = "updatedAt", sortOrder = "desc" } = req.query;

    const where = { isActive: true };

    if (search) {
      where.OR = [
        { sku: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { modelName: { contains: search, mode: "insensitive" } },
        { drawingId: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId, 10);
    }

    if (isManufactured !== undefined && isManufactured !== "") {
      where.isManufactured = isManufactured === "true";
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [total, products, categories] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: { select: { id: true, name: true, type: true } },
          _count: {
            select: {
              bomRevisions: true,
              productSpecifications: true,
              mediaAssets: true,
            },
          },
        },
      }),
      prisma.category.findMany({
        select: { id: true, name: true, type: true },
        orderBy: { name: "asc" },
      }),
    ]);

    res.json({
      success: true,
      data: {
        products,
        categories,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          pages: Math.ceil(total / take) || 1,
        },
      },
    });
  } catch (err) {
    console.error("Products list error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/:id - Full product detail workspace
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, error: "Invalid product ID" });

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        productSpecifications: {
          orderBy: { createdAt: "desc" },
        },
        bomRevisions: {
          include: {
            items: {
              include: {
                component: {
                  select: { id: true, sku: true, name: true, unitOfMeasure: true, listPrice: true },
                },
              },
            },
            operations: {
              orderBy: { sequence: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        mediaAssets: {
          orderBy: { createdAt: "desc" },
        },
        inventory: true,
        // Where this product is used as a subassembly or component
        bomComponents: {
          include: {
            bomRevision: {
              include: {
                product: { select: { id: true, sku: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    console.error("Product detail error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/products - Create a new product
router.post("/", validateProductCreate, async (req, res) => {
  try {
    const {
      sku,
      name,
      variant,
      categoryId,
      hsnCode,
      standardMake,
      gstPercent,
      listPrice,
      unitOfMeasure,
      isManufactured,
      diameter,
      length,
      modelName,
      bagType,
      bagSize,
      bagQuantity,
      drawingId,
      drawingUrl,
      imageUrl,
      description,
      minReorderLevel,
    } = req.body;

    if (!sku || !name || !categoryId) {
      return res.status(400).json({ success: false, error: "SKU, Product Name, and Category are required." });
    }

    // Check SKU uniqueness
    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      return res.status(409).json({ success: false, error: `Product with SKU "${sku}" already exists.` });
    }

    const newProduct = await prisma.product.create({
      data: {
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        variant: variant ? variant.trim() : null,
        categoryId: parseInt(categoryId, 10),
        hsnCode: hsnCode ? hsnCode.trim() : "8538",
        standardMake: standardMake ? standardMake.trim() : "YASH",
        gstPercent: gstPercent !== undefined ? parseFloat(gstPercent) : 18.0,
        listPrice: listPrice !== undefined ? parseFloat(listPrice) : 0.0,
        unitOfMeasure: unitOfMeasure ? unitOfMeasure.trim().toUpperCase() : "PCS",
        isManufactured: Boolean(isManufactured),
        diameter: diameter || null,
        length: length || null,
        modelName: modelName || null,
        bagType: bagType || null,
        bagSize: bagSize || null,
        bagQuantity: bagQuantity ? parseInt(bagQuantity, 10) : 1,
        drawingId: drawingId || null,
        drawingUrl: drawingUrl || null,
        imageUrl: imageUrl || null,
        description: description || null,
        minReorderLevel: minReorderLevel ? parseFloat(minReorderLevel) : 10.0,
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/products/:id - Update product
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, error: "Invalid product ID" });

    const {
      name,
      variant,
      categoryId,
      hsnCode,
      standardMake,
      gstPercent,
      listPrice,
      unitOfMeasure,
      isManufactured,
      diameter,
      length,
      modelName,
      bagType,
      bagSize,
      bagQuantity,
      drawingId,
      drawingUrl,
      imageUrl,
      description,
      minReorderLevel,
      isActive,
    } = req.body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(variant !== undefined && { variant: variant ? variant.trim() : null }),
        ...(categoryId && { categoryId: parseInt(categoryId, 10) }),
        ...(hsnCode !== undefined && { hsnCode }),
        ...(standardMake !== undefined && { standardMake }),
        ...(gstPercent !== undefined && { gstPercent: parseFloat(gstPercent) }),
        ...(listPrice !== undefined && { listPrice: parseFloat(listPrice) }),
        ...(unitOfMeasure && { unitOfMeasure: unitOfMeasure.trim().toUpperCase() }),
        ...(isManufactured !== undefined && { isManufactured: Boolean(isManufactured) }),
        ...(diameter !== undefined && { diameter }),
        ...(length !== undefined && { length }),
        ...(modelName !== undefined && { modelName }),
        ...(bagType !== undefined && { bagType }),
        ...(bagSize !== undefined && { bagSize }),
        ...(bagQuantity !== undefined && { bagQuantity: parseInt(bagQuantity, 10) }),
        ...(drawingId !== undefined && { drawingId }),
        ...(drawingUrl !== undefined && { drawingUrl }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(description !== undefined && { description }),
        ...(minReorderLevel !== undefined && { minReorderLevel: parseFloat(minReorderLevel) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
      include: {
        category: true,
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/products/:id/clone - Clone a product with a new SKU
router.post("/:id/clone", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, error: "Invalid product ID" });

    const original = await prisma.product.findUnique({
      where: { id },
      include: { productSpecifications: true },
    });

    if (!original) return res.status(404).json({ success: false, error: "Original product not found" });

    // Generate unique cloned SKU
    let newSku = `${original.sku}-COPY`;
    let count = 1;
    while (await prisma.product.findUnique({ where: { sku: newSku } })) {
      count++;
      newSku = `${original.sku}-COPY-${count}`;
    }

    const cloned = await prisma.product.create({
      data: {
        sku: newSku,
        name: `${original.name} (Copy)`,
        variant: original.variant,
        categoryId: original.categoryId,
        hsnCode: original.hsnCode,
        standardMake: original.standardMake,
        gstPercent: original.gstPercent,
        listPrice: original.listPrice,
        unitOfMeasure: original.unitOfMeasure,
        isManufactured: original.isManufactured,
        diameter: original.diameter,
        length: original.length,
        modelName: original.modelName,
        bagType: original.bagType,
        bagSize: original.bagSize,
        bagQuantity: original.bagQuantity,
        drawingId: original.drawingId ? `${original.drawingId}-DRAFT` : null,
        drawingUrl: original.drawingUrl,
        imageUrl: original.imageUrl,
        description: original.description,
        minReorderLevel: original.minReorderLevel,
        isActive: true,
      },
    });

    // Copy specifications as Draft
    if (original.productSpecifications && original.productSpecifications.length > 0) {
      const latestSpec = original.productSpecifications[0];
      await prisma.productSpecification.create({
        data: {
          productId: cloned.id,
          revision: "REV-DRAFT-1",
          status: "DRAFT",
          specification: latestSpec.specification,
          drawingNumber: latestSpec.drawingNumber,
        },
      });
    }

    res.status(201).json({ success: true, data: cloned, message: `Product cloned successfully with SKU ${newSku}` });
  } catch (err) {
    console.error("Clone product error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/products/:id - Soft-delete or archive product
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, error: "Invalid product ID" });

    // Check if referenced by active orders
    const orderCount = await prisma.salesOrderItem.count({ where: { productId: id } });
    if (orderCount > 0) {
      // Soft-delete to preserve transaction history
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return res.json({ success: true, message: "Product archived/deactivated because it is referenced in sales transactions." });
    }

    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ success: true, message: "Product deactivated successfully." });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
