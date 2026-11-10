import { test, expect } from '@playwright/test';
import { ProductCatalogPage } from '../pages/ProductCatalogPage';

test.use({ screenshot: 'off', trace: 'off' });

test('catalog product list is not visible', async ({ page }) => {
  const catalog = new ProductCatalogPage(page);

  await page.route('**/api/products', (route) =>
    route.fulfill({
      status: 500,
      json: { detail: 'Internal server error' },
    }),
  );

  await catalog.open();
  await expect(catalog.productList).toBeVisible({ timeout: 5_000 });
});