import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger';

export const swaggerRouter = Router();

swaggerRouter.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

swaggerRouter.get('/json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
