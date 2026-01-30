import { useCallback, useState, useRef, useEffect } from 'react';
import { useVaults } from '../contexts/VaultContext';
import { useToast } from '../contexts/ToastContext';

/**
 * Custom hook that provides unified access to Vault data with sync feedback.
 * Eliminates the need for separate formData state - reads/writes directly to appData.
 * 
 * @param {string} vaultId - The vault ID (V1, V2, V3, V4, V5)
 * @returns {Object} - { data, updateField, updateNested, isSynced, markSynced, saveAndAdvance }
 */
export function useVaultForm(vaultId) {
    const { appData, setAppData } = useVaults();
    const { addToast } = useToast();
    const [isSynced, setIsSynced] = useState(true);
    const [lastSaveTime, setLastSaveTime] = useState(null);
    const debounceRef = useRef(null);

    // Map vault IDs to storage keys
    const vaultKeyMap = {
        V1: 'S1',
        V2: 'S2',
        V3: 'S3',
        V4: 'S4',
        V5: 'S5'
    };
    const storageKey = vaultKeyMap[vaultId] || vaultId;

    // Get current vault data
    const vaultData = appData?.vaults?.[storageKey] || {};

    // Get flattened form data for easier access (same structure as old formData)
    const getFormData = useCallback(() => {
        const v = appData?.vaults || {};
        const s1 = v.S1?.fields || {};
        const s2 = v.S2 || {};
        const s3 = v.S3 || {};
        const s4 = v.S4 || {};
        const s5 = v.S5 || {};

        return {
            // Global
            clientName: appData?.clientName || '',

            // V1: Brand
            niche: s1.niche || 'gastronomia',
            tagline: s1.tagline || '',
            promise: s1.promise || '',
            enemy: s1.enemy || '',
            brandValues: s1.brandValues || s1.values || [],
            audienceAge: s1.audienceAge || '25-34',
            audienceGender: s1.audienceGender || 'todos',
            audienceClass: s1.audienceClass || 'bc',
            audiencePain: s1.audiencePain || '',
            archetype: s1.archetype || 'O Cara Comum',
            tone: s1.tone || 'casual',
            bio: s1.bio || '',
            scope: s1.scope || 'local',
            location: s1.location || '',

            // V2: Commerce
            products: s2.products || [],
            currentTicket: s2.metrics?.currentTicket || '',
            targetTicket: s2.metrics?.targetTicket || '',
            currentRevenue: s2.metrics?.currentRevenue || '',
            upsellStrategy: s2.strategy?.upsell || 'none',
            saleFormat: s2.strategy?.format || 'presencial',
            baitProduct: s2.bait?.product || '',
            baitPrice: s2.bait?.price || '',
            competitor1: s2.competitor1 || '',
            competitor2: s2.competitor2 || '',
            competitor3: s2.competitor3 || '',

            // V3: Funnel
            businessType: s3.businessType || '',
            channels: s3.channels || [],
            conversionLink: s3.steps?.find(s => s.step === 'Desejo')?.goal || '',
            instagramHandle: s3.social?.instagram || '',
            websiteUrl: s3.social?.website || '',
            primaryCTA: s3.cta?.primary || 'whatsapp',
            secondaryCTA: s3.cta?.secondary || 'saibamais',
            ctaText: s3.cta?.text || '',
            monthlyGoal: s3.metrics?.monthlyGoal || '',
            trafficType: s3.traffic?.primarySource || 'Misto',
            utmCampaign: s3.traffic?.utmCampaign || '',
            currentConversion: s3.metrics?.currentConversion || '',
            targetConversion: s3.metrics?.targetConversion || '',
            cpl: s3.metrics?.cpl || '',

            // V4: Ops
            approverName: s4.matrix?.find(m => m.role === 'Aprovador Final')?.who || '',
            teamStructure: s4.matrix?.find(m => m.role === 'Time')?.who || 'Enxuta',
            slaHours: parseInt(s4.slas?.approval) || 24,
            contentOwner: s4.owners?.content || '',
            trafficOwner: s4.owners?.traffic || '',
            supportOwner: s4.owners?.support || '',
            emergencyContact: s4.contacts?.emergency || '',
            postingFrequency: s4.schedule?.frequency || '3x',
            bestDays: s4.schedule?.bestDays || [],
            bestTimes: s4.schedule?.bestTimes || [],
            startDate: s4.schedule?.startDate || '',
            cycleDuration: s4.schedule?.cycleDuration || '30',
            stakeholders: s4.stakeholders || [],
            competitors: s4.competitors || [],

            // V5: Ideas
            ideas: s5.ideas || [],
            references: s5.references || [],
            notepad: s5.notepad || '',
            mood: s5.rules?.mood || 'moderno',
            primaryColor: s5.palette?.primary || '#F97316',
            secondaryColor: s5.palette?.secondary || '#1E293B',
            accentColor: s5.palette?.accent || '#10B981',
            brandAssets: s5.brandAssets || { logos: [], textures: [], icons: [], postTemplates: [] },
            brandIdentity: s5.brandIdentity || {
                musicalStyle: '',
                visualVibes: [],
                keyElements: [],
                prohibitedElements: [],
                colorMeanings: '',
                photoStyle: '',
                typographyNotes: ''
            },

            // Governance
            governanceHistory: appData?.governanceHistory || [],
            customThemeEnabled: appData?.customThemeEnabled || false
        };
    }, [appData]);

    const formData = getFormData();

    // Update a single field with debounced sync
    const updateField = useCallback((field, value) => {
        setIsSynced(false);

        // Clear existing debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Map field to vault structure and update
        setAppData(prev => {
            const updated = { ...prev };
            const vaults = { ...(prev?.vaults || {}) };

            // Handle global fields
            if (field === 'clientName') {
                updated.clientName = value;
            }
            else if (field === 'customThemeEnabled') {
                updated.customThemeEnabled = value;
            }
            // V1 fields
            else if (['niche', 'tagline', 'promise', 'enemy', 'brandValues', 'audienceAge',
                'audienceGender', 'audienceClass', 'audiencePain', 'archetype', 'tone', 'bio',
                'scope', 'location'].includes(field)) {
                vaults.S1 = {
                    ...(vaults.S1 || {}),
                    fields: {
                        ...(vaults.S1?.fields || {}),
                        [field]: value,
                        ...(field === 'brandValues' ? { values: value } : {})
                    }
                };
            }
            // V2 fields
            else if (field === 'products') {
                vaults.S2 = { ...(vaults.S2 || {}), products: value };
            }
            else if (['currentTicket', 'targetTicket', 'currentRevenue'].includes(field)) {
                vaults.S2 = {
                    ...(vaults.S2 || {}),
                    metrics: { ...(vaults.S2?.metrics || {}), [field]: value }
                };
            }
            else if (['upsellStrategy', 'saleFormat'].includes(field)) {
                const key = field === 'upsellStrategy' ? 'upsell' : 'format';
                vaults.S2 = {
                    ...(vaults.S2 || {}),
                    strategy: { ...(vaults.S2?.strategy || {}), [key]: value }
                };
            }
            else if (['baitProduct', 'baitPrice'].includes(field)) {
                const key = field === 'baitProduct' ? 'product' : 'price';
                vaults.S2 = {
                    ...(vaults.S2 || {}),
                    bait: { ...(vaults.S2?.bait || {}), [key]: value }
                };
            }
            else if (['competitor1', 'competitor2', 'competitor3'].includes(field)) {
                vaults.S2 = { ...(vaults.S2 || {}), [field]: value };
            }
            // V3 fields
            else if (field === 'businessType') {
                vaults.S3 = { ...(vaults.S3 || {}), businessType: value };
            }
            else if (field === 'channels') {
                vaults.S3 = { ...(vaults.S3 || {}), channels: value };
            }
            else if (field === 'conversionLink') {
                const prevSteps = vaults.S3?.steps || [];
                const nextSteps = prevSteps.length
                    ? prevSteps.map(s => s?.step === 'Desejo' ? { ...s, goal: value } : s)
                    : [
                        { step: 'Atenção', kpi: 'CPM', goal: 'R$ 10,00' },
                        { step: 'Interesse', kpi: 'CTR', goal: '2%' },
                        { step: 'Desejo', kpi: 'Click Whatsapp', goal: value }
                    ];
                vaults.S3 = { ...(vaults.S3 || {}), steps: nextSteps };
            }
            else if (['instagramHandle', 'websiteUrl'].includes(field)) {
                const key = field === 'instagramHandle' ? 'instagram' : 'website';
                vaults.S3 = {
                    ...(vaults.S3 || {}),
                    social: { ...(vaults.S3?.social || {}), [key]: value }
                };
            }
            else if (['primaryCTA', 'secondaryCTA', 'ctaText'].includes(field)) {
                const key = field === 'primaryCTA' ? 'primary' : field === 'secondaryCTA' ? 'secondary' : 'text';
                vaults.S3 = {
                    ...(vaults.S3 || {}),
                    cta: { ...(vaults.S3?.cta || {}), [key]: value }
                };
            }
            else if (['trafficType', 'utmCampaign'].includes(field)) {
                const key = field === 'trafficType' ? 'primarySource' : 'utmCampaign';
                vaults.S3 = {
                    ...(vaults.S3 || {}),
                    traffic: { ...(vaults.S3?.traffic || {}), [key]: value }
                };
            }
            else if (['monthlyGoal', 'currentConversion', 'targetConversion', 'cpl'].includes(field)) {
                vaults.S3 = {
                    ...(vaults.S3 || {}),
                    metrics: { ...(vaults.S3?.metrics || {}), [field]: value }
                };
            }
            // V4 fields
            else if (field === 'approverName') {
                const matrix = vaults.S4?.matrix || [];
                const newMatrix = matrix.length
                    ? matrix.map(m => m.role === 'Aprovador Final' ? { ...m, who: value } : m)
                    : [{ role: 'Aprovador Final', who: value }, { role: 'Estrategista', who: 'Bravvo Agent' }, { role: 'Time', who: 'Enxuta' }];
                vaults.S4 = { ...(vaults.S4 || {}), matrix: newMatrix };
            }
            else if (field === 'teamStructure') {
                const matrix = vaults.S4?.matrix || [];
                const newMatrix = matrix.length
                    ? matrix.map(m => m.role === 'Time' ? { ...m, who: value } : m)
                    : [{ role: 'Aprovador Final', who: '' }, { role: 'Estrategista', who: 'Bravvo Agent' }, { role: 'Time', who: value }];
                vaults.S4 = { ...(vaults.S4 || {}), matrix: newMatrix };
            }
            else if (field === 'slaHours') {
                vaults.S4 = {
                    ...(vaults.S4 || {}),
                    slas: { ...(vaults.S4?.slas || {}), approval: `${value}h` }
                };
            }
            else if (['contentOwner', 'trafficOwner', 'supportOwner'].includes(field)) {
                const key = field.replace('Owner', '').toLowerCase();
                vaults.S4 = {
                    ...(vaults.S4 || {}),
                    owners: { ...(vaults.S4?.owners || {}), [key]: value }
                };
            }
            else if (field === 'emergencyContact') {
                vaults.S4 = {
                    ...(vaults.S4 || {}),
                    contacts: { ...(vaults.S4?.contacts || {}), emergency: value }
                };
            }
            else if (['postingFrequency', 'bestDays', 'bestTimes', 'startDate', 'cycleDuration'].includes(field)) {
                const key = field === 'postingFrequency' ? 'frequency' : field;
                vaults.S4 = {
                    ...(vaults.S4 || {}),
                    schedule: { ...(vaults.S4?.schedule || {}), [key]: value }
                };
            }
            else if (['stakeholders', 'competitors'].includes(field)) {
                vaults.S4 = { ...(vaults.S4 || {}), [field]: value };
            }
            // V5 fields
            else if (['ideas', 'references', 'notepad'].includes(field)) {
                vaults.S5 = { ...(vaults.S5 || {}), [field]: value };
            }
            else if (field === 'mood') {
                vaults.S5 = {
                    ...(vaults.S5 || {}),
                    rules: { ...(vaults.S5?.rules || {}), mood: value }
                };
            }
            else if (['primaryColor', 'secondaryColor', 'accentColor'].includes(field)) {
                const key = field.replace('Color', '').toLowerCase();
                vaults.S5 = {
                    ...(vaults.S5 || {}),
                    palette: { ...(vaults.S5?.palette || {}), [key]: value }
                };
            }
            else if (field === 'brandAssets') {
                vaults.S5 = { ...(vaults.S5 || {}), brandAssets: value };
            }
            else if (field === 'brandIdentity') {
                vaults.S5 = { ...(vaults.S5 || {}), brandIdentity: value };
            }
            // Governance
            else if (field === 'governanceHistory') {
                updated.governanceHistory = value;
            }

            updated.vaults = vaults;
            return updated;
        });

        // Debounce sync indicator
        debounceRef.current = setTimeout(() => {
            setIsSynced(true);
            setLastSaveTime(Date.now());
        }, 500);
    }, [setAppData]);

    // Batch update multiple fields at once
    const updateFields = useCallback((updates) => {
        Object.entries(updates).forEach(([field, value]) => {
            updateField(field, value);
        });
    }, [updateField]);

    // Mark as synced manually (for button feedback)
    const markSynced = useCallback(() => {
        setIsSynced(true);
        setLastSaveTime(Date.now());
    }, []);

    // Save and advance to next vault with feedback
    const saveAndAdvance = useCallback((onNext, vaultLabel = vaultId) => {
        // Force sync state
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        setIsSynced(true);
        setLastSaveTime(Date.now());

        addToast({
            title: `${vaultLabel} Salvo`,
            description: 'Dados sincronizados com sucesso.',
            type: 'success',
            duration: 2000
        });

        if (onNext) {
            onNext();
        }
    }, [addToast, vaultId]);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return {
        formData,
        vaultData,
        updateField,
        updateFields,
        isSynced,
        lastSaveTime,
        markSynced,
        saveAndAdvance
    };
}
