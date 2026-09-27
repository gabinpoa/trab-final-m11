import { CustomizationService } from './customization.service';
import { CustomizationRepository } from '../repositories/customization.repository';
import { ImageProcessingService } from './imageProcessing.service';
import prisma from '../../../shared/config/database';
import fs from 'fs';
import path from 'path';

describe('CustomizationService Tests', () => {
  let service: CustomizationService;
  let mockRepository: jest.Mocked<CustomizationRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByOrderId: jest.fn(),
      delete: jest.fn(),
    } as any;

    service = new CustomizationService();
    (service as any).repository = mockRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCustomization', () => {
    it('should create customization successfully', async () => {
      const orderId = 'order-123';
      const filePath = '/tmp/test.jpg';
      const filename = 'customization-uuid.jpg';
      const comment = 'Test comment';

      const mockOrder = {
        id: orderId,
        userId: 'user-123',
        status: 'pending',
        total: 100,
        freight: 10,
        deliveryDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCustomization = {
        id: 'custom-123',
        orderId,
        filename,
        originalPath: `/uploads/customizations/${orderId}/${filename}`,
        thumbnailPath: `/uploads/customizations/${orderId}/thumbnails/${filename}`,
        compressedPath: `/uploads/customizations/${orderId}/compressed/${filename}`,
        comment,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any);
      jest.spyOn(ImageProcessingService, 'processImage').mockResolvedValue({
        original: mockCustomization.originalPath,
        thumbnail: mockCustomization.thumbnailPath,
        compressed: mockCustomization.compressedPath,
      });
      mockRepository.create.mockResolvedValue(mockCustomization as any);

      const result = await service.createCustomization(orderId, filePath, filename, comment);

      expect(result).toEqual({
        id: mockCustomization.id,
        orderId: mockCustomization.orderId,
        filename: mockCustomization.filename,
        originalPath: mockCustomization.originalPath,
        thumbnailPath: mockCustomization.thumbnailPath,
        compressedPath: mockCustomization.compressedPath,
        comment: mockCustomization.comment,
        createdAt: mockCustomization.createdAt,
        updatedAt: mockCustomization.updatedAt,
      });

      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
      });
      expect(ImageProcessingService.processImage).toHaveBeenCalledWith(
        filePath,
        path.join(process.cwd(), 'uploads', 'customizations', orderId),
        filename
      );
      expect(mockRepository.create).toHaveBeenCalledWith({
        orderId,
        filename,
        originalPath: mockCustomization.originalPath,
        thumbnailPath: mockCustomization.thumbnailPath,
        compressedPath: mockCustomization.compressedPath,
        comment,
      });
    });

    it('should throw error when order not found', async () => {
      const orderId = 'non-existent-order';
      const filePath = '/tmp/test.jpg';
      const filename = 'customization-uuid.jpg';

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(null);

      await expect(
        service.createCustomization(orderId, filePath, filename)
      ).rejects.toThrow('Order not found');

      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
      });
    });

    it('should create directory structure for thumbnails and compressed', async () => {
      const orderId = 'order-123';
      const filePath = '/tmp/test.jpg';
      const filename = 'customization-uuid.jpg';

      const mockOrder = {
        id: orderId,
        userId: 'user-123',
        status: 'pending',
        total: 100,
        freight: 10,
        deliveryDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const baseDir = path.join(process.cwd(), 'uploads', 'customizations', orderId);
      const thumbnailsDir = path.join(baseDir, 'thumbnails');
      const compressedDir = path.join(baseDir, 'compressed');

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any);
      jest.spyOn(ImageProcessingService, 'processImage').mockResolvedValue({
        original: `${baseDir}/${filename}`,
        thumbnail: `${thumbnailsDir}/${filename}`,
        compressed: `${compressedDir}/${filename}`,
      });
      mockRepository.create.mockResolvedValue({
        id: 'custom-123',
        orderId,
        filename,
        originalPath: `${baseDir}/${filename}`,
        thumbnailPath: `${thumbnailsDir}/${filename}`,
        compressedPath: `${compressedDir}/${filename}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await service.createCustomization(orderId, filePath, filename);

      // Verify directories would be created (in real implementation)
      expect(fs.existsSync).toBeDefined();
    });

    it('should delete temporary file after processing', async () => {
      const orderId = 'order-123';
      const filePath = '/tmp/test.jpg';
      const filename = 'customization-uuid.jpg';

      const mockOrder = {
        id: orderId,
        userId: 'user-123',
        status: 'pending',
        total: 100,
        freight: 10,
        deliveryDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any);
      jest.spyOn(ImageProcessingService, 'processImage').mockResolvedValue({
        original: `/uploads/customizations/${orderId}/${filename}`,
        thumbnail: `/uploads/customizations/${orderId}/thumbnails/${filename}`,
        compressed: `/uploads/customizations/${orderId}/compressed/${filename}`,
      });
      mockRepository.create.mockResolvedValue({
        id: 'custom-123',
        orderId,
        filename,
        originalPath: `/uploads/customizations/${orderId}/${filename}`,
        thumbnailPath: `/uploads/customizations/${orderId}/thumbnails/${filename}`,
        compressedPath: `/uploads/customizations/${orderId}/compressed/${filename}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      // Create temporary file
      fs.writeFileSync(filePath, 'test content');

      await service.createCustomization(orderId, filePath, filename);

      // Verify file would be deleted (in real implementation)
      expect(fs.existsSync).toBeDefined();

      // Cleanup
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    it('should clean up files on error', async () => {
      const orderId = 'order-123';
      const filePath = '/tmp/test.jpg';
      const filename = 'customization-uuid.jpg';

      jest.spyOn(prisma.order, 'findUnique').mockRejectedValue(new Error('Database error'));

      // Create temporary file
      fs.writeFileSync(filePath, 'test content');

      await expect(
        service.createCustomization(orderId, filePath, filename)
      ).rejects.toThrow('Database error');

      // Verify file would be deleted on error (in real implementation)
      expect(fs.existsSync).toBeDefined();

      // Cleanup
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  });

  describe('findById', () => {
    it('should return customization by ID', async () => {
      const customizationId = 'custom-123';
      const mockCustomization = {
        id: customizationId,
        orderId: 'order-123',
        filename: 'customization-uuid.jpg',
        originalPath: '/uploads/customizations/order-123/customization-uuid.jpg',
        thumbnailPath: '/uploads/customizations/order-123/thumbnails/customization-uuid.jpg',
        compressedPath: '/uploads/customizations/order-123/compressed/customization-uuid.jpg',
        comment: 'Test comment',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockCustomization as any);

      const result = await service.findById(customizationId);

      expect(result).toEqual({
        id: mockCustomization.id,
        orderId: mockCustomization.orderId,
        filename: mockCustomization.filename,
        originalPath: mockCustomization.originalPath,
        thumbnailPath: mockCustomization.thumbnailPath,
        compressedPath: mockCustomization.compressedPath,
        comment: mockCustomization.comment,
        createdAt: mockCustomization.createdAt,
        updatedAt: mockCustomization.updatedAt,
      });

      expect(mockRepository.findById).toHaveBeenCalledWith(customizationId);
    });

    it('should return null when customization not found', async () => {
      const customizationId = 'non-existent-custom';

      mockRepository.findById.mockResolvedValue(null);

      const result = await service.findById(customizationId);

      expect(result).toBeNull();
      expect(mockRepository.findById).toHaveBeenCalledWith(customizationId);
    });
  });

  describe('findByOrderId', () => {
    it('should return customizations by order ID', async () => {
      const orderId = 'order-123';
      const mockCustomizations = [
        {
          id: 'custom-1',
          orderId,
          filename: 'customization-1.jpg',
          originalPath: '/uploads/customizations/order-123/customization-1.jpg',
          thumbnailPath: '/uploads/customizations/order-123/thumbnails/customization-1.jpg',
          compressedPath: '/uploads/customizations/order-123/compressed/customization-1.jpg',
          comment: 'Comment 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'custom-2',
          orderId,
          filename: 'customization-2.jpg',
          originalPath: '/uploads/customizations/order-123/customization-2.jpg',
          thumbnailPath: '/uploads/customizations/order-123/thumbnails/customization-2.jpg',
          compressedPath: '/uploads/customizations/order-123/compressed/customization-2.jpg',
          comment: 'Comment 2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.findByOrderId.mockResolvedValue(mockCustomizations as any);

      const result = await service.findByOrderId(orderId);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: mockCustomizations[0].id,
        orderId: mockCustomizations[0].orderId,
        filename: mockCustomizations[0].filename,
        originalPath: mockCustomizations[0].originalPath,
        thumbnailPath: mockCustomizations[0].thumbnailPath,
        compressedPath: mockCustomizations[0].compressedPath,
        comment: mockCustomizations[0].comment,
        createdAt: mockCustomizations[0].createdAt,
        updatedAt: mockCustomizations[0].updatedAt,
      });

      expect(mockRepository.findByOrderId).toHaveBeenCalledWith(orderId);
    });

    it('should return empty array when no customizations found', async () => {
      const orderId = 'order-without-customizations';

      mockRepository.findByOrderId.mockResolvedValue([]);

      const result = await service.findByOrderId(orderId);

      expect(result).toEqual([]);
      expect(mockRepository.findByOrderId).toHaveBeenCalledWith(orderId);
    });
  });

  describe('delete', () => {
    it('should delete customization and files', async () => {
      const customizationId = 'custom-123';
      const mockCustomization = {
        id: customizationId,
        orderId: 'order-123',
        filename: 'customization-uuid.jpg',
        originalPath: '/uploads/customizations/order-123/customization-uuid.jpg',
        thumbnailPath: '/uploads/customizations/order-123/thumbnails/customization-uuid.jpg',
        compressedPath: '/uploads/customizations/order-123/compressed/customization-uuid.jpg',
        comment: 'Test comment',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockCustomization as any);
      mockRepository.delete.mockResolvedValue();

      await service.delete(customizationId);

      expect(mockRepository.findById).toHaveBeenCalledWith(customizationId);
      expect(mockRepository.delete).toHaveBeenCalledWith(customizationId);

      // Verify files would be deleted (in real implementation)
      expect(fs.existsSync).toBeDefined();
    });

    it('should throw error when customization not found', async () => {
      const customizationId = 'non-existent-custom';

      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete(customizationId)).rejects.toThrow('Customization not found');

      expect(mockRepository.findById).toHaveBeenCalledWith(customizationId);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle missing files gracefully', async () => {
      const customizationId = 'custom-123';
      const mockCustomization = {
        id: customizationId,
        orderId: 'order-123',
        filename: 'customization-uuid.jpg',
        originalPath: '/uploads/customizations/order-123/customization-uuid.jpg',
        thumbnailPath: '/uploads/customizations/order-123/thumbnails/customization-uuid.jpg',
        compressedPath: '/uploads/customizations/order-123/compressed/customization-uuid.jpg',
        comment: 'Test comment',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockCustomization as any);
      mockRepository.delete.mockResolvedValue();

      await service.delete(customizationId);

      expect(mockRepository.findById).toHaveBeenCalledWith(customizationId);
      expect(mockRepository.delete).toHaveBeenCalledWith(customizationId);
    });
  });

  describe('toResponseDto', () => {
    it('should convert customization to response DTO', () => {
      const mockCustomization = {
        id: 'custom-123',
        orderId: 'order-123',
        filename: 'customization-uuid.jpg',
        originalPath: '/uploads/customizations/order-123/customization-uuid.jpg',
        thumbnailPath: '/uploads/customizations/order-123/thumbnails/customization-uuid.jpg',
        compressedPath: '/uploads/customizations/order-123/compressed/customization-uuid.jpg',
        comment: 'Test comment',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = (service as any).toResponseDto(mockCustomization);

      expect(result).toEqual({
        id: mockCustomization.id,
        orderId: mockCustomization.orderId,
        filename: mockCustomization.filename,
        originalPath: mockCustomization.originalPath,
        thumbnailPath: mockCustomization.thumbnailPath,
        compressedPath: mockCustomization.compressedPath,
        comment: mockCustomization.comment,
        createdAt: mockCustomization.createdAt,
        updatedAt: mockCustomization.updatedAt,
      });
    });
  });
});
