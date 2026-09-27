import { Router } from 'express';
import { QRCodeController } from './controllers/qrcode.controller';
import { authMiddleware } from '../../shared/middlewares/auth';

const router = Router();
const controller = new QRCodeController();

/**
 * @route GET /qrcode/orders/:id
 * @desc Gerar QR Code para um pedido
 * @access Private (User/Admin)
 */
router.get('/orders/:id', authMiddleware, controller.generate);

/**
 * @route GET /rastreamento/:code
 * @desc Buscar informações de rastreamento (público)
 * @access Public
 */
router.get('/rastreamento/:code', controller.getTrackingInfo);

export default router;
