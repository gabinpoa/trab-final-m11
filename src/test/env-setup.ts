// Set test environment variables directly
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/ecommerce_test?schema=public';
process.env.JWT_SECRET = 'test-secret-key';
process.env.PORT = '3001';
