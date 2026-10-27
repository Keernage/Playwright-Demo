// A small, hand-written Playwright JSON report with one passing, one failing,
// one flaky and one skipped test. Used to test the dashboard deterministically.
const result = (status: string, duration: number, extra: object = {}) => ({ status, duration, retry: 0, attachments: [], ...extra });

export const SAMPLE_REPORT = {
  stats: { startTime: '2026-01-15T10:00:00.000Z', duration: 12_345, expected: 1, unexpected: 1, flaky: 1, skipped: 1 },
  errors: [],
  suites: [
    {
      title: 'e2e/login.spec.ts',
      file: 'e2e/login.spec.ts',
      specs: [],
      suites: [
        {
          title: 'Login',
          file: 'e2e/login.spec.ts',
          specs: [
            { title: 'signs in', file: 'e2e/login.spec.ts', line: 3, tests: [{ projectName: 'desktop-chromium', status: 'expected', results: [result('passed', 1200)] }] },
            {
              title: 'shows an error',
              file: 'e2e/login.spec.ts',
              line: 9,
              tests: [
                {
                  projectName: 'desktop-chromium',
                  status: 'unexpected',
                  results: [
                    result('failed', 5000, {
                      error: { message: '\u001b[31mExpected: "Invalid email"\u001b[39m\nReceived: "Oops"' },
                      attachments: [{ name: 'screenshot', contentType: 'image/png', path: 'C:\\proj\\test-results\\login-shows-an-error\\test-failed-1.png' }],
                    }),
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'e2e/cart.spec.ts',
      file: 'e2e/cart.spec.ts',
      specs: [
        { title: 'retries then passes', file: 'e2e/cart.spec.ts', line: 4, tests: [{ projectName: 'mobile-chromium', status: 'flaky', results: [result('failed', 900), result('passed', 800)] }] },
        { title: 'not ready yet', file: 'e2e/cart.spec.ts', line: 12, tests: [{ projectName: 'mobile-chromium', status: 'skipped', results: [result('skipped', 0)] }] },
      ],
    },
  ],
};
