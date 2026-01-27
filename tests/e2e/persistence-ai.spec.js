import { test, expect } from '@playwright/test';

async function goToLogin(page) {
    const anyBinderTab = page.locator('[data-testid^="binder-tab-"]').first();
    const agencyDash = page.getByTestId('agency-dashboard');
    const username = page.locator('input[name="username"]');
    const landingBtn = page.getByTestId('landing-login');
    const errorReload = page.getByRole('button', { name: /Recarregar Página/i });

    for (let attempt = 0; attempt < 2; attempt += 1) {
        await page.goto('./', { waitUntil: 'domcontentloaded' });

        if (await errorReload.count()) {
            await errorReload.click({ noWaitAfter: true });
            await page.waitForLoadState('domcontentloaded');
            await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => null);
        }

        await Promise.race([
            anyBinderTab.waitFor({ state: 'visible', timeout: 45000 }).catch(() => null),
            agencyDash.waitFor({ state: 'visible', timeout: 45000 }).catch(() => null),
            username.first().waitFor({ state: 'visible', timeout: 45000 }).catch(() => null),
            landingBtn.waitFor({ state: 'visible', timeout: 45000 }).catch(() => null)
        ]);

        if (await anyBinderTab.count()) return;
        if (await agencyDash.count()) {
            await expect(agencyDash).toBeVisible({ timeout: 30000 });
            return;
        }
        if (await username.count()) {
            await expect(username.first()).toBeVisible({ timeout: 30000 });
            return;
        }

        if (await landingBtn.count()) {
            try {
                await landingBtn.click({ noWaitAfter: true });
            } catch {
                // UI can unmount during click; proceed
            }
            await expect(username.first()).toBeVisible({ timeout: 30000 });
            return;
        }

        if (attempt === 0) {
            await page.reload();
        }
    }

    await expect(username.first()).toBeVisible({ timeout: 30000 });
}

async function loginAsAgency(page) {
    const anyBinderTab = page.locator('[data-testid^="binder-tab-"]').first();
    if (await anyBinderTab.isVisible({ timeout: 1000 }).catch(() => false)) {
        return;
    }
    if (await page.getByTestId('agency-dashboard').count()) {
        await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 15000 });
        return;
    }
    const username = page.locator('input[name="username"]');
    await expect(username.first()).toBeVisible({ timeout: 15000 });
    await page.locator('input[name="username"]').fill('bravvo');
    await page.locator('input[name="password"]').fill('1@Wardogs');
    await page.locator('input[name="remember"]').check();
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });
}

async function openClientWorkspaceFromAgency(page, clientId = 'C1') {
    const anyBinderTab = page.locator('[data-testid^="binder-tab-"]').first();
    const binderBack = page.getByTestId('binder-back-to-agency');
    const osTab = page.getByTestId('binder-tab-OS');
    const vaultCard = page.getByTestId('os-vault-card-V1');

    await Promise.race([
        binderBack.waitFor({ state: 'visible', timeout: 20000 }).catch(() => null),
        anyBinderTab.waitFor({ state: 'visible', timeout: 20000 }).catch(() => null),
        page.getByTestId('agency-dashboard').waitFor({ state: 'visible', timeout: 20000 }).catch(() => null)
    ]);

    if (await binderBack.count() || await anyBinderTab.count()) {
        if ((await vaultCard.count()) === 0) {
            await osTab.click({ force: true });
        }
        await expect(vaultCard).toBeVisible({ timeout: 30000 });
        return;
    }

    await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 30000 });
    const card = page.getByTestId(`agency-client-card-${clientId}`);
    await expect(card).toBeVisible({ timeout: 30000 });
    const accessBtn = page.getByTestId(`agency-access-os-${clientId}`);
    const fallbackBtn = card.getByRole('button', { name: /Acessar OS/i }).first();

    for (let attempt = 0; attempt < 3; attempt += 1) {
        if (await binderBack.count() || await anyBinderTab.count()) break;
        if (await accessBtn.count()) {
            await accessBtn.click({ force: true, noWaitAfter: true, timeout: 2000 }).catch(() => null);
        } else {
            await fallbackBtn.click({ force: true, noWaitAfter: true, timeout: 2000 }).catch(() => null);
        }
        if (attempt > 0 && typeof accessBtn.tap === 'function') {
            try {
                await accessBtn.tap();
            } catch {
                // ignore
            }
        }
        const entered = await Promise.race([
            binderBack.isVisible({ timeout: 6000 }).catch(() => false),
            anyBinderTab.isVisible({ timeout: 6000 }).catch(() => false)
        ]);
        if (entered) break;
        await page.waitForTimeout(250);
    }

    await Promise.race([
        binderBack.waitFor({ state: 'visible', timeout: 30000 }).catch(() => null),
        anyBinderTab.waitFor({ state: 'visible', timeout: 30000 }).catch(() => null)
    ]);
    if (await binderBack.count()) {
        await expect(binderBack).toBeVisible({ timeout: 30000 });
    } else {
        await expect(anyBinderTab).toBeVisible({ timeout: 30000 });
    }
    if ((await vaultCard.count()) === 0) {
        await osTab.click({ force: true });
    }
    await expect(vaultCard).toBeVisible({ timeout: 30000 });
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
    const errorReload = page.getByRole('button', { name: /Recarregar Página/i });
    const v2AddProduct = page.getByTestId('v2-add-product');
    const v2Name0 = page.getByTestId('v2-product-name-0');

    for (let attempt = 0; attempt < 2; attempt += 1) {
        await page.getByTestId('binder-tab-V2').click({ force: true });

        await Promise.race([
            v2AddProduct.waitFor({ state: 'visible', timeout: 30000 }).catch(() => null),
            v2Name0.waitFor({ state: 'visible', timeout: 30000 }).catch(() => null),
            errorReload.waitFor({ state: 'visible', timeout: 30000 }).catch(() => null)
        ]);

        if (await errorReload.count()) {
            await errorReload.click({ noWaitAfter: true });
            await goToLogin(page);
            await loginAsAgency(page);
            await openClientWorkspaceFromAgency(page, 'C1');
            continue;
        }

        if ((await v2AddProduct.count()) + (await v2Name0.count()) > 0) break;
    }

    expect((await v2AddProduct.count()) + (await v2Name0.count())).toBeGreaterThan(0);

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

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    await page.getByTestId('quickadd-date').fill(tomorrowStr);

    await page.getByTestId('quickadd-submit').click();
    await expect(page.locator('[data-toast-type="success"]').first()).toBeVisible();
    await expect(quickAddContainer).toHaveCount(0);

    const monthFilter = page.getByRole('button', { name: /MÊS|MES|MONTH/i }).first();
    if (await monthFilter.isVisible()) {
        await monthFilter.click();
    }

    const createdRow = page.locator('[data-testid^="d2-row-"]', { hasText: quickInitiative }).first();
    await expect(createdRow).toHaveCount(1);
    await createdRow.scrollIntoViewIfNeeded();
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
    await goToLogin(page);
    await loginAsAgency(page);
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
