import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';

export const validateProductImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Foto do produto é obrigatória' });
      return;
    }

    // Validar resolução mínima (72dpi para web)
    const metadata = await sharp(req.file.path).metadata();

    if (!metadata.width || !metadata.height) {
      res.status(400).json({ message: 'Não foi possível ler as dimensões da imagem' });
      return;
    }

    // Resolução mínima para exibição web (300x300 pixels)
    if (metadata.width < 300 || metadata.height < 300) {
      // Remover arquivo inválido
      const fs = require('fs');
      fs.unlinkSync(req.file.path);

      res.status(400).json({
        message: 'Resolução mínima da imagem deve ser 300x300 pixels',
        currentResolution: `${metadata.width}x${metadata.height}`,
      });
      return;
    }

    // Validar MIME type real (não apenas extensão)
    const mimeType = await sharp(req.file.path).metadata().then(m => m.format);

    if (!['jpeg', 'png', 'webp'].includes(mimeType || '')) {
      const fs = require('fs');
      fs.unlinkSync(req.file.path);

      res.status(400).json({ message: 'Formato de arquivo inválido' });
      return;
    }

    next();
  } catch (error) {
    // Remover arquivo em caso de erro
    if (req.file) {
      const fs = require('fs');
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ message: 'Erro ao validar imagem' });
  }
};
