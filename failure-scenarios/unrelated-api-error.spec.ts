import { test, expect } from '@playwright/test';
import { ProductCatalogPage } from '../pages/ProductCatalogPage';

test('catalog locator fails after an unrelated telemetry error', async ({ page }) => {
  const catalog = new ProductCatalogPage(page);

  await page.route('**/api/telemetry', (route) =>
    route.fulfill({
      status: 500,
      json: { detail: 'Telemetry unavailable' },
    }),
  );

  const productsResponsePromise = page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/api/products',
  );

  await catalog.open();

  const productsResponse = await productsResponsePromise;
  expect(productsResponse.status()).toBe(200);
  await expect(catalog.productList).toBeVisible();

  const telemetryResponsePromise = page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/api/telemetry',
  );

  await page.evaluate(async () => {
    await fetch('/api/telemetry', { method: 'POST' });
  });

  const telemetryResponse = await telemetryResponsePromise;
  expect(telemetryResponse.status()).toBe(500);

  for (const [name, response] of [
    ['products-response.json', productsResponse],
    ['telemetry-response.json', telemetryResponse],
  ] as const) {
    await test.info().attach(name, {
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
  }

  await test.info().attach('catalog-state.txt', {
    body: 'The Products list was visible before the failing locator assertion.',
    contentType: 'text/plain',
  });

  await expect(
    page.getByRole('list', { name: 'Productz', exact: true }),
  ).toBeVisible({ timeout: 5_000 });
});