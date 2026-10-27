# QA Studio: end-to-end test automation demo

A small, self-contained portfolio project showing how I set up automated website testing for a software team:

- **ShopLite**, a fictional online store (React + TypeScript) that serves as the system under test.
- **A Playwright end-to-end suite** covering login, product search, cart and checkout validation, run on a desktop and an emulated mobile browser.
- **A results dashboard** that reads Playwright's JSON report and shows test counts, pass/fail status, duration, per-file breakdown, and failure details with screenshots.
- **Full Playwright HTML reports** with screenshots, videos and traces for every failure.

Everything runs locally with free, open-source tools. There are no paid services, API keys or real customer data. All accounts, products and card numbers are fictional.

---

## Quick start

Requirements: **Node.js 18+** (tested with Node 22 LTS) on Windows, macOS or Linux.

```bash
npm install                 # install dependencies
npm run browsers:install    # download Playwright's Chromium (one-time, ~150 MB)
npm test                    # build the app, start it, run the full suite
npm run preview             # serve the app → open http://localhost:4173
```

Open **http://localhost:4173** to see the dashboard for the run you just did. **Demo store** opens the app that was tested.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the app with hot reload (http://localhost:5173) |
| `npm test` | Run all tests headless on desktop + mobile Chromium |
| `npm run test:headed` | Watch the tests drive a real browser window |
| `npm run test:ui` | Playwright UI mode: pick tests, time-travel through steps |
| `npm run test:demo-failure` | Run the suite plus **one deliberately failing test**, to show what a failure report looks like |
| `npm run report` | Open the full Playwright HTML report |
| `npm run typecheck` | TypeScript check for the app and tests |

Demo accounts (also listed on the login page):

| Email | Password | Behaviour |
| --- | --- | --- |
| `standard@shoplite.test` | `Password123!` | Normal user |
| `locked@shoplite.test` | `Password123!` | Account locked: login is refused |

---

## What is tested

23 tests per browser project (46 runs in total):

| Spec | Covers |
| --- | --- |
| `login.spec.ts` | Successful sign-in, wrong password, locked account, required-field and email-format validation, redirecting anonymous users, logout |
| `search.spec.ts` | Full catalogue, search by name, case and whitespace insensitivity, search by category, empty state and recovery |
| `cart.spec.ts` | Add to cart and badge count, line items and subtotal, quantity changes, removing items, disabled checkout on empty cart, persistence across reload |
| `checkout.spec.ts` | All required fields, malformed email, postal code, card number (Luhn check), expiry and CVC, expired card, shipping-fee rule, successful order and confirmation |
| `dashboard.spec.ts` | The dashboard correctly summarises a known report (counts, pass rate, failure messages, screenshots) and shows setup help when no report exists |

### Reports

After `npm test`:

- `reports/results.json`: machine-readable results (feeds the dashboard and works in CI tooling).
- `reports/html/`: the full Playwright HTML report (`npm run report`, or **Full HTML report** on the dashboard).
- `test-results/`: screenshot, video, trace (`trace.zip`) and error context **for each failed test**. Passing tests keep no artifacts, so runs stay fast and small.

To see a failure end to end, run `npm run test:demo-failure` and then `npm run preview`. The dashboard opens on the failing test, showing the expected/received diff, the screenshot taken at the moment of failure, and a link to the trace. Open the trace with `npx playwright show-trace <path>` or drop it on https://trace.playwright.dev (it runs in your browser; nothing is uploaded).

---

## Project layout

```
src/
  store/              ShopLite demo store (pages, state, validation rules)
  dashboard/          Results dashboard + Playwright JSON report parser
tests/
  e2e/                The test suite (one spec per feature area)
  pages/              Page objects: all selectors live here
  support/
    fixtures.ts       Shared setup, e.g. the `signedIn` fixture
    test-data.ts      Users, products, valid checkout details
  demo/               The deliberately failing example (not part of `npm test`)
playwright.config.ts  Browsers, reporters, artifacts, web server
vite.config.ts        Serves reports/ and test-results/ to the dashboard
```

Design choices worth noting:

- **Stable selectors.** Tests use `data-testid` attributes and accessible roles, never CSS classes or layout. Restyling the site doesn't break the suite.
- **Page objects.** Each page's selectors and actions live in one class under `tests/pages/`. When the UI changes, you update one file, not every test.
- **No fixed sleeps.** The login form deliberately has network-like latency. The tests rely on Playwright's auto-waiting and web-first assertions, which is what keeps a suite from becoming flaky.
- **Isolated tests.** Every test gets a fresh browser context, so they run in parallel and in any order.
- **Artifacts only on failure.** Screenshots, video and traces are kept only when a test fails.

---

## Adapting the suite to your website

The suite is built so the structure carries over to a real product. Typically:

1. **Point it at your site.** Set `BASE_URL` and the local web server is skipped:
   ```bash
   # macOS/Linux
   BASE_URL=https://staging.example.com npm test
   # Windows PowerShell
   $env:BASE_URL="https://staging.example.com"; npm test
   ```
   To test a local app, change `webServer.command` in `playwright.config.ts` to however you start it.
2. **Use a dedicated test account.** Never use real customer credentials. Provide the test user through environment variables (`E2E_USER_EMAIL`, `E2E_USER_PASSWORD`, read in `tests/support/test-data.ts`), stored as CI secrets.
3. **Update the page objects.** Map each class in `tests/pages/` to your real pages. Ideally, add `data-testid` attributes to key elements in your app. Otherwise prefer `getByRole` / `getByLabel` locators.
4. **Rewrite the specs around your critical journeys.** Login, search, cart and checkout are common starting points. The highest-value tests are the flows that cost you money or support tickets when they break.
5. **Payments.** Run checkout against your payment provider's **test/sandbox mode** with its published test cards. Never run automated orders against live payments.
6. **Add browsers.** Add Firefox and WebKit (Safari engine) projects in `playwright.config.ts` and run `npx playwright install`.
7. **Run in CI.** Playwright works on any CI. A minimal free GitHub Actions job:
   ```yaml
   - uses: actions/setup-node@v4
     with: { node-version: 22 }
   - run: npm ci
   - run: npx playwright install --with-deps chromium
   - run: npm test
   - uses: actions/upload-artifact@v4
     if: always()
     with: { name: playwright-report, path: reports/ }
   ```
   With `CI` set, the config enables retries (to detect flaky tests) and forbids accidentally committed `test.only`.

---

## Known limitations

- **The store is a front-end-only mock.** There is no server, database or real authentication. State lives in `sessionStorage`. Tests against a real backend also need test-data setup and cleanup (e.g. seeding accounts through an API).
- **Chromium only by default.** Desktop and mobile are both Chromium (mobile is device emulation: viewport, touch, user agent, not a real phone). Firefox and WebKit are a one-line addition each but are not part of the verified run.
- **The dashboard shows the latest run only.** There is no history or trend over time. In a real engagement that would come from storing each run's JSON (or using CI test analytics).
- **The dashboard needs the bundled server.** Reports are served by a small Vite plugin in `npm run dev` / `npm run preview`. A static deploy of `dist/` would need the report files copied alongside it.
- **No visual regression or accessibility audits.** Both fit the same setup (Playwright `toHaveScreenshot`, `@axe-core/playwright`) and are natural next steps.
