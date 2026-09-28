import orderRepository from '../repositories/order.repository';
import logger from '../../../shared/utils/logger';
import prisma from '../../../shared/config/database';
import { OrderStatus } from '@prisma/client';

export interface CreateOrderDto {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  freight?: number;
  cep?: string;
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  freight?: number;
  deliveryDate?: Date;
}

export class OrderService {
  async getAll(options?: { skip?: number; take?: number; userId?: string }) {
    try {
      return await orderRepository.findAll(options);
    } catch (error) {
      logger.error({ error }, 'Error getting all orders');
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const order = await orderRepository.findById(id);
      if (!order) {
        throw new Error('Order not found');
      }
      return order;
    } catch (error) {
      logger.error({ error }, 'Error getting order by id');
      throw error;
    }
  }

  async getByUser(userId: string) {
    try {
      return await orderRepository.findByUser(userId);
    } catch (error) {
      logger.error({ error }, 'Error getting orders by user');
      throw error;
    }
  }

  async create(dto: CreateOrderDto) {
    try {
      const order = await orderRepository.create({
        user: {
          connect: { id: dto.userId },
        },
        status: 'pending',
        total: dto.total,
        freight: dto.freight,
        items: {
          create: dto.items.map((item) => ({
            product: {
              connect: { id: item.productId },
            },
            quantity: item.quantity,
            price: item.price,
          })),
        },
        history: {
          create: {
            status: 'pending',
            changedBy: dto.userId,
          },
        },
      });

      logger.info(`Order created: ${order.id}`);
      return order;
    } catch (error) {
      logger.error({ error }, 'Error creating order');
      throw error;
    }
  }

  async update(id: string, dto: UpdateOrderDto) {
    try {
      const order = await orderRepository.findById(id);
      if (!order) {
        throw new Error('Order not found');
      }

      const updatedOrder = await orderRepository.update(id, {
        ...(dto.status && { status: dto.status as any }),
        ...(dto.freight !== undefined && { freight: dto.freight }),
        ...(dto.deliveryDate && { deliveryDate: dto.deliveryDate }),
      });

      // Add history entry if status changed
      if (dto.status && dto.status !== order.status) {
        await prisma.orderHistory.create({
          data: {
            orderId: id,
            status: dto.status,
            changedBy: order.userId,
          },
        });
      }

      logger.info(`Order updated: ${updatedOrder.id}`);
      return updatedOrder;
    } catch (error) {
      logger.error({ error }, 'Error updating order');
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const order = await orderRepository.findById(id);
      if (!order) {
        throw new Error('Order not found');
      }

      await orderRepository.delete(id);
      logger.info(`Order deleted: ${order.id}`);
      return { message: 'Order deleted successfully' };
    } catch (error) {
      logger.error({ error }, 'Error deleting order');
      throw error;
    }
  }

  async updateStatus(id: string, status: OrderStatus) {
    try {
      const order = await orderRepository.findById(id);
      if (!order) {
        throw new Error('Order not found');
      }

      const updatedOrder = await orderRepository.updateStatus(id, status);

      // Add history entry
      await prisma.orderHistory.create({
        data: {
          orderId: id,
          status,
          changedBy: order.userId,
        },
      });

      logger.info(`Order status updated: ${id} -> ${status}`);
      return updatedOrder;
    } catch (error) {
      logger.error({ error }, 'Error updating order status');
      throw error;
    }
  }
}

export default new OrderService();
