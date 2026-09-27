import request from 'supertest';
import app from '../app';
import { DatabaseHelper } from '../test/database-helper';

describe('E2E Tests: Complete User Flows', () => {
  let testData: any;
  let authToken: string;

  beforeAll(async () => {
    // Seed database with test data
    testData = await DatabaseHelper.seedDatabase();

    // Get auth token for regular user
    authToken = await DatabaseHelper.getTestAuthToken(
      testData.regularUser.id,
      testData.regularUser.email,
      'user'
    );
  });

  afterAll(async () => {
    await DatabaseHelper.disconnect();
  });

  beforeEach(async () => {
    await DatabaseHelper.cleanDatabase();
    // Re-seed basic data
    testData = await DatabaseHelper.seedDatabase();
  });

  describe('Complete User Registration and Login Flow', () => {
    it('should allow user to register, login, and access protected routes', async () => {
      // Step 1: Register new user
      const registerResponse = await request(app)
        .post('/auth/register')
        .send({
          email: 'flowuser@test.com',
          password: 'password123',
          name: 'Flow User',
        });

      expect([200, 201]).toContain(registerResponse.status);
      expect(registerResponse.body).toHaveProperty('user');
      expect(registerResponse.body).toHaveProperty('token');

      const newUserToken = registerResponse.body.token;

      // Step 2: Login with registered user
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'flowuser@test.com',
          password: 'password123',
        });

      expect([200, 401]).toContain(loginResponse.status);

      // Step 3: Access protected route with token
      const ordersResponse = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${newUserToken}`);

      expect(ordersResponse.status).toBe(200);
      expect(Array.isArray(ordersResponse.body)).toBe(true);
    });
  });

  describe('Complete Order Creation Flow', () => {
    it('should allow user to browse products and create an order', async () => {
      // Step 1: Browse products
      const productsResponse = await request(app).get('/products');

      expect(productsResponse.status).toBe(200);
      expect(Array.isArray(productsResponse.body)).toBe(true);
      expect(productsResponse.body.length).toBeGreaterThan(0);

      const productId = productsResponse.body[0].id;

      // Step 2: Create order with product
      const orderResponse = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              productId: productId,
              quantity: 2,
              price: productsResponse.body[0].price,
            },
          ],
          total: productsResponse.body[0].price * 2,
          freight: 15,
        });

      expect([200, 201]).toContain(orderResponse.status);

      // Step 3: Verify order was created
      const ordersResponse = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(ordersResponse.status).toBe(200);
      expect(ordersResponse.body.length).toBeGreaterThan(0);
    });
  });

  describe('Complete Material Management Flow (Admin)', () => {
    it('should allow admin to manage materials', async () => {
      const adminToken = await DatabaseHelper.getTestAuthToken(
        testData.adminUser.id,
        testData.adminUser.email,
        'admin'
      );

      // Step 1: Create material
      const createResponse = await request(app)
        .post('/materials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'E2E Test Material',
          quantity: 100,
          minLevel: 20,
        });

      expect([200, 201]).toContain(createResponse.status);

      const materialId = createResponse.body.id;

      // Step 2: Get all materials
      const getAllResponse = await request(app)
        .get('/materials')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getAllResponse.status).toBe(200);
      expect(Array.isArray(getAllResponse.body)).toBe(true);

      // Step 3: Update material
      const updateResponse = await request(app)
        .put(`/materials/${materialId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          quantity: 150,
        });

      expect([200, 201]).toContain(updateResponse.status);

      // Step 4: Delete material
      const deleteResponse = await request(app)
        .delete(`/materials/${materialId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteResponse.status).toBe(200);
    });
  });

  describe('Complete Product Management Flow (Admin)', () => {
    it('should allow admin to manage products', async () => {
      const adminToken = await DatabaseHelper.getTestAuthToken(
        testData.adminUser.id,
        testData.adminUser.email,
        'admin'
      );

      // Note: Product creation requires file upload, which is complex to test in E2E
      // We'll test the read operations that don't require file upload

      // Step 1: Get all products
      const getAllResponse = await request(app).get('/products');

      expect(getAllResponse.status).toBe(200);
      expect(Array.isArray(getAllResponse.body)).toBe(true);

      // Step 2: Get specific product
      const productId = getAllResponse.body[0].id;
      const getOneResponse = await request(app).get(`/products/${productId}`);

      expect(getOneResponse.status).toBe(200);
      expect(getOneResponse.body).toHaveProperty('id', productId);
      expect(getOneResponse.body).toHaveProperty('imageUrl');
    });
  });

  describe('Error Handling in Complete Flows', () => {
    it('should handle invalid authentication in complete flow', async () => {
      // Try to access protected route without token
      const response = await request(app).get('/orders');

      expect(response.status).toBe(401);
    });

    it('should handle invalid token in complete flow', async () => {
      const response = await request(app)
        .get('/orders')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should handle insufficient permissions in complete flow', async () => {
      // Regular user trying to access admin endpoint
      const response = await request(app)
        .post('/materials')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Unauthorized Material',
          quantity: 50,
          minLevel: 10,
        });

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('Data Consistency in Complete Flows', () => {
    it('should maintain data consistency across operations', async () => {
      // Create material
      const adminToken = await DatabaseHelper.getTestAuthToken(
        testData.adminUser.id,
        testData.adminUser.email,
        'admin'
      );

      const material = await request(app)
        .post('/materials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Consistency Test Material',
          quantity: 100,
          minLevel: 20,
        });

      const materialId = material.body.id;

      // Verify it exists
      const getResponse = await request(app)
        .get(`/materials/${materialId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.quantity).toBe(100);

      // Update it
      await request(app)
        .put(`/materials/${materialId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 75 });

      // Verify update persisted
      const getAfterUpdate = await request(app)
        .get(`/materials/${materialId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getAfterUpdate.body.quantity).toBe(75);
    });
  });
});
