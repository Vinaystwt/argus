import { test, expect } from '@playwright/test';

// Valid trace root from /apps/web/public/demo-data.json (first trace)
const VALID_TRACE_ROOT = '0x238317e9ba02d2d71ac06c8bafdad663e2be45c038d39a99c76ae532ada3d7a1';

test('1. Homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1').first()).toBeVisible();
  const h1Text = await page.locator('h1').first().textContent();
  // h1 contains "agent" (in "Every agent action") or "Argus"
  expect(h1Text?.toLowerCase()).toMatch(/agent|argus/i);
});

test('2. Why Argus loads', async ({ page }) => {
  await page.goto('/why-argus');
  await expect(page.locator('h1').first()).toBeVisible();
  const h1Text = await page.locator('h1').first().textContent();
  expect(h1Text?.toLowerCase()).toContain('accountability');
});

test('3. Demo loads', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('body')).toBeVisible();
  // No 500 error
  await expect(page.locator('text=Application error')).not.toBeVisible();
});

test('4. Dashboard loads', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('text=Application error')).not.toBeVisible();
});

test('5. Traces page loads', async ({ page }) => {
  await page.goto('/traces');
  await expect(page.locator('body')).toBeVisible();
  // "Traces" or "Trace" appears in heading or page text
  await expect(
    page.locator('h1, h2, [class*="title"], [class*="eyebrow"]').filter({ hasText: /trace/i }).first()
  ).toBeVisible();
});

test('6. Trace detail loads for valid trace root', async ({ page }) => {
  const encodedRoot = encodeURIComponent(VALID_TRACE_ROOT);
  await page.goto(`/traces/${encodedRoot}`);
  await expect(page.locator('body')).toBeVisible();
  // No 500 error, no notFound crash
  await expect(page.locator('text=Application error')).not.toBeVisible();
  // Should show trace detail page (eyebrow "Trace detail" or similar)
  await expect(
    page.locator('h1, h2, [class*="title"], [class*="eyebrow"]').filter({ hasText: /trace|black.box/i }).first()
  ).toBeVisible();
});

test('7. Verify page loads', async ({ page }) => {
  await page.goto('/verify');
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('text=Application error')).not.toBeVisible();
  // Verify page has some content (TamperWorkbench)
  await expect(page.locator('body')).toContainText(/verify|tamper|trace/i);
});

test('8. Verify page – load example trace interaction', async ({ page }) => {
  await page.goto('/verify');
  await expect(page.locator('body')).toBeVisible();
  // Look for a "Load example" button or similar
  const loadExampleBtn = page.locator('button').filter({ hasText: /load example|example|load trace/i });
  if (await loadExampleBtn.count() > 0) {
    await loadExampleBtn.first().click();
    // After clicking, some state should change — a trace root or hash should appear
    await expect(page.locator('body')).toContainText(/0x[0-9a-f]+/i, { timeout: 5000 });
  } else {
    // If no "load example" button, verify the page at minimum renders a select or textarea
    const hasInput = await page.locator('select, textarea, input').count();
    expect(hasInput).toBeGreaterThan(0);
  }
});

test('9. Developers page loads', async ({ page }) => {
  await page.goto('/developers');
  await expect(page.locator('body')).toBeVisible();
  // "Developer" in heading
  await expect(
    page.locator('h1, h2, [class*="title"], [class*="eyebrow"]').filter({ hasText: /developer/i }).first()
  ).toBeVisible();
});

test('10. Primary nav links work – clicking Why Argus', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
  // Click the "Why Argus" nav link
  await page.locator('a').filter({ hasText: /why argus/i }).first().click();
  await expect(page).toHaveURL(/why-argus/);
});

test('11. Console nav active state on Dashboard', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.locator('body')).toBeVisible();
  // ConsoleNav sets aria-current="page" on the active link
  const activeLink = page.locator('a[aria-current="page"]').filter({ hasText: /overview|dashboard/i });
  await expect(activeLink.first()).toBeVisible();
});
