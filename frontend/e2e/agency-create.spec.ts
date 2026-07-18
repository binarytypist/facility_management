import { test, expect } from '@playwright/test';

test.describe('Agency Create E2E Flow', () => {
  test('should create a new agency successfully', async ({ page }) => {
    // 1. Go to app root, which should redirect to Keycloak login
    await page.goto('/');

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

    // 6. Navigate to agency create page
    await page.goto('/agencies/create');
    await expect(page.getByRole('heading', { name: 'Register New Agency Company' })).toBeVisible();

    // Wait for translation and data to load
    await page.waitForTimeout(1000);

    // 7. Fill in agency details
    // Input 0: Name
    await page.locator('input[type="text"]').nth(0).fill('Test Agency E2E');
    
    // Input 1: Code
    await page.locator('input[type="text"]').nth(1).fill('TA-001');

    // Select 0: Service Category
    await page.locator('select').nth(0).selectOption({ index: 1 });

    // Input 2: Phone
    await page.locator('input[type="text"]').nth(2).fill('+1234567890');

    // Input 3: Address
    await page.locator('input[type="text"]').nth(3).fill('123 Test St');

    // Input 4: City
    await page.locator('input[type="text"]').nth(4).fill('Test City');

    // Input 5: Postcode
    await page.locator('input[type="text"]').nth(5).fill('12345');

    // Textarea: Other info
    await page.locator('textarea').first().fill('This is a test agency created via E2E tests.');

    // 8. Click Save button
    await page.click('button:has-text("Save & Proceed to Employees")');

    // 9. Verify redirection to edit page
    await page.waitForURL('**/agencies/edit/**');
    await expect(page.getByRole('heading', { name: 'Manage Agency' })).toBeVisible();
  });
});
