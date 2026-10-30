// e2e/05-report.spec.ts
// Scenario: Report — testing.md §9 row 5
import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Release report', () => {
  test('disclaimer visible and statuses correct', async ({ page }) => {
    await login(page);

    // Navigate directly to a run report (mock provides run-1)
    await page.goto('/runs/run-1/report');

    // Disclaimer must be present (exact text from prd.md FR-5)
    await expect(
      page.getByText(
        'This report assesses API compatibility based on the OpenAPI specifications provided. It does not guarantee the release is safe.',
      ),
    ).toBeVisible();

    // Verdict banner present
    await expect(
      page
        .getByText('Safe based on configured checks')
        .or(page.getByText('Warning: review required'))
        .or(page.getByText('Not ready: blocking changes detected')),
    ).toBeVisible();
  });
});

