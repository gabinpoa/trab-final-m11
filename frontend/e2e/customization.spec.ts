import { test, expect } from '@playwright/test';

test.describe('Customization Flow', () => {
  test('deve redirecionar para login ao acessar personalização sem autenticação', async ({ page }) => {
    await page.goto('/customization');
    await expect(page).toHaveURL('/login');
  });
});
