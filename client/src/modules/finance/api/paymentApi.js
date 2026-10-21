import apiClient from './client';

export const paymentApi = {
  getPayments: async () => {
    return apiClient.get('/finance/payments');
  },
};

export default paymentApi;
