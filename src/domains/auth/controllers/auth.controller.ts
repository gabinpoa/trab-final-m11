import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import logger from '../../../shared/utils/logger';

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({
        message: 'Email, password, and name are required',
      });
      return;
    }

    const result = await authService.register({ email, password, name });

    res.status(201).json(result);
  } catch (error) {
    logger.error({ error }, 'Error in register controller');
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error('Unknown error occurred'));
    }
  }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: 'Email and password are required',
      });
      return;
    }

    const result = await authService.login({ email, password });

    res.status(200).json(result);
  } catch (error) {
    logger.error({ error }, 'Error in login controller');
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error('Unknown error occurred'));
    }
  }
};
