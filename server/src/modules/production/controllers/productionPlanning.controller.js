import {
  getPlanningDashboard,
  getProductionCalendar,
  getDemandForecast,
  getProductionCapacity,
  updatePlanApproval,
} from "../services/productionPlanning.service.js";
import {
  errorMessage,
  errorStatus,
} from "../../../shared/middleware/httpError.js";

const wrap =
  (work, message = "Planning data loaded.") =>
  async (req, res) => {
    try {
      return res.json({ success: true, message, data: await work(req) });
    } catch (error) {
      return res
        .status(errorStatus(error))
        .json({ success: false, message: errorMessage(error) });
    }
  };

export const planningDashboard = wrap((req) => getPlanningDashboard(req.query));
export const productionCalendar = wrap((req) =>
  getProductionCalendar(req.query),
);
export const demandForecast = wrap((req) => getDemandForecast(req.query));
export const capacityPlan = wrap((req) => getProductionCapacity(req.query));
export const planApproval = wrap(
  (req) => updatePlanApproval(req.params.id, req.body, req.user?.id),
  "Plan approval updated.",
);
