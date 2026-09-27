import prisma from '../../../shared/config/database';
import { Product, Prisma } from '@prisma/client';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(options?: { skip?: number; take?: number; categoryId?: string }): Promise<Product[]>;
  findByCategory(categoryId: string): Promise<Product[]>;
  search(query: string): Promise<Product[]>;
  create(data: Prisma.ProductCreateInput): Promise<Product>;
  update(id: string, data: Prisma.ProductUpdateInput): Promise<Product>;
  delete(id: string): Promise<Product>;
}

export class ProductRepository implements IProductRepository {
  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  async findAll(options?: { skip?: number; take?: number; categoryId?: string }): Promise<Product[]> {
    const where = options?.categoryId ? { categoryId: options.categoryId } : {};

    return prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      skip: options?.skip || 0,
      take: options?.take || 10,
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    return prisma.product.findMany({
      where: { categoryId },
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async search(query: string): Promise<Product[]> {
    return prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({
      data,
      include: {
        category: true,
      },
    });
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async delete(id: string): Promise<Product> {
    return prisma.product.delete({
      where: { id },
    });
  }
}

export default new ProductRepository();
