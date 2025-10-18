import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('text=Log in');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h1')).toContainText('Log in');
  });

  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation and check user is logged in
    await page.waitForURL('/');
    await expect(page.locator('[title*="Logged in"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=/invalid|error/i')).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.click('text=Sign up');
    await expect(page).toHaveURL(/.*signup/);
    await expect(page.locator('h1')).toContainText('Sign up');
  });

  test('should complete signup flow', async ({ page }) => {
    await page.goto('/signup');
    
    await page.fill('input[name="name"]', 'New User');
    await page.fill('input[type="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    await page.click('button[type="submit"]');
    
    // Should show onboarding or redirect to home
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url === '/' || url.includes('onboarding')).toBeTruthy();
  });

  test('should logout successfully', async ({ page, context }) => {
    // Set logged in state
    await context.addCookies([{
      name: 'token',
      value: 'test-token',
      domain: 'localhost',
      path: '/',
    }]);
    
    await page.goto('/');
    await page.click('[title*="Logged in"]');
    await page.click('text=Log out');
    
    // Confirm logout
    page.on('dialog', dialog => dialog.accept());
    
    await expect(page.locator('text=Log in')).toBeVisible();
  });
});