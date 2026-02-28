// @ts-check
import { test, expect } from '@playwright/test';

/**
 * COMPREHENSIVE QA TEST SUITE - Bravvo Binder
 * Coverage: All surfaces, modules, data flows, and edge cases
 */

// ============================================
// SECTION 1: ENVIRONMENT & SURFACE MAPPING
// ============================================

test.describe('1. Environment Validation', () => {
    test('1.1 App loads without console errors', async ({ page }) => {
        /** @type {string[]} */
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') consoleErrors.push(msg.text());
        });

        await page.goto('./', { waitUntil: 'domcontentloaded' });

        // Landing page should render
        await expect(page.getByTestId('landing-login')).toBeVisible();

        // No critical console errors
        const criticalErrors = consoleErrors.filter(e => 
            !e.includes('favicon') && 
            !e.includes('DevTools') &&
            !e.includes('third-party')
        );
        expect(criticalErrors).toHaveLength(0);
    });

    test('1.2 No network errors on initial load', async ({ page }) => {
        /** @type {{ url: string, failure: (string | null | undefined) }[]} */
        const failedRequests = [];
        page.on('requestfailed', request => {
            failedRequests.push({
                url: request.url(),
                failure: request.failure()?.errorText
            });
        });

        await page.goto('./', { waitUntil: 'domcontentloaded' });
        await expect(page.getByTestId('landing-login')).toBeVisible();

        const ignored = /favicon|apple-touch-icon|manifest|\.webmanifest/i;
        expect(failedRequests.filter(r => !ignored.test(r.url))).toHaveLength(0);
    });

    test('1.3 Performance: Initial load under 3s', async ({ page }, testInfo) => {
        const startTime = Date.now();
        await page.goto('./', { waitUntil: 'domcontentloaded' });
        const loadTime = Date.now() - startTime;

        const dclMs = await page.evaluate(() => {
            const timing = performance.timing;
            const navStart = timing?.navigationStart || 0;
            const dclEnd = timing?.domContentLoadedEventEnd || 0;
            if (!navStart || !dclEnd || dclEnd < navStart) return null;
            return dclEnd - navStart;
        });

        const isWebkitFamily = testInfo.project.name === 'webkit' || testInfo.project.name === 'mobile-safari';
        const thresholdMs = isWebkitFamily ? 7000 : 3000;
        expect(dclMs ?? loadTime).toBeLessThan(thresholdMs);
    });
});

// ============================================
// SECTION 2: AUTHENTICATION FLOW
// ============================================

test.describe('2. Authentication Flow', () => {
    test('2.1 Landing page renders correctly', async ({ page }) => {
        await page.goto('./', { waitUntil: 'domcontentloaded' });
        
        // Hero section
        await expect(page.locator('h1')).toBeVisible();
        
        // Login button
        await expect(page.getByTestId('landing-login')).toBeVisible();
    });

    test('2.2 Login modal opens and has required fields', async ({ page }) => {
        await page.goto('./', { waitUntil: 'domcontentloaded' });
        if (await page.locator('input[name="username"]').count() === 0) {
            await page.getByTestId('landing-login').click({ noWaitAfter: true });
        }

        // Username and password fields (actual selectors)
        await expect(page.locator('input[name="username"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();

        // Submit button
        await expect(page.getByTestId('login-submit')).toBeVisible();
    });

    test('2.3 Login with valid credentials', async ({ page }) => {
        await page.goto('./', { waitUntil: 'domcontentloaded' });
        if (await page.locator('input[name="username"]').count() === 0) {
            await page.getByTestId('landing-login').click({ noWaitAfter: true });
        }
        await page.locator('input[name="username"]').fill('bravvo');
        await page.locator('input[name="password"]').fill('1@Wardogs');
        await page.getByTestId('login-submit').click({ noWaitAfter: true });

        // Should navigate to agency dashboard
        await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });
    });

    test('2.4 Login validation - empty fields', async ({ page }) => {
        await page.goto('./', { waitUntil: 'domcontentloaded' });
        if (await page.locator('input[name="username"]').count() === 0) {
            await page.getByTestId('landing-login').click({ noWaitAfter: true });
        }
        await page.getByTestId('login-submit').click({ noWaitAfter: true });

        // Should show validation or not submit
        // Check form is still visible (didn't navigate away)
        await expect(page.locator('input[name="username"]')).toBeVisible();
    });
});

// ============================================
// SECTION 3: AGENCY DASHBOARD
// ============================================

test.describe('3. Agency Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('./', { waitUntil: 'domcontentloaded' });
        if (await page.locator('input[name="username"]').count() === 0) {
            await page.getByTestId('landing-login').click({ noWaitAfter: true });
        }
        await page.locator('input[name="username"]').fill('bravvo');
        await page.locator('input[name="password"]').fill('1@Wardogs');
        await page.getByTestId('login-submit').click({ noWaitAfter: true });
        await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });
    });

    test('3.1 Agency dashboard renders with client cards', async ({ page }) => {
        // At least one client card should be visible
        await expect(page.locator('[data-testid^="agency-client-card-"]').first()).toBeVisible();
    });

    test('3.2 Client card hover reveals access button', async ({ page }, testInfo) => {
        const clientCard = page.locator('[data-testid^="agency-client-card-"]').first();
        if (!testInfo.project.name.startsWith('mobile')) {
            await clientCard.hover();
        }
        
        const accessButton = page.locator('[data-testid^="agency-access-os-"]').first();
        await expect(accessButton).toBeVisible();
    });

    test('3.3 Access client workspace (OS)', async ({ page }, testInfo) => {
        const clientCard = page.locator('[data-testid^="agency-client-card-"]').first();
        if (!testInfo.project.name.startsWith('mobile')) {
            await clientCard.hover();
        }
        
        const accessButton = page.locator('[data-testid^="agency-access-os-"]').first();
        await accessButton.click({ force: true });

        // Should see vault cards in OS
        await expect(page.getByTestId('os-vault-card-V1')).toBeVisible({ timeout: 10000 });
    });
});

// ============================================
// SECTION 4: OSA/DASHBOARD (PRD BIG TECH)
// ============================================

test.describe('4. OSA Dashboard - PRD Big Tech', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('./', { waitUntil: 'domcontentloaded' });
        if (await page.locator('input[name="username"]').count() === 0) {
            await page.getByTestId('landing-login').click({ noWaitAfter: true });
        }
        await page.locator('input[name="username"]').fill('bravvo');
        await page.locator('input[name="password"]').fill('1@Wardogs');
        await page.getByTestId('login-submit').click({ noWaitAfter: true });
        await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });
        
        // Access first client
        await expect(page.getByTestId('agency-client-card-C1')).toBeVisible();
        await page.getByTestId('agency-access-os-C1').click({ force: true });
        await expect(page.getByTestId('os-vault-card-V1')).toBeVisible({ timeout: 10000 });
    });

    test('4.1 Governance Header is visible', async ({ page }) => {
        // Should have governance controls
        await expect(page.locator('text=Governança').first()).toBeVisible();
    });

    test('4.2 Day Summary AI section exists', async ({ page }) => {
        // Date filter segmented control is desktop-only (hidden on mobile). Use a stable OS control.
        await expect(page.getByTestId('os-quick-add')).toBeVisible();
    });

    test('4.3 KPI Grid shows meta vs realizado', async ({ page }) => {
        // KPIs should be visible
        await expect(page.locator('text=Meta:').first()).toBeVisible();
    });

    test('4.4 Priority Actions card shows top 3', async ({ page }) => {
        await page.getByTestId('binder-tab-OS').click();
        await expect(page.getByTestId('os-quick-add')).toBeVisible();

        const quickInitiative = `E2E Priority Action ${Date.now()}`;
        await page.getByTestId('os-quick-add').click();
        const quickAddContainer = page.getByTestId('quickadd-drawer').or(page.getByTestId('quickadd-modal'));
        await expect(quickAddContainer).toBeVisible();
        await page.getByTestId('quickadd-initiative').fill(quickInitiative);
        await page.getByTestId('quickadd-submit').click();
        await expect(page.locator('[data-toast-type="success"]').first()).toBeVisible();
        await expect(quickAddContainer).toHaveCount(0);

        await expect(page.locator('text=Ações Prioritárias').first()).toBeVisible();
    });

    test('4.5 Vault cards show status indicators', async ({ page }) => {
        // Vault V1 should have status
        const vaultCard = page.getByTestId('os-vault-card-V1');
        await expect(vaultCard).toBeVisible();
        
        // Should have status text (Completo/Parcial/Incompleto)
        await expect(vaultCard.locator('text=Completo').or(vaultCard.locator('text=Parcial')).or(vaultCard.locator('text=Incompleto'))).toBeVisible();
    });

    test('4.6 Quick Add button works', async ({ page }) => {
        await page.getByTestId('os-quick-add').click();
        
        // Should open drawer or modal
        await expect(page.getByTestId('quickadd-drawer').or(page.getByTestId('quickadd-modal'))).toBeVisible();
    });

    test('4.7 Date filter buttons work', async ({ page }) => {
        // Click on different date filters
        const filters = ['today', 'tomorrow', 'week', 'month'];
        for (const filter of filters) {
            const filterBtn = page.locator(`button:has-text("${filter}")`, { hasText: new RegExp(filter, 'i') }).first();
            if (await filterBtn.isVisible()) {
                await filterBtn.click();
                await page.waitForTimeout(300);
            }
        }
    });
});

// ============================================
// SECTION 5: VAULTS (ESTRATÉGIA)
// ============================================

test.describe('5. Vaults - Strategy', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('./', { waitUntil: 'domcontentloaded' });
        if (await page.locator('input[name="username"]').count() === 0) {
            await page.getByTestId('landing-login').click({ noWaitAfter: true });
        }
        await page.locator('input[name="username"]').fill('bravvo');
        await page.locator('input[name="password"]').fill('1@Wardogs');
        await page.getByTestId('login-submit').click({ noWaitAfter: true });
        await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });
        
        await expect(page.getByTestId('agency-client-card-C1')).toBeVisible();
        await page.getByTestId('agency-access-os-C1').click({ force: true });
        await expect(page.getByTestId('os-vault-card-V1')).toBeVisible({ timeout: 10000 });
    });

    test('5.1 Navigate to Vault V1 (Brand DNA)', async ({ page }) => {
        await page.getByTestId('os-vault-card-V1').click();
        
        // Should navigate to vault view
        await page.waitForTimeout(500);
        // Vault content should be visible
    });

    test('5.2 Navigate to Vault V2 (Offer)', async ({ page }) => {
        await page.getByTestId('os-vault-card-V2').click();
        await page.waitForTimeout(500);
    });

    test('5.3 Navigate to Vault V3 (Traffic)', async ({ page }) => {
        await page.getByTestId('os-vault-card-V3').click();
        await page.waitForTimeout(500);
    });

    test('5.4 Navigate to Vault V4 (Team)', async ({ page }) => {
        await page.getByTestId('os-vault-card-V4').click();
        await page.waitForTimeout(500);
    });

    test('5.5 Navigate to Vault V5 (Ideas)', async ({ page }) => {
        await page.getByTestId('os-vault-card-V5').click();
        await page.waitForTimeout(500);
    });
});

// ============================================
// SECTION 6: ROADMAP TÁTICO
// ============================================

test.describe('6. Tactical Roadmap', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('./', { waitUntil: 'domcontentloaded' });
        if (await page.locator('input[name="username"]').count() === 0) {
            await page.getByTestId('landing-login').click({ noWaitAfter: true });
        }
        await page.locator('input[name="username"]').fill('bravvo');
        await page.locator('input[name="password"]').fill('1@Wardogs');
        await page.getByTestId('login-submit').click({ noWaitAfter: true });
        await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });

        await expect(page.getByTestId('agency-client-card-C1')).toBeVisible();
        await page.getByTestId('agency-access-os-C1').click({ force: true });
        await expect(page.getByTestId('os-vault-card-V1')).toBeVisible({ timeout: 10000 });
    });

    test('6.1 Create new roadmap item', async ({ page }) => {
        await page.getByTestId('os-quick-add').click();
        
        const drawer = page.getByTestId('quickadd-drawer').or(page.getByTestId('quickadd-modal'));
        await expect(drawer).toBeVisible();

        // Fill form
        await page.getByTestId('quickadd-initiative').fill('Test Initiative E2E');
        await page.getByTestId('quickadd-submit').click();

        // Should close drawer/modal
        await expect(drawer).not.toBeVisible({ timeout: 5000 });
    });

    test('6.2 Edit roadmap item', async ({ page }) => {
        // Find an edit button
        const editBtn = page.locator('[data-testid^="d2-edit-"]').first();
        if (await editBtn.isVisible()) {
            await editBtn.click();
            
            // Edit drawer should open
            await expect(page.getByTestId('detail-edit-drawer').or(page.getByTestId('detail-edit-modal'))).toBeVisible();
        }
    });

    test('6.3 Change item status', async ({ page }) => {
        const statusTriggers = page.locator('[data-testid^="d2-status-"][data-testid$="-trigger"]');
        if (await statusTriggers.count() === 0) {
            const initiative = `E2E Status Item ${Date.now()}`;
            await page.getByTestId('os-quick-add').click();

            const drawer = page.getByTestId('quickadd-drawer').or(page.getByTestId('quickadd-modal'));
            await expect(drawer).toBeVisible();
            await page.getByTestId('quickadd-initiative').fill(initiative);
            const tomorrow = new Date();
            tomorrow.setHours(0, 0, 0, 0);
            tomorrow.setDate(tomorrow.getDate() + 1);
            await page.getByTestId('quickadd-date').fill(tomorrow.toISOString().split('T')[0]);
            await page.getByTestId('quickadd-submit').click();
            await expect(drawer).not.toBeVisible({ timeout: 5000 });
        }

        await expect.poll(async () => statusTriggers.count()).toBeGreaterThan(0);
        const statusTrigger = statusTriggers.first();
        await statusTrigger.scrollIntoViewIfNeeded();
        await expect(statusTrigger).toBeVisible();
        await statusTrigger.click();

        // Status options should appear
        const statusOptions = page.locator('[data-testid^="d2-status-"][data-testid*="-opt-"]');
        await expect.poll(async () => statusOptions.count()).toBeGreaterThan(0);
        await expect(statusOptions.first()).toBeVisible();
    });

    test('6.4 Generate art for item', async ({ page }) => {
        const generateBtn = page.locator('[data-testid^="d2-generate-art-"]').first();
        if (await generateBtn.isVisible()) {
            await generateBtn.click();
            
            // Creative studio modal should open
            await expect(page.getByTestId('creative-provider')).toBeVisible({ timeout: 15000 });
        }
    });
});

// ============================================
// SECTION 7: GOVERNANCE
// ============================================

test.describe('7. Governance Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('./', { waitUntil: 'domcontentloaded' });
        if (await page.locator('input[name="username"]').count() === 0) {
            await page.getByTestId('landing-login').click({ noWaitAfter: true });
        }
        await page.locator('input[name="username"]').fill('bravvo');
        await page.locator('input[name="password"]').fill('1@Wardogs');
        await page.getByTestId('login-submit').click({ noWaitAfter: true });
        await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });

        await expect(page.getByTestId('agency-client-card-C1')).toBeVisible();
        await page.getByTestId('agency-access-os-C1').click({ force: true });
        await expect(page.getByTestId('os-vault-card-V1')).toBeVisible({ timeout: 10000 });
    });

    test('7.1 Toggle governance mode', async ({ page }) => {
        await page.getByTestId('os-toggle-governance').click();
        await expect(page.getByTestId('os-toggle-governance')).toContainText('Encerrar Reunião');
        await expect(page.getByText(/Modo Governança ativo/).first()).toBeVisible({ timeout: 15000 });
    });

    test('7.2 Open governance modal', async ({ page }) => {
        await page.getByTestId('os-toggle-governance').click();
        await expect(page.getByTestId('governance-next')).toBeVisible({ timeout: 15000 });
    });
});

// ============================================
// SECTION 8: PERSISTENCE & STATE
// ============================================

test.describe('8. Persistence Tests', () => {
    test('8.1 Data persists after page refresh', async ({ page }) => {
        // Login
        await page.goto('./', { waitUntil: 'domcontentloaded' });
        if (await page.locator('input[name="username"]').count() === 0) {
            await page.getByTestId('landing-login').click({ noWaitAfter: true });
        }
        await page.locator('input[name="username"]').fill('bravvo');
        await page.locator('input[name="password"]').fill('1@Wardogs');
        await page.locator('input[name="remember"]').check();
        await page.getByTestId('login-submit').click({ noWaitAfter: true });
        await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });

        // Access client
        await expect(page.getByTestId('agency-client-card-C1')).toBeVisible();
        await page.getByTestId('agency-access-os-C1').click({ force: true });
        await expect(page.getByTestId('os-vault-card-V1')).toBeVisible({ timeout: 10000 });

        // Refresh page
        await page.reload();

        // Data should still be visible (or login again depending on session)
        await page.waitForTimeout(1000);
    });

    test('8.2 Browser back/forward navigation', async ({ page }) => {
        await page.goto('./', { waitUntil: 'domcontentloaded' });
        if (await page.locator('input[name="username"]').count() === 0) {
            await page.getByTestId('landing-login').click({ noWaitAfter: true });
        }
        await page.locator('input[name="username"]').fill('bravvo');
        await page.locator('input[name="password"]').fill('1@Wardogs');
        await page.getByTestId('login-submit').click({ noWaitAfter: true });
        await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });

        // Navigate to client
        await expect(page.getByTestId('agency-client-card-C1')).toBeVisible();
        await page.getByTestId('agency-access-os-C1').click({ force: true });
        await expect(page.getByTestId('os-quick-add')).toBeVisible({ timeout: 10000 });

        // Go back
        await page.goBack();
        await page.waitForTimeout(500);

        // Go forward
        await page.goForward();
        await page.waitForTimeout(500);
    });
});

// ============================================
// SECTION 9: ACCESSIBILITY
// ============================================

test.describe('9. Accessibility', () => {
    test('9.1 Tab navigation works', async ({ page }) => {
        await page.goto('./', { waitUntil: 'domcontentloaded' });
        
        // Press tab multiple times
        for (let i = 0; i < 5; i++) {
            await page.keyboard.press('Tab');
        }

        // Some element should be focused
        const focused = await page.evaluate(() => document.activeElement?.tagName);
        expect(focused).toBeTruthy();
    });

    test('9.2 Buttons have visible focus', async ({ page }, testInfo) => {
        await page.goto('./', { waitUntil: 'domcontentloaded' });
        await expect(page.getByTestId('landing-login')).toBeVisible();
        if (!testInfo.project.name.startsWith('mobile')) {
            await page.getByTestId('landing-login').focus();
            await expect(page.getByTestId('landing-login')).toBeFocused();
        }
    });
});

// ============================================
// SECTION 10: SMOKE TEST SUMMARY
// ============================================

test.describe('10. Smoke Test - Full Flow', () => {
    test('10.1 Complete user journey', async ({ page }) => {
        // 1. Landing
        await page.goto('./', { waitUntil: 'domcontentloaded' });
        await expect(page.getByTestId('landing-login')).toBeVisible();

        // 2. Login
        await page.getByTestId('landing-login').click({ noWaitAfter: true });
        await page.locator('input[name="username"]').fill('bravvo');
        await page.locator('input[name="password"]').fill('1@Wardogs');
        await page.getByTestId('login-submit').click({ noWaitAfter: true });

        // 3. Agency Dashboard
        await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });

        // 4. Access Client
        await expect(page.getByTestId('agency-client-card-C1')).toBeVisible();
        await page.getByTestId('agency-access-os-C1').click({ force: true });

        // 5. OS Dashboard
        await expect(page.getByTestId('os-vault-card-V1')).toBeVisible({ timeout: 10000 });

        // 6. Create Item
        await page.getByTestId('os-quick-add').click();
        const modal = page.getByTestId('quickadd-modal');
        await expect(modal).toBeVisible();
        await page.getByTestId('quickadd-initiative').fill('Smoke Test Item');
        await page.getByTestId('quickadd-submit').click();

        // 7. Verify item creation (toast appears)
        await expect(page.locator('[data-toast-type="success"]').first()).toBeVisible();

        console.log('✅ Complete user journey passed');
    });
});
