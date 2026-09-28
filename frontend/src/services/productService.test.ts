import { describe, it, expect, beforeEach, vi } from 'vitest';
import { productService } from './productService';
import type { Product } from '../types';
import api from './api';

// Mock do api
vi.mock('./api');

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Product 1',
      description: 'Description 1',
      price: 100,
      complexity: 1,
      category: 'camisetas',
      imageUrl: 'http://example.com/image1.jpg',
      stock: 10,
    },
    {
      id: '2',
      name: 'Product 2',
      description: 'Description 2',
      price: 200,
      complexity: 2,
      category: 'canecas',
      imageUrl: 'http://example.com/image2.jpg',
      stock: 5,
    },
  ];

  describe('getAll', () => {
    it('deve retornar lista de produtos', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockProducts } as any);

      const result = await productService.getAll();

      expect(result).toEqual(mockProducts);
      expect(api.get).toHaveBeenCalledWith('/products');
    });

    it('deve lançar erro em caso de falha', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

      await expect(productService.getAll()).rejects.toThrow('Network error');
    });
  });

  describe('getById', () => {
    it('deve retornar produto por ID', async () => {
      const mockProduct = mockProducts[0];
      vi.mocked(api.get).mockResolvedValue({ data: mockProduct } as any);

      const result = await productService.getById('1');

      expect(result).toEqual(mockProduct);
      expect(api.get).toHaveBeenCalledWith('/products/1');
    });

    it('deve lançar erro em caso de falha', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Product not found'));

      await expect(productService.getById('1')).rejects.toThrow('Product not found');
    });
  });

  describe('search', () => {
    it('deve retornar produtos que correspondem à busca', async () => {
      const searchResults = [mockProducts[0]];
      vi.mocked(api.get).mockResolvedValue({ data: searchResults } as any);

      const result = await productService.search('Product 1');

      expect(result).toEqual(searchResults);
      expect(api.get).toHaveBeenCalledWith('/products/search?q=Product 1');
    });

    it('deve lançar erro em caso de falha', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Search failed'));

      await expect(productService.search('test')).rejects.toThrow('Search failed');
    });
  });

  describe('getByCategory', () => {
    it('deve retornar produtos por categoria', async () => {
      const categoryProducts = [mockProducts[0]];
      vi.mocked(api.get).mockResolvedValue({ data: categoryProducts } as any);

      const result = await productService.getByCategory('camisetas');

      expect(result).toEqual(categoryProducts);
      expect(api.get).toHaveBeenCalledWith('/products/category/camisetas');
    });

    it('deve lançar erro em caso de falha', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Category not found'));

      await expect(productService.getByCategory('camisetas')).rejects.toThrow('Category not found');
    });
  });
});
