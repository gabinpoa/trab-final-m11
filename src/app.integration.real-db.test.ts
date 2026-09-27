import request from 'supertest';
import app from './app';
import { DatabaseHelper } from './test/database-helper';

describe('API Integration Tests with Real Database', () => {
  let testData: any;

  beforeAll(async () => {
    // Seed database with test data
    testData = await DatabaseHelper.seedDatabase();
  });

  describe('Health Check', () => {
    it('GET /health should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Not found' });
    });
  });

  describe('Auth Routes', () => {
    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Materials Routes', () => {
    it('should return 401 without auth token', async () => {
      const response = await request(app).get('/materials');

      expect(response.status).toBe(401);
    });

    it('should create a new material with auth', async () => {
      const authToken = await DatabaseHelper.getTestAuthToken(
        testData.adminUser.id,
        testData.adminUser.email,
        'admin'
      );

      const response = await request(app)
        .post('/materials')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New Test Material',
          quantity: 50,
          minLevel: 10,
        });

      expect([200, 201]).toContain(response.status);
    });

    it('should return 401 without auth token for POST', async () => {
      const response = await request(app)
        .post('/materials')
        .send({
          name: 'Unauthorized Material',
          quantity: 50,
          minLevel: 10,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Products Routes', () => {
    it('should return 404 for non-existent product', async () => {
      const response = await request(app).get('/products/invalid-id');

      expect(response.status).toBe(404);
    });
  });

  describe('Orders Routes', () => {
    it('should return 401 without auth token', async () => {
      const response = await request(app).get('/orders');

      expect(response.status).toBe(401);
    });

    it('should return 401 without auth token for POST', async () => {
      const response = await request(app)
        .post('/orders')
        .send({
          items: [{ productId: testData.product.id, quantity: 1, price: 100 }],
          total: 100,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle Product not found error', async () => {
      const response = await request(app).get('/products/invalid-id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Product not found');
    });

    it('should handle Material not found error', async () => {
      const authToken = await DatabaseHelper.getTestAuthToken(
        testData.adminUser.id,
        testData.adminUser.email,
        'admin'
      );

      const response = await request(app)
        .get('/materials/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Material not found');
    });
  });
});
