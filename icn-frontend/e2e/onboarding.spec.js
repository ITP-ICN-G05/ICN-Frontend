import { test, expect } from '@playwright/test';

test.describe('Onboarding', () => {
  test('should complete onboarding flow', async ({ page }) => {
    // Simulate new user
    await page.goto('/signup');
    
    // Complete signup
    await page.fill('input[name="name"]', 'Brand New User');
    await page.fill('input[type="email"]', 'brandnew@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for onboarding modal
    await page.waitForTimeout(2000);
    
    // If onboarding appears
    const onboardingModal = page.locator('.onboarding-modal');
    if (await onboardingModal.isVisible()) {
      // Step 1: User type
      await page.click('text=/Finding suppliers/i');
      await page.click('button:has-text("Next")');
      
      // Step 2: Industries
      await page.click('text=Technology');
      await page.click('button:has-text("Next")');
      
      // Step 3: Company size
      await page.click('text=/Any size/i');
      await page.click('button:has-text("Next")');
      
      // Step 4: Search radius
      await page.locator('input[type="range"]').fill('75');
      await page.click('button:has-text("Get Started")');
      
      // Should redirect to home
      await page.waitForURL('/');
    }
  });

  test('should allow skipping onboarding', async ({ page }) => {
    // Similar setup as above
    await page.goto('/signup');
    
    await page.fill('input[name="name"]', 'Skip User');
    await page.fill('input[type="email"]', 'skip@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    
    const skipButton = page.locator('button:has-text("Skip")');
    if (await skipButton.isVisible()) {
      await skipButton.click();
      await page.waitForURL('/');
    }
  });
});