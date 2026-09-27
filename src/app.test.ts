import request from 'supertest';
import app from './app';

describe('App', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api-docs', () => {
    it('should return swagger documentation', async () => {
      const response = await request(app).get('/api-docs/');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Swagger UI');
    });
  });
});
