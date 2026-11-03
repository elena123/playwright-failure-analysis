import { test, expect } from '@playwright/test';

test('API returns the expected products', async ({ request }) => {
  const response = await request.get('/api/products');

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual([
    { id: 1, name: 'Keyboard', price: 49.99 },
    { id: 2, name: 'Mouse', price: 24.99 },
    { id: 3, name: 'Monitor', price: 199.99 },
  ]);
});