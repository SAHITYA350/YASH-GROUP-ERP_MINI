import apiClient from '../../../services/apiClient';

export const leadApi = {
  getLeads: async () => {
    return apiClient.get('/leads');
  },

  getLead: async (id) => {
    return apiClient.get(`/leads/${id}`);
  },

  getLeadFollowUps: async (id) => {
    return apiClient.get(`/leads/${id}/follow-ups`);
  },
};

export default leadApi;
