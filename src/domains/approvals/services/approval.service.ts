import { ApprovalRepository } from '../repositories/approval.repository';
import { ApprovalStatus, OrderStatus } from '@prisma/client';
import { ApprovalResponseDto, ApproveOrderDto, RejectOrderDto } from '../dto/approval.dto';
import prisma from '../../../shared/config/database';

export class ApprovalService {
  private repository: ApprovalRepository;

  constructor() {
    this.repository = new ApprovalRepository();
  }

  /**
   * Aprovar pedido
   */
  async approveOrder(dto: ApproveOrderDto): Promise<ApprovalResponseDto> {
    try {
      // Verificar se o pedido existe
      const order = await prisma.order.findUnique({
        where: { id: dto.orderId },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Verificar se já existe aprovação pendente
      const pendingApproval = await this.repository.findPendingByOrderId(dto.orderId);
      
      if (pendingApproval) {
        // Atualizar aprovação existente
        const approval = await this.repository.update(pendingApproval.id, {
          status: ApprovalStatus.approved,
          approvedBy: dto.approvedBy,
          approvedAt: new Date(),
        });

        // Atualizar status do pedido
        await prisma.order.update({
          where: { id: dto.orderId },
          data: { status: OrderStatus.approved },
        });

        // Registrar histórico
        await this.recordOrderHistory(dto.orderId, OrderStatus.approved, dto.approvedBy);

        return this.toResponseDto(approval);
      }

      // Criar nova aprovação
      const approval = await this.repository.create({
        orderId: dto.orderId,
        status: ApprovalStatus.approved,
        approvedBy: dto.approvedBy,
        approvedAt: new Date(),
      });

      // Atualizar status do pedido
      await prisma.order.update({
        where: { id: dto.orderId },
        data: { status: OrderStatus.approved },
      });

      // Registrar histórico
      await this.recordOrderHistory(dto.orderId, OrderStatus.approved, dto.approvedBy);

      return this.toResponseDto(approval);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Rejeitar pedido
   */
  async rejectOrder(dto: RejectOrderDto): Promise<ApprovalResponseDto> {
    try {
      // Verificar se o pedido existe
      const order = await prisma.order.findUnique({
        where: { id: dto.orderId },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Verificar se já existe aprovação pendente
      const pendingApproval = await this.repository.findPendingByOrderId(dto.orderId);
      
      if (pendingApproval) {
        // Atualizar aprovação existente
        const approval = await this.repository.update(pendingApproval.id, {
          status: ApprovalStatus.rejected,
          approvedBy: dto.approvedBy,
          approvedAt: new Date(),
          rejectionReason: dto.rejectionReason,
        });

        // Atualizar status do pedido
        await prisma.order.update({
          where: { id: dto.orderId },
          data: { status: OrderStatus.cancelled },
        });

        // Registrar histórico
        await this.recordOrderHistory(dto.orderId, OrderStatus.cancelled, dto.approvedBy);

        return this.toResponseDto(approval);
      }

      // Criar nova aprovação
      const approval = await this.repository.create({
        orderId: dto.orderId,
        status: ApprovalStatus.rejected,
        approvedBy: dto.approvedBy,
        approvedAt: new Date(),
        rejectionReason: dto.rejectionReason,
      });

      // Atualizar status do pedido
      await prisma.order.update({
        where: { id: dto.orderId },
        data: { status: OrderStatus.cancelled },
      });

      // Registrar histórico
      await this.recordOrderHistory(dto.orderId, OrderStatus.cancelled, dto.approvedBy);

      return this.toResponseDto(approval);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar aprovação por ID
   */
  async findById(id: string): Promise<ApprovalResponseDto | null> {
    const approval = await this.repository.findById(id);
    if (!approval) {
      return null;
    }
    return this.toResponseDto(approval);
  }

  /**
   * Buscar aprovações por pedido
   */
  async findByOrderId(orderId: string): Promise<ApprovalResponseDto[]> {
    const approvals = await this.repository.findByOrderId(orderId);
    return approvals.map(a => this.toResponseDto(a));
  }

  /**
   * Registrar histórico de alteração de status do pedido
   */
  private async recordOrderHistory(orderId: string, status: OrderStatus, changedBy?: string): Promise<void> {
    await prisma.orderHistory.create({
      data: {
        orderId,
        status,
        changedBy,
      },
    });
  }

  /**
   * Converter para DTO de resposta
   */
  private toResponseDto(approval: any): ApprovalResponseDto {
    return {
      id: approval.id,
      orderId: approval.orderId,
      status: approval.status,
      approvedBy: approval.approvedBy,
      approvedAt: approval.approvedAt,
      rejectionReason: approval.rejectionReason,
      createdAt: approval.createdAt,
      updatedAt: approval.updatedAt,
    };
  }
}
