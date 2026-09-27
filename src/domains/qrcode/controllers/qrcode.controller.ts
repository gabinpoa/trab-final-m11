import { Response } from 'express';
import { QRCodeService } from '../services/qrcode.service';
import logger from '../../../shared/utils/logger';
import { AuthRequest } from '../../../shared/types/express';

export class QRCodeController {
  private service: QRCodeService;

  constructor() {
    this.service = new QRCodeService();
  }

  /**
   * Gerar QR Code para um pedido
   */
  generate = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const idStr = Array.isArray(id) ? id[0] : id;

      logger.info({
        requestId: (req as any).requestId,
        orderId: idStr,
      }, 'Generating QR code');

      const qrCodeData = await this.service.generateQRCode(idStr);

      logger.info({
        requestId: (req as any).requestId,
        orderId: idStr,
        trackingCode: qrCodeData.trackingCode,
      }, 'QR code generated successfully');

      res.json(qrCodeData);
    } catch (error) {
      logger.error({
        requestId: (req as any).requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to generate QR code');

      if (error instanceof Error) {
        if (error.message === 'Order not found') {
          res.status(404).json({
            message: 'Order not found',
          });
          return;
        }
      }

      res.status(500).json({
        message: 'Internal server error',
      });
    }
  };

  /**
   * Buscar informações de rastreamento
   */
  getTrackingInfo = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { code } = req.params;
      const codeStr = Array.isArray(code) ? code[0] : code;

      logger.info({
        requestId: (req as any).requestId,
        trackingCode: codeStr,
      }, 'Fetching tracking info');

      const trackingInfo = await this.service.getTrackingInfo(codeStr);

      res.json(trackingInfo);
    } catch (error) {
      logger.error({
        requestId: (req as any).requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to fetch tracking info');

      if (error instanceof Error) {
        if (error.message === 'Order not found') {
          res.status(404).json({
            message: 'Order not found',
          });
          return;
        }
      }

      res.status(500).json({
        message: 'Internal server error',
      });
    }
  };
}
