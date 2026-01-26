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

test('flags: drawers + insights actions + undo', async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem('bravvo_lang', 'pt');

        localStorage.setItem(
            'bravvo_feature_flags',
            JSON.stringify({
                DASH_ONBOARDING: false,
                DASH_INSIGHTS: true,
                DASH_INSIGHTS_ACTIONS: true,
                DASH_EDIT_DRAWER: true,
                DASH_QUICKADD_DRAWER: true,
                DASH_UNDO: true,
                DASH_SKELETON_REAL: true,
                DASH_EMPTY_STATES: true
            })
        );
    });

    // 1) Login + open workspace
    await goToLogin(page);
    await loginAsAgency(page);
    await openClientWorkspaceFromAgency(page, 'C1');

    // 2) Go to OS
    await page.getByTestId('binder-tab-OS').click();
    await expect(page.getByTestId('os-quick-add')).toBeVisible();

    // 3) QuickAdd opens in Drawer
    const quickInitiative = `E2E Roadmap Flags ${Date.now()}`;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    await page.getByTestId('os-quick-add').click();
    await expect(page.getByTestId('quickadd-drawer')).toBeVisible();

    await page.getByTestId('quickadd-initiative').fill(quickInitiative);
    await page.getByTestId('quickadd-date').fill(tomorrowStr);
    await page.getByTestId('quickadd-submit').click();

    await expect(page.locator('[data-toast-type="success"]').first()).toBeVisible();
    await expect(page.getByTestId('quickadd-drawer')).toHaveCount(0);

    // 4) Insight action triggers focus/scroll + row highlight
    const insightAction = page.getByRole('button', { name: /Ver atrasados|Ver produção|Gerar arte|Iniciar produção|Ver entregas/ }).first();
    await expect(insightAction).toBeVisible();
    await insightAction.click();

    await expect(
        page.locator('[data-testid^="d2-row-"][class*="ring-purple-500/30"]').first()
    ).toBeVisible();

    // Ensure the item we created is now visible (dateFilter should have switched to month)
    const createdRow = page.locator('[data-testid^="d2-row-"]', { hasText: quickInitiative }).first();
    await expect(createdRow).toBeVisible();

    const createdRowTestId = await createdRow.getAttribute('data-testid');
    expect(createdRowTestId).toBeTruthy();
    const createdItemId = createdRowTestId.replace('d2-row-', '');

    // 5) Edit opens in Drawer
    await createdRow.hover();
    const editButton = createdRow.locator('[data-testid^="d2-edit-"]');
    await expect(editButton).toBeVisible();
    await editButton.click();
    await expect(page.getByTestId('detail-edit-drawer')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('detail-edit-drawer')).toHaveCount(0);

    // 6) Undo: change status then undo via toast action
    await page.getByTestId(`d2-status-${createdItemId}-trigger`).click();
    await page.getByTestId(`d2-status-${createdItemId}-opt-done`).click();

    const statusInfoToast = page.locator('[data-toast-type="info"]').filter({ hasText: 'Status atualizado' }).first();
    await expect(statusInfoToast).toBeVisible();
    await expect(page.getByTestId(`d2-status-${createdItemId}-trigger`)).toContainText('done');

    await expect(statusInfoToast.getByRole('button', { name: 'Desfazer' })).toBeVisible();
    await statusInfoToast.getByRole('button', { name: 'Desfazer' }).click();
    await expect(page.getByTestId(`d2-status-${createdItemId}-trigger`)).toContainText('draft');
});
