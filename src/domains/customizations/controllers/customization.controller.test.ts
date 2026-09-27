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

  describe('upload endpoint', () => {
    it('should upload customization successfully', async () => {
      const mockRequest = {
        params: { orderId: 'order-123' },
        body: { comment: 'Test comment' },
        file: {
          path: '/tmp/test.jpg',
          filename: 'customization-uuid.jpg',
          size: 1024 * 1024, // 1MB
          mimetype: 'image/jpeg',
        } as Express.Multer.File,
        requestId: 'req-123',
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

      mockService.createCustomization.mockResolvedValue(mockCustomization);

      await controller.upload[mockService.createCustomization ? 7 : 6](
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        id: mockCustomization.id,
        orderId: mockCustomization.orderId,
        filename: mockCustomization.filename,
        originalUrl: `/uploads/customizations/${mockCustomization.orderId}/${mockCustomization.filename}`,
        thumbnailUrl: `/uploads/customizations/${mockCustomization.orderId}/thumbnails/${mockCustomization.filename}`,
        compressedUrl: `/uploads/customizations/${mockCustomization.orderId}/compressed/${mockCustomization.filename}`,
        comment: mockCustomization.comment,
        createdAt: mockCustomization.createdAt,
      });
    });

    it('should return 400 when no file uploaded', async () => {
      const mockRequest = {
        params: { orderId: 'order-123' },
        body: { comment: 'Test comment' },
        file: undefined,
        requestId: 'req-123',
      } as any;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      await controller.upload[mockService.createCustomization ? 7 : 6](
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'No file uploaded',
      });
    });

    it('should return 404 when order not found', async () => {
      const mockRequest = {
        params: { orderId: 'non-existent-order' },
        body: { comment: 'Test comment' },
        file: {
          path: '/tmp/test.jpg',
          filename: 'customization-uuid.jpg',
          size: 1024 * 1024,
          mimetype: 'image/jpeg',
        } as Express.Multer.File,
        requestId: 'req-123',
      } as any;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      mockService.createCustomization.mockRejectedValue(new Error('Order not found'));

      await controller.upload[mockService.createCustomization ? 7 : 6](
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Order not found',
      });
    });

    it('should return 500 on service error', async () => {
      const mockRequest = {
        params: { orderId: 'order-123' },
        body: { comment: 'Test comment' },
        file: {
          path: '/tmp/test.jpg',
          filename: 'customization-uuid.jpg',
          size: 1024 * 1024,
          mimetype: 'image/jpeg',
        } as Express.Multer.File,
        requestId: 'req-123',
      } as any;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      mockService.createCustomization.mockRejectedValue(new Error('Service error'));

      await controller.upload[mockService.createCustomization ? 7 : 6](
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Service error',
      });
    });
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

      mockService.delete.mockResolvedValue();

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

  describe('File Upload Integration', () => {
    it('should handle file upload with valid image', async () => {
      const testFilePath = path.join(__dirname, 'test-image.jpg');
      const testFileContent = Buffer.from('fake image data');

      // Create test file
      fs.writeFileSync(testFilePath, testFileContent);

      const mockRequest = {
        params: { orderId: 'order-123' },
        body: { comment: 'Test comment' },
        file: {
          path: testFilePath,
          filename: 'customization-uuid.jpg',
          size: testFileContent.length,
          mimetype: 'image/jpeg',
        } as Express.Multer.File,
        requestId: 'req-123',
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

      mockService.createCustomization.mockResolvedValue(mockCustomization);

      await controller.upload[mockService.createCustomization ? 7 : 6](
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);

      // Cleanup
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });

    it('should handle file upload with PDF', async () => {
      const testFilePath = path.join(__dirname, 'test-document.pdf');
      const testFileContent = Buffer.from('fake PDF data');

      // Create test file
      fs.writeFileSync(testFilePath, testFileContent);

      const mockRequest = {
        params: { orderId: 'order-123' },
        body: { comment: 'Test comment' },
        file: {
          path: testFilePath,
          filename: 'customization-uuid.pdf',
          size: testFileContent.length,
          mimetype: 'application/pdf',
        } as Express.Multer.File,
        requestId: 'req-123',
      } as any;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      const mockCustomization = {
        id: 'custom-123',
        orderId: 'order-123',
        filename: 'customization-uuid.pdf',
        originalPath: '/uploads/customizations/order-123/customization-uuid.pdf',
        thumbnailPath: '/uploads/customizations/order-123/thumbnails/customization-uuid.pdf',
        compressedPath: '/uploads/customizations/order-123/compressed/customization-uuid.pdf',
        comment: 'Test comment',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.createCustomization.mockResolvedValue(mockCustomization);

      await controller.upload[mockService.createCustomization ? 7 : 6](
        mockRequest,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);

      // Cleanup
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });
  });
});
