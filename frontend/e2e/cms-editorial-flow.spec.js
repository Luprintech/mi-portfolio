import { expect, test } from '@playwright/test';
import process from 'process';

const CMS_USERNAME = process.env.PLAYWRIGHT_CMS_USERNAME || 'e2e-admin';
const CMS_PASSWORD = process.env.PLAYWRIGHT_CMS_PASSWORD || 'e2e-password';
const BACKEND_URL = process.env.PLAYWRIGHT_BACKEND_URL || 'http://127.0.0.1:3100';
const SHARED_IMAGE_ONE = '/posts/images/synology-docker-deploy-cover.png';
const SHARED_IMAGE_TWO = '/posts/images/1774007529998-captura-de-pantalla-2026-03-20-084834.png';
const SHARED_DOCUMENT = '/posts/documents/1774436015235-comandos-git.pdf';

function buildRichHtml(title) {
  return [
    `<h2>${title}</h2>`,
    '<p>Validamos el pipeline editorial completo con HTML-first real desde el CMS.</p>',
    `<div data-block="image-grid" data-columns="2" data-images='[{"src":"${SHARED_IMAGE_ONE}","alt":"Panel principal","caption":"Panel principal"},{"src":"${SHARED_IMAGE_TWO}","alt":"Captura secundaria","caption":"Captura secundaria"}]'></div>`,
    `<div data-block="document" data-src="${SHARED_DOCUMENT}" data-title="Guia operativa" data-filename="guia-operativa.pdf" data-file-type="pdf" data-display="embed"></div>`,
    '<pre data-block="code" data-language="bash" data-filename="deploy.sh" data-title="Deploy" data-variant="terminal"><code>npm run lint\nnpm run test</code></pre>',
  ].join('');
}

async function loginToCms(page) {
  await page.goto('/bitacora');
  await page.getByLabel(/usuario/i).fill(CMS_USERNAME);
  await page.getByLabel(/contraseña/i).fill(CMS_PASSWORD);
  await page.getByRole('button', { name: /entrar/i }).click();
  await expect(page).toHaveURL(/\/bitacora\/inicio$/);
}

async function assertRichBlocks(page, postTitle) {
  await expect(page.locator('h1, h2').filter({ hasText: postTitle }).first()).toBeVisible();
  await expect(page.locator('[data-rendered-block="image-grid"]')).toHaveCount(1);
  await expect(page.locator('[data-rendered-block="image-grid"] img')).toHaveCount(2);
  await expect(page.locator('[data-rendered-block="document"]')).toHaveCount(1);
  await expect(page.locator('[data-rendered-block="document"] iframe')).toHaveCount(1);
  await expect(page.locator('[data-rendered-block="code"]')).toHaveCount(1);
  await expect(page.getByText('npm run lint')).toBeVisible();
  await expect(page.locator('[data-rendered-block="code"]').getByRole('button', { name: /^copiar$/i })).toBeVisible();
}

test.describe('CMS editorial E2E', () => {
  test('protege el editor del CMS para usuarios anonimos', async ({ page }) => {
    await page.goto('/bitacora/posts/nuevo');

    await expect(page).toHaveURL(/\/bitacora$/);
    await expect(page.getByRole('heading', { name: /bitácora/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
  });

  test('crea un post rico, abre preview y confirma render publico consistente', async ({ page, request }) => {
    const suffix = Date.now();
    const postTitle = `E2E editorial ${suffix}`;
    const postSlug = `e2e-editorial-${suffix}`;
    const richHtml = buildRichHtml(postTitle);

    await loginToCms(page);
    const token = await page.evaluate(() => window.sessionStorage.getItem('cms_token'));

    try {
      await page.goto('/bitacora/posts/nuevo');

      await page.getByLabel(/título/i).fill(postTitle);
      await page.getByLabel(/slug/i).fill(postSlug);
      await page.getByLabel(/tags/i).fill('e2e, cms, playwright');
      await page.getByLabel(/resumen/i).fill('Post de prueba E2E para validar preview y render publico.');

      await page.getByRole('button', { name: /modo código fuente/i }).click();
      await page.getByLabel(/editor html source/i).fill(richHtml);

      const previewPromise = page.waitForEvent('popup');
      await page.getByRole('button', { name: /vista previa/i }).click();
      const previewPage = await previewPromise;

      await previewPage.waitForLoadState('domcontentloaded');
      await expect(previewPage).toHaveURL(/\/blog\/preview$/);
      await assertRichBlocks(previewPage, postTitle);
      await previewPage.close();

      await page.getByRole('button', { name: /^publicar$/i }).click();
      await expect(page).toHaveURL(/\/bitacora\/posts$/);
      await expect(page.getByRole('heading', { name: /^posts$/i })).toBeVisible();

      await page.goto(`/blog/${postSlug}`);
      await assertRichBlocks(page, postTitle);
    } finally {
      if (token) {
        await request.delete(`${BACKEND_URL}/api/bitacora/posts/${postSlug}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          failOnStatusCode: false,
        });
      }
    }
  });
});
