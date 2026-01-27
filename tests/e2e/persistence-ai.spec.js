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
    await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });
}

async function openClientWorkspaceFromAgency(page, clientId = 'C1') {
    await page.getByTestId(`agency-client-card-${clientId}`).hover();
    await page.getByTestId(`agency-access-os-${clientId}`).click();
    await expect(page.getByTestId('os-vault-card-V1')).toBeVisible({ timeout: 10000 });
}

test('persistence + multi-client isolation + reset + AI prompt uses Vault data', async ({ page }) => {
    await page.addInitScript(() => {
        if (sessionStorage.getItem('__bravvo_e2e_initialized__') === '1') return;
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem('bravvo_lang', 'pt');
        sessionStorage.setItem('__bravvo_e2e_initialized__', '1');
    });

    await goToLogin(page);
    await loginAsAgency(page);
    await openClientWorkspaceFromAgency(page, 'C1');

    page.once('dialog', dialog => dialog.accept());
    await page.getByTestId('binder-tab-OS').click();
    await expect(page.getByTestId('os-reset-workspace')).toBeVisible();
    await page.getByTestId('os-reset-workspace').click();
    await expect(page.locator('[data-toast-type="success"]')).toBeVisible();

    const productName = `E2E Product ${Date.now()}`;
    await page.getByTestId('binder-tab-V2').click();
    await expect(page.getByTestId('v2-add-product').or(page.getByTestId('v2-product-name-0'))).toBeVisible();

    if (await page.getByTestId('v2-product-name-0').count() === 0) {
        await page.getByTestId('v2-add-product').click();
        await expect(page.getByTestId('v2-product-name-0')).toBeVisible();
    }
    await page.getByTestId('v2-product-name-0').fill(productName);
    await page.getByTestId('v2-save-next').click();

    await page.getByTestId('binder-tab-OS').click();
    await expect(page.getByTestId('os-quick-add')).toBeVisible();
    const quickInitiative = `E2E Roadmap ${Date.now()}`;
    await page.getByTestId('os-quick-add').click();
    const quickAddContainer = page.getByTestId('quickadd-drawer').or(page.getByTestId('quickadd-modal'));
    await expect(quickAddContainer).toBeVisible();
    await page.getByTestId('quickadd-initiative').fill(quickInitiative);
    await page.getByTestId('quickadd-submit').click();
    await expect(page.locator('[data-toast-type="success"]').first()).toBeVisible();
    await expect(quickAddContainer).toHaveCount(0);

    const monthFilter = page.getByRole('button', { name: /MÊS|MES|MONTH/i }).first();
    if (await monthFilter.isVisible()) {
        await monthFilter.click();
    }

    const createdRow = page.locator('[data-testid^="d2-row-"]', { hasText: quickInitiative }).first();
    await expect(createdRow).toBeVisible();
    const createdRowTestId = await createdRow.getAttribute('data-testid');
    expect(createdRowTestId).toBeTruthy();
    const createdItemId = createdRowTestId.replace('d2-row-', '');

    await page.getByTestId(`d2-generate-art-${createdItemId}`).click();
    await expect(page.getByTestId('creative-provider')).toBeVisible();
    await page.getByTestId('creative-provider').selectOption('ai');
    await page.getByTestId('creative-generate-prompt').click();

    await expect(page.getByTestId('prompt-overlay')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('prompt-content')).toContainText(productName);

    await page.getByTestId('prompt-close').click();
    await expect(page.getByTestId('prompt-overlay')).toHaveCount(0);

    await page.reload();
    if (await page.getByTestId('agency-dashboard').count()) {
        await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });
    } else {
        await goToLogin(page);
        await loginAsAgency(page);
    }
    await openClientWorkspaceFromAgency(page, 'C1');
    await page.getByTestId('binder-tab-V2').click();
    await expect(page.getByTestId('v2-product-name-0')).toHaveValue(productName);

    await page.getByTestId('binder-back-to-agency').click();
    await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });
    await openClientWorkspaceFromAgency(page, 'C2');
    await page.getByTestId('binder-tab-V2').click();
    if (await page.getByTestId('v2-product-name-0').count() > 0) {
        await expect(page.getByTestId('v2-product-name-0')).not.toHaveValue(productName);
    } else {
        await expect(page.getByTestId('v2-add-product')).toBeVisible();
    }

    await page.getByTestId('binder-back-to-agency').click();
    await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });
    await openClientWorkspaceFromAgency(page, 'C1');
    await page.getByTestId('binder-tab-V2').click();
    await expect(page.getByTestId('v2-product-name-0')).toHaveValue(productName);

    page.once('dialog', dialog => dialog.accept());
    await page.getByTestId('binder-tab-OS').click();
    await page.getByTestId('os-reset-workspace').click();
    await expect(page.locator('[data-toast-type="success"]').first()).toBeVisible();
    await page.getByTestId('binder-tab-V2').click();
    await expect(page.getByTestId('v2-product-name-0')).toHaveCount(0);
    await expect(page.getByTestId('v2-add-product')).toBeVisible();
});
