import { type Locator, type Page } from '@playwright/test';

export type CheckoutField = 'fullName' | 'email' | 'address' | 'city' | 'postalCode' | 'cardNumber' | 'expiry' | 'cvc';

export class CheckoutPage {
  readonly placeOrder: Locator;
  readonly errorSummary: Locator;
  readonly total: Locator;
  readonly shipping: Locator;

  constructor(readonly page: Page) {
    this.placeOrder = page.getByTestId('place-order');
    this.errorSummary = page.getByTestId('checkout-error-summary');
    this.total = page.getByTestId('summary-total');
    this.shipping = page.getByTestId('summary-shipping');
  }

  input(field: CheckoutField): Locator {
    return this.page.getByTestId(`checkout-${field}`);
  }

  error(field: CheckoutField): Locator {
    return this.page.getByTestId(`error-${field}`);
  }

  async fill(values: Partial<Record<CheckoutField, string>>) {
    for (const [field, value] of Object.entries(values)) {
      await this.input(field as CheckoutField).fill(value);
    }
  }
}
