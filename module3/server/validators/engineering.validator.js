/**
 * Request Body Validators for Module 3 Product & Engineering Workspace
 */

export function validateProductCreate(req, res, next) {
  const { name, categoryId, listPrice } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    errors.push("Product name is required.");
  }
  if (!categoryId || isNaN(parseInt(categoryId, 10))) {
    errors.push("Valid categoryId is required.");
  }
  if (listPrice !== undefined && (isNaN(Number(listPrice)) || Number(listPrice) < 0)) {
    errors.push("listPrice must be a non-negative number.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, error: errors.join(" ") });
  }
  next();
}

export function validateBOMCreate(req, res, next) {
  const { productId, revision, items } = req.body;
  const errors = [];

  if (!productId || isNaN(parseInt(productId, 10))) {
    errors.push("Valid productId is required.");
  }
  if (!revision || typeof revision !== "string") {
    errors.push("Revision identifier (e.g. R1, R2) is required.");
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push("At least one component item is required in the BOM.");
  } else {
    for (const item of items) {
      if (!item.componentProductId || isNaN(parseInt(item.componentProductId, 10))) {
        errors.push("Each component item must have a valid componentProductId.");
        break;
      }
      if (item.quantity === undefined || Number(item.quantity) <= 0) {
        errors.push("Each component item quantity must be greater than zero.");
        break;
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, error: errors.join(" ") });
  }
  next();
}

export function validateCostingSimulation(req, res, next) {
  const { bomId } = req.params;
  if (!bomId || isNaN(parseInt(bomId, 10))) {
    return res.status(400).json({ success: false, error: "Valid numeric bomId is required in URL parameter." });
  }
  next();
}
