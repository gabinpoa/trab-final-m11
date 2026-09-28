import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { generateShortId } from '../../../shared/utils/idGenerator';
import prisma from '../../../shared/config/database';
import { QRCodeResponseDto } from '../dto/qrcode.dto';

// Cache em memória para QR Codes gerados
const qrCodeCache = new Map<string, string>();

export class QRCodeService {
  /**
   * Gerar QR Code para um pedido
   */
  async generateQRCode(orderId: string): Promise<QRCodeResponseDto> {
    try {
      // Verificar se o pedido existe
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Verificar se já existe QR Code em cache
      if (qrCodeCache.has(orderId)) {
        const cachedData = JSON.parse(qrCodeCache.get(orderId)!);
        return cachedData;
      }

      // Gerar ou usar trackingCode existente
      let trackingCode = order.trackingCode;
      if (!trackingCode) {
        trackingCode = this.generateTrackingCode(orderId);
        
        // Atualizar pedido com trackingCode
        await prisma.order.update({
          where: { id: orderId },
          data: { trackingCode },
        });
      }

      // Definir URL de rastreamento
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const trackingUrl = `${baseUrl}/rastreamento/${trackingCode}`;

      // Criar diretório de QR Codes se não existir
      const qrCodeDir = path.join(process.cwd(), 'uploads', 'qrcodes');
      if (!fs.existsSync(qrCodeDir)) {
        fs.mkdirSync(qrCodeDir, { recursive: true });
      }

      // Caminho do arquivo QR Code
      const qrCodePath = path.join(qrCodeDir, `${orderId}.png`);

      // Gerar QR Code
      await QRCode.toFile(qrCodePath, trackingUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      // URL do QR Code
      const qrCodeUrl = `/uploads/qrcodes/${orderId}.png`;

      // Criar DTO de resposta
      const response: QRCodeResponseDto = {
        orderId,
        qrCodeUrl,
        trackingCode,
        trackingUrl,
      };

      // Salvar em cache
      qrCodeCache.set(orderId, JSON.stringify(response));

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Gerar código único de rastreamento
   */
  private generateTrackingCode(orderId: string): string {
    // Usar gerador de ID curto para garantir unicidade
    return generateShortId();
  }

  /**
   * Buscar informações de rastreamento por código
   */
  async getTrackingInfo(trackingCode: string): Promise<any> {
    try {
      // Buscar pedido pelo tracking code
      const order = await prisma.order.findFirst({
        where: { trackingCode },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customizations: true,
          productionQueue: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
          history: {
            orderBy: {
              changedAt: 'desc',
            },
          },
        },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      return {
        orderId: order.id,
        status: order.status,
        total: order.total,
        freight: order.freight,
        deliveryDate: order.deliveryDate,
        createdAt: order.createdAt,
        items: order.items.map((item: any) => ({
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
        customizations: order.customizations.map((customization: any) => ({
          filename: customization.filename,
          thumbnailUrl: `/uploads/customizations/${order.id}/thumbnails/${customization.filename}`,
        })),
        productionStage: order.productionQueue[0]?.stage || null,
        history: order.history.map((h: any) => ({
          status: h.status,
          changedAt: h.changedAt,
          changedBy: h.changedBy,
        })),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Limpar cache de QR Code
   */
  clearCache(orderId: string): void {
    qrCodeCache.delete(orderId);
  }

  /**
   * Limpar todo o cache
   */
  clearAllCache(): void {
    qrCodeCache.clear();
  }
}
