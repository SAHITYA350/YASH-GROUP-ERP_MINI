import apiClient from '../../../services/apiClient';

export const userApi = {
  getUsers: async () => {
    return apiClient.get('/users');
  },

  getUser: async (id) => {
    return apiClient.get(`/users/${id}`);
  },
};

export default userApi;
