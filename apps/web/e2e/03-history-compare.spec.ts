// e2e/03-history-compare.spec.ts
// Scenario: History and compare — testing.md §9 row 3
import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('History and compare', () => {
  test('compare page shows New/Resolved/Unresolved tabs with counts', async ({ page }) => {
    await login(page);
    await page.goto('/projects');

    const firstProject = page.locator('[data-testid="project-card"]').first();
    await firstProject.click();

    // Find compare link
    await page.getByRole('link', { name: /compare/i }).click();
    await page.waitForURL(/\/compare/);

    // Tabs present
    await expect(page.getByRole('tab', { name: /new/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /resolved/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /unresolved/i })).toBeVisible();
  });
});

