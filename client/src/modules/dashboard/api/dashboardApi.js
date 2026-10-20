import apiClient from '../../../services/apiClient';

export const dashboardApi = {
  getOverview: async () => {
    // Collect stats from finance dashboard and related services
    try {
      const finance = await apiClient.get('/finance/dashboard');
      return {
        finance,
      };
    } catch (err) {
      return {
        finance: null,
        error: err.message,
      };
    }
  },
};

export default dashboardApi;
