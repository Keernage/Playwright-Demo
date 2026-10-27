import { expect, test } from '../support/fixtures';
import { USERS } from '../support/test-data';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user can sign in and sees the product list', async ({ page, loginPage, productsPage }) => {
    await loginPage.login(USERS.standard.email, USERS.standard.password);

    await productsPage.expectLoaded();
    await expect(page.getByTestId('current-user')).toHaveText(USERS.standard.name);
    await expect(productsPage.cartCount).toHaveText('0');
  });

  test('wrong password shows a generic error and stays on the login page', async ({ page, loginPage }) => {
    await loginPage.login(USERS.standard.email, 'not-the-password');

    await expect(loginPage.error).toHaveText('Invalid email or password');
    await expect(page).toHaveURL(/#\/store\/login$/);
  });

  test('locked-out user is told their account is locked', async ({ loginPage }) => {
    await loginPage.login(USERS.locked.email, USERS.locked.password);

    await expect(loginPage.error).toContainText('locked');
  });

  test('required fields are validated before submitting', async ({ loginPage }) => {
    await loginPage.submit.click();
    await expect(loginPage.error).toHaveText('Email is required');

    await loginPage.email.fill('not-an-email');
    await loginPage.submit.click();
    await expect(loginPage.error).toHaveText('Enter a valid email address');

    await loginPage.email.fill(USERS.standard.email);
    await loginPage.submit.click();
    await expect(loginPage.error).toHaveText('Password is required');
  });

  test('protected pages redirect anonymous visitors to login', async ({ page }) => {
    await page.goto('/#/store/cart');
    await expect(page).toHaveURL(/#\/store\/login$/);
  });

  test('logging out returns to the login page', async ({ page, signedIn }) => {
    await expect(signedIn.cards.first()).toBeVisible();
    await page.getByTestId('logout').click();

    await expect(page).toHaveURL(/#\/store\/login$/);
    await page.goto('/#/store/products');
    await expect(page).toHaveURL(/#\/store\/login$/);
  });
});
