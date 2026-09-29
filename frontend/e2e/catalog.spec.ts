import { test, expect } from '@playwright/test';

test.describe('Catalog and Cart Flow', () => {
  test('deve redirecionar para login ao acessar catálogo sem autenticação', async ({ page }) => {
    await page.goto('/products');
    await expect(page).toHaveURL('/login');
  });
});
