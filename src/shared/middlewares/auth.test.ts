import { authMiddleware, roleMiddleware } from './auth';
import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../config/env');
jest.mock('../utils/logger');

describe('Auth Middleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authMiddleware', () => {
    it('should call next() with valid token', () => {
      const mockDecoded = { id: '1', email: 'test@example.com', role: 'user' };
      mockReq.headers.authorization = 'Bearer validToken';

      const config = require('../config/env').config;
      config.jwt = { secret: 'testSecret' };

      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      authMiddleware(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual(mockDecoded);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 401 if no token provided', () => {
      authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'No token provided' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token does not start with Bearer', () => {
      mockReq.headers.authorization = 'InvalidToken';

      authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'No token provided' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
      mockReq.headers.authorization = 'Bearer invalidToken';

      const config = require('../config/env').config;
      config.jwt = { secret: 'testSecret' };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should extract token correctly from Bearer header', () => {
      const mockDecoded = { id: '1', email: 'test@example.com', role: 'user' };
      mockReq.headers.authorization = 'Bearer validToken';

      const config = require('../config/env').config;
      config.jwt = { secret: 'testSecret' };

      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      authMiddleware(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('validToken', 'testSecret');
    });
  });

  describe('roleMiddleware', () => {
    it('should call next() if user has allowed role', () => {
      mockReq.user = { id: '1', email: 'test@example.com', role: 'admin' };
      const middleware = roleMiddleware(['admin', 'user']);

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have allowed role', () => {
      mockReq.user = { id: '1', email: 'test@example.com', role: 'user' };
      const middleware = roleMiddleware(['admin']);

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Insufficient permissions' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', () => {
      mockReq.user = undefined;
      const middleware = roleMiddleware(['admin']);

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Authentication required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should work with multiple allowed roles', () => {
      mockReq.user = { id: '1', email: 'test@example.com', role: 'user' };
      const middleware = roleMiddleware(['admin', 'user', 'moderator']);

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
