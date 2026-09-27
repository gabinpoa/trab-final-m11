// Test setup file - run before all tests
import { DatabaseHelper } from './database-helper';
import prisma from '../shared/config/database';

// Global test timeout
jest.setTimeout(30000);

// Setup and teardown hooks
beforeAll(async () => {
  console.log('Test setup started');
  // Ensure database connection is established
  await prisma.$connect();
  console.log('Database connected');
});

afterAll(async () => {
  console.log('Test cleanup completed');
  // Disconnect from database
  await DatabaseHelper.disconnect();
});

beforeEach(async () => {
  // Clean database before each test for isolation
  await DatabaseHelper.cleanDatabase();
  // Reset mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
  jest.restoreAllMocks();
});
