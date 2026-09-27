import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export class ImageProcessingService {
  /**
   * Gerar thumbnail de uma imagem
   * @param imagePath Caminho da imagem original
   * @param outputPath Caminho onde o thumbnail será salvo
   * @param size Tamanho do thumbnail (padrão: 200x200)
   */
  static async generateThumbnail(
    imagePath: string,
    outputPath: string,
    size: { width: number; height: number } = { width: 200, height: 200 }
  ): Promise<void> {
    try {
      await sharp(imagePath)
        .resize(size.width, size.height, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toFile(outputPath);
    } catch (error) {
      throw new Error(`Failed to generate thumbnail: ${error}`);
    }
  }

  /**
   * Comprimir imagem para reduzir tamanho
   * @param imagePath Caminho da imagem original
   * @param outputPath Caminho onde a imagem comprimida será salva
   * @param quality Qualidade da compressão (padrão: 80)
   */
  static async compressImage(
    imagePath: string,
    outputPath: string,
    quality: number = 80
  ): Promise<void> {
    try {
      const metadata = await sharp(imagePath).metadata();
      
      if (!metadata.format) {
        throw new Error('Unable to determine image format');
      }

      // Comprimir baseado no formato
      if (metadata.format === 'jpeg') {
        await sharp(imagePath)
          .jpeg({ quality })
          .toFile(outputPath);
      } else if (metadata.format === 'png') {
        await sharp(imagePath)
          .png({ quality })
          .toFile(outputPath);
      } else if (metadata.format === 'webp') {
        await sharp(imagePath)
          .webp({ quality })
          .toFile(outputPath);
      } else {
        // Se não for um formato suportado, apenas copiar
        fs.copyFileSync(imagePath, outputPath);
      }
    } catch (error) {
      throw new Error(`Failed to compress image: ${error}`);
    }
  }

  /**
   * Obter metadados de uma imagem
   * @param imagePath Caminho da imagem
   */
  static async getImageMetadata(imagePath: string): Promise<any> {
    try {
      return await sharp(imagePath).metadata();
    } catch (error) {
      throw new Error(`Failed to get image metadata: ${error}`);
    }
  }

  /**
   * Processar imagem completa (thumbnail + compressão)
   * @param imagePath Caminho da imagem original
   * @param outputDir Diretório de saída
   * @param filename Nome do arquivo
   */
  static async processImage(
    imagePath: string,
    outputDir: string,
    filename: string
  ): Promise<{ original: string; thumbnail: string; compressed: string }> {
    try {
      // Criar diretório de saída se não existir
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const ext = path.extname(filename);
      const nameWithoutExt = path.basename(filename, ext);

      // Caminhos de saída
      const originalPath = path.join(outputDir, `${nameWithoutExt}-original${ext}`);
      const thumbnailPath = path.join(outputDir, `${nameWithoutExt}-thumbnail${ext}`);
      const compressedPath = path.join(outputDir, `${nameWithoutExt}-compressed${ext}`);

      // Copiar original
      fs.copyFileSync(imagePath, originalPath);

      // Gerar thumbnail
      await this.generateThumbnail(imagePath, thumbnailPath);

      // Comprimir imagem
      await this.compressImage(imagePath, compressedPath);

      return {
        original: originalPath,
        thumbnail: thumbnailPath,
        compressed: compressedPath,
      };
    } catch (error) {
      throw new Error(`Failed to process image: ${error}`);
    }
  }
}
