import { Response } from 'express';
import { OrderHistoryRepository } from '../repositories/orderHistory.repository';
import logger from '../../../shared/utils/logger';
import { AuthRequest } from '../../../shared/types/express';

export class OrderHistoryController {
  private repository: OrderHistoryRepository;

  constructor() {
    this.repository = new OrderHistoryRepository();
  }

  /**
   * Buscar histórico de um pedido
   */
  findByOrderId = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;
      const orderIdStr = Array.isArray(orderId) ? orderId[0] : orderId;

      const history = await this.repository.findByOrderId(orderIdStr);

      res.json(history);
    } catch (error) {
      logger.error({
        requestId: (req as any).requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to fetch order history');

      res.status(500).json({
        message: 'Internal server error',
      });
    }
  };
}
