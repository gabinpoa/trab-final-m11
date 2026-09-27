import materialRepository from '../repositories/material.repository';
import logger from '../../../shared/utils/logger';

export interface CreateMaterialDto {
  name: string;
  quantity: number;
  minLevel?: number;
}

export interface UpdateMaterialDto {
  name?: string;
  quantity?: number;
  minLevel?: number;
}

export class MaterialService {
  async getAll() {
    try {
      return await materialRepository.findAll();
    } catch (error) {
      logger.error({ error }, 'Error getting all materials');
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const material = await materialRepository.findById(id);
      if (!material) {
        throw new Error('Material not found');
      }
      return material;
    } catch (error) {
      logger.error({ error }, 'Error getting material by id');
      throw error;
    }
  }

  async create(dto: CreateMaterialDto) {
    try {
      const material = await materialRepository.create({
        name: dto.name,
        quantity: dto.quantity,
        minLevel: dto.minLevel || 20,
        version: 0,
      });

      logger.info(`Material created: ${material.name}`);
      return material;
    } catch (error) {
      logger.error({ error }, 'Error creating material');
      throw error;
    }
  }

  async update(id: string, dto: UpdateMaterialDto) {
    try {
      const material = await materialRepository.findById(id);
      if (!material) {
        throw new Error('Material not found');
      }

      const updatedMaterial = await materialRepository.update(id, {
        ...(dto.name && { name: dto.name }),
        ...(dto.quantity !== undefined && { quantity: dto.quantity }),
        ...(dto.minLevel !== undefined && { minLevel: dto.minLevel }),
      });

      logger.info(`Material updated: ${updatedMaterial.name}`);
      return updatedMaterial;
    } catch (error) {
      logger.error({ error }, 'Error updating material');
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const material = await materialRepository.findById(id);
      if (!material) {
        throw new Error('Material not found');
      }

      await materialRepository.delete(id);
      logger.info(`Material deleted: ${material.name}`);
      return { message: 'Material deleted successfully' };
    } catch (error) {
      logger.error({ error }, 'Error deleting material');
      throw error;
    }
  }

  async reserve(materialId: string, orderId: string, quantity: number) {
    try {
      const reservation = await materialRepository.reserveWithLock(
        materialId,
        orderId,
        quantity
      );

      logger.info(`Material reserved: ${materialId} for order ${orderId}`);
      return reservation;
    } catch (error) {
      logger.error({ error }, 'Error reserving material');
      throw error;
    }
  }

  async reserveSimple(materialId: string, quantity: number) {
    try {
      const material = await materialRepository.findById(materialId);
      if (!material) {
        throw new Error('Material not found');
      }

      if (material.quantity < quantity) {
        throw new Error(`Insufficient material. Available: ${material.quantity}, Required: ${quantity}`);
      }

      const updatedMaterial = await materialRepository.updateWithLock(materialId, {
        quantity: material.quantity - quantity,
        version: material.version,
      });

      logger.info(`Material reserved: ${materialId}, quantity: ${quantity}, new version: ${updatedMaterial.version}`);
      return updatedMaterial;
    } catch (error) {
      logger.error({ error }, 'Error reserving material');
      throw error;
    }
  }

  async release(materialId: string, quantity: number) {
    try {
      const material = await materialRepository.findById(materialId);
      if (!material) {
        throw new Error('Material not found');
      }

      const updatedMaterial = await materialRepository.updateWithLock(materialId, {
        quantity: material.quantity + quantity,
        version: material.version,
      });

      logger.info(`Material released: ${materialId}, quantity: ${quantity}`);
      return updatedMaterial;
    } catch (error) {
      logger.error({ error }, 'Error releasing material');
      throw error;
    }
  }

  async getAvailableMaterials() {
    try {
      return await materialRepository.findByAvailability();
    } catch (error) {
      logger.error({ error }, 'Error getting available materials');
      throw error;
    }
  }

  async checkLowStock() {
    try {
      const materials = await materialRepository.findAll();
      const lowStockMaterials = materials.filter(
        (material) => material.quantity <= material.minLevel
      );

      if (lowStockMaterials.length > 0) {
        logger.warn(`Low stock alert for ${lowStockMaterials.length} materials`);
        lowStockMaterials.forEach((material) => {
          logger.warn(
            `Material ${material.name} has low stock: ${material.quantity} (min: ${material.minLevel})`
          );
        });
      }

      return lowStockMaterials;
    } catch (error) {
      logger.error({ error }, 'Error checking low stock');
      throw error;
    }
  }
}

export default new MaterialService();
