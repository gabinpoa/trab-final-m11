import { test, expect } from '@playwright/test';

test.describe('Orders Flow', () => {
  test('deve redirecionar para login ao acessar pedidos sem autenticação', async ({ page }) => {
    await page.goto('/orders');
    await expect(page).toHaveURL('/login');
  });
});
