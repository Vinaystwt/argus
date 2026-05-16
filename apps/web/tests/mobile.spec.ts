import { test, expect } from '@playwright/test';

test('12. Mobile nav renders without breaking', async ({ page }) => {
  // Viewport is 390x844 (iPhone 12 size) set via mobile project config
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
  // Brand link should be visible
  await expect(page.locator('.nav-brand').first()).toBeVisible();
  // .nav-links should be hidden (display:none) on mobile — correct behavior
  const navLinks = page.locator('.nav-links');
  const isHidden = await navLinks.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';
  });
  expect(isHidden).toBe(true);
});
