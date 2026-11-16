import axiosClient from './axiosClient';

export const authApi = {
  login: async (credentials) => {
    const response = await axiosClient.post('/api/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await axiosClient.post('/api/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axiosClient.get('/api/auth/me');
    return response.data;
  },
};
