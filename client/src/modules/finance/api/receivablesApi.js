import apiClient from './client';

export const receivablesApi = {
  getSummary: async () => {
    return apiClient.get('/finance/receivables');
  },

  getAgeing: async () => {
    return apiClient.get('/finance/receivables/ageing');
  },
};

export default receivablesApi;
