import { test, expect } from '@playwright/test';
import { ProductCatalogPage } from '../../pages/ProductCatalogPage';

test('catalog displays all products and prices', async ({ page }) => {
  const catalog = new ProductCatalogPage(page);

  await catalog.open();

  await expect(catalog.products).toHaveText([
    'Keyboard — 49.99 EUR',
    'Mouse — 24.99 EUR',
    'Monitor — 199.99 EUR',
  ]);
});

test('search filters products regardless of case', async ({ page }) => {
  const catalog = new ProductCatalogPage(page);

  await catalog.open();
  await catalog.searchFor('mOuSe');

  await expect(catalog.products).toHaveText([
    'Mouse — 24.99 EUR',
  ]);
});

test('unmatched search shows an empty result', async ({ page }) => {
  const catalog = new ProductCatalogPage(page);

  await catalog.open();
  await expect(catalog.productList).toBeVisible();

  await catalog.searchFor('xyz');

  await expect(catalog.emptyMessage).toBeVisible();
  await expect(catalog.productList).toHaveCount(0);
});