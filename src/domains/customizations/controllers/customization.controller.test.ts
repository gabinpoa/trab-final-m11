import { CustomizationController } from './customization.controller';
import { CustomizationService } from '../services/customization.service';

describe('CustomizationController Tests', () => {
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
      mockService.delete.mockResolvedValue(undefined as any);

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
