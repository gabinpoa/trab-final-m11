import { Router } from 'express';
import { getAll, getById, getMyOrders, create, update, deleteOrder, updateStatus } from './controllers/order.controller';
import { authMiddleware, roleMiddleware } from '../../shared/middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// User routes (order matters!)
router.get('/my', getMyOrders);
router.post('/', create);
router.put('/:id', update);
router.get('/:id', getById); // Allow users to view their own orders

// Admin routes
router.get('/', roleMiddleware(['admin']), getAll);
router.delete('/:id', roleMiddleware(['admin']), deleteOrder);
router.patch('/:id/status', roleMiddleware(['admin']), updateStatus);

export default router;
