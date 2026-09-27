import { Router } from 'express';
import { ApprovalController } from './controllers/approval.controller';
import { OrderHistoryController } from './controllers/orderHistory.controller';
import { authMiddleware } from '../../shared/middlewares/auth';

const router = Router();
const approvalController = new ApprovalController();
const historyController = new OrderHistoryController();

/**
 * @route POST /approvals/:id/approve
 * @desc Aprovar pedido
 * @access Private (User/Admin)
 */
router.post('/:id/approve', authMiddleware, approvalController.approve);

/**
 * @route POST /approvals/:id/reject
 * @desc Rejeitar pedido
 * @access Private (User/Admin)
 */
router.post('/:id/reject', authMiddleware, approvalController.reject);

/**
 * @route GET /approvals/:id
 * @desc Buscar aprovação por ID
 * @access Private (User/Admin)
 */
router.get('/:id', authMiddleware, approvalController.findById);

/**
 * @route GET /approvals/order/:orderId
 * @desc Buscar aprovações por pedido
 * @access Private (User/Admin)
 */
router.get('/order/:orderId', authMiddleware, approvalController.findByOrderId);

/**
 * @route GET /approvals/history/:orderId
 * @desc Buscar histórico de alterações de um pedido
 * @access Private (User/Admin)
 */
router.get('/history/:orderId', authMiddleware, historyController.findByOrderId);

export default router;
