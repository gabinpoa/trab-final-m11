import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { generateId } from '../../../shared/utils/idGenerator';

// Configuração de storage para personalizações
const customizationStorage = multer.diskStorage({
  destination: (req: any, callback: any) => {
    // Extrair order ID dos parâmetros
    const orderId = req.params.orderId || req.body.orderId;
    
    if (!orderId) {
      return callback(new Error('Order ID is required'), '');
    }

    // Criar estrutura hierárquica: uploads/customizations/{orderId}/
    const uploadDir = path.join(process.cwd(), 'uploads', 'customizations', orderId);

    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    callback(null, uploadDir);
  },
  filename: (_req: any, file: any, callback: any) => {
    // Nome único com ID gerado para evitar conflitos
    const uniqueName = generateId();
    const ext = path.extname(file.originalname);
    callback(null, `customization-${uniqueName}${ext}`);
  },
});

// Filtro para validar tipo de arquivo (MIME type real será validado no middleware de validação)
const customizationFileFilter = (_req: any, file: any, cb: any) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo inválido. Apenas JPG, PNG, WEBP e PDF são permitidos.'));
  }
};

// Configuração do Multer para personalizações
export const uploadCustomization = multer({
  storage: customizationStorage,
  fileFilter: customizationFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
}).single('customization');
