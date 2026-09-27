import { MaterialService } from './material.service';

// Mock dependencies
jest.mock('../repositories/material.repository');
jest.mock('../../../shared/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

describe('MaterialService', () => {
  let materialService: MaterialService;

  beforeEach(() => {
    materialService = new MaterialService();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all materials', async () => {
      const mockMaterials = [
        { id: '1', name: 'Material 1', quantity: 100, minLevel: 20, version: 0 },
        { id: '2', name: 'Material 2', quantity: 50, minLevel: 20, version: 0 },
      ];

      const materialRepository = require('../repositories/material.repository').default;
      materialRepository.findAll = jest.fn().mockResolvedValue(mockMaterials);

      const result = await materialService.getAll();

      expect(result).toEqual(mockMaterials);
      expect(materialRepository.findAll).toHaveBeenCalled();
    });

    it('should throw error if repository fails', async () => {
      const materialRepository = require('../repositories/material.repository').default;
      materialRepository.findAll = jest.fn().mockRejectedValue(new Error('Database error'));

      await expect(materialService.getAll()).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('should return material by id', async () => {
      const mockMaterial = { id: '1', name: 'Material 1', quantity: 100, minLevel: 20, version: 0 };

      const materialRepository = require('../repositories/material.repository').default;
      materialRepository.findById = jest.fn().mockResolvedValue(mockMaterial);

      const result = await materialService.getById('1');

      expect(result).toEqual(mockMaterial);
      expect(materialRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw error if material not found', async () => {
      const materialRepository = require('../repositories/material.repository').default;
      materialRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(materialService.getById('1')).rejects.toThrow('Material not found');
    });
  });

  describe('create', () => {
    it('should create new material', async () => {
      const mockMaterial = { id: '1', name: 'Material 1', quantity: 100, minLevel: 20, version: 0 };

      const materialRepository = require('../repositories/material.repository').default;
      materialRepository.create = jest.fn().mockResolvedValue(mockMaterial);

      const result = await materialService.create({
        name: 'Material 1',
        quantity: 100,
      });

      expect(result).toEqual(mockMaterial);
      expect(materialRepository.create).toHaveBeenCalledWith({
        name: 'Material 1',
        quantity: 100,
        minLevel: 20,
        version: 0,
      });
    });

    it('should create material with custom minLevel', async () => {
      const mockMaterial = { id: '1', name: 'Material 1', quantity: 100, minLevel: 30, version: 0 };

      const materialRepository = require('../repositories/material.repository').default;
      materialRepository.create = jest.fn().mockResolvedValue(mockMaterial);

      const result = await materialService.create({
        name: 'Material 1',
        quantity: 100,
        minLevel: 30,
      });

      expect(result).toEqual(mockMaterial);
      expect(materialRepository.create).toHaveBeenCalledWith({
        name: 'Material 1',
        quantity: 100,
        minLevel: 30,
        version: 0,
      });
    });
  });

  describe('update', () => {
    it('should update material', async () => {
      const mockMaterial = { id: '1', name: 'Material 1', quantity: 100, minLevel: 20, version: 0 };
      const mockUpdatedMaterial = { id: '1', name: 'Updated Material', quantity: 150, minLevel: 25, version: 1 };

      const materialRepository = require('../repositories/material.repository').default;
      materialRepository.findById = jest.fn().mockResolvedValue(mockMaterial);
      materialRepository.update = jest.fn().mockResolvedValue(mockUpdatedMaterial);

      const result = await materialService.update('1', {
        name: 'Updated Material',
        quantity: 150,
        minLevel: 25,
      });

      expect(result).toEqual(mockUpdatedMaterial);
      expect(materialRepository.update).toHaveBeenCalledWith('1', {
        name: 'Updated Material',
        quantity: 150,
        minLevel: 25,
      });
    });

    it('should throw error if material not found', async () => {
      const materialRepository = require('../repositories/material.repository').default;
      materialRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(materialService.update('1', { name: 'Updated' })).rejects.toThrow('Material not found');
    });

    it('should update only provided fields', async () => {
      const mockMaterial = { id: '1', name: 'Material 1', quantity: 100, minLevel: 20, version: 0 };
      const mockUpdatedMaterial = { id: '1', name: 'Updated Material', quantity: 100, minLevel: 20, version: 1 };

      const materialRepository = require('../repositories/material.repository').default;
      materialRepository.findById = jest.fn().mockResolvedValue(mockMaterial);
      materialRepository.update = jest.fn().mockResolvedValue(mockUpdatedMaterial);

      const result = await materialService.update('1', {
        name: 'Updated Material',
      });

      expect(result).toEqual(mockUpdatedMaterial);
      expect(materialRepository.update).toHaveBeenCalledWith('1', {
        name: 'Updated Material',
      });
    });
  });

  describe('delete', () => {
    it('should delete material', async () => {
      const mockMaterial = { id: '1', name: 'Material 1', quantity: 100, minLevel: 20, version: 0 };

      const materialRepository = require('../repositories/material.repository').default;
      materialRepository.findById = jest.fn().mockResolvedValue(mockMaterial);
      materialRepository.delete = jest.fn().mockResolvedValue(undefined);

      const result = await materialService.delete('1');

      expect(result).toEqual({ message: 'Material deleted successfully' });
      expect(materialRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw error if material not found', async () => {
      const materialRepository = require('../repositories/material.repository').default;
      materialRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(materialService.delete('1')).rejects.toThrow('Material not found');
    });
  });

  describe('reserve', () => {
    it('should reserve material', async () => {
      const mockReservation = {
        id: '1',
        materialId: '1',
        orderId: '1',
        quantity: 10,
      };

      const materialRepository = require('../repositories/material.repository').default;
      materialRepository.reserveWithLock = jest.fn().mockResolvedValue(mockReservation);

      const result = await materialService.reserve('1', '1', 10);

      expect(result).toEqual(mockReservation);
      expect(materialRepository.reserveWithLock).toHaveBeenCalledWith('1', '1', 10);
    });

    it('should throw error if reservation fails', async () => {
      const materialRepository = require('../repositories/material.repository').default;
      materialRepository.reserveWithLock = jest.fn().mockRejectedValue(new Error('Insufficient stock'));

      await expect(materialService.reserve('1', '1', 1000)).rejects.toThrow('Insufficient stock');
    });
  });

  describe('getAvailableMaterials', () => {
    it('should return available materials', async () => {
      const mockMaterials = [
        { id: '1', name: 'Material 1', quantity: 100, minLevel: 20, version: 0 },
      ];

      const materialRepository = require('../repositories/material.repository').default;
      materialRepository.findByAvailability = jest.fn().mockResolvedValue(mockMaterials);

      const result = await materialService.getAvailableMaterials();

      expect(result).toEqual(mockMaterials);
      expect(materialRepository.findByAvailability).toHaveBeenCalled();
    });
  });

  describe('checkLowStock', () => {
    it('should return materials with low stock', async () => {
      const mockMaterials = [
        { id: '1', name: 'Material 1', quantity: 15, minLevel: 20, version: 0 },
        { id: '2', name: 'Material 2', quantity: 10, minLevel: 20, version: 0 },
        { id: '3', name: 'Material 3', quantity: 100, minLevel: 20, version: 0 },
      ];

      const materialRepository = require('../repositories/material.repository').default;
      materialRepository.findAll = jest.fn().mockResolvedValue(mockMaterials);

      const result = await materialService.checkLowStock();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Material 1');
      expect(result[1].name).toBe('Material 2');
    });

    it('should return empty array if no low stock', async () => {
      const mockMaterials = [
        { id: '1', name: 'Material 1', quantity: 100, minLevel: 20, version: 0 },
        { id: '2', name: 'Material 2', quantity: 50, minLevel: 20, version: 0 },
      ];

      const materialRepository = require('../repositories/material.repository').default;
      materialRepository.findAll = jest.fn().mockResolvedValue(mockMaterials);

      const result = await materialService.checkLowStock();

      expect(result).toHaveLength(0);
    });
  });
});
