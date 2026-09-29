import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('deve renderizar a página de login', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByLabel('Email:')).toBeVisible();
    await expect(page.getByLabel('Password:')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('deve mostrar erro ao tentar login com credenciais inválidas', async ({ page }) => {
    // Mock de API response para erro
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' })
      });
    });

    await page.getByLabel('Email:').fill('invalid@test.com');
    await page.getByLabel('Password:').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    
    await expect(page.getByText(/Login failed/i)).toBeVisible();
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

    await page.getByLabel('Email:').fill('test@test.com');
    await page.getByLabel('Password:').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).not.toHaveURL(/\/login/);
  });

  test('deve ter link para página de registro', async ({ page }) => {
    await expect(page.getByText('Registre-se')).toBeVisible();
    await page.getByRole('link', { name: 'Registre-se' }).click();
    await expect(page).toHaveURL(/\/register/);
  });
});
