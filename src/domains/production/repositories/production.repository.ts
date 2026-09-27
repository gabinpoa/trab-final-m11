import prisma from '../../../shared/config/database';
import { ProductionQueue, ProductionStage } from '@prisma/client';

export class ProductionRepository {
  async create(data: {
    orderId: string;
    stage?: ProductionStage;
  }): Promise<ProductionQueue> {
    return prisma.productionQueue.create({
      data: {
        orderId: data.orderId,
        stage: data.stage || ProductionStage.pending,
      },
    });
  }

  async findById(id: string): Promise<ProductionQueue | null> {
    return prisma.productionQueue.findUnique({
      where: { id },
      include: {
        order: true,
      },
    });
  }

  async findAll(): Promise<ProductionQueue[]> {
    return prisma.productionQueue.findMany({
      include: {
        order: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findByStage(stage: ProductionStage): Promise<ProductionQueue[]> {
    return prisma.productionQueue.findMany({
      where: { stage },
      include: {
        order: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findByOrderId(orderId: string): Promise<ProductionQueue[]> {
    return prisma.productionQueue.findMany({
      where: { orderId },
      include: {
        order: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateStage(id: string, stage: ProductionStage): Promise<ProductionQueue> {
    const now = new Date();
    
    // Se for a primeira etapa (pending -> printing), setar startedAt
    const current = await this.findById(id);
    if (!current) {
      throw new Error('Production queue item not found');
    }

    const updateData: any = {
      stage,
    };

    // Setar startedAt se estiver iniciando a produção
    if (current.stage === ProductionStage.pending && stage === ProductionStage.printing) {
      updateData.startedAt = now;
    }

    // Setar completedAt se estiver finalizando (packaging -> shipped)
    if (current.stage === ProductionStage.packaging && stage === ProductionStage.shipped) {
      updateData.completedAt = now;
    }

    return prisma.productionQueue.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<ProductionQueue> {
    return prisma.productionQueue.delete({
      where: { id },
    });
  }
}
