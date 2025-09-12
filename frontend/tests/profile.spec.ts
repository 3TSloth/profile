import { test, expect } from '@playwright/test';

test('Main page loads', async ({ page }) => {
  await page.goto('/');
  await page.goto('http://localhost:8080/');
  await expect(page).toHaveTitle("Paulo Moreira");
});

test('Click on home button in header', async ({ page }) => {
  await page.goto('/');
  await page.goto('http://localhost:8080/');
  await page.getByRole('navigation').getByText('Home').click();
  await expect(page).toHaveURL("http://localhost:8080/#home");
});

test('Click on project button in header', async ({ page }) => {
  await page.goto('/');
  await page.goto('http://localhost:8080/');
  await page.getByRole('navigation').getByText('Projects').click();
  await expect(page).toHaveURL("http://localhost:8080/#projects");
});

test('Click on About button in header', async ({ page }) => {
  await page.goto('/');
  await page.goto('http://localhost:8080/');
  await page.getByRole('navigation').getByText('About').click();
  await expect(page).toHaveURL("http://localhost:8080/#about");
});

test('Click on Contact button in header', async ({ page }) => {
  await page.goto('/');
  await page.goto('http://localhost:8080/');
  await page.getByRole('navigation').getByText('Contact').click();
  await expect(page).toHaveURL("http://localhost:8080/#contact");
});


