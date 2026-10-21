import apiClient from './client';

export const vendorBillApi = {
  getVendorBills: async () => {
    return apiClient.get('/finance/vendor-bills');
  },

  getVendorBill: async (id) => {
    return apiClient.get(`/finance/vendor-bills/${id}`);
  },

  createVendorBill: async (data) => {
    return apiClient.post('/finance/vendor-bills', data);
  },

  approveVendorBill: async (id) => {
    return apiClient.post(`/finance/vendor-bills/${id}/approve`);
  },

  matchVendorBill: async (id, data) => {
    return apiClient.post(`/finance/vendor-bills/${id}/match`, data);
  },

  createBillPayment: async (id, data) => {
    return apiClient.post(`/finance/vendor-bills/${id}/payments`, data);
  },
};

export default vendorBillApi;
