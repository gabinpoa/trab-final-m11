import api from './api';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  total: number;
  freight?: number;
  deliveryDate?: Date;
  trackingCode?: string;
  createdAt: Date;
  items: OrderItem[];
}

export const orderService = {
  async getAll(): Promise<Order[]> {
    const response = await api.get('/orders');
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
