import apiClient from './client';

export const expenseApi = {
  getExpenses: async () => {
    return apiClient.get('/finance/expenses');
  },

  createExpense: async (data) => {
    return apiClient.post('/finance/expenses', data);
  },
};

export default expenseApi;
