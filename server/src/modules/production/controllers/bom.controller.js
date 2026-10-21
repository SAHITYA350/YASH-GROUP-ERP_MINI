import {
  getBOMRevisions,
  getBOMRevisionById,
  createBOMRevision,
  updateBOMRevision,
  deleteBOMRevision,
  upsertBOMItems,
  upsertBOMOperations,
  getBOMStats,
} from "../services/bom.service.js";
import {
  errorMessage,
  errorStatus,
} from "../../../shared/middleware/httpError.js";

// GET /api/production/bom
export const getAllBOMs = async (req, res) => {
  try {
    const boms = await getBOMRevisions(req.query);
    return res
      .status(200)
      .json({ success: true, count: boms.length, data: boms });
  } catch (err) {
    return res
      .status(errorStatus(err, 500))
      .json({ success: false, message: errorMessage(err) });
  }
};

// GET /api/production/bom/:id
export const getBOMById = async (req, res) => {
  try {
    const bom = await getBOMRevisionById(req.params.id);
    return res.status(200).json({ success: true, data: bom });
  } catch (err) {
    return res
      .status(errorStatus(err, 500))
      .json({ success: false, message: errorMessage(err) });
  }
};

// POST /api/production/bom
export const createBOM = async (req, res) => {
  try {
    const bom = await createBOMRevision(req.body);
    return res
      .status(201)
      .json({ success: true, message: "BOM revision created.", data: bom });
  } catch (err) {
    return res
      .status(errorStatus(err))
      .json({ success: false, message: errorMessage(err) });
  }
};

// PATCH /api/production/bom/:id
export const updateBOM = async (req, res) => {
  try {
    const bom = await updateBOMRevision(req.params.id, req.body);
    return res
      .status(200)
      .json({ success: true, message: "BOM revision updated.", data: bom });
  } catch (err) {
    return res
      .status(errorStatus(err))
      .json({ success: false, message: errorMessage(err) });
  }
};

// DELETE /api/production/bom/:id
export const deleteBOM = async (req, res) => {
  try {
    await deleteBOMRevision(req.params.id);
    return res
      .status(200)
      .json({ success: true, message: "BOM revision deleted." });
  } catch (err) {
    return res
      .status(errorStatus(err))
      .json({ success: false, message: errorMessage(err) });
  }
};

// POST /api/production/bom/:id/items
export const upsertItems = async (req, res) => {
  try {
    const items = await upsertBOMItems(req.params.id, req.body.items || []);
    return res
      .status(200)
      .json({ success: true, message: "BOM items saved.", data: items });
  } catch (err) {
    return res
      .status(errorStatus(err))
      .json({ success: false, message: errorMessage(err) });
  }
};

// POST /api/production/bom/:id/operations
export const upsertOperations = async (req, res) => {
  try {
    const ops = await upsertBOMOperations(
      req.params.id,
      req.body.operations || [],
    );
    return res
      .status(200)
      .json({ success: true, message: "BOM operations saved.", data: ops });
  } catch (err) {
    return res
      .status(errorStatus(err))
      .json({ success: false, message: errorMessage(err) });
  }
};

// GET /api/production/bom/stats
export const getBOMStatsSummary = async (req, res) => {
  try {
    const stats = await getBOMStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (err) {
    return res
      .status(errorStatus(err, 500))
      .json({ success: false, message: errorMessage(err) });
  }
};
