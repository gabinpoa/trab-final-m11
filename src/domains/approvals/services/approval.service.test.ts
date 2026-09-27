import { ApprovalService } from './approval.service';
import { ApprovalRepository } from '../repositories/approval.repository';
import { ApprovalStatus, OrderStatus } from '@prisma/client';
import prisma from '../../../shared/config/database';

describe('ApprovalService Tests', () => {
  let service: ApprovalService;
  let mockRepository: jest.Mocked<ApprovalRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByOrderId: jest.fn(),
      findPendingByOrderId: jest.fn(),
      update: jest.fn(),
    } as any;

    service = new ApprovalService();
    (service as any).repository = mockRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('approveOrder', () => {
    it('should approve order successfully with existing pending approval', async () => {
      const orderId = 'order-123';
      const approvedBy = 'user-456';
      const mockOrder = {
        id: orderId,
        userId: 'user-789',
        status: OrderStatus.pending,
        total: 100,
        freight: 10,
        deliveryDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPendingApproval = {
        id: 'approval-1',
        orderId,
        status: ApprovalStatus.pending,
        approvedBy: null,
        approvedAt: null,
        rejectionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedApproval = {
        id: 'approval-1',
        orderId,
        status: ApprovalStatus.approved,
        approvedBy,
        approvedAt: new Date(),
        rejectionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any);
      jest.spyOn(prisma.order, 'update').mockResolvedValue({} as any);
      jest.spyOn(prisma.orderHistory, 'create').mockResolvedValue({} as any);
      mockRepository.findPendingByOrderId.mockResolvedValue(mockPendingApproval as any);
      mockRepository.update.mockResolvedValue(mockUpdatedApproval as any);

      const result = await service.approveOrder({ orderId, approvedBy });

      expect(result).toEqual({
        id: mockUpdatedApproval.id,
        orderId: mockUpdatedApproval.orderId,
        status: mockUpdatedApproval.status,
        approvedBy: mockUpdatedApproval.approvedBy,
        approvedAt: mockUpdatedApproval.approvedAt,
        rejectionReason: mockUpdatedApproval.rejectionReason,
        createdAt: mockUpdatedApproval.createdAt,
        updatedAt: mockUpdatedApproval.updatedAt,
      });

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: OrderStatus.approved },
      });

      expect(prisma.orderHistory.create).toHaveBeenCalledWith({
        data: {
          orderId,
          status: OrderStatus.approved,
          changedBy: approvedBy,
        },
      });
    });

    it('should approve order successfully creating new approval', async () => {
      const orderId = 'order-123';
      const approvedBy = 'user-456';
      const mockOrder = {
        id: orderId,
        userId: 'user-789',
        status: OrderStatus.pending,
        total: 100,
        freight: 10,
        deliveryDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockApproval = {
        id: 'approval-1',
        orderId,
        status: ApprovalStatus.approved,
        approvedBy,
        approvedAt: new Date(),
        rejectionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any);
      jest.spyOn(prisma.order, 'update').mockResolvedValue({} as any);
      jest.spyOn(prisma.orderHistory, 'create').mockResolvedValue({} as any);
      mockRepository.findPendingByOrderId.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockApproval as any);

      const result = await service.approveOrder({ orderId, approvedBy });

      expect(result).toEqual({
        id: mockApproval.id,
        orderId: mockApproval.orderId,
        status: mockApproval.status,
        approvedBy: mockApproval.approvedBy,
        approvedAt: mockApproval.approvedAt,
        rejectionReason: mockApproval.rejectionReason,
        createdAt: mockApproval.createdAt,
        updatedAt: mockApproval.updatedAt,
      });

      expect(mockRepository.create).toHaveBeenCalledWith({
        orderId,
        status: ApprovalStatus.approved,
        approvedBy,
        approvedAt: expect.any(Date),
      });

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: OrderStatus.approved },
      });
    });

    it('should throw error when order not found', async () => {
      const orderId = 'non-existent-order';
      const approvedBy = 'user-456';

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(null);

      await expect(
        service.approveOrder({ orderId, approvedBy })
      ).rejects.toThrow('Order not found');

      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
      });
    });
  });

  describe('rejectOrder', () => {
    it('should reject order successfully with existing pending approval', async () => {
      const orderId = 'order-123';
      const approvedBy = 'user-456';
      const rejectionReason = 'Invalid customization';
      const mockOrder = {
        id: orderId,
        userId: 'user-789',
        status: OrderStatus.pending,
        total: 100,
        freight: 10,
        deliveryDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPendingApproval = {
        id: 'approval-1',
        orderId,
        status: ApprovalStatus.pending,
        approvedBy: null,
        approvedAt: null,
        rejectionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedApproval = {
        id: 'approval-1',
        orderId,
        status: ApprovalStatus.rejected,
        approvedBy,
        approvedAt: new Date(),
        rejectionReason,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any);
      jest.spyOn(prisma.order, 'update').mockResolvedValue({} as any);
      jest.spyOn(prisma.orderHistory, 'create').mockResolvedValue({} as any);
      mockRepository.findPendingByOrderId.mockResolvedValue(mockPendingApproval as any);
      mockRepository.update.mockResolvedValue(mockUpdatedApproval as any);

      const result = await service.rejectOrder({ orderId, approvedBy, rejectionReason });

      expect(result).toEqual({
        id: mockUpdatedApproval.id,
        orderId: mockUpdatedApproval.orderId,
        status: mockUpdatedApproval.status,
        approvedBy: mockUpdatedApproval.approvedBy,
        approvedAt: mockUpdatedApproval.approvedAt,
        rejectionReason: mockUpdatedApproval.rejectionReason,
        createdAt: mockUpdatedApproval.createdAt,
        updatedAt: mockUpdatedApproval.updatedAt,
      });

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: OrderStatus.cancelled },
      });

      expect(prisma.orderHistory.create).toHaveBeenCalledWith({
        data: {
          orderId,
          status: OrderStatus.cancelled,
          changedBy: approvedBy,
        },
      });
    });

    it('should reject order successfully creating new approval', async () => {
      const orderId = 'order-123';
      const approvedBy = 'user-456';
      const rejectionReason = 'Invalid customization';
      const mockOrder = {
        id: orderId,
        userId: 'user-789',
        status: OrderStatus.pending,
        total: 100,
        freight: 10,
        deliveryDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockApproval = {
        id: 'approval-1',
        orderId,
        status: ApprovalStatus.rejected,
        approvedBy,
        approvedAt: new Date(),
        rejectionReason,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any);
      jest.spyOn(prisma.order, 'update').mockResolvedValue({} as any);
      jest.spyOn(prisma.orderHistory, 'create').mockResolvedValue({} as any);
      mockRepository.findPendingByOrderId.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockApproval as any);

      const result = await service.rejectOrder({ orderId, approvedBy, rejectionReason });

      expect(result).toEqual({
        id: mockApproval.id,
        orderId: mockApproval.orderId,
        status: mockApproval.status,
        approvedBy: mockApproval.approvedBy,
        approvedAt: mockApproval.approvedAt,
        rejectionReason: mockApproval.rejectionReason,
        createdAt: mockApproval.createdAt,
        updatedAt: mockApproval.updatedAt,
      });

      expect(mockRepository.create).toHaveBeenCalledWith({
        orderId,
        status: ApprovalStatus.rejected,
        approvedBy,
        approvedAt: expect.any(Date),
        rejectionReason,
      });

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: OrderStatus.cancelled },
      });
    });

    it('should throw error when order not found', async () => {
      const orderId = 'non-existent-order';
      const approvedBy = 'user-456';
      const rejectionReason = 'Invalid customization';

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(null);

      await expect(
        service.rejectOrder({ orderId, approvedBy, rejectionReason })
      ).rejects.toThrow('Order not found');

      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
      });
    });
  });

  describe('findById', () => {
    it('should return approval by ID', async () => {
      const approvalId = 'approval-123';
      const mockApproval = {
        id: approvalId,
        orderId: 'order-123',
        status: ApprovalStatus.approved,
        approvedBy: 'user-456',
        approvedAt: new Date(),
        rejectionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockApproval as any);

      const result = await service.findById(approvalId);

      expect(result).toEqual({
        id: mockApproval.id,
        orderId: mockApproval.orderId,
        status: mockApproval.status,
        approvedBy: mockApproval.approvedBy,
        approvedAt: mockApproval.approvedAt,
        rejectionReason: mockApproval.rejectionReason,
        createdAt: mockApproval.createdAt,
        updatedAt: mockApproval.updatedAt,
      });

      expect(mockRepository.findById).toHaveBeenCalledWith(approvalId);
    });

    it('should return null when approval not found', async () => {
      const approvalId = 'non-existent-approval';

      mockRepository.findById.mockResolvedValue(null);

      const result = await service.findById(approvalId);

      expect(result).toBeNull();
      expect(mockRepository.findById).toHaveBeenCalledWith(approvalId);
    });
  });

  describe('findByOrderId', () => {
    it('should return approvals by order ID', async () => {
      const orderId = 'order-123';
      const mockApprovals = [
        {
          id: 'approval-1',
          orderId,
          status: ApprovalStatus.approved,
          approvedBy: 'user-456',
          approvedAt: new Date(),
          rejectionReason: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'approval-2',
          orderId,
          status: ApprovalStatus.rejected,
          approvedBy: 'user-789',
          approvedAt: new Date(),
          rejectionReason: 'Invalid customization',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.findByOrderId.mockResolvedValue(mockApprovals as any);

      const result = await service.findByOrderId(orderId);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: mockApprovals[0].id,
        orderId: mockApprovals[0].orderId,
        status: mockApprovals[0].status,
        approvedBy: mockApprovals[0].approvedBy,
        approvedAt: mockApprovals[0].approvedAt,
        rejectionReason: mockApprovals[0].rejectionReason,
        createdAt: mockApprovals[0].createdAt,
        updatedAt: mockApprovals[0].updatedAt,
      });

      expect(mockRepository.findByOrderId).toHaveBeenCalledWith(orderId);
    });

    it('should return empty array when no approvals found', async () => {
      const orderId = 'order-without-approvals';

      mockRepository.findByOrderId.mockResolvedValue([]);

      const result = await service.findByOrderId(orderId);

      expect(result).toEqual([]);
      expect(mockRepository.findByOrderId).toHaveBeenCalledWith(orderId);
    });
  });
});
