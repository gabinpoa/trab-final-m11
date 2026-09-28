import api from './api';
import { Customization } from '../types';

export const customizationService = {
  async upload(orderId: string, file: File, comment?: string): Promise<Customization> {
    const formData = new FormData();
    formData.append('file', file);
    if (comment) {
      formData.append('comment', comment);
    }

    const response = await api.post(`/customizations/${orderId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getById(id: string): Promise<Customization> {
    const response = await api.get(`/customizations/${id}`);
    return response.data;
  },

  async getByOrderId(orderId: string): Promise<Customization[]> {
    const response = await api.get(`/customizations/order/${orderId}`);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/customizations/${id}`);
  },
};
