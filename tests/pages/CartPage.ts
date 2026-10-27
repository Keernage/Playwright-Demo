import { type Locator, type Page } from '@playwright/test';

export class CartPage {
  readonly lines: Locator;
  readonly subtotal: Locator;
  readonly checkoutButton: Locator;
  readonly empty: Locator;

  constructor(readonly page: Page) {
    this.lines = page.getByTestId('cart-line');
    this.subtotal = page.getByTestId('cart-subtotal');
    this.checkoutButton = page.getByTestId('checkout-button');
    this.empty = page.getByTestId('empty-cart');
  }

  line(productId: string): Locator {
    return this.page.locator(`[data-testid="cart-line"][data-product-id="${productId}"]`);
  }

  async increase(productId: string) {
    await this.line(productId).getByTestId('qty-increase').click();
  }

  async decrease(productId: string) {
    await this.line(productId).getByTestId('qty-decrease').click();
  }

  async remove(productId: string) {
    await this.line(productId).getByTestId('remove-line').click();
  }
}
