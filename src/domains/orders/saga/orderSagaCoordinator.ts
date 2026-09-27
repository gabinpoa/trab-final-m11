import { SagaContext, SagaStep, SagaResult } from './types';
import logger from '../../../shared/utils/logger';

export class OrderSagaCoordinator {
  private steps: SagaStep[] = [];

  constructor() {
    this.steps = [];
  }

  addStep(step: SagaStep): void {
    this.steps.push(step);
  }

  async execute(context: SagaContext): Promise<SagaResult> {
    context.status = 'in_progress';
    context.completedSteps = [];

    logger.info({ orderId: context.orderId }, 'Starting order saga');

    try {
      for (const step of this.steps) {
        logger.info({ step: step.name, orderId: context.orderId }, 'Executing saga step');

        try {
          await step.execute(context);
          context.completedSteps.push(step.name);
          logger.info({ step: step.name, orderId: context.orderId }, 'Saga step completed');
        } catch (error) {
          logger.error({ step: step.name, orderId: context.orderId, error }, 'Saga step failed');
          context.failedStep = step.name;
          context.error = error as Error;
          context.status = 'compensating';

          // Compensate completed steps in reverse order
          await this.compensate(context);

          context.status = 'failed';
          return {
            success: false,
            error: `Saga failed at step: ${step.name}. Error: ${error instanceof Error ? error.message : String(error)}`,
          };
        }
      }

      context.status = 'completed';
      logger.info({ orderId: context.orderId }, 'Order saga completed successfully');

      return {
        success: true,
        orderId: context.orderId,
      };
    } catch (error) {
      logger.error({ orderId: context.orderId, error }, 'Unexpected error in saga');
      context.status = 'failed';
      context.error = error as Error;

      return {
        success: false,
        error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  private async compensate(context: SagaContext): Promise<void> {
    logger.info({ orderId: context.orderId }, 'Starting compensation');

    // Compensate in reverse order
    for (let i = context.completedSteps.length - 1; i >= 0; i--) {
      const stepName = context.completedSteps[i];
      const step = this.steps.find(s => s.name === stepName);

      if (step) {
        logger.info({ step: step.name, orderId: context.orderId }, 'Compensating step');

        try {
          await step.compensate(context);
          logger.info({ step: step.name, orderId: context.orderId }, 'Step compensated');
        } catch (error) {
          logger.error({ step: step.name, orderId: context.orderId, error }, 'Compensation failed');
          // Continue compensating other steps even if one fails
        }
      }
    }

    logger.info({ orderId: context.orderId }, 'Compensation completed');
  }
}
