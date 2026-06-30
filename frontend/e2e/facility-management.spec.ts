import { test, expect } from '@playwright/test';

test.describe('Facility Management E2E Flows', () => {
  const uniqueEmail = `test_e2e_${Date.now()}@facility.com`;
  const password = 'Password123';

  test('should support user registration, login, landing page redirection, and dashboard load', async ({ page }) => {
    // 1. Go to register page
    await page.goto('/register');
    await expect(page.locator('h1')).toHaveText('Create Account');

    // 2. Fill registration details
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', password);
    await page.fill('#confirmPassword', password);
    await page.selectOption('#role', 'admin');

    // 3. Submit registration
    await page.click('button[type="submit"]');

    // 4. Wait for redirection to login (wait up to 5s for the redirect timeout)
    await page.waitForURL('**/login', { timeout: 6000 });
    await expect(page.locator('h1')).toHaveText('Welcome Back');

    // 5. Fill login details
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');

    // 6. Wait for redirection to landing page
    await page.waitForURL('**/landing');
    await expect(page.locator('h1')).toContainText('Facility Maintenance');

    // 7. Click 'Enter Portal' button to go to the dashboard
    await page.click('button:has-text("Enter Portal")');

    // 8. Verify dashboard load
    await page.waitForURL('**/dashboard');
    await expect(page.locator('h1')).toContainText('FaciliPro');

    // 9. Verify the facility hierarchy sidebar tree is present
    await expect(page.locator('aside')).toContainText('Facility Hierarchy');
    await expect(page.locator('aside')).toContainText('Site A');
    await expect(page.locator('aside')).toContainText('Site B');

    // 10. Verify KPI metrics load
    await expect(page.locator('section').first()).toContainText('Active Events');
    await expect(page.locator('section').first()).toContainText('Total Expense');
  });
});
