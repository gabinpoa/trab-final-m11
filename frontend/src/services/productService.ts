import api from './api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  complexity: number;
  category: string;
  imageUrl?: string;
  stock: number;
}

export const productService = {
  async getAll(): Promise<Product[]> {
    const response = await api.get('/products');
    return response.data;
  },

  async getById(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async search(query: string): Promise<Product[]> {
    const response = await api.get(`/products/search?q=${query}`);
    return response.data;
  },

  async getByCategory(category: string): Promise<Product[]> {
    const response = await api.get(`/products/category/${category}`);
    return response.data;
  },
};
