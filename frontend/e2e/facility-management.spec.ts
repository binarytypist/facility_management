import { test, expect } from '@playwright/test';

test.describe('Facility Management E2E Flows', () => {
  test('should authenticate via Keycloak and load the dashboard', async ({ page }) => {
    // 1. Go to app root, which should redirect to Keycloak login
    await page.goto('/');

    page.on('request', request => {
      if (request.url().includes('/api/')) console.log('>>', request.method(), request.url());
    });
    page.on('requestfailed', request => {
      if (request.url().includes('/api/')) console.log('XX FAILED', request.method(), request.url(), request.failure()?.errorText);
    });
    page.on('response', response => {
      if (response.url().includes('/api/')) console.log('<<', response.status(), response.url());
    });

    // 2. Wait for Keycloak login page to load
    await expect(page.locator('#kc-header-wrapper')).toBeVisible();

    // 3. Fill in Keycloak login details
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin');
    
    // 4. Submit login
    await page.click('#kc-login');

    // 5. Verify redirection to dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.locator('h1')).toContainText('FaciliPro');

    // 6. Verify the facility hierarchy sidebar tree is present
    await expect(page.locator('aside')).toContainText('Facility Hierarchy');
    await expect(page.locator('aside')).toContainText('Site A');
    await expect(page.locator('aside')).toContainText('Site B');

    // 7. Verify KPI metrics load
    await expect(page.locator('section').first()).toContainText('Active Events');
    await expect(page.locator('section').first()).toContainText('Total Expense');
  });
});
