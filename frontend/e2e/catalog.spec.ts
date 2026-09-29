import { test, expect } from '@playwright/test';

test.describe('Catalog and Cart Flow', () => {
  test.beforeEach(async ({ page }) => {
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
          },
          {
            id: '2',
            name: 'Caneca Personalizada',
            description: 'Caneca de cerâmica com personalização',
            price: 29.90,
            complexity: 1,
            category: 'canecas',
            imageUrl: 'http://localhost:3000/uploads/products/2/foto.jpg',
            stock: 15
          }
        ])
      });
    });
  });

  test('deve renderizar página de catálogo', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByText('Catálogo de Produtos')).toBeVisible();
  });

  test('deve mostrar lista de produtos', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByText('Camiseta Personalizada')).toBeVisible();
    await expect(page.getByText('Caneca Personalizada')).toBeVisible();
  });

  test('deve permitir buscar produtos', async ({ page }) => {
    await page.goto('/products');
    
    await page.getByPlaceholder(/buscar/i).fill('Camiseta');
    await page.getByRole('button', { name: /buscar/i }).click();
    
    await expect(page.getByText('Camiseta Personalizada')).toBeVisible();
    await expect(page.getByText('Caneca Personalizada')).not.toBeVisible();
  });

  test('deve adicionar produto ao carrinho', async ({ page }) => {
    await page.goto('/products');
    
    await page.getByText('Camiseta Personalizada')
      .locator('..')
      .getByRole('button', { name: /adicionar/i })
      .click();
    
    // Verifica se o carrinho foi atualizado (ajustar conforme implementação)
    await page.getByText('Carrinho').click();
    await expect(page.getByText('Camiseta Personalizada')).toBeVisible();
  });

  test('deve filtrar por categoria', async ({ page }) => {
    await page.goto('/products');
    
    await page.getByRole('combobox').selectOption('camisetas');
    
    await expect(page.getByText('Camiseta Personalizada')).toBeVisible();
    await expect(page.getByText('Caneca Personalizada')).not.toBeVisible();
  });
});
