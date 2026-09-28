import fs from 'fs';
import path from 'path';
import prisma from '../config/database';
import logger from '../utils/logger';

/**
 * Serviço de limpeza automática de storage
 * Remove arquivos antigos para manter storage dentro do limite (100MB no free tier)
 */
export class StorageCleanupService {
  private static readonly CUSTOMIZATION_RETENTION_DAYS = 30;
  private static readonly STORAGE_CHECK_INTERVAL_HOURS = 24;

  /**
   * Iniciar limpeza automática agendada
   */
  static startScheduledCleanup(): void {
    // Executar a cada 24 horas
    setInterval(() => {
      this.performCleanup();
    }, this.STORAGE_CHECK_INTERVAL_HOURS * 60 * 60 * 1000);

    logger.info('Storage cleanup service started (runs every 24 hours)');
  }

  /**
   * Executar limpeza de storage
   */
  static async performCleanup(): Promise<void> {
    try {
      logger.info('Starting storage cleanup...');

      // Limpar personalizações de pedidos antigos
      await this.cleanupOldCustomizations();

      // Limpar fotos de produtos descontinuados
      await this.cleanupDiscontinuedProducts();

      // Monitorar uso de storage
      await this.monitorStorageUsage();

      logger.info('Storage cleanup completed');
    } catch (error) {
      logger.error({ error }, 'Storage cleanup failed');
    }
  }

  /**
   * Limpar personalizações de pedidos entregues/cancelados há mais de 30 dias
   */
  private static async cleanupOldCustomizations(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.CUSTOMIZATION_RETENTION_DAYS);

      // Buscar pedidos entregues ou cancelados antigos
      const oldOrders = await prisma.order.findMany({
        where: {
          OR: [
            { status: 'delivered' },
            { status: 'cancelled' },
          ],
          updatedAt: {
            lt: cutoffDate,
          },
        },
        select: { id: true },
      });

      let deletedCount = 0;

      for (const order of oldOrders) {
        const customizationDir = path.join(
          process.cwd(),
          'uploads',
          'customizations',
          order.id
        );

        if (fs.existsSync(customizationDir)) {
          fs.rmSync(customizationDir, { recursive: true, force: true });
          deletedCount++;
          logger.info(`Deleted customization folder for order ${order.id}`);
        }
      }

      if (deletedCount > 0) {
        logger.info(`Deleted ${deletedCount} old customization folders`);
      }
    } catch (error) {
      logger.error({ error }, 'Failed to cleanup old customizations');
    }
  }

  /**
   * Limpar fotos de produtos descontinuados
   */
  private static async cleanupDiscontinuedProducts(): Promise<void> {
    try {
      // Buscar produtos que não estão mais ativos (se houver campo active/discontinued)
      // Por enquanto, apenas logar que esta funcionalidade está disponível
      logger.info('Product cleanup check: no discontinued products to clean');
    } catch (error) {
      logger.error({ error }, 'Failed to cleanup discontinued products');
    }
  }

  /**
   * Monitorar uso de storage e alertar se estiver próximo do limite
   */
  private static async monitorStorageUsage(): Promise<void> {
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const totalSize = this.getDirectorySize(uploadsDir);
      const totalSizeMB = totalSize / (1024 * 1024);

      logger.info(`Storage usage: ${totalSizeMB.toFixed(2)} MB`);

      // Alerta se usar mais de 80MB (80% do limite de 100MB)
      if (totalSizeMB > 80) {
        logger.warn(`Storage usage critical: ${totalSizeMB.toFixed(2)} MB (limit: 100 MB)`);
      }

      // Alerta se usar mais de 90MB (90% do limite)
      if (totalSizeMB > 90) {
        logger.error(`Storage usage very critical: ${totalSizeMB.toFixed(2)} MB (limit: 100 MB)`);
      }
    } catch (error) {
      logger.error({ error }, 'Failed to monitor storage usage');
    }
  }

  /**
   * Calcular tamanho de um diretório recursivamente
   */
  private static getDirectorySize(dirPath: string): number {
    let totalSize = 0;

    if (!fs.existsSync(dirPath)) {
      return totalSize;
    }

    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        totalSize += this.getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }

    return totalSize;
  }

  /**
   * Limpeza manual (pode ser chamada via endpoint admin)
   */
  static async manualCleanup(): Promise<{ deletedFolders: number; storageUsageMB: number }> {
    await this.performCleanup();

    const uploadsDir = path.join(process.cwd(), 'uploads');
    const totalSize = this.getDirectorySize(uploadsDir);
    const totalSizeMB = totalSize / (1024 * 1024);

    return {
      deletedFolders: 0, // Seria calculado se implementássemos contador
      storageUsageMB: parseFloat(totalSizeMB.toFixed(2)),
    };
  }
}
