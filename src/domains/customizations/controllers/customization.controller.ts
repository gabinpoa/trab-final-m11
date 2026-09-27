import { Request, Response } from 'express';
import { CustomizationService } from '../services/customization.service';
import { uploadCustomization } from '../middlewares/upload.middleware';
import { validateMimeTypeReal } from '../middlewares/validation.middleware';
import { validateImageResolution } from '../middlewares/validation.middleware';
import { validateFileSize } from '../middlewares/validation.middleware';
import { sanitizeFilename } from '../middlewares/sanitization.middleware';
import { validateOrderId } from '../middlewares/sanitization.middleware';
import logger from '../../../shared/utils/logger';

// Interface para Request com requestId
interface CustomRequest extends Request {
  requestId?: string;
}

export class CustomizationController {
  private service: CustomizationService;

  constructor() {
    this.service = new CustomizationService();
  }

  /**
   * Upload de personalização
   */
  upload = [
    validateOrderId,
    uploadCustomization,
    sanitizeFilename,
    validateFileSize,
    validateMimeTypeReal,
    validateImageResolution,
    async (req: CustomRequest, res: Response): Promise<void> => {
      try {
        const file = req.file as Express.Multer.File;
        
        if (!file) {
          res.status(400).json({
            message: 'No file uploaded',
          });
          return;
        }

        const { orderId } = req.params;
        const { comment } = req.body;

        logger.info({
          requestId: req.requestId,
          orderId,
          filename: file.filename,
          size: file.size,
        }, 'Processing customization upload');

        const customization = await this.service.createCustomization(
          orderId,
          file.path,
          file.filename,
          comment
        );

        logger.info({
          requestId: req.requestId,
          customizationId: customization.id,
        }, 'Customization upload completed');

        res.status(201).json({
          id: customization.id,
          orderId: customization.orderId,
          filename: customization.filename,
          originalUrl: `/uploads/customizations/${orderId}/${customization.filename}`,
          thumbnailUrl: `/uploads/customizations/${orderId}/thumbnails/${customization.filename}`,
          compressedUrl: `/uploads/customizations/${orderId}/compressed/${customization.filename}`,
          comment: customization.comment,
          createdAt: customization.createdAt,
        });
      } catch (error) {
        logger.error({
          requestId: req.requestId,
          error: error instanceof Error ? error.message : 'Unknown error',
        }, 'Customization upload failed');

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
          error: process.env.NODE_ENV === 'development' ? error : undefined,
        });
      }
    },
  ];

  /**
   * Buscar personalização por ID
   */
  findById = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const customization = await this.service.findById(id);

      if (!customization) {
        res.status(404).json({
          message: 'Customization not found',
        });
        return;
      }

      res.json(customization);
    } catch (error) {
      logger.error({
        requestId: req.requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to fetch customization');

      res.status(500).json({
        message: 'Internal server error',
      });
    }
  };

  /**
   * Buscar personalizações por pedido
   */
  findByOrderId = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;

      const customizations = await this.service.findByOrderId(orderId);

      res.json(customizations);
    } catch (error) {
      logger.error({
        requestId: req.requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to fetch customizations');

      res.status(500).json({
        message: 'Internal server error',
      });
    }
  };

  /**
   * Deletar personalização
   */
  delete = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      await this.service.delete(id);

      res.status(204).send();
    } catch (error) {
      logger.error({
        requestId: req.requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Failed to delete customization');

      if (error instanceof Error) {
        if (error.message === 'Customization not found') {
          res.status(404).json({
            message: 'Customization not found',
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
