import { test, expect } from '@playwright/test';

const fnv1a = (str) => {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i += 1) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
};

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
}

async function openClientWorkspaceFromAgency(page, clientId = 'C1') {
    const anyBinderTab = page.locator('[data-testid^="binder-tab-"]').first();
    const binderBack = page.getByTestId('binder-back-to-agency');
    const osTab = page.getByTestId('binder-tab-OS');
    const vaultCard = page.getByTestId('os-vault-card-V1');

    await Promise.race([
        binderBack.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
        anyBinderTab.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
        page.getByTestId('agency-dashboard').waitFor({ state: 'visible', timeout: 10000 }).catch(() => null)
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
        if (await anyBinderTab.isVisible({ timeout: 1000 }).catch(() => false)) {
            break;
        }
        if (await accessBtn.count()) {
            await accessBtn.click({ force: true, noWaitAfter: true });
        } else {
            await fallbackBtn.click({ force: true, noWaitAfter: true });
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

test('workspace tools: preferences + backup + snapshots + audit', async ({ page }, testInfo) => {
    const clientId = 'C1';

    await page.addInitScript(() => {
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem('bravvo_lang', 'pt');
    });

    await goToLogin(page);
    await loginAsAgency(page);
    await openClientWorkspaceFromAgency(page, clientId);

    await page.getByTestId('binder-tab-OS').click();
    await expect(page.getByTestId('os-quick-add')).toBeVisible();

    await page.getByTestId('os-open-workspace-tools').click();
    await expect(page.getByTestId('workspace-tools-modal')).toBeVisible();

    // Default tab is now 'Marca', so we need to switch to 'Preferências' (tools) for auto-inspire
    await expect(page.getByTestId('workspace-tab-brand')).toBeVisible();
    await page.getByTestId('workspace-tab-tools').click();

    const autoInspireCheckbox = page.getByTestId('workspace-auto-inspire').locator('input[type="checkbox"]');
    if (await autoInspireCheckbox.isChecked()) {
        await autoInspireCheckbox.click({ force: true });
        await expect(autoInspireCheckbox).not.toBeChecked();
    }

    await autoInspireCheckbox.click({ force: true });
    await expect(autoInspireCheckbox).toBeChecked();

    await page.getByRole('button', { name: 'Auditoria' }).click();
    await expect(page.getByText('TOGGLE_AUTO_INSPIRE').first()).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: 'Backup' }).click();

    const exportBefore = await page.evaluate((id) => {
        const raw = localStorage.getItem(`bravvo_app_data_snapshots:${id}`) || '[]';
        const snaps = JSON.parse(raw);
        if (!Array.isArray(snaps)) return { firstTs: null };
        return { firstTs: snaps[0]?.ts || null };
    }, clientId);

    const exportDownloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    await page.getByTestId('workspace-export').click();
    const exportDownload = await exportDownloadPromise;
    if (exportDownload) {
        expect(exportDownload.suggestedFilename()).toContain(`bravvo-workspace-${clientId}-`);
    }

    await expect.poll(async () => {
        return page.evaluate((id) => {
            const raw = localStorage.getItem(`bravvo_app_data_snapshots:${id}`) || '[]';
            const snaps = JSON.parse(raw);
            if (!Array.isArray(snaps) || !snaps[0]?.ts) return null;
            return snaps[0].ts;
        }, clientId);
    }, { timeout: 15000 }).not.toEqual(exportBefore.firstTs);

    await page.getByRole('button', { name: 'Auditoria' }).click();
    await expect(page.getByText('EXPORT_WORKSPACE').first()).toBeVisible({ timeout: 15000 });

    const currentAppData = await page.evaluate((id) => {
        const raw = localStorage.getItem(`bravvo_app_data:${id}`) || localStorage.getItem('bravvo_app_data') || '{}';
        try {
            return JSON.parse(raw);
        } catch {
            return {};
        }
    }, clientId);

    const importPayload = {
        ...currentAppData,
        id: clientId,
        workspacePrefs: {
            ...(currentAppData?.workspacePrefs || {}),
            autoInspire: false
        },
        kpis: {
            ...(currentAppData?.kpis || {}),
            sales: {
                ...((currentAppData?.kpis || {})?.sales || {}),
                value: 777
            }
        }
    };

    const checksum = fnv1a(JSON.stringify(importPayload));
    const bundle = {
        type: 'bravvo_workspace_export',
        version: 1,
        exportedAt: new Date().toISOString(),
        clientId,
        schemaVersion: Number.isFinite(importPayload?.schemaVersion) ? importPayload.schemaVersion : 1,
        checksum,
        payload: importPayload
    };

    await page.getByRole('button', { name: 'Backup' }).click();

    await page.getByTestId('workspace-import-file').setInputFiles({
        name: `e2e-import-${Date.now()}.json`,
        mimeType: 'application/json',
        buffer: Buffer.from(JSON.stringify(bundle, null, 2))
    });

    await expect(page.getByTestId('workspace-import-apply')).toBeEnabled();

    page.once('dialog', dialog => dialog.accept());
    await page.getByTestId('workspace-import-apply').click();

    await expect(page.getByTestId('workspace-tools-modal')).toHaveCount(0, { timeout: 15000 });

    await expect.poll(async () => {
        return page.evaluate((id) => {
            const raw = localStorage.getItem(`bravvo_app_data:${id}`) || localStorage.getItem('bravvo_app_data') || '{}';
            const parsed = JSON.parse(raw);
            return {
                sales: parsed?.kpis?.sales?.value,
                autoInspire: Boolean(parsed?.workspacePrefs?.autoInspire)
            };
        }, clientId);
    }, { timeout: 15000 }).toEqual({ sales: 777, autoInspire: false });

    // Restore from an existing snapshot whose state differs from the imported one.
    // This avoids relying on a specific timestamp remaining in the "últimos 5" list.
    await page.getByTestId('os-open-workspace-tools').click();
    await expect(page.getByTestId('workspace-tools-modal')).toBeVisible();
    await page.getByRole('button', { name: 'Backup' }).click();
    await expect(page.getByTestId('workspace-snapshots')).toBeVisible();

    await expect.poll(async () => {
        return page.evaluate((id) => {
            const raw = localStorage.getItem(`bravvo_app_data_snapshots:${id}`) || '[]';
            const snaps = JSON.parse(raw);
            return Array.isArray(snaps) ? snaps.length : 0;
        }, clientId);
    }, { timeout: 15000 }).toBeGreaterThan(0);

    const restoreTarget = await page.evaluate((id) => {
        const raw = localStorage.getItem(`bravvo_app_data_snapshots:${id}`) || '[]';
        const snaps = JSON.parse(raw);
        if (!Array.isArray(snaps)) return null;

        const isDifferent = (entry) => {
            const data = entry?.data || {};
            const sales = data?.kpis?.sales?.value;
            const autoInspire = Boolean(data?.workspacePrefs?.autoInspire);
            return sales !== 777 || autoInspire !== false;
        };

        const candidate = snaps.find(isDifferent) || snaps[snaps.length - 1] || null;
        if (!candidate?.ts) return null;
        const data = candidate?.data || {};
        return {
            ts: candidate.ts,
            expected: {
                sales: data?.kpis?.sales?.value,
                autoInspire: Boolean(data?.workspacePrefs?.autoInspire)
            }
        };
    }, clientId);

    expect(restoreTarget?.ts).toBeTruthy();

    const restoreBtn = page.getByTestId(`workspace-restore-${restoreTarget.ts}`);
    await expect(restoreBtn).toHaveCount(1, { timeout: 15000 });
    await restoreBtn.evaluate(el => el.scrollIntoView({ block: 'center' }));
    page.once('dialog', dialog => dialog.accept());
    await restoreBtn.evaluate(el => el.click());

    await expect(page.getByTestId('workspace-tools-modal')).toHaveCount(0, { timeout: 15000 });

    await expect.poll(async () => {
        return page.evaluate((id) => {
            const raw = localStorage.getItem(`bravvo_app_data:${id}`) || localStorage.getItem('bravvo_app_data') || '{}';
            const parsed = JSON.parse(raw);
            return {
                sales: parsed?.kpis?.sales?.value,
                autoInspire: Boolean(parsed?.workspacePrefs?.autoInspire)
            };
        }, clientId);
    }, { timeout: 15000 }).toEqual(restoreTarget.expected);

    await page.getByTestId('os-open-workspace-tools').click();
    await expect(page.getByTestId('workspace-tools-modal')).toBeVisible();

    await page.getByTestId('workspace-tab-tools').click();

    const restoredAutoInspire = await autoInspireCheckbox.isChecked();
    expect(restoredAutoInspire).toBe(Boolean(restoreTarget.expected.autoInspire));

    await page.getByRole('button', { name: 'Auditoria' }).click();
    await expect(page.getByText('IMPORT_WORKSPACE').first()).toBeVisible();
    await expect(page.getByText('RESTORE_SNAPSHOT').first()).toBeVisible();

    const auditDownloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    await page.getByTestId('workspace-audit-download').click();
    const auditDownload = await auditDownloadPromise;
    if (auditDownload && !testInfo.project.name.startsWith('mobile')) {
        expect(auditDownload.suggestedFilename()).toContain(`bravvo-audit-${clientId}-`);
    }

    await page.getByRole('button', { name: /FECHAR/i }).click();
    await expect(page.getByTestId('workspace-tools-modal')).toHaveCount(0);
});
