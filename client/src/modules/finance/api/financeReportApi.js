import apiClient from './client';

export const financeReportApi = {
  getDashboard: async () => {
    return apiClient.get('/finance/dashboard');
  },

  getMisReport: async () => {
    return apiClient.get('/finance/reports/mis');
  },
};

export default financeReportApi;
