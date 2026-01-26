import React, { useState, useCallback, useEffect } from 'react';
import { aiService } from './services/aiService';
import { BinderLayout } from './components/Binder/BinderLayout';
import { PageBrand } from './components/Pages/PageBrand';
import { PageOffer } from './components/Pages/PageOffer';
import { PageFunnel } from './components/Pages/PageFunnel';
import { PageOps } from './components/Pages/PageOps';
import { PageIdeas } from './components/Pages/PageIdeas';
// NEW: Import One Page Dashboard
import { OnePageDashboard } from './components/CommandCenter/OnePageDashboard';

// IMPORTS FOR IMPROVEMENTS
import { useLocalStorage } from './hooks/useLocalStorage';
import { ToastProvider, useToast } from './contexts/ToastContext';

import {
    Terminal,
    Wand2,
    Copy,
    Check,
    Users,
    PlusCircle
} from 'lucide-react';

import { useVaults } from './contexts/VaultContext';

// --- NEW COMPONENTS FOR MULTI-TENANCY ---
import { LandingPage } from './components/Marketing/LandingPage';
import { LoginScreen } from './components/Auth/LoginScreen';
import { AgencyDashboard } from './components/Agency/AgencyDashboard';
import { MasterDashboard } from './components/Master/MasterDashboard';
import { api } from './data/mockDB';
// Import VaultProvider to wrap the workspace instance
import { VaultProvider } from './contexts/VaultContext';

// ============================================================================
// CLIENT WORKSPACE (THE ORIGINAL APP "OS")
// ============================================================================
function ClientWorkspace({ onBackToAgency, isAgencyView, initialData, onSave, currentUser }) {
    // We wrap the internal content with VaultProvider so it can accept initialData
    return (
        <VaultProvider initialData={initialData} onSave={onSave}>
            <ClientWorkspaceContent
                onBackToAgency={onBackToAgency}
                isAgencyView={isAgencyView}
                currentUser={currentUser}
            />
        </VaultProvider>
    );
}

function ClientWorkspaceContent({ onBackToAgency, isAgencyView: _isAgencyView, currentUser }) {
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
    const [meetingState, setMeetingState] = useLocalStorage('bravvo_meeting_state', {
        active: false,
        comments: {
            general: '',
            revenue: '',
            traffic: '',
            sales: ''
        }
    });

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
    const [formData, setFormData] = useLocalStorage('bravvo_form_data', {
        // --- V1: Brand Vault ---
        clientName: appData.clientName || "",
        niche: appData?.vaults?.S1?.fields?.niche || "gastronomia",
        tagline: appData?.vaults?.S1?.fields?.tagline || "",
        promise: appData?.vaults?.S1?.fields?.promise || "",
        enemy: appData?.vaults?.S1?.fields?.enemy || "",
        brandValues: appData?.vaults?.S1?.fields?.brandValues || [],
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
        customThemeEnabled: appData.customThemeEnabled || false
    });

    // Handlers
    const handleGeneratePrompt = useCallback((item) => {
        setIsGenerating(true);
        // Now returns object { aiPrompt, humanGuide }
        const promptData = generatePrompt(item, appData.vaults);
        setSelectedPrompt(promptData);
        setPromptTab('ai'); // Reset to AI tab
        setSelectedItem(item);
        setPromptHistory(prev => [
            { id: Date.now(), item: item.initiative, timestamp: new Date().toLocaleTimeString(), prompt: promptData },
            ...prev.slice(0, 9)
        ]);
        setIsGenerating(false);
    }, [appData.vaults]);

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

    const handleOnboardingComplete = (newClientData) => {
        // --- 1. VAULT GENERATION (SOURCE OF TRUTH) ---

        // S1: Brand Vault
        const newS1 = {
            ...(appData?.vaults?.S1 || {}),
            fields: {
                ...(appData?.vaults?.S1?.fields || {}),
                promise: newClientData.promise, // From V1
                enemy: newClientData.enemy,     // From V1
                tone: Array.isArray(newClientData.tone) ? newClientData.tone : (newClientData.tone || '').split(','),
                archetype: newClientData.archetype // From V1
            }
        };

        // S2: Commerce Vault
        const inputProducts = newClientData.products || [];
        const heroProduct = inputProducts[0] || { name: "Produto Exemplo", price: 0, margin: "Medium" };

        const newS2 = {
            ...(appData?.vaults?.S2 || {}),
            products: inputProducts.length > 0 ? inputProducts : [
                { id: "P_NEW_1", name: "Produto Inicial", role: "Hero", margin: "High", price: 100 },
            ],
            strategy: {
                format: newClientData.saleFormat || "presencial",
                seasonality: "Evergreen"
            }
        };

        // S3: Funnel Vault
        const newS3 = {
            ...(appData?.vaults?.S3 || {}),
            steps: [
                { step: "Atenção", kpi: "CPM", goal: "R$ 10,00" },
                { step: "Interesse", kpi: "CTR", goal: "2%" },
                { step: "Desejo", kpi: "Click Whatsapp", goal: newClientData.conversionLink } // From V3
            ],
            traffic: {
                primarySource: newClientData.trafficType
            }
        };

        // S4: Ops Vault
        const newS4 = {
            ...(appData?.vaults?.S4 || {}),
            matrix: [
                { role: "Aprovador Final", who: newClientData.approverName }, // From V4
                { role: "Estrategista", who: "Bravvo Agent" },
                { role: "Time", who: newClientData.teamStructure }
            ],
            slas: {
                ...(appData?.vaults?.S4?.slas || {}),
                approval: `${newClientData.slaHours}h` // From V4
            }
        };

        // S5: Design Vault
        const newS5 = {
            ...(appData?.vaults?.S5 || {}),
            palette: {
                ...(appData?.vaults?.S5?.palette || {}),
                primary: newClientData.primaryColor // From V1
            },
            rules: {
                ...(appData?.vaults?.S5?.rules || {}),
                mood: newClientData.mood
            }
        };

        // --- 2. DASHBOARD GENERATION (DERIVED FROM VAULTS) ---

        // D1 (Economy): STRICTLY derived from S2 Products
        const newD1 = newS2.products.map(p => ({
            id: p.id,
            product: p.name,
            type: "Produto",
            price: p.price,
            margin: p.margin,
            offer_strategy: p.role === 'Hero' ? 'Tráfego Frio' : 'Upsell',
            status: "Active"
        }));

        // D3 (Matrix): STRICTLY derived from S4 Matrix
        const newD3 = [
            { id: 1, task: "Aprovação de Criativos", owner: "Agência", approver: newS4.matrix[0].who, sla: newS4.slas.approval, status: "Active" },
            { id: 2, task: "Definição de Oferta", owner: "Cliente", approver: "Agência", sla: "48h", status: "Active" }
        ];

        // D2 (Plan): Uses S1 (Message) + S2 (Product) + S3 (Link)
        const newD2 = [
            {
                id: 1,
                date: "2024-03-01",
                initiative: `Lançamento: ${newS1.fields.promise}`, // Uses S1
                channel: "Instagram Reel",
                format: "reel",
                offerId: heroProduct.id || "P_NEW_1", // Uses S2
                ctaId: "CTA_MAIN", // Implicitly linked to S3 Goal
                responsible: "IA Agent",
                status: "scheduled",
                visual_output: "Pending"
            },
            {
                id: 2,
                date: "2024-03-03",
                initiative: `Combater: ${newS1.fields.enemy}`, // Uses S1
                channel: "Instagram Story",
                format: "story",
                offerId: heroProduct.id || "P_NEW_1",
                ctaId: "CTA_MAIN",
                responsible: "IA Agent",
                status: "draft",
                visual_output: "Pending"
            }
        ];

        // Update Global State
        setAppData({
            ...appData,
            clientName: newClientData.clientName,
            vaults: {
                S1: newS1,
                S2: newS2,
                S3: newS3,
                S4: newS4,
                S5: newS5
            },
            dashboard: {
                ...appData.dashboard,
                D1: newD1, // Derived
                D2: newD2, // Derived
                D3: newD3, // Derived
                D4: appData.dashboard.D4, // Keep existing template for blocks
                D5: appData.dashboard.D5  // Keep existing template for KPIs
            }
        });

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
    const handleV1Next = () => advanceTab('V1', 'V2');
    const handleV2Next = () => advanceTab('V2', 'V3');
    const handleV3Next = () => advanceTab('V3', 'V4');
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
                <PageIdeas formData={formData} setFormData={setFormData} onComplete={() => setBinderTab('OS')} />
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
            <AppContent />
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
    const { addToast } = useToast();

    // AUTO-LOGIN CHECK - Only if explicitly requested (not on first visit)
    useEffect(() => {
        // Check if this is a direct landing page visit (no hash/query params)
        const isDirectVisit = !window.location.hash && !window.location.search;
        
        const savedSession = localStorage.getItem('bravvo_session');
        if (savedSession && !isDirectVisit) {
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
            }
        }
    }, [addToast]);

    const handleLogin = (role, credentials) => {
        // SAVING SESSION
        if (credentials && credentials.remember) {
            localStorage.setItem('bravvo_session', JSON.stringify({
                user: credentials.username,
                role: role,
                token: 'mock-token-123'
            }));
        }

        if (role === 'agency') {
            setViewMode('agency');
            setCurrentUser({ role: 'agency', client: null });
        } else if (role === 'master') {
            setViewMode('master');
            setCurrentUser({ role: 'master', client: null });
        } else {
            // Client login - for demo, we pick C1
            const data = api.getClientData('C1');
            setClientData(data);
            setViewMode('client_workspace');
            setCurrentUser({ role: 'client', client: { name: 'Direct Client' } });
        }
    };

    const handleSelectClient = (client) => {
        // Fetch fresh data for the selected client from Mock DB
        const data = api.getClientData(client.id);
        setClientData(data);
        setCurrentUser(prev => ({ ...prev, client: client }));
        setViewMode('client_workspace');
    };

    const handleSaveClientData = (newData) => {
        if (clientData && clientData.id) {
            api.updateClientData(clientData.id, newData);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('bravvo_session'); // Clear session
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
                />
            );

        default:
            return <LandingPage onLogin={() => setViewMode('login')} />;
    }
}

export default App;
