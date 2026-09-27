import { Router } from 'express';
import { getAll, getById, create, update, deleteMaterial, getAvailability } from './controllers/material.controller';
import { authMiddleware, roleMiddleware } from '../../shared/middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Admin only routes
router.use(roleMiddleware(['admin']));

router.get('/', getAll);
router.get('/availability', getAvailability);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', deleteMaterial);

export default router;
