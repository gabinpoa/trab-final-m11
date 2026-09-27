import { Response } from 'express';
import { ProductionService } from '../services/production.service';
import { UpdateStageDto } from '../dto/production.dto';
import logger from '../../../shared/utils/logger';
import { AuthRequest } from '../../../shared/types/express';
import { roleMiddleware } from '../../../shared/middlewares/auth';

export class ProductionController {
  private service: ProductionService;

  constructor() {
    this.service = new ProductionService();
  }

  /**
   * Criar entrada na fila de produção
   */
  create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { orderId } = req.body;
      const orderIdStr = Array.isArray(orderId) ? orderId[0] : orderId;

      logger.info({
        requestId: (req as any).requestId,
        orderId: orderIdStr,
      }, 'Creating production queue');

      const productionQueue = await this.service.createProductionQueue(orderIdStr);

      logger.info({
        requestId: (req as any).requestId,
        productionQueueId: productionQueue.id,
      }, 'Production queue created successfully');

      res.status(201).json(productionQueue);
    } catch (error) {
      logger.error({
        requestId: (req as any).requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to create production queue');

      if (error instanceof Error) {
        if (error.message === 'Order not found') {
          res.status(404).json({
            message: 'Order not found',
          });
          return;
        }
        if (error.message === 'Order must be approved before production') {
          res.status(400).json({
            message: 'Order must be approved before production',
          });
          return;
        }
        if (error.message === 'Production queue already exists for this order') {
          res.status(409).json({
            message: 'Production queue already exists for this order',
          });
          return;
        }
      }

      res.status(500).json({
        message: 'Internal server error',
      });
    }
  };

  /**
   * Buscar fila de produção por ID
   */
  findById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;

      const productionQueue = await this.service.findById(idStr);

      if (!productionQueue) {
        res.status(404).json({
          message: 'Production queue item not found',
        });
        return;
      }

      res.json(productionQueue);
    } catch (error) {
      logger.error({
        requestId: (req as any).requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to fetch production queue');

      res.status(500).json({
        message: 'Internal server error',
      });
    }
  };

  /**
   * Buscar toda a fila de produção
   */
  findAll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const productionQueues = await this.service.findAll();

      res.json(productionQueues);
    } catch (error) {
      logger.error({
        requestId: (req as any).requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to fetch production queue');

      res.status(500).json({
        message: 'Internal server error',
      });
    }
  };

  /**
   * Buscar fila de produção por etapa
   */
  findByStage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { stage } = req.params;
      const stageStr = Array.isArray(stage) ? stage[0] : stage;

      const productionQueues = await this.service.findByStage(stageStr as any);

      res.json(productionQueues);
    } catch (error) {
      logger.error({
        requestId: (req as any).requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to fetch production queue by stage');

      res.status(500).json({
        message: 'Internal server error',
      });
    }
  };

  /**
   * Atualizar etapa de produção
   */
  updateStage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;
      const { stage } = req.body;

      const dto: UpdateStageDto = {
        stage,
      };

      logger.info({
        requestId: (req as any).requestId,
        productionQueueId: idStr,
        newStage: stage,
      }, 'Updating production stage');

      const updated = await this.service.updateStage(idStr, dto);

      logger.info({
        requestId: (req as any).requestId,
        productionQueueId: idStr,
      }, 'Production stage updated successfully');

      res.json(updated);
    } catch (error) {
      logger.error({
        requestId: (req as any).requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to update production stage');

      if (error instanceof Error) {
        if (error.message === 'Production queue item not found') {
          res.status(404).json({
            message: 'Production queue item not found',
          });
          return;
        }
        if (error.message.startsWith('Invalid transition')) {
          res.status(400).json({
            message: error.message,
          });
          return;
        }
      }

      res.status(500).json({
        message: 'Internal server error',
      });
    }
  };

  /**
   * Calcular tempo estimado restante
   */
  calculateEstimatedTime = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;

      const estimatedTime = await this.service.calculateEstimatedTime(idStr);

      res.json({
        id: idStr,
        estimatedTimeHours: estimatedTime,
      });
    } catch (error) {
      logger.error({
        requestId: (req as any).requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to calculate estimated time');

      if (error instanceof Error) {
        if (error.message === 'Production queue item not found') {
          res.status(404).json({
            message: 'Production queue item not found',
          });
          return;
        }
      }

      res.status(500).json({
        message: 'Internal server error',
      });
    }
  };
}
