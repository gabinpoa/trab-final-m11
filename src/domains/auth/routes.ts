import { Router } from 'express';
import { register, login } from './controllers/auth.controller';
import { authMiddleware, roleMiddleware } from '../../shared/middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);

// Protected route example
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: (req as any).user });
});

// Admin only route example
router.get('/admin', authMiddleware, roleMiddleware(['admin']), (_req, res) => {
  res.json({ message: 'Admin access granted' });
});

export default router;
