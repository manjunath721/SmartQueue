import axiosClient from './axiosClient';

export const queueApi = {
  // Public customer token generation
  generateToken: async (tokenData) => {
    const response = await axiosClient.post('/api/customer/tokens', tokenData);
    return response.data;
  },

  // Public customer tracking
  trackToken: async (trackingId) => {
    const response = await axiosClient.get(`/api/customer/tokens/${trackingId}`);
    return response.data;
  },

  // Public display board
  getDisplayBoard: async () => {
    const response = await axiosClient.get('/api/customer/display-board');
    return response.data;
  },

  // Staff queue operations
  getStaffDashboard: async () => {
    const response = await axiosClient.get('/api/staff/dashboard');
    return response.data;
  },

  getWaitingQueue: async (serviceId) => {
    const response = await axiosClient.get(`/api/staff/queue`, {
      params: serviceId ? { serviceId } : {},
    });
    return response.data;
  },

  callNext: async (serviceId, counterName) => {
    const response = await axiosClient.post('/api/staff/queue/call-next', {
      serviceId,
      counterName,
    });
    return response.data;
  },

  completeService: async (tokenId) => {
    const response = await axiosClient.put(`/api/staff/tokens/${tokenId}/complete`);
    return response.data;
  },

  cancelToken: async (tokenId, reason) => {
    const response = await axiosClient.put(`/api/staff/tokens/${tokenId}/cancel`, {
      reason,
    });
    return response.data;
  },

  getCurrentServing: async () => {
    const response = await axiosClient.get('/api/staff/current-serving');
    return response.data;
  },
};
