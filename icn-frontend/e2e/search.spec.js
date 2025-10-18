import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock geolocation
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: -37.8136, longitude: 144.9631 });
    
    await page.goto('/search');
  });

  test('should display search page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/search|find/i);
  });

  test('should perform text search', async ({ page }) => {
    await page.fill('input[placeholder*="Search"]', 'technology');
    await page.press('input[placeholder*="Search"]', 'Enter');
    
    await page.waitForTimeout(1000);
    
    // Check if results are displayed
    await expect(page.locator('.company-card-search').first()).toBeVisible();
  });

  test('should apply filters', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Open filters if needed
    const filterPanel = page.locator('text=Filters');
    if (await filterPanel.isVisible()) {
      await filterPanel.click();
    }
    
    // Select sector
    await page.check('text=Technology');
    
    // Adjust distance
    await page.locator('input[type="range"]').fill('25');
    
    // Wait for results to update
    await page.waitForTimeout(500);
    
    // Verify filter is applied
    const distanceValue = await page.locator('text=/25 km/').textContent();
    expect(distanceValue).toContain('25');
  });

  test('should view company details', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Click on first company card
    const firstCard = page.locator('.company-card-search').first();
    await firstCard.waitFor({ state: 'visible' });
    await firstCard.click();
    
    // Should navigate to detail page or open modal
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/company\/\d+/);
  });

  test('should bookmark a company', async ({ page, context }) => {
    // Login first
    await context.addCookies([{
      name: 'token',
      value: 'test-token',
      domain: 'localhost',
      path: '/',
    }]);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Find and click bookmark button
    const bookmarkBtn = page.locator('button:has-text("Bookmark")').first();
    await bookmarkBtn.waitFor({ state: 'visible' });
    await bookmarkBtn.click();
    
    // Verify bookmark was added
    await expect(page.locator('button:has-text("Bookmarked")')).toBeVisible();
  });

  test('should save search', async ({ page, context }) => {
    // Login first
    await context.addCookies([{
      name: 'token',
      value: 'test-token',
      domain: 'localhost',
      path: '/',
    }]);
    
    await page.reload();
    
    // Perform search
    await page.fill('input[placeholder*="Search"]', 'manufacturing');
    await page.press('input[placeholder*="Search"]', 'Enter');
    
    await page.waitForTimeout(1000);
    
    // Click save search
    await page.click('text=/Save Search/i');
    
    // Fill in modal
    await page.fill('input[name="name"]', 'My Manufacturing Search');
    await page.click('button:has-text("Save Search")');
    
    // Verify success
    await expect(page.locator('text=/saved successfully/i')).toBeVisible();
  });
});