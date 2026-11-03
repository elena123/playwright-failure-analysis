import { test, expect } from '@playwright/test';

test('API returns the expected products', async ({ request }) => {
  const response = await request.get(
    'http://127.0.0.1:8000/api/products',
  );

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual([
    { id: 1, name: 'Keyboard', price: 49.99 },
    { id: 2, name: 'Mouse', price: 24.99 },
    { id: 3, name: 'Monitor', price: 199.99 },
  ]);
});

test('catalog displays all products and prices', async ({ page }) => {
  await page.goto('/');

  const products = page
    .getByRole('list', { name: 'Products' })
    .getByRole('listitem');

  await expect(products).toHaveText([
    'Keyboard — 49.99 EUR',
    'Mouse — 24.99 EUR',
    'Monitor — 199.99 EUR',
  ]);
});

test('search filters products regardless of case', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Search products' })
    .fill('mOuSe');

  const products = page
    .getByRole('list', { name: 'Products' })
    .getByRole('listitem');

  await expect(products).toHaveText(['Mouse — 24.99 EUR']);
});

test('unmatched search shows an empty result', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('list', { name: 'Products' }),
  ).toBeVisible();

  await page.getByRole('searchbox', { name: 'Search products' })
    .fill('xyz');

  await expect(page.getByText('No products found.', { exact: true }))
    .toBeVisible();

  await expect(
    page.getByRole('list', { name: 'Products' }),
  ).toHaveCount(0);
});