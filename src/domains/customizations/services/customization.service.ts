import { CustomizationRepository } from '../repositories/customization.repository';
import { ImageProcessingService } from './imageProcessing.service';
import path from 'path';
import fs from 'fs';
import prisma from '../../../shared/config/database';
import { CreateCustomizationDto, CustomizationResponseDto } from '../dto/customization.dto';

export class CustomizationService {
  private repository: CustomizationRepository;

  constructor() {
    this.repository = new CustomizationRepository();
  }

  /**
   * Criar personalização com upload de arquivo
   */
  async createCustomization(
    orderId: string,
    filePath: string,
    filename: string,
    comment?: string
  ): Promise<CustomizationResponseDto> {
    try {
      // Verificar se o pedido existe
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Criar estrutura de diretórios
      const baseDir = path.join(process.cwd(), 'uploads', 'customizations', orderId);
      const thumbnailsDir = path.join(baseDir, 'thumbnails');
      const compressedDir = path.join(baseDir, 'compressed');

      // Criar diretórios se não existirem
      if (!fs.existsSync(thumbnailsDir)) {
        fs.mkdirSync(thumbnailsDir, { recursive: true });
      }
      if (!fs.existsSync(compressedDir)) {
        fs.mkdirSync(compressedDir, { recursive: true });
      }

      // Processar imagem (thumbnail + compressão)
      const processedPaths = await ImageProcessingService.processImage(
        filePath,
        baseDir,
        filename
      );

      // Salvar metadados no banco
      const customization = await this.repository.create({
        orderId,
        filename,
        originalPath: processedPaths.original,
        thumbnailPath: processedPaths.thumbnail,
        compressedPath: processedPaths.compressed,
        comment,
      });

      // Remover arquivo temporário original
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return this.toResponseDto(customization);
    } catch (error) {
      // Limpar arquivos em caso de erro
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }
  }

  /**
   * Buscar personalização por ID
   */
  async findById(id: string): Promise<CustomizationResponseDto | null> {
    const customization = await this.repository.findById(id);
    if (!customization) {
      return null;
    }
    return this.toResponseDto(customization);
  }

  /**
   * Buscar personalizações por pedido
   */
  async findByOrderId(orderId: string): Promise<CustomizationResponseDto[]> {
    const customizations = await this.repository.findByOrderId(orderId);
    return customizations.map(c => this.toResponseDto(c));
  }

  /**
   * Deletar personalização
   */
  async delete(id: string): Promise<void> {
    const customization = await this.repository.findById(id);
    
    if (!customization) {
      throw new Error('Customization not found');
    }

    // Deletar arquivos do sistema
    const filesToDelete = [
      customization.originalPath,
      customization.thumbnailPath,
      customization.compressedPath,
    ];

    for (const filePath of filesToDelete) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Deletar registro do banco
    await this.repository.delete(id);
  }

  /**
   * Converter para DTO de resposta
   */
  private toResponseDto(customization: any): CustomizationResponseDto {
    return {
      id: customization.id,
      orderId: customization.orderId,
      filename: customization.filename,
      originalPath: customization.originalPath,
      thumbnailPath: customization.thumbnailPath,
      compressedPath: customization.compressedPath,
      comment: customization.comment,
      createdAt: customization.createdAt,
      updatedAt: customization.updatedAt,
    };
  }
}
