import axios from 'axios';
import { config } from '../../../shared/config/env';
import logger from '../../../shared/utils/logger';
import { CircuitBreaker, RetryWithBackoff } from './viaCep.client';

interface Holiday {
  date: string;
  name: string;
  type: string;
}

class HolidaysAPIClient {
  private circuitBreaker: CircuitBreaker;
  private baseURL: string = 'https://brasilapi.com.br/api/feriados/v1';
  private timeout: number;

  constructor() {
    this.circuitBreaker = new CircuitBreaker(5, 60000);
    this.timeout = config.externalApis.holidaysApiTimeout;
  }

  async getHolidays(year: number): Promise<Holiday[]> {
    return this.circuitBreaker.execute(async () => {
      return RetryWithBackoff.execute(async () => {
        const response = await axios.get<Holiday[]>(`${this.baseURL}/${year}`, {
          timeout: this.timeout,
        });

        return response.data;
      }, 2, 1000);
    });
  }

  isHoliday(date: Date, holidays: Holiday[]): boolean {
    const dateStr = date.toISOString().split('T')[0];
    return holidays.some((holiday) => holiday.date === dateStr);
  }

  async isHolidayDate(date: Date): Promise<boolean> {
    try {
      const year = date.getFullYear();
      const holidays = await this.getHolidays(year);
      return this.isHoliday(date, holidays);
    } catch (error) {
      logger.error({ error }, 'Error checking if date is holiday');
      return false;
    }
  }

  getCircuitBreakerState() {
    return this.circuitBreaker.getState();
  }

  resetCircuitBreaker() {
    this.circuitBreaker.reset();
  }
}

export default new HolidaysAPIClient();
