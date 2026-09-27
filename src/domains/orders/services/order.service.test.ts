import { OrderService } from './order.service';

// Mock dependencies
jest.mock('../repositories/order.repository');
jest.mock('../../../shared/config/database', () => ({
  default: {
    orderHistory: {
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));
jest.mock('../../../shared/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all orders', async () => {
      const mockOrders = [
        { id: '1', userId: '1', status: 'pending', total: 100, freight: 10 },
        { id: '2', userId: '2', status: 'approved', total: 200, freight: 20 },
      ];

      const orderRepository = require('../repositories/order.repository').default;
      orderRepository.findAll = jest.fn().mockResolvedValue(mockOrders);

      const result = await orderService.getAll();

      expect(result).toEqual(mockOrders);
      expect(orderRepository.findAll).toHaveBeenCalled();
    });

    it('should return orders with pagination options', async () => {
      const mockOrders = [{ id: '1', userId: '1', status: 'pending', total: 100, freight: 10 }];

      const orderRepository = require('../repositories/order.repository').default;
      orderRepository.findAll = jest.fn().mockResolvedValue(mockOrders);

      const result = await orderService.getAll({ skip: 0, take: 10 });

      expect(result).toEqual(mockOrders);
      expect(orderRepository.findAll).toHaveBeenCalledWith({ skip: 0, take: 10 });
    });

    it('should return orders filtered by user', async () => {
      const mockOrders = [{ id: '1', userId: '1', status: 'pending', total: 100, freight: 10 }];

      const orderRepository = require('../repositories/order.repository').default;
      orderRepository.findAll = jest.fn().mockResolvedValue(mockOrders);

      const result = await orderService.getAll({ userId: '1' });

      expect(result).toEqual(mockOrders);
      expect(orderRepository.findAll).toHaveBeenCalledWith({ userId: '1' });
    });
  });

  describe('getById', () => {
    it('should return order by id', async () => {
      const mockOrder = { id: '1', userId: '1', status: 'pending', total: 100, freight: 10 };

      const orderRepository = require('../repositories/order.repository').default;
      orderRepository.findById = jest.fn().mockResolvedValue(mockOrder);

      const result = await orderService.getById('1');

      expect(result).toEqual(mockOrder);
      expect(orderRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw error if order not found', async () => {
      const orderRepository = require('../repositories/order.repository').default;
      orderRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(orderService.getById('1')).rejects.toThrow('Order not found');
    });
  });

  describe('getByUser', () => {
    it('should return orders by user', async () => {
      const mockOrders = [
        { id: '1', userId: '1', status: 'pending', total: 100, freight: 10 },
        { id: '2', userId: '1', status: 'approved', total: 200, freight: 20 },
      ];

      const orderRepository = require('../repositories/order.repository').default;
      orderRepository.findByUser = jest.fn().mockResolvedValue(mockOrders);

      const result = await orderService.getByUser('1');

      expect(result).toEqual(mockOrders);
      expect(orderRepository.findByUser).toHaveBeenCalledWith('1');
    });
  });

  describe('create', () => {
    it('should create new order', async () => {
      const mockOrder = {
        id: '1',
        userId: '1',
        status: 'pending',
        total: 100,
        freight: 10,
        items: [
          { id: '1', productId: '1', quantity: 2, price: 50 },
        ],
      };

      const orderRepository = require('../repositories/order.repository').default;
      orderRepository.create = jest.fn().mockResolvedValue(mockOrder);

      const result = await orderService.create({
        userId: '1',
        items: [{ productId: '1', quantity: 2, price: 50 }],
        total: 100,
        freight: 10,
      });

      expect(result).toEqual(mockOrder);
      expect(orderRepository.create).toHaveBeenCalledWith({
        user: { connect: { id: '1' } },
        status: 'pending',
        total: 100,
        freight: 10,
        items: {
          create: [{ product: { connect: { id: '1' } }, quantity: 2, price: 50 }],
        },
        history: {
          create: { status: 'pending', changedBy: '1' },
        },
      });
    });

    it('should create order without freight', async () => {
      const mockOrder = {
        id: '1',
        userId: '1',
        status: 'pending',
        total: 100,
        freight: null,
        items: [
          { id: '1', productId: '1', quantity: 2, price: 50 },
        ],
      };

      const orderRepository = require('../repositories/order.repository').default;
      orderRepository.create = jest.fn().mockResolvedValue(mockOrder);

      const result = await orderService.create({
        userId: '1',
        items: [{ productId: '1', quantity: 2, price: 50 }],
        total: 100,
      });

      expect(result).toEqual(mockOrder);
      expect(orderRepository.create).toHaveBeenCalledWith({
        user: { connect: { id: '1' } },
        status: 'pending',
        total: 100,
        freight: undefined,
        items: {
          create: [{ product: { connect: { id: '1' } }, quantity: 2, price: 50 }],
        },
        history: {
          create: { status: 'pending', changedBy: '1' },
        },
      });
    });

    it('should create order with multiple items', async () => {
      const mockOrder = {
        id: '1',
        userId: '1',
        status: 'pending',
        total: 150,
        freight: 10,
        items: [
          { id: '1', productId: '1', quantity: 2, price: 50 },
          { id: '2', productId: '2', quantity: 1, price: 50 },
        ],
      };

      const orderRepository = require('../repositories/order.repository').default;
      orderRepository.create = jest.fn().mockResolvedValue(mockOrder);

      const result = await orderService.create({
        userId: '1',
        items: [
          { productId: '1', quantity: 2, price: 50 },
          { productId: '2', quantity: 1, price: 50 },
        ],
        total: 150,
        freight: 10,
      });

      expect(result).toEqual(mockOrder);
      expect(orderRepository.create).toHaveBeenCalledWith({
        user: { connect: { id: '1' } },
        status: 'pending',
        total: 150,
        freight: 10,
        items: {
          create: [
            { product: { connect: { id: '1' } }, quantity: 2, price: 50 },
            { product: { connect: { id: '2' } }, quantity: 1, price: 50 },
          ],
        },
        history: {
          create: { status: 'pending', changedBy: '1' },
        },
      });
    });
  });

  describe('update', () => {
    it('should update order', async () => {
      const mockOrder = { id: '1', userId: '1', status: 'pending', total: 100, freight: 10 };
      const mockUpdatedOrder = { id: '1', userId: '1', status: 'approved', total: 100, freight: 15 };

      const orderRepository = require('../repositories/order.repository').default;
      orderRepository.findById = jest.fn().mockResolvedValue(mockOrder);
      orderRepository.update = jest.fn().mockResolvedValue(mockUpdatedOrder);

      const prisma = require('../../../shared/config/database').default;
      (prisma as any).orderHistory = { create: jest.fn().mockResolvedValue({}) };

      const result = await orderService.update('1', {
        status: 'approved',
        freight: 15,
      });

      expect(result).toEqual(mockUpdatedOrder);
      expect(orderRepository.update).toHaveBeenCalledWith('1', {
        status: 'approved',
        freight: 15,
      });
      expect(prisma.orderHistory.create).toHaveBeenCalledWith({
        data: { orderId: '1', status: 'approved', changedBy: '1' },
      });
    });

    it('should throw error if order not found', async () => {
      const orderRepository = require('../repositories/order.repository').default;
      orderRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(orderService.update('1', { status: 'approved' })).rejects.toThrow('Order not found');
    });

    it('should not create history entry if status did not change', async () => {
      const mockOrder = { id: '1', userId: '1', status: 'pending', total: 100, freight: 10 };
      const mockUpdatedOrder = { id: '1', userId: '1', status: 'pending', total: 100, freight: 15 };

      const orderRepository = require('../repositories/order.repository').default;
      orderRepository.findById = jest.fn().mockResolvedValue(mockOrder);
      orderRepository.update = jest.fn().mockResolvedValue(mockUpdatedOrder);

      const prisma = require('../../../shared/config/database').default;
      (prisma as any).orderHistory = { create: jest.fn().mockResolvedValue({}) };

      const result = await orderService.update('1', {
        freight: 15,
      });

      expect(result).toEqual(mockUpdatedOrder);
      expect(prisma.orderHistory.create).not.toHaveBeenCalled();
    });

    it('should update only provided fields', async () => {
      const mockOrder = { id: '1', userId: '1', status: 'pending', total: 100, freight: 10 };
      const mockUpdatedOrder = { id: '1', userId: '1', status: 'pending', total: 100, freight: 15 };

      const orderRepository = require('../repositories/order.repository').default;
      orderRepository.findById = jest.fn().mockResolvedValue(mockOrder);
      orderRepository.update = jest.fn().mockResolvedValue(mockUpdatedOrder);

      const result = await orderService.update('1', {
        freight: 15,
      });

      expect(result).toEqual(mockUpdatedOrder);
      expect(orderRepository.update).toHaveBeenCalledWith('1', {
        freight: 15,
      });
    });
  });

  describe('delete', () => {
    it('should delete order', async () => {
      const mockOrder = { id: '1', userId: '1', status: 'pending', total: 100, freight: 10 };

      const orderRepository = require('../repositories/order.repository').default;
      orderRepository.findById = jest.fn().mockResolvedValue(mockOrder);
      orderRepository.delete = jest.fn().mockResolvedValue(mockOrder);

      const result = await orderService.delete('1');

      expect(result).toEqual({ message: 'Order deleted successfully' });
      expect(orderRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw error if order not found', async () => {
      const orderRepository = require('../repositories/order.repository').default;
      orderRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(orderService.delete('1')).rejects.toThrow('Order not found');
    });
  });

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const mockOrder = { id: '1', userId: '1', status: 'pending', total: 100, freight: 10 };
      const mockUpdatedOrder = { id: '1', userId: '1', status: 'approved', total: 100, freight: 10 };

      const orderRepository = require('../repositories/order.repository').default;
      orderRepository.findById = jest.fn().mockResolvedValue(mockOrder);
      orderRepository.updateStatus = jest.fn().mockResolvedValue(mockUpdatedOrder);

      const prisma = require('../../../shared/config/database').default;
      (prisma as any).orderHistory = { create: jest.fn().mockResolvedValue({}) };

      const result = await orderService.updateStatus('1', 'approved');

      expect(result).toEqual(mockUpdatedOrder);
      expect(orderRepository.updateStatus).toHaveBeenCalledWith('1', 'approved');
      expect(prisma.orderHistory.create).toHaveBeenCalledWith({
        data: { orderId: '1', status: 'approved', changedBy: '1' },
      });
    });

    it('should throw error if order not found', async () => {
      const orderRepository = require('../repositories/order.repository').default;
      orderRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(orderService.updateStatus('1', 'approved')).rejects.toThrow('Order not found');
    });
  });
});
