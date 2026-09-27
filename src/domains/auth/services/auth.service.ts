import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from '../../../shared/config/database';
import { config } from '../../../shared/config/env';
import logger from '../../../shared/utils/logger';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
}

export class AuthService {
  async register(dto: RegisterDto): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Get default user role
      const userRole = await prisma.role.findUnique({
        where: { name: 'user' },
      });

      if (!userRole) {
        throw new Error('Default user role not found');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          roleId: userRole.id,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      });

      // Generate token
      const token = this.generateToken(user.id, user.email, user.role.name);

      logger.info(`User registered: ${user.email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.name,
        },
        token,
      };
    } catch (error) {
      logger.error({ error }, 'Error in register');
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: dto.email },
        include: {
          role: true,
        },
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(dto.password, user.password);

      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate token
      const token = this.generateToken(user.id, user.email, user.role.name);

      logger.info(`User logged in: ${user.email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.name,
        },
        token,
      };
    } catch (error) {
      logger.error({ error }, 'Error in login');
      throw error;
    }
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      return decoded;
    } catch (error) {
      logger.error({ error }, 'Error verifying token');
      throw new Error('Invalid token');
    }
  }

  private generateToken(userId: string, email: string, role: string): string {
    return jwt.sign(
      {
        id: userId,
        email,
        role,
      },
      config.jwt.secret,
      {
        expiresIn: '1h',
      }
    );
  }
}

export default new AuthService();
