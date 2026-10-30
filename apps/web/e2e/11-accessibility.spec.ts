// e2e/11-accessibility.spec.ts
// Scenario: Accessibility — testing.md §9 row 11
// Uses axe-playwright for no serious violations
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { login } from './helpers';

test.describe('Accessibility (axe WCAG AA)', () => {
  test('dashboard has no serious violations', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const serious = results.violations.filter(
      (v: { impact: string | null }) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(serious, `Serious violations: ${JSON.stringify(serious, null, 2)}`).toHaveLength(0);
  });

  test('run detail has no serious violations', async ({ page }) => {
    await login(page);
    await page.goto('/runs/run-1');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const serious = results.violations.filter(
      (v: { impact: string | null }) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(serious, `Serious violations: ${JSON.stringify(serious, null, 2)}`).toHaveLength(0);
  });
});

