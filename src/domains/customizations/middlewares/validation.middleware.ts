import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import sharp from 'sharp';

// Magic bytes para validar MIME type real
const magicBytes: Record<string, Buffer> = {
  'image/jpeg': Buffer.from([0xFF, 0xD8, 0xFF]),
  'image/png': Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
  'image/webp': Buffer.from([0x52, 0x49, 0x46, 0x46]),
  'application/pdf': Buffer.from([0x25, 0x50, 0x44, 0x46]),
};

// Função para validar MIME type real usando magic bytes
const validateMimeType = (filePath: string, declaredMime: string): boolean => {
  try {
    const buffer = fs.readFileSync(filePath);
    const expectedMagic = magicBytes[declaredMime];
    
    if (!expectedMagic) {
      return false;
    }

    // Verificar se os primeiros bytes correspondem ao magic byte esperado
    for (let i = 0; i < expectedMagic.length; i++) {
      if (buffer[i] !== expectedMagic[i]) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
};

// Função para validar resolução de imagem (mínimo 300dpi)
const validateImageResolutionInternal = async (filePath: string): Promise<boolean> => {
  try {
    const metadata = await sharp(filePath).metadata();
    
    if (!metadata.width || !metadata.height) {
      return false;
    }

    // Calcular DPI aproximado (assumindo 72 DPI padrão se não especificado)
    const dpi = metadata.density || 72;
    
    // Verificar se a resolução é pelo menos 300dpi
    return dpi >= 300;
  } catch (error) {
    return false;
  }
};

// Middleware para validação de MIME type real
export const validateMimeTypeReal = async (req: Request, res: Response, next: NextFunction) => {
  const file = req.file as Express.Multer.File;
  
  if (!file) {
    return next();
  }

  try {
    const isValid = validateMimeType(file.path, file.mimetype);
    
    if (!isValid) {
      // Remover arquivo inválido
      fs.unlinkSync(file.path);
      return res.status(400).json({
        message: 'Invalid file type. The file does not match its declared MIME type.',
      });
    }

    next();
  } catch (error) {
    // Remover arquivo em caso de erro
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return res.status(500).json({
      message: 'Error validating file type.',
    });
  }
};

// Middleware para validação de resolução de imagem
export const validateImageResolution = async (req: Request, res: Response, next: NextFunction) => {
  const file = req.file as Express.Multer.File;
  
  if (!file) {
    return next();
  }

  // PDF não precisa de validação de resolução
  if (file.mimetype === 'application/pdf') {
    return next();
  }

  try {
    const isValid = await validateImageResolutionInternal(file.path);
    
    if (!isValid) {
      // Remover arquivo com resolução insuficiente
      fs.unlinkSync(file.path);
      return res.status(400).json({
        message: 'Image resolution is too low. Minimum 300dpi required.',
      });
    }

    next();
  } catch (error) {
    // Remover arquivo em caso de erro
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return res.status(500).json({
      message: 'Error validating image resolution.',
    });
  }
};

// Middleware para validação de tamanho (já configurado no Multer, mas validação adicional)
export const validateFileSize = (req: Request, res: Response, next: NextFunction) => {
  const file = req.file as Express.Multer.File;
  
  if (!file) {
    return next();
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (file.size > maxSize) {
    // Remover arquivo muito grande
    fs.unlinkSync(file.path);
    return res.status(400).json({
      message: 'File size exceeds maximum limit of 10MB.',
    });
  }

  next();
};
