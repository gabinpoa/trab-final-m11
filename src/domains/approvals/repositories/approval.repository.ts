import prisma from '../../../shared/config/database';
import { Approval, ApprovalStatus } from '@prisma/client';

export class ApprovalRepository {
  async create(data: {
    orderId: string;
    status: ApprovalStatus;
    approvedBy?: string;
    rejectionReason?: string;
  }): Promise<Approval> {
    return prisma.approval.create({
      data,
    });
  }

  async findById(id: string): Promise<Approval | null> {
    return prisma.approval.findUnique({
      where: { id },
      include: {
        order: true,
      },
    });
  }

  async findByOrderId(orderId: string): Promise<Approval[]> {
    return prisma.approval.findMany({
      where: { orderId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findPendingByOrderId(orderId: string): Promise<Approval | null> {
    return prisma.approval.findFirst({
      where: {
        orderId,
        status: ApprovalStatus.pending,
      },
    });
  }

  async update(id: string, data: Partial<Approval>): Promise<Approval> {
    return prisma.approval.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Approval> {
    return prisma.approval.delete({
      where: { id },
    });
  }
}
