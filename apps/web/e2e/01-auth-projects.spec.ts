// e2e/01-auth-projects.spec.ts
// Scenario: Login and projects — testing.md §9 row 1
import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Auth and projects', () => {
  test('register, login, create project — project appears', async ({ page }) => {
    // Register
    await page.goto('/register');
    await page.getByLabel('Full name').fill('E2E User');
    await page.getByLabel('Email').fill(`e2e-${Date.now()}@test.dev`);
    await page.getByLabel('Password').fill('password1234');
    await page.getByRole('button', { name: 'Create account' }).click();
    await page.waitForURL('/dashboard');
    await expect(page.getByText('Overview')).toBeVisible();

    // Navigate to projects
    await page.getByRole('link', { name: 'Projects' }).click();
    await page.waitForURL('/projects');

    // Create project (form visible)
    await page.getByRole('button', { name: 'New project' }).click();
    await page.getByLabel('Name').fill('E2E Orders API');
    await page.getByLabel('Repository URL').fill('https://github.com/e2e/orders');
    await page.getByLabel('Default branch').fill('main');
    await page.getByLabel('Spec path').fill('openapi.yaml');
    await page.getByRole('button', { name: 'Create' }).click();

    // Project card appears
    await expect(page.getByText('E2E Orders API')).toBeVisible();
  });

  test('auth page accessible', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    // Labels above inputs (never placeholder-only)
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });
});

