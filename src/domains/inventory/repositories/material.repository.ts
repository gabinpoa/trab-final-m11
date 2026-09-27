import prisma from '../../../shared/config/database';
import { Material, MaterialReservation, Prisma } from '@prisma/client';

export interface IMaterialRepository {
  findById(id: string): Promise<Material | null>;
  findAll(): Promise<Material[]>;
  create(data: Prisma.MaterialCreateInput): Promise<Material>;
  update(id: string, data: Prisma.MaterialUpdateInput): Promise<Material>;
  updateWithLock(id: string, data: Prisma.MaterialUpdateInput & { version: number }): Promise<Material>;
  delete(id: string): Promise<Material>;
  reserveWithLock(materialId: string, orderId: string, quantity: number): Promise<MaterialReservation>;
  findByAvailability(): Promise<Material[]>;
}

export class MaterialRepository implements IMaterialRepository {
  async findById(id: string): Promise<Material | null> {
    return prisma.material.findUnique({
      where: { id },
      include: {
        reservations: true,
      },
    });
  }

  async findAll(): Promise<Material[]> {
    return prisma.material.findMany({
      include: {
        reservations: true,
      },
    });
  }

  async create(data: Prisma.MaterialCreateInput): Promise<Material> {
    return prisma.material.create({
      data,
    });
  }

  async update(id: string, data: Prisma.MaterialUpdateInput): Promise<Material> {
    return prisma.material.update({
      where: { id },
      data,
    });
  }

  async updateWithLock(id: string, data: Prisma.MaterialUpdateInput & { version: number }): Promise<Material> {
    const { version, ...updateData } = data;

    const updatedMaterial = await prisma.material.update({
      where: {
        id,
        version: version, // Optimistic lock
      },
      data: {
        ...updateData,
        version: {
          increment: 1,
        },
      },
    });

    if (!updatedMaterial) {
      throw new Error('Material was modified by another transaction');
    }

    return updatedMaterial;
  }

  async delete(id: string): Promise<Material> {
    return prisma.material.delete({
      where: { id },
    });
  }

  async reserveWithLock(
    materialId: string,
    orderId: string,
    quantity: number
  ): Promise<MaterialReservation> {
    return prisma.$transaction(async (tx) => {
      // Get material with current version for optimistic locking
      const material = await tx.material.findUnique({
        where: { id: materialId },
      });

      if (!material) {
        throw new Error('Material not found');
      }

      if (material.quantity < quantity) {
        throw new Error('Insufficient material quantity');
      }

      // Update material quantity and increment version
      const updatedMaterial = await tx.material.update({
        where: {
          id: materialId,
          version: material.version, // Optimistic lock
        },
        data: {
          quantity: {
            decrement: quantity,
          },
          version: {
            increment: 1,
          },
        },
      });

      if (!updatedMaterial) {
        throw new Error('Material was modified by another transaction');
      }

      // Create reservation
      const reservation = await tx.materialReservation.create({
        data: {
          materialId,
          orderId,
          quantity,
        },
      });

      return reservation;
    });
  }

  async findByAvailability(): Promise<Material[]> {
    return prisma.material.findMany({
      where: {
        quantity: {
          gt: 0,
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}

export default new MaterialRepository();
