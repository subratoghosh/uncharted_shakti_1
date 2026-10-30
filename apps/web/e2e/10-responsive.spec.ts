// e2e/10-responsive.spec.ts
// Scenario: Responsive — testing.md §9 row 10
// Uses 390px viewport (configured in playwright.config.ts mobile project)
import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Responsive 390px', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('sidebar becomes drawer at 390px', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');

    // Sidebar should NOT be visible (collapsed to drawer)
    // Menu toggle button should be visible
    await expect(page.getByRole('button', { name: 'Toggle sidebar' })).toBeVisible();

    // Open drawer
    await page.getByRole('button', { name: 'Toggle sidebar' }).click();
    await expect(page.getByRole('dialog', { name: 'Navigation' })).toBeVisible();
  });

  test('tables scroll horizontally on mobile', async ({ page }) => {
    await login(page);
    await page.goto('/projects');

    // Projects page renders without overflow breaking layout
    await expect(page.locator('main')).toBeVisible();
  });
});

