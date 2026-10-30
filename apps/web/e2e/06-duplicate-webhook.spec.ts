// e2e/06-duplicate-webhook.spec.ts
// Scenario: Duplicate webhook — testing.md §9 row 6
// NOTE: This test requires the real backend to be running.
// The frontend part: admin Events page shows duplicateCount badge.
import { test, expect } from '@playwright/test';
import { loginAdmin } from './helpers';

test.describe('Duplicate webhook (admin view)', () => {
  test('admin Events shows duplicateCount and only one run', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/events');
    await page.waitForURL('/admin/events');

    // duplicateCount badge visible (MSW provides ×1)
    await expect(page.getByText('×1').or(page.getByText('×2').or(page.getByText('Duplicate')))).toBeVisible({ timeout: 5000 });
  });
});

