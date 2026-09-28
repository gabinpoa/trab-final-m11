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

  async getMaterials(): Promise<any[]> {
    const response = await api.get('/materials');
    return response.data;
  },

  async createMaterial(data: { name: string; quantity: number; minLevel: number }): Promise<any> {
    const response = await api.post('/materials', data);
    return response.data;
  },

  async updateMaterial(id: string, data: { quantity?: number; minLevel?: number }): Promise<any> {
    const response = await api.put(`/materials/${id}`, data);
    return response.data;
  },
};
