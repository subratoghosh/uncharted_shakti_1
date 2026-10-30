// e2e/09-authorization.spec.ts
// Scenario: Authorization — testing.md §9 row 9
import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Authorization', () => {
  test('user visiting /admin/overview is redirected', async ({ page }) => {
    // Login as regular user
    await login(page);
    await page.goto('/admin/overview');

    // Should be redirected to /dashboard (admin layout does role check)
    await expect(page).toHaveURL(/dashboard/, { timeout: 5000 });
  });
});

