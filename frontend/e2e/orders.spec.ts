import { test, expect } from '@playwright/test';

test.describe('Orders Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock de API para pedidos
    await page.route('**/api/orders', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            status: 'PENDING',
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
          },
          {
            id: '2',
            status: 'APPROVED',
            total: 79.80,
            createdAt: '2024-01-14T15:30:00Z',
            items: [
              {
                productId: '1',
                productName: 'Camiseta Personalizada',
                quantity: 2,
                price: 49.90
              }
            ]
          }
        ])
      });
    });
  });

  test('deve renderizar página de pedidos', async ({ page }) => {
    await page.goto('/orders');
    await expect(page.getByText('Meus Pedidos')).toBeVisible();
  });

  test('deve mostrar lista de pedidos', async ({ page }) => {
    await page.goto('/orders');
    
    await expect(page.getByText('PENDING')).toBeVisible();
    await expect(page.getByText('APPROVED')).toBeVisible();
  });

  test('deve mostrar detalhes do pedido ao clicar', async ({ page }) => {
    await page.goto('/orders');
    
    await page.getByText('PENDING').click();
    await expect(page.getByText('Camiseta Personalizada')).toBeVisible();
    await expect(page.getByText('49.90')).toBeVisible();
  });

  test('deve mostrar QR Code para rastreamento', async ({ page }) => {
    // Mock de API para QR Code
    await page.route('**/api/orders/1/qrcode', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          qrCodeUrl: 'http://localhost:3000/uploads/qrcodes/1.png',
          trackingCode: 'ABC123'
        })
      });
    });

    await page.goto('/orders');
    
    await page.getByText('Rastrear').click();
    
    await expect(page.getByText('ABC123')).toBeVisible();
  });
});
