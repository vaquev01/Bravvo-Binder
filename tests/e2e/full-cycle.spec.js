import { test, expect } from '@playwright/test';

async function goToLogin(page) {
    const anyBinderTab = page.locator('[data-testid^="binder-tab-"]').first();
    const agencyDash = page.getByTestId('agency-dashboard');
    const username = page.locator('input[name="username"]');
    const landingBtn = page.getByTestId('landing-login');
    const errorReload = page.getByRole('button', { name: /Recarregar Página/i });

    for (let attempt = 0; attempt < 2; attempt += 1) {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => null);

        if (await errorReload.count()) {
            await errorReload.click({ noWaitAfter: true });
            await page.waitForLoadState('domcontentloaded');
            await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => null);
        }

        await Promise.race([
            anyBinderTab.waitFor({ state: 'visible', timeout: 30000 }).catch(() => null),
            agencyDash.waitFor({ state: 'visible', timeout: 30000 }).catch(() => null),
            username.first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => null),
            landingBtn.waitFor({ state: 'visible', timeout: 30000 }).catch(() => null)
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
            await landingBtn.click({ noWaitAfter: true });
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
        const alreadyInBinder = await Promise.race([
            binderBack.isVisible({ timeout: 1000 }).catch(() => false),
            anyBinderTab.isVisible({ timeout: 1000 }).catch(() => false)
        ]);
        if (alreadyInBinder) break;

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

    if ((await vaultCard.count()) === 0) {
        await osTab.click({ force: true });
    }
    await expect(vaultCard).toBeVisible({ timeout: 30000 });
}

test('full cycle: Vault -> Playbook plan -> Governance -> recalibration -> reload persistence', async ({ page }) => {
    test.setTimeout(120_000);
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
    await expect(page.locator('[data-toast-type="success"]').first()).toBeVisible();

    // Fill Vault V2 with a real hero product
    const productName = `E2E Hero ${Date.now()}`;
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

    // Start governance mode so the Playbook button is available
    await page.getByTestId('binder-tab-OS').click();
    await expect(page.getByTestId('os-toggle-governance')).toBeVisible();
    await page.getByTestId('os-toggle-governance').click();

    await expect(page.getByTestId('os-open-playbooks')).toBeVisible();
    await page.getByTestId('os-open-playbooks').click();

    await expect(page.getByTestId('playbook-modal')).toBeVisible();
    await page.getByTestId('playbook-select-retail_growth').click();
    await page.getByTestId('playbook-apply').click();

    await expect(page.locator('[data-toast-type="success"]').first()).toBeVisible();

    // Pick the first created playbook row and generate an IDF prompt, which must include the hero product name
    const monthFilter = page.getByRole('button', { name: /MÊS|MES|MONTH/i }).first();
    if (await monthFilter.isVisible()) {
        await monthFilter.click();
    }

    const firstPlaybookRow = page.locator('[data-testid^="d2-row-"]', { hasText: /Playbook:/i }).first();
    await expect(firstPlaybookRow).toBeVisible();

    const rowTestId = await firstPlaybookRow.getAttribute('data-testid');
    expect(rowTestId).toBeTruthy();
    const itemId = rowTestId.replace('d2-row-', '');

    await page.getByTestId(`d2-generate-art-${itemId}`).click();
    await expect(page.getByTestId('creative-provider')).toBeVisible();
    await page.getByTestId('creative-provider').selectOption('ai');
    await page.getByTestId('creative-generate-prompt').click();

    await expect(page.getByTestId('prompt-overlay')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('prompt-content')).toContainText(productName);
    await page.getByTestId('prompt-close').click();

    // Advance through governance steps and change a KPI goal
    await expect(page.getByTestId('gov-goal-revenue')).toBeVisible();
    await page.getByTestId('gov-goal-revenue').fill('12345');

    for (let i = 0; i < 4; i++) {
        await page.getByTestId('governance-next').click();
    }

    await page.getByTestId('gov-priority-0').fill(`Prioridade E2E ${Date.now()}`);
    await page.getByTestId('governance-complete').click();

    // Avoid strict-mode ambiguity (toast + modal). The ATA view uses an <h2>.
    const ataHeading = page.locator('h2', { hasText: 'Governança Concluída' });
    await expect(ataHeading).toBeVisible({ timeout: 20000 });

    // Close "Governança Concluída" view (this should apply changes)
    const closeAndApply = page.getByRole('button', { name: /Fechar e Aplicar Mudanças/i });
    await closeAndApply.scrollIntoViewIfNeeded();
    await closeAndApply.click();

    // After closing, "Ordens do Ciclo" should show up (recalibration persisted)
    const cycleOrders = page.locator('text=Ordens do Ciclo').first();
    await cycleOrders.scrollIntoViewIfNeeded();
    await expect(cycleOrders).toBeVisible({ timeout: 10000 });

    // Reload and verify the recalibration section still exists
    await page.reload();
    await page.waitForTimeout(250);
    const isOnAgency = await page.getByTestId('agency-dashboard').count();
    const isOnOs = await page.getByTestId('os-vault-card-V1').count();
    if (isOnAgency) {
        await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });
        await openClientWorkspaceFromAgency(page, 'C1');
    } else if (isOnOs) {
        await expect(page.getByTestId('os-vault-card-V1')).toBeVisible({ timeout: 10000 });
    } else {
        // Fallback: session might have dropped to landing/login.
        await goToLogin(page);
        if (await page.getByTestId('agency-dashboard').count() === 0) {
            await loginAsAgency(page);
        }
        await openClientWorkspaceFromAgency(page, 'C1');
    }

    await page.getByTestId('binder-tab-OS').click({ force: true });
    const cycleOrdersAfterReload = page.locator('text=Ordens do Ciclo').first();
    await cycleOrdersAfterReload.scrollIntoViewIfNeeded();
    await expect(cycleOrdersAfterReload).toBeVisible({ timeout: 10000 });
});
