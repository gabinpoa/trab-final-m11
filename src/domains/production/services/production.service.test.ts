import { ProductionService } from './production.service';
import { ProductionRepository } from '../repositories/production.repository';
import { ProductionStage, OrderStatus } from '@prisma/client';
import prisma from '../../../shared/config/database';

describe('ProductionService Tests', () => {
  let service: ProductionService;
  let mockRepository: jest.Mocked<ProductionRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByStage: jest.fn(),
      findByOrderId: jest.fn(),
      updateStage: jest.fn(),
    } as any;

    service = new ProductionService();
    (service as any).repository = mockRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProductionQueue', () => {
    it('should create production queue successfully', async () => {
      const orderId = 'order-123';
      const mockOrder = {
        id: orderId,
        userId: 'user-456',
        status: OrderStatus.approved,
        total: 100,
        freight: 10,
        deliveryDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockProductionQueue = {
        id: 'production-1',
        orderId,
        stage: ProductionStage.pending,
        startedAt: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any);
      jest.spyOn(prisma.order, 'update').mockResolvedValue({} as any);
      mockRepository.findByOrderId.mockResolvedValue([]);
      mockRepository.create.mockResolvedValue(mockProductionQueue as any);

      const result = await service.createProductionQueue(orderId);

      expect(result).toEqual({
        id: mockProductionQueue.id,
        orderId: mockProductionQueue.orderId,
        stage: mockProductionQueue.stage,
        startedAt: mockProductionQueue.startedAt,
        completedAt: mockProductionQueue.completedAt,
        createdAt: mockProductionQueue.createdAt,
        updatedAt: mockProductionQueue.updatedAt,
      });

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: OrderStatus.in_production },
      });
    });

    it('should throw error when order not found', async () => {
      const orderId = 'non-existent-order';

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(null);

      await expect(
        service.createProductionQueue(orderId)
      ).rejects.toThrow('Order not found');
    });

    it('should throw error when order is not approved', async () => {
      const orderId = 'order-123';
      const mockOrder = {
        id: orderId,
        userId: 'user-456',
        status: OrderStatus.pending,
        total: 100,
        freight: 10,
        deliveryDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any);

      await expect(
        service.createProductionQueue(orderId)
      ).rejects.toThrow('Order must be approved before production');
    });

    it('should throw error when production queue already exists', async () => {
      const orderId = 'order-123';
      const mockOrder = {
        id: orderId,
        userId: 'user-456',
        status: OrderStatus.approved,
        total: 100,
        freight: 10,
        deliveryDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockExistingQueue = {
        id: 'production-1',
        orderId,
        stage: ProductionStage.pending,
      };

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any);
      mockRepository.findByOrderId.mockResolvedValue([mockExistingQueue as any]);

      await expect(
        service.createProductionQueue(orderId)
      ).rejects.toThrow('Production queue already exists for this order');
    });
  });

  describe('findById', () => {
    it('should return production queue by ID', async () => {
      const productionId = 'production-123';
      const mockProductionQueue = {
        id: productionId,
        orderId: 'order-123',
        stage: ProductionStage.printing,
        startedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: {
          id: 'order-123',
          status: OrderStatus.in_production,
          total: 100,
        },
      };

      mockRepository.findById.mockResolvedValue(mockProductionQueue as any);

      const result = await service.findById(productionId);

      expect(result).toEqual({
        id: mockProductionQueue.id,
        orderId: mockProductionQueue.orderId,
        stage: mockProductionQueue.stage,
        startedAt: mockProductionQueue.startedAt,
        completedAt: mockProductionQueue.completedAt,
        createdAt: mockProductionQueue.createdAt,
        updatedAt: mockProductionQueue.updatedAt,
        order: {
          id: mockProductionQueue.order.id,
          status: mockProductionQueue.order.status,
          total: mockProductionQueue.order.total,
        },
      });

      expect(mockRepository.findById).toHaveBeenCalledWith(productionId);
    });

    it('should return null when production queue not found', async () => {
      const productionId = 'non-existent-production';

      mockRepository.findById.mockResolvedValue(null);

      const result = await service.findById(productionId);

      expect(result).toBeNull();
      expect(mockRepository.findById).toHaveBeenCalledWith(productionId);
    });
  });

  describe('findAll', () => {
    it('should return all production queues', async () => {
      const mockProductionQueues = [
        {
          id: 'production-1',
          orderId: 'order-123',
          stage: ProductionStage.printing,
          startedAt: new Date(),
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          order: {
            id: 'order-123',
            status: OrderStatus.in_production,
            total: 100,
          },
        },
        {
          id: 'production-2',
          orderId: 'order-456',
          stage: ProductionStage.cutting,
          startedAt: new Date(),
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          order: {
            id: 'order-456',
            status: OrderStatus.in_production,
            total: 200,
          },
        },
      ];

      mockRepository.findAll.mockResolvedValue(mockProductionQueues as any);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: mockProductionQueues[0].id,
        orderId: mockProductionQueues[0].orderId,
        stage: mockProductionQueues[0].stage,
        startedAt: mockProductionQueues[0].startedAt,
        completedAt: mockProductionQueues[0].completedAt,
        createdAt: mockProductionQueues[0].createdAt,
        updatedAt: mockProductionQueues[0].updatedAt,
        order: {
          id: mockProductionQueues[0].order.id,
          status: mockProductionQueues[0].order.status,
          total: mockProductionQueues[0].order.total,
        },
      });

      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no production queues found', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findByStage', () => {
    it('should return production queues by stage', async () => {
      const stage = ProductionStage.printing;
      const mockProductionQueues = [
        {
          id: 'production-1',
          orderId: 'order-123',
          stage: ProductionStage.printing,
          startedAt: new Date(),
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          order: {
            id: 'order-123',
            status: OrderStatus.in_production,
            total: 100,
          },
        },
      ];

      mockRepository.findByStage.mockResolvedValue(mockProductionQueues as any);

      const result = await service.findByStage(stage);

      expect(result).toHaveLength(1);
      expect(result[0].stage).toBe(stage);
      expect(mockRepository.findByStage).toHaveBeenCalledWith(stage);
    });

    it('should return empty array when no production queues found for stage', async () => {
      const stage = ProductionStage.shipped;

      mockRepository.findByStage.mockResolvedValue([]);

      const result = await service.findByStage(stage);

      expect(result).toEqual([]);
      expect(mockRepository.findByStage).toHaveBeenCalledWith(stage);
    });
  });

  describe('updateStage', () => {
    it('should update stage successfully', async () => {
      const productionId = 'production-123';
      const newStage = ProductionStage.cutting;
      const mockCurrent = {
        id: productionId,
        orderId: 'order-123',
        stage: ProductionStage.printing,
        startedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdated = {
        id: productionId,
        orderId: 'order-123',
        stage: ProductionStage.cutting,
        startedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockCurrent as any);
      mockRepository.updateStage.mockResolvedValue(mockUpdated as any);

      const result = await service.updateStage(productionId, { stage: newStage });

      expect(result).toEqual({
        id: mockUpdated.id,
        orderId: mockUpdated.orderId,
        stage: mockUpdated.stage,
        startedAt: mockUpdated.startedAt,
        completedAt: mockUpdated.completedAt,
        createdAt: mockUpdated.createdAt,
        updatedAt: mockUpdated.updatedAt,
      });

      expect(mockRepository.updateStage).toHaveBeenCalledWith(productionId, newStage);
    });

    it('should throw error when production queue not found', async () => {
      const productionId = 'non-existent-production';
      const newStage = ProductionStage.cutting;

      mockRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateStage(productionId, { stage: newStage })
      ).rejects.toThrow('Production queue item not found');
    });

    it('should throw error for invalid transition', async () => {
      const productionId = 'production-123';
      const newStage = ProductionStage.shipped;
      const mockCurrent = {
        id: productionId,
        orderId: 'order-123',
        stage: ProductionStage.pending,
        startedAt: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockCurrent as any);

      await expect(
        service.updateStage(productionId, { stage: newStage })
      ).rejects.toThrow('Invalid transition from pending to shipped');
    });

    it('should update order status when stage is shipped', async () => {
      const productionId = 'production-123';
      const newStage = ProductionStage.shipped;
      const mockCurrent = {
        id: productionId,
        orderId: 'order-123',
        stage: ProductionStage.packaging,
        startedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdated = {
        id: productionId,
        orderId: 'order-123',
        stage: ProductionStage.shipped,
        startedAt: new Date(),
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockCurrent as any);
      mockRepository.updateStage.mockResolvedValue(mockUpdated as any);
      jest.spyOn(prisma.order, 'update').mockResolvedValue({} as any);

      await service.updateStage(productionId, { stage: newStage });

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: mockCurrent.orderId },
        data: { status: OrderStatus.shipped },
      });
    });
  });

  describe('calculateEstimatedTime', () => {
    it('should calculate estimated time for pending stage', async () => {
      const productionId = 'production-123';
      const mockCurrent = {
        id: productionId,
        orderId: 'order-123',
        stage: ProductionStage.pending,
        startedAt: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockCurrent as any);

      const result = await service.calculateEstimatedTime(productionId);

      // pending -> printing (2h) -> cutting (1h) -> assembly (3h) -> quality_check (1h) -> packaging (1h) -> shipped (0h)
      // Total: 8 hours
      expect(result).toBe(8);
    });

    it('should calculate estimated time for printing stage', async () => {
      const productionId = 'production-123';
      const mockCurrent = {
        id: productionId,
        orderId: 'order-123',
        stage: ProductionStage.printing,
        startedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockCurrent as any);

      const result = await service.calculateEstimatedTime(productionId);

      // printing -> cutting (1h) -> assembly (3h) -> quality_check (1h) -> packaging (1h) -> shipped (0h)
      // Total: 6 hours
      expect(result).toBe(6);
    });

    it('should return 0 for shipped stage', async () => {
      const productionId = 'production-123';
      const mockCurrent = {
        id: productionId,
        orderId: 'order-123',
        stage: ProductionStage.shipped,
        startedAt: new Date(),
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockCurrent as any);

      const result = await service.calculateEstimatedTime(productionId);

      expect(result).toBe(0);
    });

    it('should throw error when production queue not found', async () => {
      const productionId = 'non-existent-production';

      mockRepository.findById.mockResolvedValue(null);

      await expect(
        service.calculateEstimatedTime(productionId)
      ).rejects.toThrow('Production queue item not found');
    });
  });
});
