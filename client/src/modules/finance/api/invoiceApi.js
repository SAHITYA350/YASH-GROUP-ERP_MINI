import apiClient from './client';

export const invoiceApi = {
  getInvoices: async () => {
    return apiClient.get('/finance/invoices');
  },

  getNextNumber: async () => {
    return apiClient.get('/finance/invoices/next-number');
  },

  getInvoice: async (id) => {
    return apiClient.get(`/finance/invoices/${id}`);
  },

  createInvoice: async (data) => {
    return apiClient.post('/finance/invoices', data);
  },

  createReceipt: async (invoiceId, data) => {
    return apiClient.post(`/finance/invoices/${invoiceId}/receipts`, data);
  },
};

export default invoiceApi;
