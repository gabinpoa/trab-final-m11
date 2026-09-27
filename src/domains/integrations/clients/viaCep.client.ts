import axios from 'axios';
import { config } from '../../../shared/config/env';
import logger from '../../../shared/utils/logger';

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

class CircuitBreaker {
  private threshold: number = 5;
  private timeout: number = 60000; // 1 minute
  private state: CircuitBreakerState = {
    isOpen: false,
    failureCount: 0,
    lastFailureTime: 0,
    nextAttemptTime: 0,
  };

  constructor(threshold?: number, timeout?: number) {
    if (threshold) this.threshold = threshold;
    if (timeout) this.timeout = timeout;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state.isOpen) {
      if (Date.now() < this.state.nextAttemptTime) {
        throw new Error('Circuit breaker is OPEN');
      } else {
        // Try to close the circuit
        this.state.isOpen = false;
        this.state.failureCount = 0;
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.state.failureCount = 0;
    this.state.isOpen = false;
  }

  private onFailure() {
    this.state.failureCount++;
    this.state.lastFailureTime = Date.now();

    if (this.state.failureCount >= this.threshold) {
      this.state.isOpen = true;
      this.state.nextAttemptTime = Date.now() + this.timeout;
      logger.warn('Circuit breaker opened due to repeated failures');
    }
  }

  getState() {
    return { ...this.state };
  }

  reset() {
    this.state = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0,
    };
  }
}

class RetryWithBackoff {
  static async execute<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          throw lastError;
        }

        const delay = baseDelay * Math.pow(2, attempt);
        logger.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export class ViaCEPClient {
  private circuitBreaker: CircuitBreaker;
  private baseURL: string = 'https://viacep.com.br/ws';
  private timeout: number;

  constructor() {
    this.circuitBreaker = new CircuitBreaker(5, 60000);
    this.timeout = config.externalApis.viaCepTimeout;
  }

  async getAddress(cep: string): Promise<ViaCEPResponse> {
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      throw new Error('Invalid CEP format');
    }

    return this.circuitBreaker.execute(async () => {
      return RetryWithBackoff.execute(async () => {
        const response = await axios.get<ViaCEPResponse>(
          `${this.baseURL}/${cleanCep}/json`,
          {
            timeout: this.timeout,
          }
        );

        if (response.data.erro) {
          throw new Error('CEP not found');
        }

        return response.data;
      }, 3, 1000);
    });
  }

  getCircuitBreakerState() {
    return this.circuitBreaker.getState();
  }

  resetCircuitBreaker() {
    this.circuitBreaker.reset();
  }
}

export { CircuitBreaker, RetryWithBackoff };
export default new ViaCEPClient();
