import apiClient from './client';

export const costingApi = {
  getJobs: async () => {
    return apiClient.get('/finance/jobs');
  },

  getJobCosts: async (jobId) => {
    return apiClient.get(`/finance/jobs/${jobId}/costs`);
  },
};

export default costingApi;
