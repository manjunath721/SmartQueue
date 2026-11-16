import axiosClient from './axiosClient';

export const serviceApi = {
  getActiveServices: async () => {
    const response = await axiosClient.get('/api/services');
    return response.data;
  },

  getAllServices: async () => {
    const response = await axiosClient.get('/api/services/all');
    return response.data;
  },

  getServiceById: async (id) => {
    const response = await axiosClient.get(`/api/services/${id}`);
    return response.data;
  },

  createService: async (serviceData) => {
    const response = await axiosClient.post('/api/services', serviceData);
    return response.data;
  },

  updateService: async (id, serviceData) => {
    const response = await axiosClient.put(`/api/services/${id}`, serviceData);
    return response.data;
  },

  toggleServiceStatus: async (id) => {
    const response = await axiosClient.put(`/api/services/${id}/toggle-status`);
    return response.data;
  },
};
