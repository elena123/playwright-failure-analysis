import type { Locator, Page } from '@playwright/test';

export class ProductCatalogPage {
  readonly searchInput: Locator;
  readonly productList: Locator;
  readonly products: Locator;
  readonly emptyMessage: Locator;

  constructor(private readonly page: Page) {
    this.searchInput = page.getByRole('searchbox', {
      name: 'Search products',
    });
    this.productList = page.getByRole('list', {
      name: 'Products',
    });
    this.products = this.productList.getByRole('listitem');
    this.emptyMessage = page.getByText('No products found.', {
      exact: true,
    });
  }

  async open(): Promise<void> {
    await this.page.goto('/');
  }

  async searchFor(text: string): Promise<void> {
    await this.searchInput.fill(text);
  }
}