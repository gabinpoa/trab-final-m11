import materialService from './material.service';
import { DatabaseHelper } from '../../../test/database-helper';
import prisma from '../../../shared/config/database';

describe('MaterialService Integration Tests with Real Database', () => {
  beforeAll(async () => {
    await prisma.$connect();
    await DatabaseHelper.seedDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean only materials, not users/roles needed for orders
    await prisma.materialReservation.deleteMany();
    await prisma.material.deleteMany();
  });

  describe('CRUD Operations', () => {
    it('should create a new material', async () => {
      const material = await materialService.create({
        name: 'Test Material',
        quantity: 100,
        minLevel: 20,
      });

      expect(material).toHaveProperty('id');
      expect(material.name).toBe('Test Material');
      expect(material.quantity).toBe(100);
      expect(material.minLevel).toBe(20);
      expect(material.version).toBe(0);
    });

    it('should get all materials', async () => {
      // Create test materials
      await materialService.create({ name: 'Material 1', quantity: 50, minLevel: 10 });
      await materialService.create({ name: 'Material 2', quantity: 75, minLevel: 15 });

      const materials = await materialService.getAll();

      expect(Array.isArray(materials)).toBe(true);
      expect(materials.length).toBe(2);
    });

    it('should get material by id', async () => {
      const created = await materialService.create({
        name: 'Test Material',
        quantity: 100,
        minLevel: 20,
      });

      const found = await materialService.getById(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe('Test Material');
    });

    it('should throw error when material not found', async () => {
      await expect(materialService.getById('nonexistent-id')).rejects.toThrow('Material not found');
    });

    it('should update material', async () => {
      const created = await materialService.create({
        name: 'Original Name',
        quantity: 100,
        minLevel: 20,
      });

      const updated = await materialService.update(created.id, {
        name: 'Updated Name',
        quantity: 150,
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.quantity).toBe(150);
    });

    it('should delete material', async () => {
      const created = await materialService.create({
        name: 'To Delete',
        quantity: 100,
        minLevel: 20,
      });

      const result = await materialService.delete(created.id);

      expect(result).toHaveProperty('message', 'Material deleted successfully');

      // Verify it's actually deleted
      await expect(materialService.getById(created.id)).rejects.toThrow('Material not found');
    });
  });

  describe('Reservations', () => {
    it('should fail to reserve with insufficient quantity', async () => {
      const material = await materialService.create({
        name: 'Test Material',
        quantity: 10,
        minLevel: 5,
      });

      // Note: Reservations require a valid order ID
      // This test validates the quantity check logic
      await expect(
        materialService.reserve(material.id, 'test-order-id', 100)
      ).rejects.toThrow();
    });
  });

  describe('Low Stock Check', () => {
    it('should identify materials with low stock', async () => {
      await materialService.create({ name: 'Normal Stock', quantity: 100, minLevel: 20 });
      await materialService.create({ name: 'Low Stock', quantity: 15, minLevel: 20 });
      await materialService.create({ name: 'Critical Stock', quantity: 5, minLevel: 20 });

      const lowStockMaterials = await materialService.checkLowStock();

      expect(lowStockMaterials.length).toBe(2);
      expect(lowStockMaterials.map((m: any) => m.name)).toContain('Low Stock');
      expect(lowStockMaterials.map((m: any) => m.name)).toContain('Critical Stock');
    });

    it('should return empty array when no low stock', async () => {
      await materialService.create({ name: 'Normal Stock', quantity: 100, minLevel: 20 });
      await materialService.create({ name: 'Another Normal', quantity: 50, minLevel: 10 });

      const lowStockMaterials = await materialService.checkLowStock();

      expect(lowStockMaterials.length).toBe(0);
    });
  });

  describe('Available Materials', () => {
    it('should return available materials', async () => {
      await materialService.create({
        name: 'Test Material',
        quantity: 100,
        minLevel: 20,
      });

      const available = await materialService.getAvailableMaterials();

      expect(Array.isArray(available)).toBe(true);
      expect(available.length).toBeGreaterThan(0);
    });
  });
});
