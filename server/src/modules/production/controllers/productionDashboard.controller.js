import {
  getProductionDashboardStats,
  getWorkOrderTimeline,
} from "../services/productionDashboard.service.js";
import {
  errorMessage,
  errorStatus,
} from "../../../shared/middleware/httpError.js";

// GET /api/production/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await getProductionDashboardStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (err) {
    return res
      .status(errorStatus(err, 500))
      .json({ success: false, message: errorMessage(err) });
  }
};

// GET /api/production/timeline
export const getTimeline = async (req, res) => {
  try {
    const timeline = await getWorkOrderTimeline(req.query);
    return res
      .status(200)
      .json({ success: true, count: timeline.length, data: timeline });
  } catch (err) {
    return res
      .status(errorStatus(err, 500))
      .json({ success: false, message: errorMessage(err) });
  }
};
