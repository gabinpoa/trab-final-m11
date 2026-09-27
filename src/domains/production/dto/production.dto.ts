import { ProductionStage } from '@prisma/client';

export interface CreateProductionQueueDto {
  orderId: string;
}

export interface UpdateStageDto {
  stage: ProductionStage;
}

export interface ProductionQueueResponseDto {
  id: string;
  orderId: string;
  stage: ProductionStage;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductionQueueWithOrderDto extends ProductionQueueResponseDto {
  order: {
    id: string;
    status: string;
    total: number;
  };
}
