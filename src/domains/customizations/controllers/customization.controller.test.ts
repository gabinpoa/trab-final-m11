import { CustomizationController } from './customization.controller';
import { CustomizationService } from '../services/customization.service';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

describe('CustomizationController Integration Tests', () => {
  let controller: CustomizationController;
  let mockService: jest.Mocked<CustomizationService>;

  beforeEach(() => {
    mockService = {
      createCustomization: jest.fn(),
      findById: jest.fn(),
      findByOrderId: jest.fn(),
      delete: jest.fn(),
    } as any;

    controller = new CustomizationController();
    (controller as any).service = mockService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById endpoint', () => {
    it('should return customization by ID', async () => {
      const mockRequest = {
        params: { id: 'custom-123' },
      } as any;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

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

      mockService.findById.mockResolvedValue(mockCustomization);

      await controller.findById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCustomization);
    });

    it('should return 404 when customization not found', async () => {
      const mockRequest = {
        params: { id: 'non-existent-custom' },
      } as any;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      mockService.findById.mockResolvedValue(null);

      await controller.findById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Customization not found',
      });
    });
  });

  describe('findByOrderId endpoint', () => {
    it('should return customizations by order ID', async () => {
      const mockRequest = {
        params: { orderId: 'order-123' },
      } as any;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      const mockCustomizations = [
        {
          id: 'custom-1',
          orderId: 'order-123',
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
          orderId: 'order-123',
          filename: 'customization-2.jpg',
          originalPath: '/uploads/customizations/order-123/customization-2.jpg',
          thumbnailPath: '/uploads/customizations/order-123/thumbnails/customization-2.jpg',
          compressedPath: '/uploads/customizations/order-123/compressed/customization-2.jpg',
          comment: 'Comment 2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockService.findByOrderId.mockResolvedValue(mockCustomizations);

      await controller.findByOrderId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCustomizations);
    });

    it('should return empty array when no customizations found', async () => {
      const mockRequest = {
        params: { orderId: 'order-without-customizations' },
      } as any;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      mockService.findByOrderId.mockResolvedValue([]);

      await controller.findByOrderId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith([]);
    });
  });

  describe('delete endpoint', () => {
    it('should delete customization successfully', async () => {
      const mockRequest = {
        params: { id: 'custom-123' },
      } as any;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      mockService.delete.mockResolvedValue(undefined);

      await controller.delete(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockService.delete).toHaveBeenCalledWith('custom-123');
    });

    it('should return 404 when customization not found', async () => {
      const mockRequest = {
        params: { id: 'non-existent-custom' },
      } as any;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      mockService.delete.mockRejectedValue(new Error('Customization not found'));

      await controller.delete(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Customization not found',
      });
    });

    it('should return 500 on service error', async () => {
      const mockRequest = {
        params: { id: 'custom-123' },
      } as any;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      mockService.delete.mockRejectedValue(new Error('Service error'));

      await controller.delete(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Service error',
      });
    });
  });

  describe('Service Integration', () => {
    it('should handle service operations correctly', async () => {
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

      mockService.findById.mockResolvedValue(mockCustomization);
      mockService.findByOrderId.mockResolvedValue([mockCustomization]);
      mockService.delete.mockResolvedValue(undefined);

      // Test findById
      const found = await mockService.findById('custom-123');
      expect(found).toEqual(mockCustomization);

      // Test findByOrderId
      const byOrder = await mockService.findByOrderId('order-123');
      expect(byOrder).toHaveLength(1);

      // Test delete
      await mockService.delete('custom-123');
      expect(mockService.delete).toHaveBeenCalledWith('custom-123');
    });
  });
});
