import { Request, Response, NextFunction } from 'express';
import path from 'path';

// Middleware para sanitizar nomes de arquivos e prevenir path traversal
export const sanitizeFilename = (req: Request, res: Response, next: NextFunction) => {
  const file = req.file as Express.Multer.File;
  
  if (!file) {
    return next();
  }

  try {
    // Verificar se o nome do arquivo contém path traversal
    const filename = file.originalname;
    const normalized = path.normalize(filename);
    
    // Se o nome normalizado for diferente do original, há path traversal
    if (normalized !== filename) {
      return res.status(400).json({
        message: 'Invalid filename. Path traversal is not allowed.',
      });
    }

    // Verificar se o nome contém caracteres perigosos
    const dangerousChars = ['..', '/', '\\', '\0'];
    const hasDangerousChars = dangerousChars.some(char => filename.includes(char));
    
    if (hasDangerousChars) {
      return res.status(400).json({
        message: 'Invalid filename. Dangerous characters are not allowed.',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: 'Error sanitizing filename.',
    });
  }
};

// Middleware para validar order ID e prevenir path traversal no caminho
export const validateOrderId = (req: Request, res: Response, next: NextFunction): void => {
  const orderId = req.params.orderId || req.body.orderId;
  
  if (!orderId) {
    res.status(400).json({
      message: 'Order ID is required.',
    });
    return;
  }

  try {
    // Verificar se o order ID contém path traversal
    const normalized = path.normalize(orderId);
    
    if (normalized !== orderId) {
      res.status(400).json({
        message: 'Invalid order ID. Path traversal is not allowed.',
      });
      return;
    }

    // Verificar se o order ID contém caracteres perigosos
    const dangerousChars = ['..', '/', '\\', '\0'];
    const hasDangerousChars = dangerousChars.some(char => orderId.includes(char));
    
    if (hasDangerousChars) {
      res.status(400).json({
        message: 'Invalid order ID. Dangerous characters are not allowed.',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      message: 'Error validating order ID.',
    });
  }
};
