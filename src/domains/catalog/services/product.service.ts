import productRepository from '../repositories/product.repository';
import logger from '../../../shared/utils/logger';

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  complexity?: number;
  categoryId: string;
  imageUrl?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  complexity?: number;
  categoryId?: string;
  imageUrl?: string;
}

export class ProductService {
  async getAll(options?: { skip?: number; take?: number; categoryId?: string }) {
    try {
      return await productRepository.findAll(options);
    } catch (error) {
      logger.error({ error }, 'Error getting all products');
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const product = await productRepository.findById(id);
      if (!product) {
        throw new Error('Product not found');
      }
      return product;
    } catch (error) {
      logger.error({ error }, 'Error getting product by id');
      throw error;
    }
  }

  async getByCategory(categoryId: string) {
    try {
      return await productRepository.findByCategory(categoryId);
    } catch (error) {
      logger.error({ error }, 'Error getting products by category');
      throw error;
    }
  }

  async search(query: string) {
    try {
      return await productRepository.search(query);
    } catch (error) {
      logger.error({ error }, 'Error searching products');
      throw error;
    }
  }

  async create(dto: CreateProductDto) {
    try {
      const product = await productRepository.create({
        name: dto.name,
        description: dto.description,
        price: dto.price,
        complexity: dto.complexity || 1,
        imageUrl: dto.imageUrl || '',
        category: {
          connect: { id: dto.categoryId },
        },
      });

      logger.info(`Product created: ${product.name}`);
      return product;
    } catch (error) {
      logger.error({ error }, 'Error creating product');
      throw error;
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    try {
      const product = await productRepository.findById(id);
      if (!product) {
        throw new Error('Product not found');
      }

      const updatedProduct = await productRepository.update(id, {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.complexity !== undefined && { complexity: dto.complexity }),
        ...(dto.categoryId && {
          category: {
            connect: { id: dto.categoryId },
          },
        }),
      });

      logger.info(`Product updated: ${updatedProduct.name}`);
      return updatedProduct;
    } catch (error) {
      logger.error({ error }, 'Error updating product');
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const product = await productRepository.findById(id);
      if (!product) {
        throw new Error('Product not found');
      }

      await productRepository.delete(id);
      logger.info(`Product deleted: ${product.name}`);
      return { message: 'Product deleted successfully' };
    } catch (error) {
      logger.error({ error }, 'Error deleting product');
      throw error;
    }
  }

  validateComplexity(complexity: number): boolean {
    // Define complexity rules
    if (complexity < 1 || complexity > 5) {
      return false;
    }
    return true;
  }
}

export default new ProductService();
