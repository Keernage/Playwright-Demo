import { expect, test } from '../support/fixtures';

test.describe('Product search', () => {
  test('shows the full catalogue before searching', async ({ signedIn }) => {
    await expect(signedIn.cards).toHaveCount(8);
    await expect(signedIn.resultCount).toHaveText('8 products');
  });

  test('filters products by name', async ({ signedIn }) => {
    await signedIn.search.fill('wireless');

    await expect(signedIn.names).toHaveText(['Aurora Wireless Headphones', 'Glide Wireless Mouse']);
    await expect(signedIn.resultCount).toHaveText('2 products');
  });

  test('search is case-insensitive and ignores surrounding spaces', async ({ signedIn }) => {
    await signedIn.search.fill('  KEYBOARD ');

    await expect(signedIn.names).toHaveText(['Pixel Mechanical Keyboard']);
    await expect(signedIn.resultCount).toHaveText('1 product');
  });

  test('matches on category', async ({ signedIn }) => {
    await signedIn.search.fill('outdoor');

    await expect(signedIn.cards).toHaveCount(2);
    for (const card of await signedIn.cards.all()) {
      await expect(card).toContainText('Outdoor');
    }
  });

  test('shows an empty state when nothing matches, and recovers when cleared', async ({ signedIn }) => {
    await signedIn.search.fill('submarine');

    await expect(signedIn.noResults).toContainText('No products match “submarine”');
    await expect(signedIn.cards).toHaveCount(0);

    await signedIn.search.clear();
    await expect(signedIn.cards).toHaveCount(8);
  });
});
