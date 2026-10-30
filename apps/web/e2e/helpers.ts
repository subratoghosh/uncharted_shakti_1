// e2e/helpers.ts — shared Playwright helpers
import { Page, expect } from '@playwright/test';

export async function login(page: Page, email = 'dev@shaktiq.dev', password = 'password') {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/dashboard');
}

export async function loginAdmin(page: Page) {
  await login(page, 'admin@shaktiq.dev', 'adminpassword');
}

export async function expectStatusBadge(page: Page, status: string) {
  await expect(page.getByText(status)).toBeVisible();
}

