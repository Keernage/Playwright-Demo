import { expect, test } from '../support/fixtures';
import { PRODUCTS, VALID_CHECKOUT } from '../support/test-data';

test.describe('Checkout validation', () => {
  test.beforeEach(async ({ page, signedIn, cartPage }) => {
    await signedIn.addToCart(PRODUCTS.bottle.id);
    await signedIn.openCart();
    await cartPage.checkoutButton.click();
    await expect(page).toHaveURL(/#\/store\/checkout$/);
  });

  test('submitting an empty form flags every required field', async ({ checkoutPage }) => {
    await checkoutPage.placeOrder.click();

    await expect(checkoutPage.errorSummary).toHaveText('Please fix 8 fields before placing your order.');
    await expect(checkoutPage.error('fullName')).toHaveText('Full name is required');
    await expect(checkoutPage.error('email')).toHaveText('Email is required');
    await expect(checkoutPage.error('cardNumber')).toHaveText('Card number is required');
    await expect(checkoutPage.input('fullName')).toHaveAttribute('aria-invalid', 'true');
  });

  test('rejects malformed email, postal code, card, expiry and CVC', async ({ page, checkoutPage }) => {
    await checkoutPage.fill({
      ...VALID_CHECKOUT,
      email: 'alex@',
      postalCode: '12AB',
      cardNumber: '4242 4242 4242 4241', // fails the Luhn check
      expiry: '13/30',
      cvc: '12',
    });
    await checkoutPage.placeOrder.click();

    await expect(checkoutPage.error('email')).toHaveText('Enter a valid email address');
    await expect(checkoutPage.error('postalCode')).toHaveText('Postal code must be 5 digits');
    await expect(checkoutPage.error('cardNumber')).toHaveText('Enter a valid 16-digit card number');
    await expect(checkoutPage.error('expiry')).toHaveText('Use MM/YY format');
    await expect(checkoutPage.error('cvc')).toHaveText('CVC must be 3 digits');
    await expect(checkoutPage.error('fullName')).toHaveCount(0);
    await expect(page).toHaveURL(/#\/store\/checkout$/);
  });

  test('rejects an expired card', async ({ checkoutPage }) => {
    await checkoutPage.fill({ ...VALID_CHECKOUT, expiry: '01/20' });
    await checkoutPage.placeOrder.click();

    await expect(checkoutPage.error('expiry')).toHaveText('Card has expired');
    await expect(checkoutPage.errorSummary).toHaveText('Please fix 1 field before placing your order.');
  });

  test('adds shipping below the free-shipping threshold', async ({ checkoutPage }) => {
    await expect(checkoutPage.shipping).toHaveText('$5.99');
    await expect(checkoutPage.total).toHaveText('$29.99');
  });

  test('a valid order is placed, confirmed, and the cart is emptied', async ({ page, checkoutPage, productsPage }) => {
    await checkoutPage.fill(VALID_CHECKOUT);
    await checkoutPage.placeOrder.click();

    await expect(page).toHaveURL(/#\/store\/confirmation$/);
    await expect(page.getByTestId('order-confirmation')).toContainText('Thank you for your order!');
    await expect(page.getByTestId('order-id')).toHaveText(/^SL-\d{6}$/);
    await expect(productsPage.cartCount).toHaveText('0');
  });
});
