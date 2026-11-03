import { test, expect } from '@playwright/test';
import { ProductCatalogPage } from '../pages/ProductCatalogPage';

test('catalog displays products', async ({ page }) => {
  const catalog = new ProductCatalogPage(page);

  await page.route('**/api/products', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Internal server error' }),
    });
  });

  const responsePromise = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/products',
  );

  await catalog.open();

  const response = await responsePromise;

  await test.info().attach('products-response.json', {
    body: JSON.stringify(
      {
        url: response.url(),
        status: response.status(),
        body: await response.text(),
      },
      null,
      2,
    ),
    contentType: 'application/json',
  });

  await expect(catalog.productList).toBeVisible();
});