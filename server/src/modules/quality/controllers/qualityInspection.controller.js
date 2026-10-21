import {
  createQualityInspection,
  getQualityInspections,
  getQualityInspectionById,
  updateQualityInspection,
  getQualityStats,
} from "../services/qualityInspection.service.js";
import {
  errorMessage,
  errorStatus,
} from "../../../shared/middleware/httpError.js";

// POST /api/quality/inspections
export const createInspection = async (req, res) => {
  try {
    const inspection = await createQualityInspection(req.body);
    return res.status(201).json({
      success: true,
      message: "Quality inspection created.",
      data: inspection,
    });
  } catch (err) {
    return res
      .status(errorStatus(err))
      .json({ success: false, message: errorMessage(err) });
  }
};

// GET /api/quality/inspections
export const getAllInspections = async (req, res) => {
  try {
    const result = await getQualityInspections(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res
      .status(errorStatus(err, 500))
      .json({ success: false, message: errorMessage(err) });
  }
};

// GET /api/quality/inspections/:id
export const getInspectionById = async (req, res) => {
  try {
    const inspection = await getQualityInspectionById(req.params.id);
    return res.status(200).json({ success: true, data: inspection });
  } catch (err) {
    return res
      .status(errorStatus(err, 500))
      .json({ success: false, message: errorMessage(err) });
  }
};

// PATCH /api/quality/inspections/:id
export const updateInspection = async (req, res) => {
  try {
    const inspection = await updateQualityInspection(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Quality inspection updated.",
      data: inspection,
    });
  } catch (err) {
    return res
      .status(errorStatus(err))
      .json({ success: false, message: errorMessage(err) });
  }
};

// GET /api/quality/stats
export const getStats = async (req, res) => {
  try {
    const stats = await getQualityStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (err) {
    return res
      .status(errorStatus(err, 500))
      .json({ success: false, message: errorMessage(err) });
  }
};
