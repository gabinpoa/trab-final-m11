import { Response, NextFunction } from 'express';
import orderService from '../services/order.service';
import logger from '../../../shared/utils/logger';
import { OrderSagaCoordinator, ReserveMaterialsStep, CalculateFreightStep, CreateOrderStep, SagaContext } from '../saga';

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
export const getAll = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { skip, take } = req.query;
    const orders = await orderService.getAll({
      skip: skip ? parseInt(skip as string) : undefined,
      take: take ? parseInt(take as string) : undefined,
    });
    res.json(orders);
  } catch (error) {
    logger.error({ error }, 'Error in getAll orders controller');
    next(error);
  }
};

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
export const getById = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await orderService.getById(id);
    res.json(order);
  } catch (error) {
    logger.error({ error }, 'Error in getById order controller');
    next(error);
  }
};

/**
 * @swagger
 * /orders/my:
 *   get:
 *     summary: Get current user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
export const getMyOrders = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const orders = await orderService.getByUser(userId);
    res.json(orders);
  } catch (error) {
    logger.error({ error }, 'Error in getMyOrders controller');
    next(error);
  }
};

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - cep
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *               cep:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Saga execution failed
 */
export const create = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { items, cep } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!items || !cep) {
      res.status(400).json({
        message: 'Items and CEP are required',
      });
      return;
    }

    // Criar contexto da saga
    const context: SagaContext = {
      userId,
      items,
      cep,
      status: 'pending',
      completedSteps: [],
    };

    // Configurar coordenador da saga
    const coordinator = new OrderSagaCoordinator();
    coordinator.addStep(new ReserveMaterialsStep());
    coordinator.addStep(new CalculateFreightStep());
    coordinator.addStep(new CreateOrderStep());

    // Executar saga
    const result = await coordinator.execute(context);

    if (result.success) {
      const order = await orderService.getById(context.orderId!);
      res.status(201).json(order);
    } else {
      res.status(500).json({
        message: 'Failed to create order',
        error: result.error,
      });
    }
  } catch (error) {
    logger.error({ error }, 'Error in create order controller');
    next(error);
  }
};

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               freight:
 *                 type: number
 *               deliveryDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Order updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */
export const update = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, freight, deliveryDate } = req.body;

    const order = await orderService.update(id, {
      status,
      freight,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
    });

    res.json(order);
  } catch (error) {
    logger.error({ error }, 'Error in update order controller');
    next(error);
  }
};

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order deleted
 */
export const deleteOrder = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await orderService.delete(id);
    res.json(result);
  } catch (error) {
    logger.error({ error }, 'Error in delete order controller');
    next(error);
  }
};

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, in_production, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */
export const updateStatus = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({
        message: 'Status is required',
      });
      return;
    }

    const order = await orderService.updateStatus(id, status);
    res.json(order);
  } catch (error) {
    logger.error({ error }, 'Error in updateStatus controller');
    next(error);
  }
};
