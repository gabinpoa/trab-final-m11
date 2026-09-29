import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('deve renderizar a página de login', async ({ page }) => {
    await expect(page.getByText('Login')).toBeVisible();
    await expect(page.getByRole('textbox', { type: 'email' })).toBeVisible();
    await expect(page.getByRole('textbox', { type: 'password' })).toBeVisible();
    await expect(page.getByRole('button', { type: 'submit' })).toBeVisible();
  });

  test('deve mostrar erro ao tentar login com credenciais inválidas', async ({ page }) => {
    await page.getByRole('textbox', { type: 'email' }).fill('invalid@test.com');
    await page.getByRole('textbox', { type: 'password' }).fill('wrongpassword');
    await page.getByRole('button', { type: 'submit' }).click();
    
    // Verifica se há mensagem de erro (ajustar seletor conforme implementação)
    await expect(page.getByText(/erro/i)).toBeVisible();
  });

  test('deve redirecionar para home após login bem-sucedido', async ({ page }) => {
    // Mock de API response para login bem-sucedido
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'fake-jwt-token',
          user: { id: 1, email: 'test@test.com', name: 'Test User' }
        })
      });
    });

    await page.getByRole('textbox', { type: 'email' }).fill('test@test.com');
    await page.getByRole('textbox', { type: 'password' }).fill('password123');
    await page.getByRole('button', { type: 'submit' }).click();

    await expect(page).not.toHaveURL(/\/login/);
  });

  test('deve ter link para página de registro', async ({ page }) => {
    await expect(page.getByText('Registrar')).toBeVisible();
    await page.getByText('Registrar').click();
    await expect(page).toHaveURL(/\/register/);
  });
});
