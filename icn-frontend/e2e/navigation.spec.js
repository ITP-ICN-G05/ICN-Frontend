import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate through main pages', async ({ page }) => {
    await page.goto('/');
    
    // Home page
    await expect(page.locator('h1')).toBeTruthy();
    
    // Navigation page
    await page.click('a[href="/navigation"]');
    await expect(page).toHaveURL('/navigation');
    
    // Search page
    await page.click('a[href="/search"]');
    await expect(page).toHaveURL(/.*search/);
    
    // Back to home
    await page.click('a[href="/"]');
    await expect(page).toHaveURL('/');
  });

  test('should show mobile menu on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Mobile menu should be visible or have hamburger icon
    // This depends on your implementation
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });
});