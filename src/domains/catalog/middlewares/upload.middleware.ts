import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuração de storage para fotos de produtos
const productStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // Usar diretório temporário para criação de produto
    const uploadDir = path.join(process.cwd(), 'uploads', 'products', 'temp');

    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Nome único com timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `foto-${uniqueSuffix}${ext}`);
  },
});

// Filtro para validar tipo de arquivo
const productFileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo inválido. Apenas JPG, PNG e WEBP são permitidos.'));
  }
};

// Configuração do Multer para fotos de produtos
export const uploadProductPhoto = multer({
  storage: productStorage,
  fileFilter: productFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single('photo');
