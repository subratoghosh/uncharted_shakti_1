// e2e/02-manual-analysis.spec.ts
// Scenario: Manual analysis — testing.md §9 row 2
import { test, expect } from '@playwright/test';
import { login } from './helpers';
import path from 'path';

const FIXTURES = path.join(__dirname, '../../fixtures/openapi');

test.describe('Manual analysis', () => {
  test('upload v1 and v2-remove-endpoint → run queued→running→completed live', async ({
    page,
  }) => {
    await login(page);
    await page.goto('/projects');

    // Click first project
    const firstProject = page.locator('[data-testid="project-card"]').first();
    await firstProject.click();

    // Go to new run
    await page.getByRole('link', { name: 'Run analysis' }).click();

    // Upload specs
    const baseInput = page.getByLabel(/base spec/i);
    const headInput = page.getByLabel(/head spec/i);
    await baseInput.setInputFiles(path.join(FIXTURES, 'orders-v1.yaml'));
    await headInput.setInputFiles(path.join(FIXTURES, 'orders-v2-remove-endpoint.yaml'));

    await page.getByRole('button', { name: 'Run analysis' }).click();

    // Should redirect to run detail
    await page.waitForURL(/\/runs\//);

    // Status updates live
    await expect(page.getByText('Queued').or(page.getByText('Running')).or(page.getByText('Completed'))).toBeVisible({ timeout: 15000 });

    // Eventually completed with 1 breaking finding
    await expect(page.getByText('Completed')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Breaking')).toBeVisible();
    await expect(page.getByText('Not ready: blocking changes detected')).toBeVisible();
  });
});

