import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('deve renderizar a página de login', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('deve ter link para página de registro', async ({ page }) => {
    await expect(page.getByText('Registre-se')).toBeVisible();
    await page.getByRole('link', { name: 'Registre-se' }).click();
    await expect(page).toHaveURL(/\/register/);
  });
});
