import { test, expect } from '@playwright/test';

test.describe('Customization Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/customization');
  });

  test('deve renderizar página de personalização', async ({ page }) => {
    await expect(page.getByText('Upload de Personalização')).toBeVisible();
    await expect(page.getByText('ID do Pedido')).toBeVisible();
    await expect(page.getByText('Arquivo')).toBeVisible();
    await expect(page.getByText('Comentário')).toBeVisible();
  });

  test('deve mostrar erro ao tentar enviar sem arquivo', async ({ page }) => {
    await page.getByPlaceholder(/ID/i).fill('123');
    await page.getByRole('button', { type: 'submit' }).click();
    
    await expect(page.getByText(/arquivo/i)).toBeVisible();
  });

  test('deve mostrar erro ao tentar enviar sem ID do pedido', async ({ page }) => {
    await page.getByRole('textbox', { type: 'file' }).setInputFiles('e2e/fixtures/test-image.jpg');
    await page.getByRole('button', { type: 'submit' }).click();
    
    await expect(page.getByText(/ID/i)).toBeVisible();
  });

  test('deve permitir upload de arquivo', async ({ page }) => {
    await page.getByPlaceholder(/ID/i).fill('123');
    await page.getByRole('textbox', { type: 'file' }).setInputFiles('e2e/fixtures/test-image.jpg');
    
    await expect(page.getByText('Selecionado')).toBeVisible();
  });

  test('deve enviar personalização com sucesso', async ({ page }) => {
    // Mock de API response
    await page.route('**/api/customizations/upload', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Personalização enviada com sucesso' })
      });
    });

    await page.getByPlaceholder(/ID/i).fill('123');
    await page.getByRole('textbox', { type: 'file' }).setInputFiles('e2e/fixtures/test-image.jpg');
    await page.getByRole('textbox').fill('Personalização especial');
    await page.getByRole('button', { type: 'submit' }).click();

    await expect(page.getByText(/sucesso/i)).toBeVisible();
  });

  test('deve mostrar instruções de upload', async ({ page }) => {
    await expect(page.getByText('Instruções')).toBeVisible();
    await expect(page.getByText(/Formatos aceitos/i)).toBeVisible();
    await expect(page.getByText(/Tamanho máximo/i)).toBeVisible();
    await expect(page.getByText(/Resolução mínima/i)).toBeVisible();
  });
});
