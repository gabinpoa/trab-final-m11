import prisma from '../../../shared/config/database';
import { OrderHistory, OrderStatus } from '@prisma/client';

export class OrderHistoryRepository {
  async create(data: {
    orderId: string;
    status: OrderStatus;
    changedBy?: string;
  }): Promise<OrderHistory> {
    return prisma.orderHistory.create({
      data,
    });
  }

  async findById(id: string): Promise<OrderHistory | null> {
    return prisma.orderHistory.findUnique({
      where: { id },
      include: {
        order: true,
      },
    });
  }

  async findByOrderId(orderId: string): Promise<OrderHistory[]> {
    return prisma.orderHistory.findMany({
      where: { orderId },
      orderBy: {
        changedAt: 'desc',
      },
    });
  }

  async delete(id: string): Promise<OrderHistory> {
    return prisma.orderHistory.delete({
      where: { id },
    });
  }
}
