import { test, expect } from '@playwright/test';

test.describe('Orders Flow', () => {
  test('deve renderizar página de pedidos - requer autenticação', async ({ page }) => {
    // Mock de autenticação
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'fake-jwt-token');
      localStorage.setItem('auth_user', JSON.stringify({ id: 1, email: 'test@test.com', name: 'Test User' }));
    });

    // Mock de API para pedidos
    await page.route('**/api/orders/my', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            status: 'pending',
            total: 49.90,
            createdAt: '2024-01-15T10:00:00Z',
            items: [
              {
                productId: '1',
                productName: 'Camiseta Personalizada',
                quantity: 1,
                price: 49.90
              }
            ]
          }
        ])
      });
    });

    await page.goto('/orders');
    await expect(page.getByRole('heading', { name: 'Meus Pedidos' })).toBeVisible();
  });
});
