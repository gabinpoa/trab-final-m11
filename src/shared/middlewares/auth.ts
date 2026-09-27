import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthRequest } from '../types/express';
import logger from '../utils/logger';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        message: 'No token provided',
      });
      return;
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, config.jwt.secret) as any;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    logger.error({ error }, 'Error in auth middleware');
    res.status(401).json({
      message: 'Invalid token',
    });
  }
};

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        message: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};
