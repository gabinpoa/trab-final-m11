import prisma from '../shared/config/database';

/**
 * Database helper for integration tests
 * Provides utilities to setup, teardown and manage test database state
 */

export class DatabaseHelper {
  /**
   * Clean all tables in the database
   * Useful for running tests with a clean slate
   */
  static async cleanDatabase() {
    // Delete in correct order to respect foreign key constraints
    await prisma.orderHistory.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.approval.deleteMany();
    await prisma.productionQueue.deleteMany();
    await prisma.materialReservation.deleteMany();
    await prisma.material.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    // Don't delete roles as they are referenced by users
  }

  /**
   * Seed the database with test data
   */
  static async seedDatabase() {
    // Clean existing data first to avoid conflicts
    await this.cleanDatabase();

    // Create roles using create (clean database)
    const adminRole = await prisma.role.create({
      data: { name: 'admin', permissions: ['all'] },
    });

    const userRole = await prisma.role.create({
      data: { name: 'user', permissions: ['create_orders', 'view_orders'] },
    });

    // Create users using create
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: '$2b$10$test', // hashed password
        name: 'Test Admin',
        roleId: adminRole.id,
      },
    });

    const regularUser = await prisma.user.create({
      data: {
        email: 'user@test.com',
        password: '$2b$10$test', // hashed password
        name: 'Test User',
        roleId: userRole.id,
      },
    });

    // Create categories using create
    const category = await prisma.category.create({
      data: { name: 'Test Category' },
    });

    // Create products using create with random data to avoid conflicts
    const product = await prisma.product.create({
      data: {
        name: `Test Product ${Date.now()}`,
        description: 'Test Description',
        price: 100,
        complexity: 1,
        imageUrl: '/uploads/products/test/foto.jpg',
        categoryId: category.id,
      },
    });

    // Create materials using create with random data to avoid conflicts
    const material = await prisma.material.create({
      data: {
        name: `Test Material ${Date.now()}`,
        quantity: 100,
        minLevel: 20,
        version: 0,
      },
    });

    return {
      adminRole,
      userRole,
      adminUser,
      regularUser,
      category,
      product,
      material,
    };
  }

  /**
   * Get a test user token (for authentication tests)
   */
  static async getTestAuthToken(userId: string, email: string, role: string): Promise<string> {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { id: userId, email, role },
      process.env.JWT_SECRET || 'test-secret-key',
      { expiresIn: '1h' }
    );
  }

  /**
   * Disconnect from database
   */
  static async disconnect() {
    await prisma.$disconnect();
  }
}
