import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductsPage from './ProductsPage';
import { useCartStore } from '../stores/cartStore';
import { productService } from '../services/productService';

// Mock do cartStore
vi.mock('../stores/cartStore');
// Mock do productService
vi.mock('../services/productService');

describe('ProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (component: React.ReactNode) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('deve mostrar estado de carregamento inicialmente', () => {
    const mockAddItem = vi.fn();
    vi.mocked(useCartStore).mockReturnValue({
      items: [],
      addItem: mockAddItem,
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
      getTotal: vi.fn(() => 0),
    } as any);

    vi.mocked(productService.getAll).mockImplementation(
      () => new Promise(() => {}) // Promise que nunca resolve
    );

    renderWithRouter(<ProductsPage />);
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });

  it('deve renderizar título da página após carregar produtos', async () => {
    const mockAddItem = vi.fn();
    vi.mocked(useCartStore).mockReturnValue({
      items: [],
      addItem: mockAddItem,
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
      getTotal: vi.fn(() => 0),
    } as any);

    const mockProducts = [
      {
        id: '1',
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        complexity: 1,
        category: 'camisetas',
        imageUrl: 'http://example.com/image.jpg',
        stock: 10,
      },
    ];

    vi.mocked(productService.getAll).mockResolvedValue(mockProducts);

    renderWithRouter(<ProductsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Catálogo de Produtos')).toBeInTheDocument();
    });
  });
});
