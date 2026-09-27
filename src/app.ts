import express, { Application } from 'express';
import { config } from './shared/config/env';
import logger from './shared/utils/logger';
import prisma from './shared/config/database';
import authRoutes from './domains/auth/routes';
import inventoryRoutes from './domains/inventory/routes';
import catalogRoutes from './domains/catalog/routes';
import orderRoutes from './domains/orders/routes';
import customizationRoutes from './domains/customizations/routes';
import path from 'path';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (fotos do catálogo)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  maxAge: '1d', // Cache de 1 dia para fotos estáticas
  etag: true,
  lastModified: true,
}));

// API routes
app.use('/auth', authRoutes);
app.use('/materials', inventoryRoutes);
app.use('/products', catalogRoutes);
app.use('/orders', orderRoutes);
app.use('/customizations', customizationRoutes);

// Health check (requisito do DevOps para monitoramento)
app.get('/health', async (_req, res) => {
  try {
    // Verificar conexão com banco de dados
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
    });
  } catch (error) {
    logger.error({ error }, 'Health check failed');
    res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      uptime: process.uptime(),
    });
  }
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Error handling
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction): void => {
  logger.error(err);

  if (err.message === 'User already exists') {
    res.status(409).json({
      message: 'User already exists',
    });
    return;
  }

  if (err.message === 'Invalid credentials') {
    res.status(401).json({
      message: 'Invalid credentials',
    });
    return;
  }

  if (err.message === 'Material not found') {
    res.status(404).json({
      message: 'Material not found',
    });
    return;
  }

  if (err.message === 'Insufficient material quantity') {
    res.status(400).json({
      message: 'Insufficient material quantity',
    });
    return;
  }

  if (err.message === 'Material was modified by another transaction') {
    res.status(409).json({
      message: 'Material was modified by another transaction',
    });
    return;
  }

  if (err.message === 'Product not found') {
    res.status(404).json({
      message: 'Product not found',
    });
    return;
  }

  if (err.message === 'Order not found') {
    res.status(404).json({
      message: 'Order not found',
    });
    return;
  }

  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export const startServer = () => {
  const PORT = config.port;
  const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });

  // Keep the process alive
  server.on('close', () => {
    logger.info('Server closed');
  });

  return server;
};

export default app;
