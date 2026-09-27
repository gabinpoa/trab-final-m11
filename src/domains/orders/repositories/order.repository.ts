import prisma from '../../../shared/config/database';
import { Order, OrderItem, Prisma } from '@prisma/client';

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findAll(options?: { skip?: number; take?: number; userId?: string }): Promise<Order[]>;
  findByUser(userId: string): Promise<Order[]>;
  create(data: Prisma.OrderCreateInput): Promise<Order>;
  update(id: string, data: Prisma.OrderUpdateInput): Promise<Order>;
  delete(id: string): Promise<Order>;
  addItem(orderId: string, item: Prisma.OrderItemCreateInput): Promise<OrderItem>;
  updateStatus(id: string, status: string): Promise<Order>;
}

export class OrderRepository implements IOrderRepository {
  async findById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        approvals: true,
        productionQueue: true,
        history: true,
      },
    });
  }

  async findAll(options?: { skip?: number; take?: number; userId?: string }): Promise<Order[]> {
    const where = options?.userId ? { userId: options.userId } : {};

    return prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      skip: options?.skip || 0,
      take: options?.take || 10,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByUser(userId: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(data: Prisma.OrderCreateInput): Promise<Order> {
    return prisma.order.create({
      data,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.OrderUpdateInput): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<Order> {
    return prisma.order.delete({
      where: { id },
    });
  }

  async addItem(orderId: string, item: Prisma.OrderItemCreateInput): Promise<OrderItem> {
    return prisma.orderItem.create({
      data: {
        ...item,
        order: {
          connect: { id: orderId },
        },
      },
      include: {
        product: true,
      },
    });
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data: {
        status: status as any,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }
}

export default new OrderRepository();
