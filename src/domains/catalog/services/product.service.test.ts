import { ProductService } from './product.service';

// Mock dependencies
jest.mock('../repositories/product.repository');
jest.mock('../../../shared/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

describe('ProductService', () => {
  let productService: ProductService;

  beforeEach(() => {
    productService = new ProductService();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all products', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 100, complexity: 1, categoryId: '1' },
        { id: '2', name: 'Product 2', price: 200, complexity: 2, categoryId: '1' },
      ];

      const productRepository = require('../repositories/product.repository').default;
      productRepository.findAll = jest.fn().mockResolvedValue(mockProducts);

      const result = await productService.getAll();

      expect(result).toEqual(mockProducts);
      expect(productRepository.findAll).toHaveBeenCalled();
    });

    it('should return products with pagination options', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 100, complexity: 1, categoryId: '1' },
      ];

      const productRepository = require('../repositories/product.repository').default;
      productRepository.findAll = jest.fn().mockResolvedValue(mockProducts);

      const result = await productService.getAll({ skip: 0, take: 10 });

      expect(result).toEqual(mockProducts);
      expect(productRepository.findAll).toHaveBeenCalledWith({ skip: 0, take: 10 });
    });

    it('should return products filtered by category', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 100, complexity: 1, categoryId: '1' },
      ];

      const productRepository = require('../repositories/product.repository').default;
      productRepository.findAll = jest.fn().mockResolvedValue(mockProducts);

      const result = await productService.getAll({ categoryId: '1' });

      expect(result).toEqual(mockProducts);
      expect(productRepository.findAll).toHaveBeenCalledWith({ categoryId: '1' });
    });
  });

  describe('getById', () => {
    it('should return product by id', async () => {
      const mockProduct = { id: '1', name: 'Product 1', price: 100, complexity: 1, categoryId: '1' };

      const productRepository = require('../repositories/product.repository').default;
      productRepository.findById = jest.fn().mockResolvedValue(mockProduct);

      const result = await productService.getById('1');

      expect(result).toEqual(mockProduct);
      expect(productRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw error if product not found', async () => {
      const productRepository = require('../repositories/product.repository').default;
      productRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(productService.getById('1')).rejects.toThrow('Product not found');
    });
  });

  describe('getByCategory', () => {
    it('should return products by category', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 100, complexity: 1, categoryId: '1' },
        { id: '2', name: 'Product 2', price: 200, complexity: 2, categoryId: '1' },
      ];

      const productRepository = require('../repositories/product.repository').default;
      productRepository.findByCategory = jest.fn().mockResolvedValue(mockProducts);

      const result = await productService.getByCategory('1');

      expect(result).toEqual(mockProducts);
      expect(productRepository.findByCategory).toHaveBeenCalledWith('1');
    });
  });

  describe('search', () => {
    it('should return products matching search query', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 100, complexity: 1, categoryId: '1' },
      ];

      const productRepository = require('../repositories/product.repository').default;
      productRepository.search = jest.fn().mockResolvedValue(mockProducts);

      const result = await productService.search('Product');

      expect(result).toEqual(mockProducts);
      expect(productRepository.search).toHaveBeenCalledWith('Product');
    });
  });

  describe('create', () => {
    it('should create new product', async () => {
      const mockProduct = { id: '1', name: 'Product 1', price: 100, complexity: 1, categoryId: '1' };

      const productRepository = require('../repositories/product.repository').default;
      productRepository.create = jest.fn().mockResolvedValue(mockProduct);

      const result = await productService.create({
        name: 'Product 1',
        price: 100,
        categoryId: '1',
      });

      expect(result).toEqual(mockProduct);
      expect(productRepository.create).toHaveBeenCalledWith({
        name: 'Product 1',
        description: undefined,
        price: 100,
        complexity: 1,
        imageUrl: '',
        category: { connect: { id: '1' } },
      });
    });

    it('should create product with custom complexity', async () => {
      const mockProduct = { id: '1', name: 'Product 1', price: 100, complexity: 3, categoryId: '1' };

      const productRepository = require('../repositories/product.repository').default;
      productRepository.create = jest.fn().mockResolvedValue(mockProduct);

      const result = await productService.create({
        name: 'Product 1',
        price: 100,
        complexity: 3,
        categoryId: '1',
      });

      expect(result).toEqual(mockProduct);
      expect(productRepository.create).toHaveBeenCalledWith({
        name: 'Product 1',
        description: undefined,
        price: 100,
        complexity: 3,
        imageUrl: '',
        category: { connect: { id: '1' } },
      });
    });

    it('should create product with description', async () => {
      const mockProduct = { id: '1', name: 'Product 1', description: 'Description', price: 100, complexity: 1, categoryId: '1' };

      const productRepository = require('../repositories/product.repository').default;
      productRepository.create = jest.fn().mockResolvedValue(mockProduct);

      const result = await productService.create({
        name: 'Product 1',
        description: 'Description',
        price: 100,
        categoryId: '1',
      });

      expect(result).toEqual(mockProduct);
      expect(productRepository.create).toHaveBeenCalledWith({
        name: 'Product 1',
        description: 'Description',
        price: 100,
        complexity: 1,
        imageUrl: '',
        category: { connect: { id: '1' } },
      });
    });
  });

  describe('update', () => {
    it('should update product', async () => {
      const mockProduct = { id: '1', name: 'Product 1', price: 100, complexity: 1, categoryId: '1' };
      const mockUpdatedProduct = { id: '1', name: 'Updated Product', price: 150, complexity: 2, categoryId: '1' };

      const productRepository = require('../repositories/product.repository').default;
      productRepository.findById = jest.fn().mockResolvedValue(mockProduct);
      productRepository.update = jest.fn().mockResolvedValue(mockUpdatedProduct);

      const result = await productService.update('1', {
        name: 'Updated Product',
        price: 150,
        complexity: 2,
      });

      expect(result).toEqual(mockUpdatedProduct);
      expect(productRepository.update).toHaveBeenCalledWith('1', {
        name: 'Updated Product',
        price: 150,
        complexity: 2,
      });
    });

    it('should throw error if product not found', async () => {
      const productRepository = require('../repositories/product.repository').default;
      productRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(productService.update('1', { name: 'Updated' })).rejects.toThrow('Product not found');
    });

    it('should update only provided fields', async () => {
      const mockProduct = { id: '1', name: 'Product 1', price: 100, complexity: 1, categoryId: '1' };
      const mockUpdatedProduct = { id: '1', name: 'Updated Product', price: 100, complexity: 1, categoryId: '1' };

      const productRepository = require('../repositories/product.repository').default;
      productRepository.findById = jest.fn().mockResolvedValue(mockProduct);
      productRepository.update = jest.fn().mockResolvedValue(mockUpdatedProduct);

      const result = await productService.update('1', {
        name: 'Updated Product',
      });

      expect(result).toEqual(mockUpdatedProduct);
      expect(productRepository.update).toHaveBeenCalledWith('1', {
        name: 'Updated Product',
      });
    });

    it('should update category', async () => {
      const mockProduct = { id: '1', name: 'Product 1', price: 100, complexity: 1, categoryId: '1' };
      const mockUpdatedProduct = { id: '1', name: 'Product 1', price: 100, complexity: 1, categoryId: '2' };

      const productRepository = require('../repositories/product.repository').default;
      productRepository.findById = jest.fn().mockResolvedValue(mockProduct);
      productRepository.update = jest.fn().mockResolvedValue(mockUpdatedProduct);

      const result = await productService.update('1', {
        categoryId: '2',
      });

      expect(result).toEqual(mockUpdatedProduct);
      expect(productRepository.update).toHaveBeenCalledWith('1', {
        category: { connect: { id: '2' } },
      });
    });
  });

  describe('delete', () => {
    it('should delete product', async () => {
      const mockProduct = { id: '1', name: 'Product 1', price: 100, complexity: 1, categoryId: '1' };

      const productRepository = require('../repositories/product.repository').default;
      productRepository.findById = jest.fn().mockResolvedValue(mockProduct);
      productRepository.delete = jest.fn().mockResolvedValue(undefined);

      const result = await productService.delete('1');

      expect(result).toEqual({ message: 'Product deleted successfully' });
      expect(productRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw error if product not found', async () => {
      const productRepository = require('../repositories/product.repository').default;
      productRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(productService.delete('1')).rejects.toThrow('Product not found');
    });
  });

  describe('validateComplexity', () => {
    it('should return true for valid complexity', () => {
      expect(productService.validateComplexity(1)).toBe(true);
      expect(productService.validateComplexity(3)).toBe(true);
      expect(productService.validateComplexity(5)).toBe(true);
    });

    it('should return false for invalid complexity', () => {
      expect(productService.validateComplexity(0)).toBe(false);
      expect(productService.validateComplexity(6)).toBe(false);
      expect(productService.validateComplexity(-1)).toBe(false);
    });
  });
});
