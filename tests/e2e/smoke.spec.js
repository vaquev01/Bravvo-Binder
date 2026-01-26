import { test, expect } from '@playwright/test';

async function goToLogin(page) {
    await page.goto('/');
    await page.getByTestId('landing-login').click();
    await expect(page.locator('input[name="username"]')).toBeVisible();
}

async function loginAsAgency(page) {
    await page.locator('input[name="username"]').fill('bravvo');
    await page.locator('input[name="password"]').fill('1@Wardogs');
    await page.locator('input[name="remember"]').check();
    await page.getByTestId('login-submit').click();
}

async function openClientWorkspaceFromAgency(page, clientId = 'C1') {
    await page.getByTestId(`agency-client-card-${clientId}`).hover();
    await page.getByTestId(`agency-access-os-${clientId}`).click();
    await expect(page.getByTestId('os-vault-card-V1')).toBeVisible();
}

test('smoke: binder sync and persistence basics', async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem('bravvo_lang', 'pt');
    });

    await goToLogin(page);
    await loginAsAgency(page);
    await openClientWorkspaceFromAgency(page, 'C1');

    const productName = `E2E Product ${Date.now()}`;

    await page.getByTestId('binder-tab-V2').click();
    await expect(page.getByTestId('v2-product-name-0')).toBeVisible();

    await page.getByTestId('v2-product-name-0').fill(productName);

    await page.getByTestId('v2-save-next').click();

    await page.getByTestId('binder-tab-OS').click();
    await expect(page.getByTestId('os-vault-card-V2')).toContainText(productName);

    const ideaTitle = `E2E Idea ${Date.now()}`;

    await page.getByTestId('binder-tab-V5').click();
    await expect(page.getByTestId('v5-new-idea')).toBeVisible();

    await page.getByTestId('v5-new-idea').click();
    await page.getByTestId('v5-idea-title').fill(ideaTitle);
    await page.getByTestId('v5-save-idea').click();

    await page.getByTestId('v5-complete').click();
    await expect(page.getByTestId('os-vault-card-V5')).toContainText(ideaTitle);
});
