import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { aiService } from './services/aiService';

// IMPORTS FOR IMPROVEMENTS
import { useLocalStorage } from './hooks/useLocalStorage';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { storageService } from './services/storageService';

import {
    Terminal,
    Wand2,
    Copy,
    Check,
    Users,
    PlusCircle
} from 'lucide-react';

import { useVaults } from './contexts/VaultContext';

import { api } from './data/mockDB';
// Import VaultProvider to wrap the workspace instance
import { VaultProvider } from './contexts/VaultContext';

const BinderLayout = lazy(() => import('./components/Binder/BinderLayout').then(m => ({ default: m.BinderLayout })));
const PageBrand = lazy(() => import('./components/Pages/PageBrand').then(m => ({ default: m.PageBrand })));
const PageOffer = lazy(() => import('./components/Pages/PageOffer').then(m => ({ default: m.PageOffer })));
const PageFunnel = lazy(() => import('./components/Pages/PageFunnel').then(m => ({ default: m.PageFunnel })));
const PageOps = lazy(() => import('./components/Pages/PageOps').then(m => ({ default: m.PageOps })));
const PageIdeas = lazy(() => import('./components/Pages/PageIdeas').then(m => ({ default: m.PageIdeas })));
const OnePageDashboard = lazy(() => import('./components/CommandCenter/OnePageDashboard').then(m => ({ default: m.OnePageDashboard })));

const LandingPage = lazy(() => import('./components/Marketing/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginScreen = lazy(() => import('./components/Auth/LoginScreen').then(m => ({ default: m.LoginScreen })));
const AgencyDashboard = lazy(() => import('./components/Agency/AgencyDashboard').then(m => ({ default: m.AgencyDashboard })));
const MasterDashboard = lazy(() => import('./components/Master/MasterDashboard').then(m => ({ default: m.MasterDashboard })));

// ============================================================================
// CLIENT WORKSPACE (THE ORIGINAL APP "OS")
// ============================================================================
function ClientWorkspace({ onBackToAgency, isAgencyView, initialData, onSave, currentUser, isWorkspaceLoading }) {
    const clientId = initialData?.id || currentUser?.client?.id || null;
    // We wrap the internal content with VaultProvider so it can accept initialData
    return (
        <VaultProvider key={clientId || 'client'} initialData={initialData} onSave={onSave}>
            <ClientWorkspaceContent
                onBackToAgency={onBackToAgency}
                isAgencyView={isAgencyView}
                currentUser={currentUser}
                clientId={clientId}
                isWorkspaceLoading={isWorkspaceLoading}
            />
        </VaultProvider>
    );
}

function ClientWorkspaceContent({ onBackToAgency, isAgencyView: _isAgencyView, currentUser, clientId, isWorkspaceLoading }) {
    const { addToast } = useToast();

    // State
    const [_activeSection, _setActiveSection] = useState('dashboard'); // 'dashboard' or 'vaults' or 'logs'
    const [_activeId, _setActiveId] = useState('D2'); // D1-D5 or S1-S5
    // Prompt UI State
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [promptTab, setPromptTab] = useState('ai'); // 'ai' or 'human'
    const [_selectedItem, setSelectedItem] = useState(null);
    const [copied, setCopied] = useState(false);
    const [_promptHistory, setPromptHistory] = useState([]);

    // --- GOVERNANCE / MEETING STATE (Lifted for Persistence) ---
    const [meetingState, setMeetingState] = useLocalStorage(`bravvo_meeting_state:${clientId || 'default'}`, {
        active: false,
        comments: {
            general: '',
            revenue: '',
            traffic: '',
            sales: ''
        }
    });

    useEffect(() => {
        if (!clientId) return;
        const legacyKey = 'bravvo_meeting_state';
        const scopedKey = `bravvo_meeting_state:${clientId}`;
        if (localStorage.getItem(scopedKey)) return;
        const legacyValue = localStorage.getItem(legacyKey);
        if (!legacyValue) return;
        try {
            const parsed = JSON.parse(legacyValue);
            setMeetingState(parsed);
        } catch {
            // ignore
        }
    }, [clientId, setMeetingState]);

    // --- BINDER STATE ---
    // Start at OS (One Page Dashboard) as requested by user ("painel de gestao quero que seja inicial")
    const [binderTab, setBinderTab] = useState('OS'); // V1, V2, V3, V4, OS
    const [completedTabs, setCompletedTabs] = useState(['V1', 'V2', 'V3', 'V4', 'V5']); // Assume config is ready or optional for now

    // Shared Form State (Lifted from Wizard)
    // NOTE: In a real implementation, formData would also come from VaultContext (S1..S5 fields)
    // For now we keep it separate but it SHOULD eventually be merged. 
    // We will initialize it from the Context to ensure consistency.
    const { appData, setAppData } = useVaults();

    // We use a simple effect to sync local form state with Context if needed, 
    // but for now we rely on appData mostly. 
    const [formData, setFormData] = useLocalStorage(`bravvo_form_data:${clientId || 'default'}`, {
        // --- V1: Brand Vault ---
        clientName: appData.clientName || "",
        niche: appData?.vaults?.S1?.fields?.niche || "gastronomia",
        tagline: appData?.vaults?.S1?.fields?.tagline || "",
        promise: appData?.vaults?.S1?.fields?.promise || "",
        enemy: appData?.vaults?.S1?.fields?.enemy || "",
        brandValues: appData?.vaults?.S1?.fields?.brandValues || appData?.vaults?.S1?.fields?.values || [],
        audienceAge: appData?.vaults?.S1?.fields?.audienceAge || "25-34",
        audienceGender: appData?.vaults?.S1?.fields?.audienceGender || "todos",
        audienceClass: appData?.vaults?.S1?.fields?.audienceClass || "bc",
        audiencePain: appData?.vaults?.S1?.fields?.audiencePain || "",
        archetype: appData?.vaults?.S1?.fields?.archetype || "O Cara Comum",
        tone: appData?.vaults?.S1?.fields?.tone || "casual",
        mood: appData?.vaults?.S5?.rules?.mood || "moderno",
        primaryColor: appData?.vaults?.S5?.palette?.primary || "#F97316",
        secondaryColor: appData?.vaults?.S5?.palette?.secondary || "#1E293B",
        accentColor: appData?.vaults?.S5?.palette?.accent || "#10B981",
        bio: appData?.vaults?.S1?.fields?.bio || "",

        // --- V2: Commerce Vault ---
        products: appData?.vaults?.S2?.products || [],
        currentTicket: appData?.vaults?.S2?.metrics?.currentTicket || "",
        targetTicket: appData?.vaults?.S2?.metrics?.targetTicket || "",
        currentRevenue: appData?.vaults?.S2?.metrics?.currentRevenue || "",
        upsellStrategy: appData?.vaults?.S2?.strategy?.upsell || "none",
        saleFormat: appData?.vaults?.S2?.strategy?.format || "presencial",
        baitProduct: appData?.vaults?.S2?.bait?.product || "",
        baitPrice: appData?.vaults?.S2?.bait?.price || "",

        // --- V3: Funnel Vault ---
        channels: appData?.vaults?.S3?.channels || [],
        conversionLink: appData?.vaults?.S3?.steps?.find(s => s.step === 'Desejo')?.goal || "",
        instagramHandle: appData?.vaults?.S3?.social?.instagram || "",
        websiteUrl: appData?.vaults?.S3?.social?.website || "",
        primaryCTA: appData?.vaults?.S3?.cta?.primary || "whatsapp",
        secondaryCTA: appData?.vaults?.S3?.cta?.secondary || "saibamais",
        ctaText: appData?.vaults?.S3?.cta?.text || "",
        monthlyGoal: appData?.vaults?.S3?.metrics?.monthlyGoal || "",
        trafficType: appData?.vaults?.S3?.traffic?.primarySource || "Misto",
        utmCampaign: appData?.vaults?.S3?.traffic?.utmCampaign || "",
        currentConversion: appData?.vaults?.S3?.metrics?.currentConversion || "",
        targetConversion: appData?.vaults?.S3?.metrics?.targetConversion || "",
        cpl: appData?.vaults?.S3?.metrics?.cpl || "",

        // --- V4: Ops Vault ---
        approverName: appData?.vaults?.S4?.matrix?.find(m => m.role === 'Aprovador Final')?.who || "",
        teamStructure: appData?.vaults?.S4?.matrix?.find(m => m.role === 'Time')?.who || "Enxuta",
        slaHours: parseInt(appData?.vaults?.S4?.slas?.approval) || 24,
        contentOwner: appData?.vaults?.S4?.owners?.content || "",
        trafficOwner: appData?.vaults?.S4?.owners?.traffic || "",
        supportOwner: appData?.vaults?.S4?.owners?.support || "",
        emergencyContact: appData?.vaults?.S4?.contacts?.emergency || "",
        postingFrequency: appData?.vaults?.S4?.schedule?.frequency || "3x",
        bestDays: appData?.vaults?.S4?.schedule?.bestDays || [],
        bestTimes: appData?.vaults?.S4?.schedule?.bestTimes || [],
        startDate: appData?.vaults?.S4?.schedule?.startDate || "",
        cycleDuration: appData?.vaults?.S4?.schedule?.cycleDuration || "30",
        stakeholders: appData?.vaults?.S4?.stakeholders || [],
        competitors: appData?.vaults?.S4?.competitors || [],

        // --- V5: Ideas & References Vault ---
        ideas: appData?.vaults?.S5?.ideas || [],
        references: appData?.vaults?.S5?.references || [],
        notepad: appData?.vaults?.S5?.notepad || "",

        // --- Governance History ---
        governanceHistory: appData.governanceHistory || [],

        // --- V5: Brand Assets (NEW) ---
        brandAssets: appData?.vaults?.S5?.brandAssets || {
            logos: [],
            textures: [],
            icons: [],
            postTemplates: []
        },

        // --- V5: Brand Identity (NEW) ---
        brandIdentity: appData?.vaults?.S5?.brandIdentity || {
            musicalStyle: "",
            visualVibes: [],
            keyElements: [],
            prohibitedElements: [],
            colorMeanings: "",
            photoStyle: "",
            typographyNotes: ""
        },

        // --- Theme Customization ---
        customThemeEnabled: appData.customThemeEnabled || false,
        _schemaVersion: 1
    });

    useEffect(() => {
        if (typeof document === 'undefined') return;
        const root = document.documentElement;
        const enabled = Boolean(appData?.customThemeEnabled);
        const palette = appData?.vaults?.S5?.palette;
        const brandIdentity = appData?.vaults?.S5?.brandIdentity;

        const applyVar = (name, value) => {
            if (enabled && typeof value === 'string' && value.trim()) {
                root.style.setProperty(name, value.trim());
            } else {
                root.style.removeProperty(name);
            }
        };

        applyVar('--brand-primary', palette?.primary);
        applyVar('--brand-secondary', palette?.secondary);
        applyVar('--brand-accent', palette?.accent);
        applyVar('--brand-font', brandIdentity?.fontFamily);

        if (enabled && typeof palette?.accent === 'string' && palette.accent.trim()) {
            root.style.setProperty('--accent-purple', palette.accent.trim());
        } else {
            root.style.removeProperty('--accent-purple');
        }
    }, [appData]);

    useEffect(() => {
        if (!clientId) return;
        const legacyKey = 'bravvo_form_data';
        const scopedKey = `bravvo_form_data:${clientId}`;
        if (localStorage.getItem(scopedKey)) return;
        const legacyValue = localStorage.getItem(legacyKey);
        if (!legacyValue) return;
        try {
            const parsed = JSON.parse(legacyValue);
            setFormData(parsed);
        } catch {
            // ignore
        }
    }, [clientId, setFormData]);

    useEffect(() => {
        setFormData(prev => {
            const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
            const safePrev = isPlainObject(prev) ? prev : {};
            let changed = false;

            const next = { ...safePrev };
            if (next._schemaVersion !== 1) {
                next._schemaVersion = 1;
                changed = true;
            }

            if (!Array.isArray(next.brandValues)) {
                next.brandValues = [];
                changed = true;
            }
            if (!Array.isArray(next.channels)) {
                next.channels = [];
                changed = true;
            }
            if (!Array.isArray(next.products)) {
                next.products = [];
                changed = true;
            }
            if (!Array.isArray(next.bestDays)) {
                next.bestDays = [];
                changed = true;
            }
            if (!Array.isArray(next.bestTimes)) {
                next.bestTimes = [];
                changed = true;
            }
            if (!Array.isArray(next.stakeholders)) {
                next.stakeholders = [];
                changed = true;
            }
            if (!Array.isArray(next.competitors)) {
                next.competitors = [];
                changed = true;
            }
            if (!Array.isArray(next.ideas)) {
                next.ideas = [];
                changed = true;
            }
            if (!Array.isArray(next.references)) {
                next.references = [];
                changed = true;
            }
            if (typeof next.notepad !== 'string') {
                next.notepad = '';
                changed = true;
            }

            const brandAssets = next.brandAssets;
            const normalizedBrandAssets = {
                logos: Array.isArray(brandAssets?.logos) ? brandAssets.logos : [],
                textures: Array.isArray(brandAssets?.textures) ? brandAssets.textures : [],
                icons: Array.isArray(brandAssets?.icons) ? brandAssets.icons : [],
                postTemplates: Array.isArray(brandAssets?.postTemplates) ? brandAssets.postTemplates : []
            };
            if (!isPlainObject(brandAssets)
                || normalizedBrandAssets.logos !== brandAssets.logos
                || normalizedBrandAssets.textures !== brandAssets.textures
                || normalizedBrandAssets.icons !== brandAssets.icons
                || normalizedBrandAssets.postTemplates !== brandAssets.postTemplates) {
                next.brandAssets = normalizedBrandAssets;
                changed = true;
            }

            const brandIdentity = next.brandIdentity;
            const normalizedBrandIdentity = {
                musicalStyle: typeof brandIdentity?.musicalStyle === 'string' ? brandIdentity.musicalStyle : '',
                visualVibes: Array.isArray(brandIdentity?.visualVibes) ? brandIdentity.visualVibes : [],
                keyElements: Array.isArray(brandIdentity?.keyElements) ? brandIdentity.keyElements : [],
                prohibitedElements: Array.isArray(brandIdentity?.prohibitedElements) ? brandIdentity.prohibitedElements : [],
                colorMeanings: typeof brandIdentity?.colorMeanings === 'string' ? brandIdentity.colorMeanings : '',
                photoStyle: typeof brandIdentity?.photoStyle === 'string' ? brandIdentity.photoStyle : '',
                typographyNotes: typeof brandIdentity?.typographyNotes === 'string' ? brandIdentity.typographyNotes : ''
            };
            if (!isPlainObject(brandIdentity)
                || normalizedBrandIdentity.musicalStyle !== brandIdentity.musicalStyle
                || normalizedBrandIdentity.visualVibes !== brandIdentity.visualVibes
                || normalizedBrandIdentity.keyElements !== brandIdentity.keyElements
                || normalizedBrandIdentity.prohibitedElements !== brandIdentity.prohibitedElements
                || normalizedBrandIdentity.colorMeanings !== brandIdentity.colorMeanings
                || normalizedBrandIdentity.photoStyle !== brandIdentity.photoStyle
                || normalizedBrandIdentity.typographyNotes !== brandIdentity.typographyNotes) {
                next.brandIdentity = normalizedBrandIdentity;
                changed = true;
            }

            return changed ? next : prev;
        });
    }, [setFormData]);

    // Handlers
    const handleGeneratePrompt = useCallback(async (item) => {
        setIsGenerating(true);
        try {
            const result = await aiService.generateCreativeBrief(item, appData.vaults);
            if (!result?.success) {
                throw new Error(result?.error || 'Falha ao gerar o prompt.');
            }

            const promptData = result.data;
            setSelectedPrompt(promptData);
            setPromptTab('ai'); // Reset to AI tab
            setSelectedItem(item);
            setPromptHistory(prev => [
                { id: Date.now(), item: item?.initiative || 'Item', timestamp: new Date().toLocaleTimeString(), prompt: promptData },
                ...prev.slice(0, 9)
            ]);
        } catch (err) {
            console.error('Prompt generation error:', err);
            addToast({
                title: 'Falha ao gerar prompt',
                description: err instanceof Error ? err.message : 'Tente novamente.',
                type: 'error'
            });
        } finally {
            setIsGenerating(false);
        }
    }, [addToast, appData.vaults]);

    const handleCopy = useCallback(async () => {
        if (selectedPrompt) {
            const textToCopy = promptTab === 'ai' ? selectedPrompt.aiPrompt : selectedPrompt.humanGuide;
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            addToast({
                title: 'Copiado para a área de transferência',
                type: 'success',
                duration: 2000
            });
        }
    }, [selectedPrompt, promptTab, addToast]);

    const syncFormDataToAppData = useCallback((newClientData, options = {}) => {
        const { regeneratePlanIfEmpty = false } = options;

        setAppData(prev => {
            const prevVaults = prev?.vaults || {};

            const nextS1 = {
                ...(prevVaults.S1 || {}),
                fields: {
                    ...(prevVaults.S1?.fields || {}),
                    niche: newClientData.niche,
                    tagline: newClientData.tagline,
                    promise: newClientData.promise,
                    enemy: newClientData.enemy,
                    tone: Array.isArray(newClientData.tone) ? newClientData.tone : (newClientData.tone || '').split(',').map(t => t.trim()).filter(Boolean),
                    archetype: newClientData.archetype,
                    audienceAge: newClientData.audienceAge,
                    audienceGender: newClientData.audienceGender,
                    audienceClass: newClientData.audienceClass,
                    audiencePain: newClientData.audiencePain,
                    bio: newClientData.bio,
                    brandValues: newClientData.brandValues,
                    values: newClientData.brandValues
                }
            };

            const nextS2 = {
                ...(prevVaults.S2 || {}),
                products: newClientData.products || [],
                metrics: {
                    ...(prevVaults.S2?.metrics || {}),
                    currentTicket: newClientData.currentTicket,
                    targetTicket: newClientData.targetTicket,
                    currentRevenue: newClientData.currentRevenue
                },
                strategy: {
                    ...(prevVaults.S2?.strategy || {}),
                    upsell: newClientData.upsellStrategy,
                    format: newClientData.saleFormat
                },
                bait: {
                    ...(prevVaults.S2?.bait || {}),
                    product: newClientData.baitProduct,
                    price: newClientData.baitPrice
                }
            };

            const conversionGoal = newClientData.conversionLink;
            const prevSteps = Array.isArray(prevVaults.S3?.steps) ? prevVaults.S3.steps : [];
            const nextSteps = prevSteps.length
                ? prevSteps.map(s => (s?.step === 'Desejo' ? { ...s, goal: conversionGoal } : s))
                : [
                    { step: 'Atenção', kpi: 'CPM', goal: 'R$ 10,00' },
                    { step: 'Interesse', kpi: 'CTR', goal: '2%' },
                    { step: 'Desejo', kpi: 'Click Whatsapp', goal: conversionGoal }
                ];

            const nextS3 = {
                ...(prevVaults.S3 || {}),
                channels: newClientData.channels || [],
                steps: nextSteps,
                social: {
                    ...(prevVaults.S3?.social || {}),
                    instagram: newClientData.instagramHandle,
                    website: newClientData.websiteUrl
                },
                cta: {
                    ...(prevVaults.S3?.cta || {}),
                    primary: newClientData.primaryCTA,
                    secondary: newClientData.secondaryCTA,
                    text: newClientData.ctaText
                },
                traffic: {
                    ...(prevVaults.S3?.traffic || {}),
                    primarySource: newClientData.trafficType,
                    utmCampaign: newClientData.utmCampaign
                },
                metrics: {
                    ...(prevVaults.S3?.metrics || {}),
                    monthlyGoal: newClientData.monthlyGoal,
                    currentConversion: newClientData.currentConversion,
                    targetConversion: newClientData.targetConversion,
                    cpl: newClientData.cpl
                }
            };

            const nextS4 = {
                ...(prevVaults.S4 || {}),
                matrix: [
                    { role: 'Aprovador Final', who: newClientData.approverName },
                    { role: 'Estrategista', who: prevVaults.S4?.matrix?.find(m => m.role === 'Estrategista')?.who || 'Bravvo Agent' },
                    { role: 'Time', who: newClientData.teamStructure }
                ],
                slas: {
                    ...(prevVaults.S4?.slas || {}),
                    approval: `${newClientData.slaHours}h`
                },
                owners: {
                    ...(prevVaults.S4?.owners || {}),
                    content: newClientData.contentOwner,
                    traffic: newClientData.trafficOwner,
                    support: newClientData.supportOwner
                },
                contacts: {
                    ...(prevVaults.S4?.contacts || {}),
                    emergency: newClientData.emergencyContact
                },
                schedule: {
                    ...(prevVaults.S4?.schedule || {}),
                    frequency: newClientData.postingFrequency,
                    bestDays: newClientData.bestDays || [],
                    bestTimes: newClientData.bestTimes || [],
                    startDate: newClientData.startDate,
                    cycleDuration: newClientData.cycleDuration
                },
                stakeholders: newClientData.stakeholders || [],
                competitors: newClientData.competitors || []
            };

            const nextS5 = {
                ...(prevVaults.S5 || {}),
                palette: {
                    ...(prevVaults.S5?.palette || {}),
                    primary: newClientData.primaryColor,
                    secondary: newClientData.secondaryColor,
                    accent: newClientData.accentColor
                },
                rules: {
                    ...(prevVaults.S5?.rules || {}),
                    mood: newClientData.mood
                },
                ideas: newClientData.ideas || [],
                references: newClientData.references || [],
                notepad: newClientData.notepad || '',
                brandAssets: newClientData.brandAssets || (prevVaults.S5?.brandAssets || undefined),
                brandIdentity: newClientData.brandIdentity || (prevVaults.S5?.brandIdentity || undefined)
            };

            const nextVaults = {
                ...prevVaults,
                S1: nextS1,
                S2: nextS2,
                S3: nextS3,
                S4: nextS4,
                S5: nextS5
            };

            const nextD1 = (nextS2.products || []).map(p => ({
                id: p.id,
                product: p.name,
                type: p.category || 'Produto',
                price: p.price,
                margin: p.margin,
                offer_strategy: p.role === 'Hero' ? 'Tráfego Frio' : 'Upsell',
                status: 'Active'
            }));

            const nextD3 = [
                {
                    id: 1,
                    task: 'Aprovação de Criativos',
                    owner: 'Agência',
                    approver: nextS4.matrix?.find(m => m.role === 'Aprovador Final')?.who || '',
                    sla: nextS4.slas?.approval,
                    status: 'Active'
                },
                {
                    id: 2,
                    task: 'Definição de Oferta',
                    owner: 'Cliente',
                    approver: 'Agência',
                    sla: '48h',
                    status: 'Active'
                }
            ];

            const prevD2 = prev?.dashboard?.D2;
            const shouldGenerateD2 = regeneratePlanIfEmpty && (!Array.isArray(prevD2) || prevD2.length === 0);
            const heroProduct = (nextS2.products || [])[0];

            const nextD2 = shouldGenerateD2
                ? [
                    {
                        id: 1,
                        date: '2024-03-01',
                        initiative: `Lançamento: ${nextS1.fields.promise}`,
                        channel: 'Instagram Reel',
                        format: 'reel',
                        offerId: heroProduct?.id,
                        ctaId: 'CTA_MAIN',
                        responsible: 'IA Agent',
                        status: 'scheduled',
                        visual_output: 'Pending'
                    },
                    {
                        id: 2,
                        date: '2024-03-03',
                        initiative: `Combater: ${nextS1.fields.enemy}`,
                        channel: 'Instagram Story',
                        format: 'story',
                        offerId: heroProduct?.id,
                        ctaId: 'CTA_MAIN',
                        responsible: 'IA Agent',
                        status: 'draft',
                        visual_output: 'Pending'
                    }
                ]
                : prevD2;

            return {
                ...prev,
                clientName: newClientData.clientName ?? prev.clientName,
                customThemeEnabled: newClientData.customThemeEnabled ?? prev.customThemeEnabled,
                governanceHistory: newClientData.governanceHistory ?? prev.governanceHistory,
                vaults: nextVaults,
                dashboard: {
                    ...(prev?.dashboard || {}),
                    D1: nextD1,
                    D2: nextD2,
                    D3: nextD3
                }
            };
        });
    }, [setAppData]);

    const handleOnboardingComplete = (newClientData) => {
        syncFormDataToAppData(newClientData, { regeneratePlanIfEmpty: true });

        addToast({
            title: 'Dados Salvos e Processados',
            description: 'O OnePage Dashboard foi atualizado com sucesso.',
            type: 'success'
        });
    };

    // --- BINDER LOGIC ---
    const advanceTab = (current, next) => {
        if (!completedTabs.includes(current)) {
            setCompletedTabs([...completedTabs, current]);
        }
        setBinderTab(next);
        window.scrollTo(0, 0);

        // Add minimal feedback for stepping forward
        if (current !== 'V5') { // Don't show on last step as it conflicts with Complete toast
            // Optional: could add toast here, but might be annoying
        }
    };

    // Renamed Handlers from R to V
    const handleV1Next = () => {
        syncFormDataToAppData(formData);
        advanceTab('V1', 'V2');
    };
    const handleV2Next = () => {
        syncFormDataToAppData(formData);
        advanceTab('V2', 'V3');
    };
    const handleV3Next = () => {
        syncFormDataToAppData(formData);
        advanceTab('V3', 'V4');
    };
    const handleV4Complete = () => {
        handleOnboardingComplete(formData);
        advanceTab('V4', 'OS');
    };

    return (
        <BinderLayout
            activeTab={binderTab}
            setActiveTab={setBinderTab}
            completedTabs={completedTabs}
            onBack={onBackToAgency} // Pass back handler if in agency mode
        >

            {binderTab === 'V1' && (
                <PageBrand formData={formData} setFormData={setFormData} onNext={handleV1Next} />
            )}

            {binderTab === 'V2' && (
                <PageOffer formData={formData} setFormData={setFormData} onNext={handleV2Next} />
            )}

            {binderTab === 'V3' && (
                <PageFunnel formData={formData} setFormData={setFormData} onNext={handleV3Next} />
            )}

            {binderTab === 'V4' && (
                <PageOps formData={formData} setFormData={setFormData} onComplete={handleV4Complete} />
            )}

            {binderTab === 'V5' && (
                <PageIdeas
                    formData={formData}
                    setFormData={setFormData}
                    onComplete={() => {
                        syncFormDataToAppData(formData);
                        setBinderTab('OS');
                    }}
                />
            )}

            {binderTab === 'OS' && (
                <OnePageDashboard
                    appData={appData}
                    setAppData={setAppData}
                    setActiveTab={setBinderTab}
                    onGeneratePrompt={handleGeneratePrompt}
                    formData={formData}
                    setFormData={setFormData}
                    meetingState={meetingState}
                    setMeetingState={setMeetingState}
                    currentUser={currentUser}
                    isWorkspaceLoading={isWorkspaceLoading}
                />
            )}

            {/* GLOBAL PROMPT OVERLAY - IDF ENGINE v1 */}
            {(selectedPrompt || isGenerating) && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-[#111] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] min-h-[400px]">
                        
                        {isGenerating ? (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                                <Wand2 className="text-purple-500 animate-pulse" size={48} />
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-white mb-2">Processando Contexto...</h3>
                                    <p className="text-gray-400 text-sm">Analisando Vaults S1-S5 e gerando diretrizes.</p>
                                </div>
                                <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mt-4">
                                    <div className="h-full bg-purple-500 animate-progressBar"></div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="h-14 border-b border-white/10 bg-[#0a0a0a] flex items-center justify-between px-6">
                                    <div className="flex items-center gap-2">
                                        <Wand2 className="text-purple-500" size={18} />
                                        <span className="font-bold text-gray-200">Bravvo Binder - IDF Engine v1</span>
                                    </div>
                                    <button onClick={() => setSelectedPrompt(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                        <PlusCircle className="rotate-45 text-gray-400" size={20} />
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div className="flex border-b border-white/5 bg-[#080808]">
                                    <button
                                        onClick={() => setPromptTab('ai')}
                                        className={`flex-1 h-12 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${promptTab === 'ai'
                                            ? 'bg-[#111] text-purple-400 border-b-2 border-purple-500'
                                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                            }`}
                                    >
                                        <Terminal size={14} />
                                        AI PROMPT (MIDJOURNEY)
                                    </button>
                                    <button
                                        onClick={() => setPromptTab('human')}
                                        className={`flex-1 h-12 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${promptTab === 'human'
                                            ? 'bg-[#111] text-orange-400 border-b-2 border-orange-500'
                                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                            }`}
                                    >
                                        <Users size={14} />
                                        HUMAN GUIDE (EDITOR)
                                    </button>
                                </div>

                                {/* Editor Area */}
                                <div className="flex-1 overflow-auto p-6 bg-[#050505] font-mono text-sm text-gray-300 relative group">
                                    <div className="whitespace-pre-wrap leading-relaxed">
                                        {promptTab === 'ai' ? selectedPrompt.aiPrompt : selectedPrompt.humanGuide}
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="h-16 border-t border-white/10 bg-[#0a0a0a] flex items-center justify-between px-6">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className={`w-2 h-2 rounded-full ${promptTab === 'ai' ? 'bg-purple-500' : 'bg-orange-500'}`}></span>
                                        <span>{promptTab === 'ai' ? 'Modo: Gerador Instrucional (9-Block)' : 'Modo: Guia Operacional Humano'}</span>
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${copied ? 'bg-green-500 text-black' : 'bg-white text-black hover:scale-105'}`}
                                    >
                                        {copied ? <Check size={16} /> : <Copy size={16} />}
                                        {copied ? 'COPIADO' : 'COPIAR'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </BinderLayout>
    );
}

// WRAPPER
function App() {
    return (
        <ToastProvider>
            <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
                <AppContent />
            </Suspense>
        </ToastProvider>
    );
}

// ============================================================================
// MAIN APP ROUTER
// ============================================================================
function AppContent() {
    const [viewMode, setViewMode] = useState('landing'); // 'landing' | 'login' | 'agency' | 'master' | 'client_workspace'
    const [currentUser, setCurrentUser] = useState(null); // { role: 'agency' | 'master', client: null }
    const [clientData, setClientData] = useState(null); // The actual data for the workspace
    const [isClientLoading, setIsClientLoading] = useState(false);
    const { addToast } = useToast();

    // AUTO-LOGIN CHECK
    useEffect(() => {
        const savedSession = sessionStorage.getItem('bravvo_session') || localStorage.getItem('bravvo_session');
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                // Simple validation - in real app, better token check
                if (session.user === 'bravvo') {
                    setCurrentUser({ role: 'agency', client: null }); // Map Bravvo Admin to Agency Dashboard for now (Command Center)
                    setViewMode('agency');
                    addToast({ title: 'Bem-vindo de volta, Commander', type: 'success' });
                }
            } catch (e) {
                console.error("Session parse error", e);
                localStorage.removeItem('bravvo_session');
                sessionStorage.removeItem('bravvo_session');
            }
        }
    }, [addToast]);

    const handleLogin = (role, credentials) => {
        // SAVING SESSION
        if (credentials) {
            const sessionPayload = {
                user: credentials.username,
                role: role,
                token: 'mock-token-123',
                ts: Date.now()
            };
            sessionStorage.setItem('bravvo_session', JSON.stringify(sessionPayload));
            if (credentials.remember) {
                localStorage.setItem('bravvo_session', JSON.stringify(sessionPayload));
            } else {
                localStorage.removeItem('bravvo_session');
            }
        }

        if (role === 'agency') {
            setViewMode('agency');
            setCurrentUser({ role: 'agency', client: null });
        } else if (role === 'master') {
            setViewMode('master');
            setCurrentUser({ role: 'master', client: null });
        } else {
            // Client login - for demo, we pick C1
            const seed = api.getClientData('C1');
            const data = storageService.loadClientData('C1', seed);
            setIsClientLoading(true);
            setClientData(data);
            setViewMode('client_workspace');
            setCurrentUser({ role: 'client', client: { id: 'C1', name: 'Direct Client' } });
        }
    };

    const handleSelectClient = (client) => {
        // Fetch fresh data for the selected client from Mock DB
        const seed = api.getClientData(client.id);
        const data = storageService.loadClientData(client.id, seed);
        setIsClientLoading(true);
        setClientData(data);
        setCurrentUser(prev => ({ ...prev, client: client }));
        setViewMode('client_workspace');
    };

    useEffect(() => {
        if (viewMode !== 'client_workspace') return;
        if (!isClientLoading) return;
        setIsClientLoading(false);
    }, [viewMode, isClientLoading]);

    const handleSaveClientData = (newData) => {
        if (clientData && clientData.id) {
            api.updateClientData(clientData.id, newData);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('bravvo_session');
        sessionStorage.removeItem('bravvo_session');
        setViewMode('login');
        setCurrentUser(null);
        setClientData(null);
    };

    const handleBackToAgency = () => {
        if (currentUser?.role === 'master') {
            setViewMode('master');
        } else {
            setViewMode('agency');
        }
        setClientData(null);
    };

    switch (viewMode) {
        case 'landing':
            return <LandingPage onLogin={() => setViewMode('login')} />;

        case 'login':
            return <LoginScreen onLogin={handleLogin} />;

        case 'agency':
            return (
                <AgencyDashboard
                    onSelectClient={handleSelectClient}
                    onLogout={handleLogout}
                />
            );

        case 'master':
            return (
                <MasterDashboard
                    onSelectClient={handleSelectClient}
                    onLogout={handleLogout}
                />
            );

        case 'client_workspace':
            return (
                <ClientWorkspace
                    onBackToAgency={currentUser?.role !== 'client' ? handleBackToAgency : undefined}
                    isAgencyView={currentUser?.role !== 'client'}
                    initialData={clientData}
                    onSave={handleSaveClientData}
                    currentUser={currentUser}
                    isWorkspaceLoading={isClientLoading}
                />
            );

        default:
            return <LandingPage onLogin={() => setViewMode('login')} />;
    }
}

export default App;
