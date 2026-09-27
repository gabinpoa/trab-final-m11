import { Router } from 'express';
import { CustomizationController } from './controllers/customization.controller';

const router = Router();
const controller = new CustomizationController();

/**
 * @route POST /customizations/:orderId
 * @desc Upload de personalização para um pedido
 * @access Private (User)
 */
router.post('/:orderId', ...controller.upload);

/**
 * @route GET /customizations/:id
 * @desc Buscar personalização por ID
 * @access Private (User/Admin)
 */
router.get('/:id', controller.findById);

/**
 * @route GET /customizations/order/:orderId
 * @desc Buscar personalizações por pedido
 * @access Private (User/Admin)
 */
router.get('/order/:orderId', controller.findByOrderId);

/**
 * @route DELETE /customizations/:id
 * @desc Deletar personalização
 * @access Private (User/Admin)
 */
router.delete('/:id', controller.delete);

export default router;
