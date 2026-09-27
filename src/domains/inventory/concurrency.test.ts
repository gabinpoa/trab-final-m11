import { MaterialService } from './services/material.service';

// Mock dependencies
jest.mock('./repositories/material.repository');
jest.mock('../../shared/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

describe('Material Service Concurrency Tests', () => {
  let materialService: MaterialService;

  beforeEach(() => {
    materialService = new MaterialService();
    jest.clearAllMocks();
  });

  describe('Concurrent Reservations', () => {
    it('should handle concurrent reservations with optimistic locking', async () => {
      const materialRepository = require('../repositories/material.repository').default;

      // Mock initial material state
      const initialMaterial = {
        id: '1',
        name: 'Test Material',
        quantity: 100,
        minLevel: 20,
        version: 0,
      };

      materialRepository.findById = jest.fn().mockResolvedValue(initialMaterial);

      // Mock successful reservation
      materialRepository.reserveWithLock = jest.fn().mockImplementation(async (materialId, orderId, quantity) => {
        // Simulate optimistic locking check
        const currentMaterial = await materialRepository.findById(materialId);
        if (currentMaterial.quantity < quantity) {
          throw new Error('Insufficient material quantity');
        }

        // Simulate version check
        if (currentMaterial.version !== 0) {
          throw new Error('Material was modified by another transaction');
        }

        // Return successful reservation
        return {
          id: 'res-1',
          materialId,
          orderId,
          quantity,
        };
      });

      // Create multiple concurrent reservation requests
      const reservationPromises = [
        materialService.reserve('1', 'order-1', 10),
        materialService.reserve('1', 'order-2', 15),
        materialService.reserve('1', 'order-3', 20),
      ];

      const results = await Promise.allSettled(reservationPromises);

      // All should succeed since there's enough quantity
      const successfulReservations = results.filter((r) => r.status === 'fulfilled');
      expect(successfulReservations).toHaveLength(3);
    });

    it('should fail concurrent reservations when quantity is insufficient', async () => {
      const materialRepository = require('../repositories/material.repository').default;

      // Mock initial material state with low quantity
      const initialMaterial = {
        id: '1',
        name: 'Test Material',
        quantity: 20,
        minLevel: 20,
        version: 0,
      };

      materialRepository.findById = jest.fn().mockResolvedValue(initialMaterial);

      // Mock reservation that checks quantity
      materialRepository.reserveWithLock = jest.fn().mockImplementation(async (materialId, orderId, quantity) => {
        const currentMaterial = await materialRepository.findById(materialId);

        if (currentMaterial.quantity < quantity) {
          throw new Error('Insufficient material quantity');
        }

        return {
          id: 'res-1',
          materialId,
          orderId,
          quantity,
        };
      });

      // Create concurrent reservations that exceed available quantity
      const reservationPromises = [
        materialService.reserve('1', 'order-1', 15),
        materialService.reserve('1', 'order-2', 10),
        materialService.reserve('1', 'order-3', 5),
      ];

      const results = await Promise.allSettled(reservationPromises);

      // At least one should fail due to insufficient quantity
      const failedReservations = results.filter((r) => r.status === 'rejected');
      expect(failedReservations.length).toBeGreaterThan(0);
    });

    it('should handle version conflicts in concurrent updates', async () => {
      const materialRepository = require('../repositories/material.repository').default;

      // Mock material that gets updated between reads
      let versionCounter = 0;

      materialRepository.findById = jest.fn().mockImplementation(async () => {
        return {
          id: '1',
          name: 'Test Material',
          quantity: 100,
          minLevel: 20,
          version: versionCounter++,
        };
      });

      materialRepository.update = jest.fn().mockImplementation(async (_id, _data) => {
        // Simulate version conflict
        throw new Error('Material was modified by another transaction');
      });

      // Create concurrent update requests
      const updatePromises = [
        materialService.update('1', { quantity: 90 }),
        materialService.update('1', { quantity: 80 }),
      ];

      const results = await Promise.allSettled(updatePromises);

      // At least one should fail due to version conflict
      const failedUpdates = results.filter((r) => r.status === 'rejected');
      expect(failedUpdates.length).toBeGreaterThan(0);
    });

    it('should handle 10 concurrent reservation requests', async () => {
      const materialRepository = require('../repositories/material.repository').default;

      const initialMaterial = {
        id: '1',
        name: 'Test Material',
        quantity: 100,
        minLevel: 20,
        version: 0,
      };

      materialRepository.findById = jest.fn().mockResolvedValue(initialMaterial);

      let reservationCount = 0;
      materialRepository.reserveWithLock = jest.fn().mockImplementation(async (materialId, orderId, quantity) => {
        const currentMaterial = await materialRepository.findById(materialId);

        if (currentMaterial.quantity < quantity) {
          throw new Error('Insufficient material quantity');
        }

        reservationCount++;
        return {
          id: `res-${reservationCount}`,
          materialId,
          orderId,
          quantity,
        };
      });

      // Create 10 concurrent reservation requests
      const reservationPromises = Array.from({ length: 10 }, (_, i) =>
        materialService.reserve('1', `order-${i}`, 5)
      );

      const results = await Promise.allSettled(reservationPromises);

      // All should succeed since each reserves only 5 and total is 100
      const successfulReservations = results.filter((r) => r.status === 'fulfilled');
      expect(successfulReservations).toHaveLength(10);
    });
  });

  describe('Race Conditions', () => {
    it('should prevent overselling with optimistic locking', async () => {
      const materialRepository = require('../repositories/material.repository').default;

      let currentQuantity = 50;
      let currentVersion = 0;

      materialRepository.findById = jest.fn().mockImplementation(async () => {
        return {
          id: '1',
          name: 'Test Material',
          quantity: currentQuantity,
          minLevel: 20,
          version: currentVersion,
        };
      });

      materialRepository.reserveWithLock = jest.fn().mockImplementation(async (materialId, orderId, quantity) => {
        const currentMaterial = await materialRepository.findById(materialId);

        if (currentMaterial.quantity < quantity) {
          throw new Error('Insufficient material quantity');
        }

        if (currentMaterial.version !== currentVersion) {
          throw new Error('Material was modified by another transaction');
        }

        // Simulate successful reservation
        currentQuantity -= quantity;
        currentVersion++;

        return {
          id: `res-${orderId}`,
          materialId,
          orderId,
          quantity,
        };
      });

      // Create concurrent reservations that would exceed quantity if not for locking
      const reservationPromises = [
        materialService.reserve('1', 'order-1', 30),
        materialService.reserve('1', 'order-2', 30),
      ];

      const results = await Promise.allSettled(reservationPromises);

      // Only one should succeed due to optimistic locking
      const successfulReservations = results.filter((r) => r.status === 'fulfilled');
      const failedReservations = results.filter((r) => r.status === 'rejected');

      expect(successfulReservations.length).toBeLessThanOrEqual(1);
      expect(failedReservations.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle rapid sequential updates', async () => {
      const materialRepository = require('../repositories/material.repository').default;

      const initialMaterial = {
        id: '1',
        name: 'Test Material',
        quantity: 100,
        minLevel: 20,
        version: 0,
      };

      materialRepository.findById = jest.fn().mockResolvedValue(initialMaterial);
      materialRepository.update = jest.fn().mockResolvedValue({
        ...initialMaterial,
        quantity: 90,
        version: 1,
      });

      // Create rapid sequential updates
      const updatePromises = Array.from({ length: 5 }, (_, i) =>
        materialService.update('1', { quantity: 100 - (i + 1) * 10 })
      );

      const results = await Promise.all(updatePromises);

      // All should complete (though some might fail in real scenario)
      expect(results).toHaveLength(5);
    });
  });

  describe('Transaction Isolation', () => {
    it('should maintain data consistency under concurrent load', async () => {
      const materialRepository = require('../repositories/material.repository').default;

      let materialState = {
        id: '1',
        name: 'Test Material',
        quantity: 100,
        minLevel: 20,
        version: 0,
      };

      materialRepository.findById = jest.fn().mockImplementation(async () => {
        return { ...materialState };
      });

      materialRepository.reserveWithLock = jest.fn().mockImplementation(async (materialId, orderId, quantity) => {
        const currentMaterial = await materialRepository.findById(materialId);

        if (currentMaterial.quantity < quantity) {
          throw new Error('Insufficient material quantity');
        }

        // Simulate transaction
        materialState = {
          ...materialState,
          quantity: currentMaterial.quantity - quantity,
          version: currentMaterial.version + 1,
        };

        return {
          id: `res-${orderId}`,
          materialId,
          orderId,
          quantity,
        };
      });

      // Create concurrent reservations
      const reservationPromises = Array.from({ length: 5 }, (_, i) =>
        materialService.reserve('1', `order-${i}`, 15)
      );

      const results = await Promise.allSettled(reservationPromises);

      // Verify final state is consistent
      const successfulReservations = results.filter((r) => r.status === 'fulfilled');
      const totalReserved = successfulReservations.reduce((sum, r) => {
        if (r.status === 'fulfilled') {
          return sum + r.value.quantity;
        }
        return sum;
      }, 0);

      expect(materialState.quantity).toBe(100 - totalReserved);
      expect(materialState.quantity).toBeGreaterThanOrEqual(0);
    });
  });
});
