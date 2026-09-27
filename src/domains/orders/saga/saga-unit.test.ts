import { OrderSagaCoordinator } from './orderSagaCoordinator';
import { SagaContext, SagaStep } from './types';

describe('OrderSagaCoordinator Unit Tests', () => {
  let coordinator: OrderSagaCoordinator;

  beforeEach(() => {
    coordinator = new OrderSagaCoordinator();
  });

  describe('Fluxo da Saga', () => {
    it('should execute steps in correct order', async () => {
      const executionOrder: string[] = [];

      const step1: SagaStep = {
        name: 'Step1',
        execute: async (context: SagaContext) => {
          executionOrder.push('Step1');
        },
        compensate: async (context: SagaContext) => {
          executionOrder.push('Compensate-Step1');
        },
      };

      const step2: SagaStep = {
        name: 'Step2',
        execute: async (context: SagaContext) => {
          executionOrder.push('Step2');
        },
        compensate: async (context: SagaContext) => {
          executionOrder.push('Compensate-Step2');
        },
      };

      const step3: SagaStep = {
        name: 'Step3',
        execute: async (context: SagaContext) => {
          executionOrder.push('Step3');
        },
        compensate: async (context: SagaContext) => {
          executionOrder.push('Compensate-Step3');
        },
      };

      coordinator.addStep(step1);
      coordinator.addStep(step2);
      coordinator.addStep(step3);

      const context: SagaContext = {
        userId: 'user-1',
        items: [],
        cep: '01310-100',
        status: 'pending',
        completedSteps: [],
      };

      const result = await coordinator.execute(context);

      expect(result.success).toBe(true);
      expect(executionOrder).toEqual(['Step1', 'Step2', 'Step3']);
    });

    it('should compensate in reverse order on failure', async () => {
      const executionOrder: string[] = [];

      const step1: SagaStep = {
        name: 'Step1',
        execute: async (_context: SagaContext) => {
          executionOrder.push('Step1');
        },
        compensate: async (_context: SagaContext) => {
          executionOrder.push('Compensate-Step1');
        },
      };

      const step2: SagaStep = {
        name: 'Step2',
        execute: async (_context: SagaContext) => {
          executionOrder.push('Step2');
        },
        compensate: async (_context: SagaContext) => {
          executionOrder.push('Compensate-Step2');
        },
      };

      const step3: SagaStep = {
        name: 'Step3',
        execute: async (_context: SagaContext) => {
          executionOrder.push('Step3');
          throw new Error('Step3 failed');
        },
        compensate: async (_context: SagaContext) => {
          executionOrder.push('Compensate-Step3');
        },
      };

      coordinator.addStep(step1);
      coordinator.addStep(step2);
      coordinator.addStep(step3);

      const context: SagaContext = {
        userId: 'user-1',
        items: [],
        cep: '01310-100',
        status: 'pending',
        completedSteps: [],
      };

      const result = await coordinator.execute(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Step3');
      expect(context.failedStep).toBe('Step3');
      expect(context.completedSteps).toEqual(['Step1', 'Step2']);
      expect(executionOrder).toEqual(['Step1', 'Step2', 'Step3', 'Compensate-Step2', 'Compensate-Step1']);
    });

    it('should track completed steps correctly', async () => {
      const step1: SagaStep = {
        name: 'Step1',
        execute: async (_context: SagaContext) => {},
        compensate: async (_context: SagaContext) => {},
      };

      const step2: SagaStep = {
        name: 'Step2',
        execute: async (context: SagaContext) => {
          throw new Error('Step2 failed');
        },
        compensate: async (_context: SagaContext) => {},
      };

      coordinator.addStep(step1);
      coordinator.addStep(step2);

      const context: SagaContext = {
        userId: 'user-1',
        items: [],
        cep: '01310-100',
        status: 'pending',
        completedSteps: [],
      };

      await coordinator.execute(context);

      expect(context.completedSteps).toEqual(['Step1']);
    });
  });

  describe('Compensação', () => {
    it('should continue compensating even if one compensation fails', async () => {
      const compensationResults: boolean[] = [];

      const step1: SagaStep = {
        name: 'Step1',
        execute: async (_context: SagaContext) => {},
        compensate: async (context: SagaContext) => {
          compensationResults.push(true);
        },
      };

      const step2: SagaStep = {
        name: 'Step2',
        execute: async (_context: SagaContext) => {},
        compensate: async (context: SagaContext) => {
          compensationResults.push(false);
          throw new Error('Compensation failed');
        },
      };

      const step3: SagaStep = {
        name: 'Step3',
        execute: async (context: SagaContext) => {
          throw new Error('Step3 failed');
        },
        compensate: async (context: SagaContext) => {
          compensationResults.push(true);
        },
      };

      coordinator.addStep(step1);
      coordinator.addStep(step2);
      coordinator.addStep(step3);

      const context: SagaContext = {
        userId: 'user-1',
        items: [],
        cep: '01310-100',
        status: 'pending',
        completedSteps: [],
      };

      await coordinator.execute(context);

      expect(compensationResults).toHaveLength(2);
      expect(compensationResults).toContain(true);
      expect(compensationResults).toContain(false);
    });

    it('should handle compensation when no steps completed', async () => {
      const step1: SagaStep = {
        name: 'Step1',
        execute: async (context: SagaContext) => {
          throw new Error('Step1 failed');
        },
        compensate: async (_context: SagaContext) => {},
      };

      coordinator.addStep(step1);

      const context: SagaContext = {
        userId: 'user-1',
        items: [],
        cep: '01310-100',
        status: 'pending',
        completedSteps: [],
      };

      const result = await coordinator.execute(context);

      expect(result.success).toBe(false);
      expect(context.completedSteps).toEqual([]);
    });
  });

  describe('Context Management', () => {
    it('should update context status correctly', async () => {
      const step1: SagaStep = {
        name: 'Step1',
        execute: async (_context: SagaContext) => {
          expect(_context.status).toBe('in_progress');
        },
        compensate: async (_context: SagaContext) => {},
      };

      coordinator.addStep(step1);

      const context: SagaContext = {
        userId: 'user-1',
        items: [],
        cep: '01310-100',
        status: 'pending',
        completedSteps: [],
      };

      await coordinator.execute(context);

      expect(context.status).toBe('completed');
    });

    it('should set status to compensating on failure', async () => {
      const step1: SagaStep = {
        name: 'Step1',
        execute: async (_context: SagaContext) => {},
        compensate: async (_context: SagaContext) => {},
      };

      const step2: SagaStep = {
        name: 'Step2',
        execute: async (context: SagaContext) => {
          throw new Error('Step2 failed');
        },
        compensate: async (_context: SagaContext) => {},
      };

      coordinator.addStep(step1);
      coordinator.addStep(step2);

      const context: SagaContext = {
        userId: 'user-1',
        items: [],
        cep: '01310-100',
        status: 'pending',
        completedSteps: [],
      };

      await coordinator.execute(context);

      expect(context.status).toBe('failed');
    });
  });

  describe('Error Handling', () => {
    it('should return error message when step fails', async () => {
      const step1: SagaStep = {
        name: 'Step1',
        execute: async (context: SagaContext) => {
          throw new Error('Custom error message');
        },
        compensate: async (_context: SagaContext) => {},
      };

      coordinator.addStep(step1);

      const context: SagaContext = {
        userId: 'user-1',
        items: [],
        cep: '01310-100',
        status: 'pending',
        completedSteps: [],
      };

      const result = await coordinator.execute(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Custom error message');
      expect(result.error).toContain('Step1');
    });

    it('should handle unexpected errors gracefully', async () => {
      const step1: SagaStep = {
        name: 'Step1',
        execute: async (context: SagaContext) => {
          throw new Error('Unexpected error');
        },
        compensate: async (_context: SagaContext) => {},
      };

      coordinator.addStep(step1);

      const context: SagaContext = {
        userId: 'user-1',
        items: [],
        cep: '01310-100',
        status: 'pending',
        completedSteps: [],
      };

      const result = await coordinator.execute(context);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
