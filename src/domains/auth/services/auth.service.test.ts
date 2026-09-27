import { AuthService } from './auth.service';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../../shared/config/database', () => ({
  default: {
    user: {
      findUnique: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
  },
}));
jest.mock('../../../shared/config/env');
jest.mock('../../../shared/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user with valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: { name: 'user' },
      };

      const mockRole = { id: '1', name: 'user' };

      // Mock Prisma responses
      const prisma = require('../../../shared/config/database').default;
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);
      prisma.role.findUnique = jest.fn().mockResolvedValue(mockRole);
      prisma.user.create = jest.fn().mockResolvedValue(mockUser);

      // Mock bcrypt
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      // Mock JWT
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result).toEqual({
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
        },
        token: 'mockToken',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(jwt.sign).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      const prisma = require('../../../shared/config/database').default;
      prisma.user.findUnique = jest.fn().mockResolvedValue({ id: '1' });

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        })
      ).rejects.toThrow('User already exists');
    });

    it('should throw error if default role not found', async () => {
      const prisma = require('../../../shared/config/database').default;
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);
      prisma.role.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        })
      ).rejects.toThrow('Default user role not found');
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: { name: 'user' },
      };

      const prisma = require('../../../shared/config/database').default;
      prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
        },
        token: 'mockToken',
      });

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });

    it('should throw error if user not found', async () => {
      const prisma = require('../../../shared/config/database').default;
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if password is invalid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: { name: 'user' },
      };

      const prisma = require('../../../shared/config/database').default;
      prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      const mockDecoded = { id: '1', email: 'test@example.com', role: 'user' };
      const config = require('../../../shared/config/env').config;
      config.jwt = { secret: 'testSecret' };

      (jwt.verify as jest.Mock).mockResolvedValue(mockDecoded);

      const result = await authService.verifyToken('validToken');

      expect(result).toEqual(mockDecoded);
      expect(jwt.verify).toHaveBeenCalledWith('validToken', 'testSecret');
    });

    it('should throw error for invalid token', async () => {
      const config = require('../../../shared/config/env').config;
      config.jwt = { secret: 'testSecret' };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.verifyToken('invalidToken')).rejects.toThrow('Invalid token');
    });
  });

  describe('generateToken (private method)', () => {
    it('should generate JWT token with correct payload', () => {
      const config = require('../../../shared/config/env').config;
      config.jwt = { secret: 'testSecret' };

      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      // Access private method through prototype
      const generateToken = (authService as any).generateToken.bind(authService);
      generateToken('1', 'test@example.com', 'user');

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: '1', email: 'test@example.com', role: 'user' },
        'testSecret',
        { expiresIn: '1h' }
      );
    });
  });
});
