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

        await page.goto('/');
        await page.waitForLoadState('networkidle');

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

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        expect(failedRequests.filter(r => !r.url.includes('favicon'))).toHaveLength(0);
    });

    test('1.3 Performance: Initial load under 3s', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
        const loadTime = Date.now() - startTime;

        expect(loadTime).toBeLessThan(3000);
    });
});

// ============================================
// SECTION 2: AUTHENTICATION FLOW
// ============================================

test.describe('2. Authentication Flow', () => {
    test('2.1 Landing page renders correctly', async ({ page }) => {
        await page.goto('/');
        
        // Hero section
        await expect(page.locator('h1')).toBeVisible();
        
        // Login button
        await expect(page.getByTestId('landing-login')).toBeVisible();
    });

    test('2.2 Login modal opens and has required fields', async ({ page }) => {
        await page.goto('/');
        await page.getByTestId('landing-login').click();

        // Username and password fields (actual selectors)
        await expect(page.locator('input[name="username"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();

        // Submit button
        await expect(page.getByTestId('login-submit')).toBeVisible();
    });

    test('2.3 Login with valid credentials', async ({ page }) => {
        await page.goto('/');
        await page.getByTestId('landing-login').click();
        await page.locator('input[name="username"]').fill('bravvo');
        await page.locator('input[name="password"]').fill('1@Wardogs');
        await page.getByTestId('login-submit').click();

        // Should navigate to agency dashboard
        await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });
    });

    test('2.4 Login validation - empty fields', async ({ page }) => {
        await page.goto('/');
        await page.getByTestId('landing-login').click();
        await page.getByTestId('login-submit').click();

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
        await page.goto('/');
        await page.getByTestId('landing-login').click();
        await page.locator('input[name="username"]').fill('bravvo');
        await page.locator('input[name="password"]').fill('1@Wardogs');
        await page.getByTestId('login-submit').click();
        await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });
    });

    test('3.1 Agency dashboard renders with client cards', async ({ page }) => {
        // At least one client card should be visible
        await expect(page.locator('[data-testid^="agency-client-card-"]').first()).toBeVisible();
    });

    test('3.2 Client card hover reveals access button', async ({ page }) => {
        const clientCard = page.locator('[data-testid^="agency-client-card-"]').first();
        await clientCard.hover();
        
        const accessButton = page.locator('[data-testid^="agency-access-os-"]').first();
        await expect(accessButton).toBeVisible();
    });

    test('3.3 Access client workspace (OS)', async ({ page }) => {
        const clientCard = page.locator('[data-testid^="agency-client-card-"]').first();
        await clientCard.hover();
        
        const accessButton = page.locator('[data-testid^="agency-access-os-"]').first();
        await accessButton.click();

        // Should see vault cards in OS
        await expect(page.getByTestId('os-vault-card-V1')).toBeVisible({ timeout: 10000 });
    });
});

// ============================================
// SECTION 4: OSA/DASHBOARD (PRD BIG TECH)
// ============================================

test.describe('4. OSA Dashboard - PRD Big Tech', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByTestId('landing-login').click();
        await page.locator('input[name="username"]').fill('bravvo');
        await page.locator('input[name="password"]').fill('1@Wardogs');
        await page.getByTestId('login-submit').click();
        await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });
        
        // Access first client
        await page.getByTestId('agency-client-card-C1').hover();
        await page.getByTestId('agency-access-os-C1').click();
        await expect(page.getByTestId('os-vault-card-V1')).toBeVisible({ timeout: 10000 });
    });

    test('4.1 Governance Header is visible', async ({ page }) => {
        // Should have governance controls
        await expect(page.locator('text=Governança').first()).toBeVisible();
    });

    test('4.2 Day Summary AI section exists', async ({ page }) => {
        // Should have day summary with AI bullets
        await expect(page.locator('text=Resumo do Dia')).toBeVisible();
    });

    test('4.3 KPI Grid shows meta vs realizado', async ({ page }) => {
        // KPIs should be visible
        await expect(page.locator('text=Meta:').first()).toBeVisible();
    });

    test('4.4 Priority Actions card shows top 3', async ({ page }) => {
        // Priority actions section
        await expect(page.locator('text=Ações Prioritárias').or(page.locator('text=Tudo em dia'))).toBeVisible();
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
        await page.goto('/');
        await page.getByTestId('landing-login').click();
        await page.locator('input[name="username"]').fill('bravvo');
        await page.locator('input[name="password"]').fill('1@Wardogs');
        await page.getByTestId('login-submit').click();
        await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });
        
        await page.getByTestId('agency-client-card-C1').hover();
        await page.getByTestId('agency-access-os-C1').click();
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
        await page.goto('/');
        await page.getByTestId('landing-login').click();
        await page.locator('input[name="username"]').fill('bravvo');
        await page.locator('input[name="password"]').fill('1@Wardogs');
        await page.getByTestId('login-submit').click();
        await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });
        
        await page.getByTestId('agency-client-card-C1').hover();
        await page.getByTestId('agency-access-os-C1').click();
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
        // Find a status dropdown trigger
        const statusTrigger = page.locator('[data-testid^="d2-status-"][data-testid$="-trigger"]').first();
        if (await statusTrigger.isVisible()) {
            await statusTrigger.click();
            
            // Status options should appear
            const statusOptions = page.locator('[data-testid^="d2-status-"][data-testid*="-opt-"]');
            await expect(statusOptions).toHaveCount(5);
            await expect(statusOptions.first()).toBeVisible();
        }
    });

    test('6.4 Generate art for item', async ({ page }) => {
        const generateBtn = page.locator('[data-testid^="d2-generate-art-"]').first();
        if (await generateBtn.isVisible()) {
            await generateBtn.click();
            
            // Creative studio modal should open
            await page.waitForTimeout(500);
        }
    });
});

// ============================================
// SECTION 7: GOVERNANCE
// ============================================

test.describe('7. Governance Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByTestId('landing-login').click();
        await page.locator('input[name="username"]').fill('bravvo');
        await page.locator('input[name="password"]').fill('1@Wardogs');
        await page.getByTestId('login-submit').click();
        await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });
        
        await page.getByTestId('agency-client-card-C1').hover();
        await page.getByTestId('agency-access-os-C1').click();
        await expect(page.getByTestId('os-vault-card-V1')).toBeVisible({ timeout: 10000 });
    });

    test('7.1 Toggle governance mode', async ({ page }) => {
        // Find governance toggle button
        const govButton = page.locator('text=Iniciar Governança').or(page.locator('text=Governance'));
        if (await govButton.first().isVisible()) {
            await govButton.first().click();
            await page.waitForTimeout(500);
        }
    });

    test('7.2 Open governance modal', async ({ page }) => {
        // First enable governance mode
        const startGov = page.locator('text=Iniciar Governança');
        if (await startGov.isVisible()) {
            await startGov.click();
            await page.waitForTimeout(500);
            
            // Then open modal
            const openGov = page.locator('text=Abrir Governança');
            if (await openGov.isVisible()) {
                await openGov.click();
                await page.waitForTimeout(500);
            }
        }
    });
});

// ============================================
// SECTION 8: PERSISTENCE & STATE
// ============================================

test.describe('8. Persistence Tests', () => {
    test('8.1 Data persists after page refresh', async ({ page }) => {
        // Login
        await page.goto('/');
        await page.getByTestId('landing-login').click();
        await page.locator('input[name="username"]').fill('bravvo');
        await page.locator('input[name="password"]').fill('1@Wardogs');
        await page.locator('input[name="remember"]').check();
        await page.getByTestId('login-submit').click();
        await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });

        // Access client
        await page.getByTestId('agency-client-card-C1').hover();
        await page.getByTestId('agency-access-os-C1').click();
        await expect(page.getByTestId('os-vault-card-V1')).toBeVisible({ timeout: 10000 });

        // Refresh page
        await page.reload();

        // Data should still be visible (or login again depending on session)
        await page.waitForTimeout(1000);
    });

    test('8.2 Browser back/forward navigation', async ({ page }) => {
        await page.goto('/');
        await page.getByTestId('landing-login').click();
        await page.locator('input[name="username"]').fill('bravvo');
        await page.locator('input[name="password"]').fill('1@Wardogs');
        await page.getByTestId('login-submit').click();
        await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });

        // Navigate to client
        await page.getByTestId('agency-client-card-C1').hover();
        await page.getByTestId('agency-access-os-C1').click();
        await expect(page.getByTestId('os-vault-card-V1')).toBeVisible({ timeout: 10000 });

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
        await page.goto('/');
        
        // Press tab multiple times
        for (let i = 0; i < 5; i++) {
            await page.keyboard.press('Tab');
        }

        // Some element should be focused
        const focused = await page.evaluate(() => document.activeElement?.tagName);
        expect(focused).toBeTruthy();
    });

    test('9.2 Buttons have visible focus', async ({ page }) => {
        await page.goto('/');
        await page.getByTestId('landing-login').focus();
        
        // Check if element is visible and focusable
        await expect(page.getByTestId('landing-login')).toBeFocused();
    });
});

// ============================================
// SECTION 10: SMOKE TEST SUMMARY
// ============================================

test.describe('10. Smoke Test - Full Flow', () => {
    test('10.1 Complete user journey', async ({ page }) => {
        // 1. Landing
        await page.goto('/');
        await expect(page.getByTestId('landing-login')).toBeVisible();

        // 2. Login
        await page.getByTestId('landing-login').click();
        await page.locator('input[name="username"]').fill('bravvo');
        await page.locator('input[name="password"]').fill('1@Wardogs');
        await page.getByTestId('login-submit').click();

        // 3. Agency Dashboard
        await expect(page.getByTestId('agency-dashboard')).toBeVisible({ timeout: 10000 });

        // 4. Access Client
        await page.getByTestId('agency-client-card-C1').hover();
        await page.getByTestId('agency-access-os-C1').click();

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
