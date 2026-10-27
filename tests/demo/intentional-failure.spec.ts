import { expect, test } from '../support/fixtures';
import { PRODUCTS } from '../support/test-data';

/**
 * DELIBERATELY FAILING. Run with `npm run test:demo-failure` to see how a
 * failure looks in the dashboard and HTML report (error diff, screenshot,
 * trace). It expects free shipping on an order that is below the threshold.
 * It is excluded from the default `npm test` run.
 */
test('[demo] order under $100 incorrectly expects free shipping', async ({ signedIn, cartPage, checkoutPage }) => {
  await signedIn.addToCart(PRODUCTS.bottle.id);
  await signedIn.openCart();
  await cartPage.checkoutButton.click();

  await expect(checkoutPage.shipping, 'shipping should be free').toHaveText('Free', { timeout: 2_000 });
});
