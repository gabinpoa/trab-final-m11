import { ViaCEPClient, CircuitBreaker, RetryWithBackoff } from './viaCep.client';
import axios from 'axios';

// Mock dependencies
jest.mock('axios');
jest.mock('../../../shared/config/env');
jest.mock('../../../shared/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

describe('ViaCEPClient', () => {
  let viaCEPClient: ViaCEPClient;

  beforeEach(() => {
    viaCEPClient = new ViaCEPClient();
    jest.clearAllMocks();
  });

  describe('getAddress', () => {
    it('should return address for valid CEP', async () => {
      const mockAddress = {
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        complemento: '',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP',
        ibge: '3550308',
        gia: '1004',
        ddd: '11',
        siafi: '7107',
      };

      (axios.get as jest.Mock).mockResolvedValue({ data: mockAddress });

      const result = await viaCEPClient.getAddress('01310100');

      expect(result).toEqual(mockAddress);
      expect(axios.get).toHaveBeenCalledWith(
        'https://viacep.com.br/ws/01310100/json',
        { timeout: 3000 }
      );
    });

    it('should throw error for invalid CEP format', async () => {
      await expect(viaCEPClient.getAddress('123')).rejects.toThrow('Invalid CEP format');
    });

    it('should throw error for CEP not found', async () => {
      (axios.get as jest.Mock).mockResolvedValue({ data: { erro: true } });

      await expect(viaCEPClient.getAddress('00000000')).rejects.toThrow('CEP not found');
    });

    it('should clean CEP format', async () => {
      const mockAddress = {
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        complemento: '',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP',
        ibge: '3550308',
        gia: '1004',
        ddd: '11',
        siafi: '7107',
      };

      (axios.get as jest.Mock).mockResolvedValue({ data: mockAddress });

      await viaCEPClient.getAddress('01310-100');

      expect(axios.get).toHaveBeenCalledWith(
        'https://viacep.com.br/ws/01310100/json',
        { timeout: 3000 }
      );
    });
  });

  describe('Circuit Breaker', () => {
    it('should open circuit after threshold failures', async () => {
      const circuitBreaker = new CircuitBreaker(2, 1000);
      const failingFn = jest.fn().mockRejectedValue(new Error('API error'));

      await expect(circuitBreaker.execute(failingFn)).rejects.toThrow('API error');
      await expect(circuitBreaker.execute(failingFn)).rejects.toThrow('API error');

      // Circuit should be open now
      await expect(circuitBreaker.execute(failingFn)).rejects.toThrow('Circuit breaker is OPEN');

      const state = circuitBreaker.getState();
      expect(state.isOpen).toBe(true);
      expect(state.failureCount).toBe(2);
    });

    it('should close circuit after timeout', async () => {
      const circuitBreaker = new CircuitBreaker(2, 100); // 100ms timeout
      const failingFn = jest.fn().mockRejectedValue(new Error('API error'));

      await expect(circuitBreaker.execute(failingFn)).rejects.toThrow('API error');
      await expect(circuitBreaker.execute(failingFn)).rejects.toThrow('API error');

      // Wait for timeout
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Circuit should be closed now
      const successFn = jest.fn().mockResolvedValue('success');
      const result = await circuitBreaker.execute(successFn);

      expect(result).toBe('success');
      expect(circuitBreaker.getState().isOpen).toBe(false);
    });

    it('should reset circuit breaker', () => {
      const circuitBreaker = new CircuitBreaker(2, 1000);
      circuitBreaker['state'] = {
        isOpen: true,
        failureCount: 5,
        lastFailureTime: Date.now(),
        nextAttemptTime: Date.now() + 60000,
      };

      circuitBreaker.reset();

      const state = circuitBreaker.getState();
      expect(state.isOpen).toBe(false);
      expect(state.failureCount).toBe(0);
    });

    it('should get circuit breaker state', () => {
      const circuitBreaker = new CircuitBreaker(2, 1000);
      const state = circuitBreaker.getState();

      expect(state).toHaveProperty('isOpen');
      expect(state).toHaveProperty('failureCount');
      expect(state).toHaveProperty('lastFailureTime');
      expect(state).toHaveProperty('nextAttemptTime');
    });
  });

  describe('Retry with Backoff', () => {
    it('should retry on failure with exponential backoff', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('API error'))
        .mockRejectedValueOnce(new Error('API error'))
        .mockResolvedValue('success');

      const result = await RetryWithBackoff.execute(mockFn, 3, 10);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('API error'));

      await expect(RetryWithBackoff.execute(mockFn, 2, 10)).rejects.toThrow('API error');
      expect(mockFn).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    it('should not retry on first success', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      const result = await RetryWithBackoff.execute(mockFn, 3, 10);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('ViaCEPClient Circuit Breaker Integration', () => {
    it('should use circuit breaker in getAddress', async () => {
      const mockAddress = {
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        complemento: '',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP',
        ibge: '3550308',
        gia: '1004',
        ddd: '11',
        siafi: '7107',
      };

      (axios.get as jest.Mock).mockResolvedValue({ data: mockAddress });

      await viaCEPClient.getAddress('01310100');

      const state = viaCEPClient.getCircuitBreakerState();
      expect(state.failureCount).toBe(0);
      expect(state.isOpen).toBe(false);
    });

    it('should reset circuit breaker', () => {
      viaCEPClient.resetCircuitBreaker();

      const state = viaCEPClient.getCircuitBreakerState();
      expect(state.isOpen).toBe(false);
      expect(state.failureCount).toBe(0);
    });

    it('should get circuit breaker state', () => {
      const state = viaCEPClient.getCircuitBreakerState();

      expect(state).toHaveProperty('isOpen');
      expect(state).toHaveProperty('failureCount');
    });
  });
});
