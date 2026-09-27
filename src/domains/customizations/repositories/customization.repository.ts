import prisma from '../../../shared/config/database';
import { Customization } from '@prisma/client';

export class CustomizationRepository {
  async create(data: {
    orderId: string;
    filename: string;
    originalPath: string;
    thumbnailPath: string;
    compressedPath: string;
    comment?: string;
  }): Promise<Customization> {
    return prisma.customization.create({
      data,
    });
  }

  async findById(id: string): Promise<Customization | null> {
    return prisma.customization.findUnique({
      where: { id },
      include: {
        order: true,
      },
    });
  }

  async findByOrderId(orderId: string): Promise<Customization[]> {
    return prisma.customization.findMany({
      where: { orderId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async delete(id: string): Promise<Customization> {
    return prisma.customization.delete({
      where: { id },
    });
  }

  async update(id: string, data: Partial<Customization>): Promise<Customization> {
    return prisma.customization.update({
      where: { id },
      data,
    });
  }
}
