import { Router } from 'express';
import { getAll, getById, getByCategory, search, create, update, deleteProduct, updatePhoto, deletePhoto } from './controllers/product.controller';
import { authMiddleware, roleMiddleware } from '../../shared/middlewares/auth';
import { uploadProductPhoto } from './middlewares/upload.middleware';
import { uploadProductPhotoUpdate } from './middlewares/uploadUpdate.middleware';
import { validateProductImage } from './middlewares/imageValidation.middleware';

const router = Router();

// Public routes (order matters!)
router.get('/', getAll);
router.get('/search', search);
router.get('/category/:categoryId', getByCategory);
router.get('/:id', getById);

// Protected routes (require authentication)
router.post('/', authMiddleware, roleMiddleware(['admin']), uploadProductPhoto, validateProductImage, create);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), update);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteProduct);

// Photo management (admin only)
router.patch('/:id/photo', authMiddleware, roleMiddleware(['admin']), uploadProductPhotoUpdate, validateProductImage, updatePhoto);
router.delete('/:id/photo', authMiddleware, roleMiddleware(['admin']), deletePhoto);

export default router;
