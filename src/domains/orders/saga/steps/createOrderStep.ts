import { SagaContext, SagaStep } from '../types';
import orderService from '../../services/order.service';
import logger from '../../../../shared/utils/logger';

export class CreateOrderStep implements SagaStep {
  name = 'CreateOrder';

  async execute(context: SagaContext): Promise<void> {
    const { userId, items, freight, cep } = context;

    if (!freight) {
      throw new Error('Freight must be calculated before creating order');
    }

    // Calcular total
    const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = itemsTotal + freight;

    // Criar pedido
    const order = await orderService.create({
      userId,
      items,
      freight,
      total,
      cep,
    });

    context.orderId = order.id;
    context.total = total;

    logger.info({
      orderId: order.id,
      total,
      freight,
      itemsCount: items.length,
    }, 'Order created');
  }

  async compensate(context: SagaContext): Promise<void> {
    if (!context.orderId) {
      return;
    }

    logger.info({ orderId: context.orderId }, 'Compensating order creation');

    try {
      // Cancelar o pedido criado
      await orderService.updateStatus(context.orderId, 'cancelled');
      logger.info({ orderId: context.orderId }, 'Order cancelled');
    } catch (error) {
      logger.error({
        orderId: context.orderId,
        error,
      }, 'Failed to cancel order during compensation');
    }
  }
}
