import api from './api';

export const adminService = {
  async approveOrder(orderId: string): Promise<any> {
    const response = await api.post(`/approvals/${orderId}/approve`);
    return response.data;
  },

  async rejectOrder(orderId: string, rejectionReason: string): Promise<any> {
    const response = await api.post(`/approvals/${orderId}/reject`, { rejectionReason });
    return response.data;
  },

  async getProductionQueue(): Promise<any[]> {
    const response = await api.get('/production/queue');
    return response.data;
  },

  async updateProductionStage(queueId: string, stage: string): Promise<any> {
    const response = await api.put(`/production/queue/${queueId}/stage`, { stage });
    return response.data;
  },
};
