import { Router } from 'express';
import { ProductionController } from './controllers/production.controller';
import { authMiddleware, roleMiddleware } from '../../shared/middlewares/auth';

const router = Router();
const controller = new ProductionController();

/**
 * @route POST /production/queue
 * @desc Criar entrada na fila de produção
 * @access Private (Admin)
 */
router.post('/queue', authMiddleware, roleMiddleware(['admin']), controller.create);

/**
 * @route GET /production/queue
 * @desc Buscar toda a fila de produção
 * @access Private (Admin)
 */
router.get('/queue', authMiddleware, roleMiddleware(['admin']), controller.findAll);

/**
 * @route GET /production/queue/:id
 * @desc Buscar fila de produção por ID
 * @access Private (Admin)
 */
router.get('/queue/:id', authMiddleware, roleMiddleware(['admin']), controller.findById);

/**
 * @route GET /production/queue/stage/:stage
 * @desc Buscar fila de produção por etapa
 * @access Private (Admin)
 */
router.get('/queue/stage/:stage', authMiddleware, roleMiddleware(['admin']), controller.findByStage);

/**
 * @route PUT /production/queue/:id/stage
 * @desc Atualizar etapa de produção
 * @access Private (Admin)
 */
router.put('/queue/:id/stage', authMiddleware, roleMiddleware(['admin']), controller.updateStage);

/**
 * @route GET /production/queue/:id/estimated-time
 * @desc Calcular tempo estimado restante
 * @access Private (Admin)
 */
router.get('/queue/:id/estimated-time', authMiddleware, roleMiddleware(['admin']), controller.calculateEstimatedTime);

export default router;
