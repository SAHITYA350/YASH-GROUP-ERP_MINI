import { serialise } from "../../utils/http.js";

export const createDashboardController = (dashboardService) => ({
  getDashboard: async (_req, res, next) => {
    try {
      const summary = await dashboardService.getSummary();
      res.json({ data: serialise(summary) });
    } catch (error) {
      next(error);
    }
  },
});
