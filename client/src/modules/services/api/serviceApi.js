import apiClient from '../../../services/apiClient';

export const serviceApi = {
  getTickets: async () => {
    return apiClient.get('/services/tickets');
  },

  getSchedule: async () => {
    return apiClient.get('/services/schedule');
  },

  getTicket: async (id) => {
    return apiClient.get(`/services/tickets/${id}`);
  },
};

export default serviceApi;
