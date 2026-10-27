import { type Locator, type Page, expect } from '@playwright/test';

export class ProductsPage {
  readonly search: Locator;
  readonly cards: Locator;
  readonly names: Locator;
  readonly resultCount: Locator;
  readonly noResults: Locator;
  readonly cartCount: Locator;

  constructor(readonly page: Page) {
    this.search = page.getByTestId('search-input');
    this.cards = page.getByTestId('product-card');
    this.names = page.getByTestId('product-name');
    this.resultCount = page.getByTestId('result-count');
    this.noResults = page.getByTestId('no-results');
    this.cartCount = page.getByTestId('cart-count');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/#\/store\/products$/);
    await expect(this.page.getByRole('heading', { name: 'Products' })).toBeVisible();
  }

  card(productId: string): Locator {
    return this.page.locator(`[data-testid="product-card"][data-product-id="${productId}"]`);
  }

  async addToCart(productId: string) {
    await this.card(productId).getByTestId('add-to-cart').click();
  }

  async openCart() {
    await this.page.getByTestId('cart-link').click();
    await expect(this.page).toHaveURL(/#\/store\/cart$/);
  }
}
