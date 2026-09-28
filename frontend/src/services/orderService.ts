import api from './api';
import type { Order, OrderItem } from '../types';

export const orderService = {
  async getAll(): Promise<Order[]> {
    const response = await api.get('/orders');
    return response.data;
  },

  async getMyOrders(): Promise<Order[]> {
    const response = await api.get('/orders/my');
    return response.data;
  },

  async getById(id: string): Promise<Order> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  async create(data: {
    items: { productId: string; quantity: number }[];
    cep: string;
  }): Promise<Order> {
    const response = await api.post('/orders', data);
    return response.data;
  },

  async getQRCode(orderId: string): Promise<any> {
    const response = await api.get(`/qrcode/orders/${orderId}`);
    return response.data;
  },
};
