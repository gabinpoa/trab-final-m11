import { SagaContext, SagaStep } from '../types';
import viaCepClient from '../../../integrations/clients/viaCep.client';
import logger from '../../../../shared/utils/logger';

export class CalculateFreightStep implements SagaStep {
  name = 'CalculateFreight';

  async execute(context: SagaContext): Promise<void> {
    const { cep } = context;

    if (!cep) {
      throw new Error('CEP is required for freight calculation');
    }

    try {
      const address = await viaCepClient.getAddress(cep);

      if (!address || !address.uf) {
        throw new Error('Invalid CEP or unable to determine state');
      }

      // Calcular frete baseado na UF (simplificado para MVP)
      const freight = this.calculateFreightByUF(address.uf);

      context.freight = freight;

      logger.info({
        cep,
        uf: address.uf,
        freight,
      }, 'Freight calculated');
    } catch (error) {
      logger.error({ cep, error }, 'Failed to calculate freight');
      throw new Error(`Failed to calculate freight: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async compensate(context: SagaContext): Promise<void> {
    // Não há nada para compensar no cálculo de frete
    // O frete é apenas um valor calculado, não tem efeito colateral
    logger.info({ orderId: context.orderId }, 'Freight calculation compensation (no-op)');
  }

  private calculateFreightByUF(uf: string): number {
    // Tabela de frete por UF (simplificada para MVP)
    const freightTable: Record<string, number> = {
      'SP': 15.00,
      'RJ': 20.00,
      'MG': 18.00,
      'RS': 25.00,
      'PR': 22.00,
      'SC': 23.00,
      'BA': 28.00,
      'PE': 30.00,
      'CE': 32.00,
      'MA': 35.00,
      'PI': 38.00,
      'RN': 40.00,
      'PB': 42.00,
      'AL': 45.00,
      'SE': 48.00,
      'TO': 50.00,
      'GO': 35.00,
      'DF': 20.00,
      'ES': 25.00,
      'MT': 40.00,
      'MS': 45.00,
      'AM': 60.00,
      'RR': 70.00,
      'AP': 80.00,
      'AC': 90.00,
      'RO': 85.00,
    };

    return freightTable[uf.toUpperCase()] || 30.00; // Valor padrão
  }
}
