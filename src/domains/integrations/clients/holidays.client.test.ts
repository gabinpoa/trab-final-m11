import HolidaysAPIClient from './holidays.client';
import axios from 'axios';

// Mock dependencies
jest.mock('axios');
jest.mock('../../../shared/config/env');
jest.mock('../../../shared/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

describe('HolidaysAPIClient', () => {
  let holidaysClient: any;

  beforeEach(() => {
    holidaysClient = HolidaysAPIClient;
    jest.clearAllMocks();
  });

  describe('getHolidays', () => {
    it('should return holidays for valid year', async () => {
      const mockHolidays = [
        { date: '2024-01-01', name: 'Confraternização Mundial', type: 'national' },
        { date: '2024-02-12', name: 'Carnaval', type: 'national' },
        { date: '2024-03-29', name: 'Sexta-feira Santa', type: 'national' },
      ];

      (axios.get as jest.Mock).mockResolvedValue({ data: mockHolidays });

      const result = await holidaysClient.getHolidays(2024);

      expect(result).toEqual(mockHolidays);
      expect(axios.get).toHaveBeenCalledWith(
        'https://brasilapi.com.br/api/feriados/v1/2024',
        { timeout: 2000 }
      );
    });

    it('should handle API errors with retry', async () => {
      (axios.get as jest.Mock)
        .mockRejectedValueOnce(new Error('API error'))
        .mockRejectedValueOnce(new Error('API error'))
        .mockResolvedValue({ data: [] });

      const result = await holidaysClient.getHolidays(2024);

      expect(result).toEqual([]);
      expect(axios.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('isHoliday', () => {
    it('should return true for holiday date', () => {
      const holidays = [
        { date: '2024-01-01', name: 'Confraternização Mundial', type: 'national' },
        { date: '2024-02-12', name: 'Carnaval', type: 'national' },
      ];

      const date = new Date('2024-01-01');
      const result = holidaysClient.isHoliday(date, holidays);

      expect(result).toBe(true);
    });

    it('should return false for non-holiday date', () => {
      const holidays = [
        { date: '2024-01-01', name: 'Confraternização Mundial', type: 'national' },
        { date: '2024-02-12', name: 'Carnaval', type: 'national' },
      ];

      const date = new Date('2024-01-02');
      const result = holidaysClient.isHoliday(date, holidays);

      expect(result).toBe(false);
    });

    it('should handle date with time component', () => {
      const holidays = [
        { date: '2024-01-01', name: 'Confraternização Mundial', type: 'national' },
      ];

      const date = new Date('2024-01-01T12:00:00');
      const result = holidaysClient.isHoliday(date, holidays);

      expect(result).toBe(true);
    });
  });

  describe('isHolidayDate', () => {
    it('should return true for holiday date', async () => {
      const mockHolidays = [
        { date: '2024-01-01', name: 'Confraternização Mundial', type: 'national' },
      ];

      (axios.get as jest.Mock).mockResolvedValue({ data: mockHolidays });

      const date = new Date('2024-01-01');
      const result = await holidaysClient.isHolidayDate(date);

      expect(result).toBe(true);
    });

    it('should return false for non-holiday date', async () => {
      const mockHolidays = [
        { date: '2024-01-01', name: 'Confraternização Mundial', type: 'national' },
      ];

      (axios.get as jest.Mock).mockResolvedValue({ data: mockHolidays });

      const date = new Date('2024-01-02');
      const result = await holidaysClient.isHolidayDate(date);

      expect(result).toBe(false);
    });

    it('should return false on API error', async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error('API error'));

      const date = new Date('2024-01-01');
      const result = await holidaysClient.isHolidayDate(date);

      expect(result).toBe(false);
    });
  });

  describe('Circuit Breaker Integration', () => {
    it('should use circuit breaker in getHolidays', async () => {
      const mockHolidays = [
        { date: '2024-01-01', name: 'Confraternização Mundial', type: 'national' },
      ];

      (axios.get as jest.Mock).mockResolvedValue({ data: mockHolidays });

      await holidaysClient.getHolidays(2024);

      const state = holidaysClient.getCircuitBreakerState();
      expect(state.failureCount).toBe(0);
      expect(state.isOpen).toBe(false);
    });

    it('should open circuit after repeated failures', async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error('API error'));

      // Trigger multiple failures to open circuit
      for (let i = 0; i < 6; i++) {
        try {
          await holidaysClient.getHolidays(2024);
        } catch (error) {
          // Expected to fail
        }
      }

      const state = holidaysClient.getCircuitBreakerState();
      expect(state.isOpen).toBe(true);
      expect(state.failureCount).toBeGreaterThanOrEqual(5);
    });

    it('should reset circuit breaker', () => {
      holidaysClient.resetCircuitBreaker();

      const state = holidaysClient.getCircuitBreakerState();
      expect(state.isOpen).toBe(false);
      expect(state.failureCount).toBe(0);
    });

    it('should get circuit breaker state', () => {
      const state = holidaysClient.getCircuitBreakerState();

      expect(state).toHaveProperty('isOpen');
      expect(state).toHaveProperty('failureCount');
    });
  });
});
