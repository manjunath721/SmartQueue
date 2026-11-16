import axiosClient from './axiosClient';

export const adminApi = {
  getDashboardSummary: async () => {
    const response = await axiosClient.get('/api/admin/dashboard');
    return response.data;
  },

  getCustomers: async (params = {}) => {
    const response = await axiosClient.get('/api/admin/customers', { params });
    return response.data;
  },

  getTokens: async (params = {}) => {
    const response = await axiosClient.get('/api/admin/tokens', { params });
    return response.data;
  },

  getStaff: async (params = {}) => {
    const response = await axiosClient.get('/api/admin/staff', { params });
    return response.data;
  },

  createStaff: async (staffData) => {
    const response = await axiosClient.post('/api/admin/staff', staffData);
    return response.data;
  },

  toggleStaffStatus: async (id) => {
    const response = await axiosClient.put(`/api/admin/staff/${id}/toggle-status`);
    return response.data;
  },

  assignStaff: async (assignmentData) => {
    const response = await axiosClient.post('/api/admin/staff/assign', assignmentData);
    return response.data;
  },

  removeStaffAssignment: async (userId, serviceId) => {
    const response = await axiosClient.delete(`/api/admin/staff/${userId}/assign/${serviceId}`);
    return response.data;
  },
};
