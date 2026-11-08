import { test, expect } from '@playwright/test';
import { ProductCatalogPage } from '../pages/ProductCatalogPage';

test('catalog fails with an incorrect products locator', async ({ page }) => {
  const catalog = new ProductCatalogPage(page);

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

  expect(response.status()).toBe(200);
  await expect(catalog.productList).toBeVisible();

  await test.info().attach('catalog-state.txt', {
    body: 'The Products list was visible before the failing locator assertion.',
    contentType: 'text/plain',
  });

  await expect(
    page.getByRole('list', { name: 'Productz', exact: true }),
  ).toBeVisible({ timeout: 5_000 });
});