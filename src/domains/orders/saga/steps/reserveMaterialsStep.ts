import { SagaContext, SagaStep, MaterialReservation } from '../types';
import materialService from '../../../inventory/services/material.service';
import logger from '../../../../shared/utils/logger';

export class ReserveMaterialsStep implements SagaStep {
  name = 'ReserveMaterials';

  async execute(context: SagaContext): Promise<void> {
    // Calcular materiais necessários para cada produto
    // Para simplificar no MVP, vamos assumir que cada produto precisa de 1 material
    // Em produção, isso seria baseado em uma tabela de produto_material

    const reservations: MaterialReservation[] = [];

    for (const item of context.items) {
      // Simular: cada produto precisa de 1 unidade de material
      // Em produção, buscar na tabela de materiais necessários
      const materialId = this.getMaterialIdForProduct(item.productId);
      const quantity = item.quantity;

      const material = await materialService.getById(materialId);

      if (!material) {
        throw new Error(`Material not found for product ${item.productId}`);
      }

      if (material.quantity < quantity) {
        throw new Error(`Insufficient material ${material.name}. Available: ${material.quantity}, Required: ${quantity}`);
      }

      // Reservar material com lock otimista
      const updatedMaterial = await materialService.reserveSimple(materialId, quantity);

      reservations.push({
        materialId,
        quantity,
        originalVersion: material.version,
      });

      logger.info({
        materialId,
        quantity,
        newVersion: updatedMaterial.version,
      }, 'Material reserved');
    }

    context.materialReservations = reservations;
  }

  async compensate(context: SagaContext): Promise<void> {
    if (!context.materialReservations) {
      return;
    }

    logger.info({ orderId: context.orderId }, 'Compensating material reservations');

    for (const reservation of context.materialReservations) {
      try {
        await materialService.release(reservation.materialId, reservation.quantity);
        logger.info({
          materialId: reservation.materialId,
          quantity: reservation.quantity,
        }, 'Material reservation released');
      } catch (error) {
        logger.error({
          materialId: reservation.materialId,
          error,
        }, 'Failed to release material reservation');
      }
    }

    context.materialReservations = [];
  }

  private getMaterialIdForProduct(productId: string): string {
    // MVP: Simular mapeamento produto -> material
    // Em produção, buscar em tabela de relacionamento
    const productMaterialMap: Record<string, string> = {
      'prod-1': 'mat-1', // Camiseta -> Camiseta Algodão Branca
      'prod-2': 'mat-1', // Camiseta Premium -> Camiseta Algodão Branca
      'prod-3': 'mat-4', // Caneca -> Caneca Cerâmica
      'prod-4': 'mat-3', // Chaveiro -> Tinta para Impressão
    };

    return productMaterialMap[productId] || 'mat-1';
  }
}
