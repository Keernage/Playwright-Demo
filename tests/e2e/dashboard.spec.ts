import { expect, test } from '@playwright/test';
import { SAMPLE_REPORT } from '../support/sample-report';

// The real results.json belongs to the run that is still in progress, so the
// dashboard is tested against a stubbed report with known contents.
test.describe('Results dashboard', () => {
  test('summarises a report: counts, pass rate, duration and failures', async ({ page }) => {
    await page.route('**/__reports/results.json', (route) => route.fulfill({ json: SAMPLE_REPORT }));
    await page.goto('/');

    await expect(page.getByTestId('run-status')).toContainText('1 failing test');
    await expect(page.getByTestId('stat-total')).toContainText('4');
    await expect(page.getByTestId('stat-passed')).toContainText('1');
    await expect(page.getByTestId('stat-failed')).toContainText('1');
    await expect(page.getByTestId('stat-other')).toContainText('1 / 1');
    // Pass rate counts flaky-but-passed tests and excludes skipped ones: 2 of 3.
    await expect(page.getByTestId('stat-pass-rate')).toContainText('66.7%');
    await expect(page.getByTestId('stat-duration')).toContainText('12.3 s');
    await expect(page.getByTestId('file-row')).toHaveCount(2);

    // Failures are shown first, expanded, with ANSI colour codes stripped.
    const failed = page.locator('[data-testid="test-row"][data-status="failed"]');
    await expect(failed).toContainText('Login › shows an error');
    await expect(failed.getByTestId('failure-message')).toHaveText('Expected: "Invalid email"\nReceived: "Oops"');
    await expect(failed.getByTestId('failure-screenshot')).toHaveAttribute(
      'src',
      '/__artifacts/login-shows-an-error/test-failed-1.png',
    );

    await page.getByRole('button', { name: /^All/ }).click();
    await expect(page.getByTestId('test-row')).toHaveCount(4);
  });

  test('shows setup instructions when no report exists yet', async ({ page }) => {
    await page.route('**/__reports/results.json', (route) => route.fulfill({ status: 404, body: 'Not found' }));
    await page.goto('/');

    await expect(page.getByTestId('dashboard-empty')).toContainText('npm test');
  });
});
