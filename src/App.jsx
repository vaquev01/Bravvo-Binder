import React, { useState, useCallback } from 'react';
// import { CARACA_BAR_DATA } from './data/mockData'; // REMOVED: Now using Context
import { generatePrompt, generateSimplePrompt } from './utils/promptGenerator';
import { VisualVault } from './components/VisualVault';
import { DashboardTable } from './components/DashboardTable';
// import { OnboardingWizard } from './components/Onboarding/OnboardingWizard'; // REMOVED
import { BinderLayout } from './components/Binder/BinderLayout';
import { PageBrand } from './components/Pages/PageBrand';
import { PageOffer } from './components/Pages/PageOffer';
import { PageFunnel } from './components/Pages/PageFunnel';
import { PageOps } from './components/Pages/PageOps';
import { PageIdeas } from './components/Pages/PageIdeas';
// NEW: Import One Page Dashboard
import { OnePageDashboard } from './components/CommandCenter/OnePageDashboard';

import {
    LayoutDashboard,
    Database,
    Terminal,
    Layers,
    Wand2,
    Copy,
    Check,
    Clock,
    AlertCircle,
    Users,
    Palette,
    ShoppingBag,
    GitBranch,
    Settings,
    BarChart3,
    FileText,
    Target,
    PlusCircle
} from 'lucide-react';

import { useVaults } from './contexts/VaultContext';

function App() {
    // State
    const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard' or 'vaults' or 'logs'
    const [activeId, setActiveId] = useState('D2'); // D1-D5 or S1-S5
    // Prompt UI State
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [promptTab, setPromptTab] = useState('ai'); // 'ai' or 'human'
    const [selectedItem, setSelectedItem] = useState(null);
    const [copied, setCopied] = useState(false);
    const [promptHistory, setPromptHistory] = useState([]);

    // --- BINDER STATE ---
    // Start at OS (One Page Dashboard) as requested by user ("painel de gestao quero que seja inicial")
    const [binderTab, setBinderTab] = useState('OS'); // V1, V2, V3, V4, OS
    const [completedTabs, setCompletedTabs] = useState(['V1', 'V2', 'V3', 'V4', 'V5']); // Assume config is ready or optional for now

    // Shared Form State (Lifted from Wizard)
    const [formData, setFormData] = useState({
        // --- V1: Brand Vault ---
        clientName: "",
        niche: "gastronomia",
        tagline: "",
        promise: "",
        enemy: "",
        brandValues: [],
        audienceAge: "25-34",
        audienceGender: "todos",
        audienceClass: "bc",
        audiencePain: "",
        archetype: "O Cara Comum",
        tone: "casual",
        mood: "moderno",
        primaryColor: "#F97316",
        secondaryColor: "#1E293B",
        accentColor: "#10B981",
        bio: "",

        // --- V2: Commerce Vault ---
        products: [],
        currentTicket: "",
        targetTicket: "",
        currentRevenue: "",
        upsellStrategy: "none",
        saleFormat: "presencial",
        baitProduct: "",
        baitPrice: "",

        // --- V3: Funnel Vault ---
        channels: [],
        conversionLink: "",
        instagramHandle: "",
        websiteUrl: "",
        primaryCTA: "whatsapp",
        secondaryCTA: "saibamais",
        ctaText: "",
        monthlyGoal: "",
        trafficType: "Misto",
        utmCampaign: "",
        currentConversion: "",
        targetConversion: "",
        cpl: "",

        // --- V4: Ops Vault ---
        approverName: "",
        teamStructure: "Enxuta",
        slaHours: 24,
        contentOwner: "",
        trafficOwner: "",
        supportOwner: "",
        emergencyContact: "",
        postingFrequency: "3x",
        bestDays: [],
        bestTimes: [],
        startDate: "",
        cycleDuration: "30",
        // V4 Additions: Stakeholders & Competitors
        stakeholders: [],  // [{id, name, role, contact, contactType, canApprove}]
        competitors: [],   // [{id, name, handle, notes, link}]

        // --- V5: Ideas & References Vault ---
        ideas: [],         // [{id, title, description, url, tags, createdAt}]
        references: [],    // [{id, title, url, type, notes, createdAt}]
        notepad: "",       // Free-form notepad

        // --- Governance History ---
        governanceHistory: [],  // [{id, date, kpiSnapshot, tasksSummary, postsApproved, notes}]

        // --- Theme Customization ---
        customThemeEnabled: false
    });

    // Application Data (Consumed from Context)
    const { appData, setAppData } = useVaults();

    // Handlers
    const handleGeneratePrompt = useCallback((item) => {
        // Now returns object { aiPrompt, humanGuide }
        const promptData = generatePrompt(item, appData.vaults);
        setSelectedPrompt(promptData);
        setPromptTab('ai'); // Reset to AI tab
        setSelectedItem(item);
        setPromptHistory(prev => [
            { id: Date.now(), item: item.initiative, timestamp: new Date().toLocaleTimeString(), prompt: promptData },
            ...prev.slice(0, 9)
        ]);
    }, [appData.vaults]);

    const handleCopy = useCallback(async () => {
        if (selectedPrompt) {
            const textToCopy = promptTab === 'ai' ? selectedPrompt.aiPrompt : selectedPrompt.humanGuide;
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [selectedPrompt, promptTab]);

    const handleOnboardingComplete = (newClientData) => {
        // --- 1. VAULT GENERATION (SOURCE OF TRUTH) ---

        // S1: Brand Vault
        const newS1 = {
            ...appData.vaults.S1,
            fields: {
                ...appData.vaults.S1.fields,
                promise: newClientData.promise, // From V1
                enemy: newClientData.enemy,     // From V1
                tone: newClientData.tone.split(','),
                archetype: newClientData.archetype // From V1 (Enhanced)
            }
        };

        // S2: Commerce Vault
        const newS2 = {
            ...appData.vaults.S2,
            products: [
                { id: "P_NEW_1", name: newClientData.heroProduct, role: "Hero", margin: newClientData.heroMargin, price: parseFloat(newClientData.heroPrice) },
                { id: "P_NEW_2", name: "Produto Complementar", role: "Upsell", margin: "High", price: parseFloat(newClientData.heroPrice) * 0.2 }
            ],
            strategy: {
                format: newClientData.offerFormat,
                seasonality: "Evergreen" // Default for now
            }
        };

        // S3: Funnel Vault
        const newS3 = {
            ...appData.vaults.S3,
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
            ...appData.vaults.S4,
            matrix: [
                { role: "Aprovador Final", who: newClientData.approverName }, // From V4
                { role: "Estrategista", who: "Bravvo Agent" },
                { role: "Time", who: newClientData.teamStructure }
            ],
            slas: {
                ...appData.vaults.S4.slas,
                approval: `${newClientData.slaHours}h` // From V4
            }
        };

        // S5: Design Vault
        const newS5 = {
            ...appData.vaults.S5,
            palette: {
                ...appData.vaults.S5.palette,
                primary: newClientData.primaryColor // From V1
            },
            rules: {
                ...appData.vaults.S5.rules,
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
                offerId: newS2.products[0].id, // Uses S2
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
                offerId: newS2.products[0].id,
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
    };

    // --- BINDER LOGIC ---
    const advanceTab = (current, next) => {
        if (!completedTabs.includes(current)) {
            setCompletedTabs([...completedTabs, current]);
        }
        setBinderTab(next);
        window.scrollTo(0, 0);
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
        <BinderLayout activeTab={binderTab} setActiveTab={setBinderTab} completedTabs={completedTabs}>

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
                />
            )}

            {/* GLOBAL PROMPT OVERLAY - IDF ENGINE v1 */}
            {selectedPrompt && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-[#111] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="h-14 border-b border-white/10 bg-[#0a0a0a] flex items-center justify-between px-6">
                            <div className="flex items-center gap-2">
                                <Wand2 className="text-purple-500" size={18} />
                                <span className="font-bold text-gray-200">Bravvo OS - IDF Engine v1</span>
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
                    </div>
                </div>
            )}
        </BinderLayout>
    );
}

export default App;
