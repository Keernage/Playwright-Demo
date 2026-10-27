import { defineConfig } from '@playwright/test';
import base from './playwright.config';

/**
 * Runs the main suite plus one deliberately failing test, so the dashboard and
 * HTML report can be shown with a real failure, screenshot and trace.
 */
export default defineConfig({
  ...base,
  testDir: './tests',
  testMatch: ['e2e/**/*.spec.ts', 'demo/**/*.spec.ts'],
  projects: base.projects?.filter((p) => p.name === 'desktop-chromium'),
});
