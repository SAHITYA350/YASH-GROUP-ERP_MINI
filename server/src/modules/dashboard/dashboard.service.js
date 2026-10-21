export const createDashboardService = (dashboardRepo) => ({
  getSummary: async () => {
    return dashboardRepo.getMetrics();
  },
});
