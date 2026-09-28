import { describe, it, expect, beforeEach, vi } from 'vitest';
import { orderService } from './orderService';
import { Order } from '../types';
import api from './api';

// Mock do api
vi.mock('./api');

describe('orderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockOrders: Order[] = [
    {
      id: '1',
      userId: 'user1',
      status: 'pending',
      total: 100,
      freight: 20,
      deliveryDate: new Date('2024-01-01'),
      trackingCode: 'TRACK123',
      createdAt: new Date('2024-01-01'),
      items: [
        {
          productId: 'prod1',
          productName: 'Product 1',
          quantity: 1,
          price: 100,
        },
      ],
    },
    {
      id: '2',
      userId: 'user1',
      status: 'approved',
      total: 200,
      freight: 30,
      deliveryDate: new Date('2024-01-02'),
      trackingCode: 'TRACK456',
      createdAt: new Date('2024-01-02'),
      items: [
        {
          productId: 'prod2',
          productName: 'Product 2',
          quantity: 2,
          price: 100,
        },
      ],
    },
  ];

  describe('getAll', () => {
    it('deve retornar lista de pedidos', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockOrders } as any);

      const result = await orderService.getAll();

      expect(result).toEqual(mockOrders);
      expect(api.get).toHaveBeenCalledWith('/orders');
    });

    it('deve lançar erro em caso de falha', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

      await expect(orderService.getAll()).rejects.toThrow('Network error');
    });
  });

  describe('getById', () => {
    it('deve retornar pedido por ID', async () => {
      const mockOrder = mockOrders[0];
      vi.mocked(api.get).mockResolvedValue({ data: mockOrder } as any);

      const result = await orderService.getById('1');

      expect(result).toEqual(mockOrder);
      expect(api.get).toHaveBeenCalledWith('/orders/1');
    });

    it('deve lançar erro em caso de falha', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Order not found'));

      await expect(orderService.getById('1')).rejects.toThrow('Order not found');
    });
  });

  describe('create', () => {
    it('deve criar novo pedido', async () => {
      const orderData = {
        items: [
          { productId: 'prod1', quantity: 1 },
        ],
        cep: '12345678',
      };

      const mockOrder = mockOrders[0];
      vi.mocked(api.post).mockResolvedValue({ data: mockOrder } as any);

      const result = await orderService.create(orderData);

      expect(result).toEqual(mockOrder);
      expect(api.post).toHaveBeenCalledWith('/orders', orderData);
    });

    it('deve lançar erro em caso de falha', async () => {
      const orderData = {
        items: [
          { productId: 'prod1', quantity: 1 },
        ],
        cep: '12345678',
      };

      vi.mocked(api.post).mockRejectedValue(new Error('Failed to create order'));

      await expect(orderService.create(orderData)).rejects.toThrow('Failed to create order');
    });
  });

  describe('getQRCode', () => {
    it('deve retornar QR Code do pedido', async () => {
      const mockQRCode = {
        qrCode: 'base64-encoded-qr-code',
        trackingUrl: 'http://example.com/tracking/TRACK123',
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockQRCode } as any);

      const result = await orderService.getQRCode('1');

      expect(result).toEqual(mockQRCode);
      expect(api.get).toHaveBeenCalledWith('/qrcode/orders/1');
    });

    it('deve lançar erro em caso de falha', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Failed to generate QR code'));

      await expect(orderService.getQRCode('1')).rejects.toThrow('Failed to generate QR code');
    });
  });
});
