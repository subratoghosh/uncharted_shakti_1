// e2e/07-invalid-signature.spec.ts
// Scenario: Invalid signature — testing.md §9 row 7
// Frontend: admin Events shows rejected entry
import { test, expect } from '@playwright/test';
import { loginAdmin } from './helpers';

test.describe('Invalid signature (admin view)', () => {
  test('admin Events shows Rejected badge', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/events');

    // Rejected badge must be visible (MSW provides a rejected event)
    await expect(page.getByText('Rejected')).toBeVisible({ timeout: 5000 });
  });
});

