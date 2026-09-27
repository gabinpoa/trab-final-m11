import { ProductionRepository } from '../repositories/production.repository';
import { ProductionStage, OrderStatus } from '@prisma/client';
import { ProductionQueueResponseDto, ProductionQueueWithOrderDto, UpdateStageDto } from '../dto/production.dto';
import prisma from '../../../shared/config/database';

// Definição de transições válidas de etapa
const VALID_TRANSITIONS: Record<ProductionStage, ProductionStage[]> = {
  [ProductionStage.pending]: [ProductionStage.printing],
  [ProductionStage.printing]: [ProductionStage.cutting],
  [ProductionStage.cutting]: [ProductionStage.assembly],
  [ProductionStage.assembly]: [ProductionStage.quality_check],
  [ProductionStage.quality_check]: [ProductionStage.packaging, ProductionStage.printing], // Pode voltar para printing se falhar
  [ProductionStage.packaging]: [ProductionStage.shipped],
  [ProductionStage.shipped]: [], // Estado final
};

// Tempo estimado por etapa (em horas)
const STAGE_DURATION: Record<ProductionStage, number> = {
  [ProductionStage.pending]: 0,
  [ProductionStage.printing]: 2,
  [ProductionStage.cutting]: 1,
  [ProductionStage.assembly]: 3,
  [ProductionStage.quality_check]: 1,
  [ProductionStage.packaging]: 1,
  [ProductionStage.shipped]: 0,
};

export class ProductionService {
  private repository: ProductionRepository;

  constructor() {
    this.repository = new ProductionRepository();
  }

  /**
   * Criar entrada na fila de produção
   */
  async createProductionQueue(orderId: string): Promise<ProductionQueueResponseDto> {
    try {
      // Verificar se o pedido existe
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Verificar se o pedido está aprovado
      if (order.status !== OrderStatus.approved) {
        throw new Error('Order must be approved before production');
      }

      // Verificar se já existe fila de produção para este pedido
      const existing = await this.repository.findByOrderId(orderId);
      if (existing.length > 0) {
        throw new Error('Production queue already exists for this order');
      }

      // Criar entrada na fila
      const productionQueue = await this.repository.create({
        orderId,
        stage: ProductionStage.pending,
      });

      // Atualizar status do pedido para in_production
      await prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.in_production },
      });

      return this.toResponseDto(productionQueue);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar fila de produção por ID
   */
  async findById(id: string): Promise<ProductionQueueWithOrderDto | null> {
    const productionQueue = await this.repository.findById(id);
    if (!productionQueue) {
      return null;
    }
    return this.toResponseWithOrderDto(productionQueue);
  }

  /**
   * Buscar toda a fila de produção
   */
  async findAll(): Promise<ProductionQueueWithOrderDto[]> {
    const productionQueues = await this.repository.findAll();
    return productionQueues.map(pq => this.toResponseWithOrderDto(pq));
  }

  /**
   * Buscar fila de produção por etapa
   */
  async findByStage(stage: ProductionStage): Promise<ProductionQueueWithOrderDto[]> {
    const productionQueues = await this.repository.findByStage(stage);
    return productionQueues.map(pq => this.toResponseWithOrderDto(pq));
  }

  /**
   * Atualizar etapa de produção
   */
  async updateStage(id: string, dto: UpdateStageDto): Promise<ProductionQueueResponseDto> {
    try {
      const current = await this.repository.findById(id);
      
      if (!current) {
        throw new Error('Production queue item not found');
      }

      // Validar transição de estado
      const validTransitions = VALID_TRANSITIONS[current.stage];
      if (!validTransitions.includes(dto.stage)) {
        throw new Error(`Invalid transition from ${current.stage} to ${dto.stage}`);
      }

      // Atualizar etapa
      const updated = await this.repository.updateStage(id, dto.stage);

      // Se a etapa for shipped, atualizar status do pedido
      if (dto.stage === ProductionStage.shipped) {
        await prisma.order.update({
          where: { id: current.orderId },
          data: { status: OrderStatus.shipped },
        });
      }

      return this.toResponseDto(updated);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calcular tempo estimado restante
   */
  async calculateEstimatedTime(id: string): Promise<number> {
    const current = await this.repository.findById(id);
    
    if (!current) {
      throw new Error('Production queue item not found');
    }

    // Calcular tempo total das etapas restantes
    let totalTime = 0;
    let currentStage = current.stage;

    while (currentStage !== ProductionStage.shipped) {
      const nextStages = VALID_TRANSITIONS[currentStage];
      if (nextStages.length === 0) break;
      
      const nextStage = nextStages[0];
      totalTime += STAGE_DURATION[nextStage];
      currentStage = nextStage;
    }

    return totalTime; // em horas
  }

  /**
   * Converter para DTO de resposta
   */
  private toResponseDto(productionQueue: any): ProductionQueueResponseDto {
    return {
      id: productionQueue.id,
      orderId: productionQueue.orderId,
      stage: productionQueue.stage,
      startedAt: productionQueue.startedAt,
      completedAt: productionQueue.completedAt,
      createdAt: productionQueue.createdAt,
      updatedAt: productionQueue.updatedAt,
    };
  }

  /**
   * Converter para DTO com pedido
   */
  private toResponseWithOrderDto(productionQueue: any): ProductionQueueWithOrderDto {
    return {
      ...this.toResponseDto(productionQueue),
      order: {
        id: productionQueue.order.id,
        status: productionQueue.order.status,
        total: productionQueue.order.total,
      },
    };
  }
}
