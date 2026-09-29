import { test, expect } from '@playwright/test';

test.describe('Catalog and Cart Flow', () => {
  test('deve renderizar página de catálogo - requer autenticação', async ({ page }) => {
    // Mock de autenticação
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'fake-jwt-token');
      localStorage.setItem('auth_user', JSON.stringify({ id: 1, email: 'test@test.com', name: 'Test User' }));
    });

    // Mock de API para produtos
    await page.route('**/api/products', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            name: 'Camiseta Personalizada',
            description: 'Camiseta de algodão com personalização',
            price: 49.90,
            complexity: 1,
            category: 'camisetas',
            imageUrl: 'http://localhost:3000/uploads/products/1/foto.jpg',
            stock: 10
          }
        ])
      });
    });

    await page.goto('/products');
    await expect(page.getByRole('heading', { name: 'Catálogo de Produtos' })).toBeVisible();
  });

  test('deve mostrar lista de produtos - requer autenticação', async ({ page }) => {
    // Mock de autenticação
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'fake-jwt-token');
      localStorage.setItem('auth_user', JSON.stringify({ id: 1, email: 'test@test.com', name: 'Test User' }));
    });

    // Mock de API para produtos
    await page.route('**/api/products', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            name: 'Camiseta Personalizada',
            description: 'Camiseta de algodão com personalização',
            price: 49.90,
            complexity: 1,
            category: 'camisetas',
            imageUrl: 'http://localhost:3000/uploads/products/1/foto.jpg',
            stock: 10
          }
        ])
      });
    });

    await page.goto('/products');
    await expect(page.getByText('Camiseta Personalizada')).toBeVisible();
  });
});
