import { validateProductImage } from './imageValidation.middleware';
import { NextFunction } from 'express';
import sharp from 'sharp';

// Mock dependencies
jest.mock('sharp');
jest.mock('fs', () => ({
  unlinkSync: jest.fn(),
}));

describe('Image Validation Middleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      file: {
        path: '/tmp/test-image.jpg',
      },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('validateProductImage', () => {
    it('should call next() for valid image', async () => {
      const mockMetadata = {
        width: 800,
        height: 600,
        format: 'jpeg',
      };

      (sharp as any).mockReturnValue({
        metadata: jest.fn().mockResolvedValue(mockMetadata),
      });

      await validateProductImage(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 400 if no file provided', async () => {
      mockReq.file = undefined;

      await validateProductImage(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Foto do produto é obrigatória' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 if image resolution is below minimum', async () => {
      const mockMetadata = {
        width: 200,
        height: 150,
        format: 'jpeg',
      };

      const fs = require('fs');
      fs.unlinkSync = jest.fn();

      (sharp as any).mockReturnValue({
        metadata: jest.fn().mockResolvedValue(mockMetadata),
      });

      await validateProductImage(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Resolução mínima da imagem deve ser 300x300 pixels',
        currentResolution: '200x150',
      });
      expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/test-image.jpg');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 if image dimensions cannot be read', async () => {
      const mockMetadata = {
        width: undefined,
        height: undefined,
        format: 'jpeg',
      };

      (sharp as any).mockReturnValue({
        metadata: jest.fn().mockResolvedValue(mockMetadata),
      });

      await validateProductImage(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Não foi possível ler as dimensões da imagem' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid MIME type', async () => {
      const mockMetadata = {
        width: 800,
        height: 600,
        format: 'pdf',
      };

      const fs = require('fs');
      fs.unlinkSync = jest.fn();

      (sharp as any).mockReturnValue({
        metadata: jest.fn()
          .mockResolvedValueOnce(mockMetadata)
          .mockResolvedValueOnce({ format: 'pdf' }),
      });

      await validateProductImage(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Formato de arquivo inválido' });
      expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/test-image.jpg');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should accept PNG format', async () => {
      const mockMetadata = {
        width: 800,
        height: 600,
        format: 'png',
      };

      (sharp as any).mockReturnValue({
        metadata: jest.fn()
          .mockResolvedValueOnce(mockMetadata)
          .mockResolvedValueOnce({ format: 'png' }),
      });

      await validateProductImage(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should accept WEBP format', async () => {
      const mockMetadata = {
        width: 800,
        height: 600,
        format: 'webp',
      };

      (sharp as any).mockReturnValue({
        metadata: jest.fn()
          .mockResolvedValueOnce(mockMetadata)
          .mockResolvedValueOnce({ format: 'webp' }),
      });

      await validateProductImage(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 500 on validation error', async () => {
      const fs = require('fs');
      fs.unlinkSync = jest.fn();

      (sharp as any).mockReturnValue({
        metadata: jest.fn().mockRejectedValue(new Error('Sharp error')),
      });

      await validateProductImage(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Erro ao validar imagem' });
      expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/test-image.jpg');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle missing MIME type gracefully', async () => {
      const mockMetadata = {
        width: 800,
        height: 600,
        format: undefined,
      };

      const fs = require('fs');
      fs.unlinkSync = jest.fn();

      (sharp as any).mockReturnValue({
        metadata: jest.fn()
          .mockResolvedValueOnce(mockMetadata)
          .mockResolvedValueOnce({ format: undefined }),
      });

      await validateProductImage(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Formato de arquivo inválido' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should accept exactly minimum resolution (300x300)', async () => {
      const mockMetadata = {
        width: 300,
        height: 300,
        format: 'jpeg',
      };

      (sharp as any).mockReturnValue({
        metadata: jest.fn().mockResolvedValue(mockMetadata),
      });

      await validateProductImage(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
