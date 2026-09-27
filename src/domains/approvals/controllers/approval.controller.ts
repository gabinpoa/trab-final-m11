import { Request, Response } from 'express';
import { ApprovalService } from '../services/approval.service';
import { ApproveOrderDto, RejectOrderDto } from '../dto/approval.dto';
import logger from '../../../shared/utils/logger';
import { AuthRequest } from '../../../shared/types/express';

export class ApprovalController {
  private service: ApprovalService;

  constructor() {
    this.service = new ApprovalService();
  }

  /**
   * Aprovar pedido
   */
  approve = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          message: 'Unauthorized',
        });
        return;
      }

      const dto: ApproveOrderDto = {
        orderId: idStr,
        approvedBy: userId,
      };

      logger.info({
        requestId: (req as any).requestId,
        orderId: idStr,
        approvedBy: userId,
      }, 'Approving order');

      const approval = await this.service.approveOrder(dto);

      logger.info({
        requestId: (req as any).requestId,
        approvalId: approval.id,
      }, 'Order approved successfully');

      res.json(approval);
    } catch (error) {
      logger.error({
        requestId: (req as any).requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to approve order');

      if (error instanceof Error) {
        if (error.message === 'Order not found') {
          res.status(404).json({
            message: 'Order not found',
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
   * Rejeitar pedido
   */
  reject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;
      const userId = req.user?.id;
      const { rejectionReason } = req.body;

      if (!userId) {
        res.status(401).json({
          message: 'Unauthorized',
        });
        return;
      }

      if (!rejectionReason) {
        res.status(400).json({
          message: 'Rejection reason is required',
        });
        return;
      }

      const dto: RejectOrderDto = {
        orderId: idStr,
        approvedBy: userId,
        rejectionReason,
      };

      logger.info({
        requestId: (req as any).requestId,
        orderId: idStr,
        approvedBy: userId,
        rejectionReason,
      }, 'Rejecting order');

      const approval = await this.service.rejectOrder(dto);

      logger.info({
        requestId: (req as any).requestId,
        approvalId: approval.id,
      }, 'Order rejected successfully');

      res.json(approval);
    } catch (error) {
      logger.error({
        requestId: (req as any).requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to reject order');

      if (error instanceof Error) {
        if (error.message === 'Order not found') {
          res.status(404).json({
            message: 'Order not found',
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
   * Buscar aprovação por ID
   */
  findById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;

      const approval = await this.service.findById(idStr);

      if (!approval) {
        res.status(404).json({
          message: 'Approval not found',
        });
        return;
      }

      res.json(approval);
    } catch (error) {
      logger.error({
        requestId: (req as any).requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to fetch approval');

      res.status(500).json({
        message: 'Internal server error',
      });
    }
  };

  /**
   * Buscar aprovações por pedido
   */
  findByOrderId = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;
      const orderIdStr = Array.isArray(orderId) ? orderId[0] : orderId;

      const approvals = await this.service.findByOrderId(orderIdStr);

      res.json(approvals);
    } catch (error) {
      logger.error({
        requestId: (req as any).requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to fetch approvals');

      res.status(500).json({
        message: 'Internal server error',
      });
    }
  };
}
