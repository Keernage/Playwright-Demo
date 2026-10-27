import { test as base, expect } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { USERS } from './test-data';

interface Pages {
  loginPage: LoginPage;
  productsPage: ProductsPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  /** Signs in as the standard user and lands on the product list. */
  signedIn: ProductsPage;
}

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  productsPage: async ({ page }, use) => use(new ProductsPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  signedIn: async ({ loginPage, productsPage }, use) => {
    await loginPage.goto();
    await loginPage.login(USERS.standard.email, USERS.standard.password);
    await productsPage.expectLoaded();
    await use(productsPage);
  },
});

export { expect };
