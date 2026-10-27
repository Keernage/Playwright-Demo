import { expect, test } from '../support/fixtures';
import { PRODUCTS } from '../support/test-data';

const { headphones, mouse } = PRODUCTS;

test.describe('Shopping cart', () => {
  test('adding a product updates the cart badge and button label', async ({ signedIn }) => {
    await signedIn.addToCart(headphones.id);

    await expect(signedIn.cartCount).toHaveText('1');
    await expect(signedIn.card(headphones.id).getByTestId('add-to-cart')).toHaveText('Add another (1)');
  });

  test('cart lists added items with the correct subtotal', async ({ signedIn, cartPage }) => {
    await signedIn.addToCart(headphones.id);
    await signedIn.addToCart(mouse.id);
    await signedIn.openCart();

    await expect(cartPage.lines).toHaveCount(2);
    await expect(cartPage.page.getByTestId('cart-line-name')).toHaveText([headphones.name, mouse.name]);
    await expect(cartPage.subtotal).toHaveText('$168.99');
  });

  test('changing quantity recalculates line total and subtotal', async ({ signedIn, cartPage }) => {
    await signedIn.addToCart(mouse.id);
    await signedIn.openCart();

    await cartPage.increase(mouse.id);
    await cartPage.increase(mouse.id);
    await expect(cartPage.line(mouse.id).getByTestId('cart-line-qty')).toHaveText('3');
    await expect(cartPage.line(mouse.id).getByTestId('cart-line-total')).toHaveText('$119.97');
    await expect(cartPage.subtotal).toHaveText('$119.97');

    await cartPage.decrease(mouse.id);
    await expect(cartPage.subtotal).toHaveText('$79.98');
    await expect(signedIn.cartCount).toHaveText('2');
  });

  test('removing the last item empties the cart and disables checkout', async ({ signedIn, cartPage }) => {
    await signedIn.addToCart(headphones.id);
    await signedIn.openCart();
    await expect(cartPage.checkoutButton).toBeEnabled();

    await cartPage.remove(headphones.id);

    await expect(cartPage.empty).toBeVisible();
    await expect(cartPage.subtotal).toHaveText('$0.00');
    await expect(cartPage.checkoutButton).toBeDisabled();
    await expect(signedIn.cartCount).toHaveText('0');
  });

  test('cart survives a page reload within the session', async ({ page, signedIn, cartPage }) => {
    await signedIn.addToCart(headphones.id);
    await signedIn.openCart();
    await page.reload();

    await expect(cartPage.lines).toHaveCount(1);
    await expect(signedIn.cartCount).toHaveText('1');
  });
});
