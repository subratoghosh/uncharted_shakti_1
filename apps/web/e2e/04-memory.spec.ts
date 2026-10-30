// e2e/04-memory.spec.ts
// Scenario: Memory — testing.md §9 row 4
import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Project memory', () => {
  test('opening a finding shows memory timeline with earlier run', async ({ page }) => {
    await login(page);
    await page.goto('/projects');

    const firstProject = page.locator('[data-testid="project-card"]').first();
    await firstProject.click();

    // Go to first run
    const firstRunRow = page.locator('table tbody tr').first();
    await firstRunRow.click();
    await page.waitForURL(/\/runs\//);

    // Click first finding to open drawer
    const firstFinding = page.locator('table tbody tr').first();
    await firstFinding.click();

    // Drawer opens
    await expect(page.getByRole('dialog')).toBeVisible();
    // Memory timeline section
    await expect(page.getByText(/memory/i).or(page.getByText(/prior occurrence/i))).toBeVisible();
  });
});

