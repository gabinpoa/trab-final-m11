import { test, expect } from '@playwright/test';

test.describe('Customization Flow', () => {
  test('deve renderizar página de personalização - requer autenticação', async ({ page }) => {
    // Mock de autenticação
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'fake-jwt-token');
      localStorage.setItem('auth_user', JSON.stringify({ id: 1, email: 'test@test.com', name: 'Test User' }));
    });

    await page.goto('/customization');
    await expect(page.getByRole('heading', { name: 'Upload de Personalização' })).toBeVisible();
    await expect(page.getByLabel('ID do Pedido:')).toBeVisible();
    await expect(page.getByLabel('Arquivo (JPG, PNG, WEBP, PDF - máx 10MB):')).toBeVisible();
  });

  test('deve mostrar instruções de upload - requer autenticação', async ({ page }) => {
    // Mock de autenticação
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'fake-jwt-token');
      localStorage.setItem('auth_user', JSON.stringify({ id: 1, email: 'test@test.com', name: 'Test User' }));
    });

    await page.goto('/customization');
    await expect(page.getByRole('heading', { name: 'Instruções:' })).toBeVisible();
    await expect(page.getByText('Formatos aceitos: JPG, PNG, WEBP, PDF')).toBeVisible();
    await expect(page.getByText('Tamanho máximo: 10MB')).toBeVisible();
  });
});
