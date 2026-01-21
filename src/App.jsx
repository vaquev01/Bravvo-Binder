import React, { useState, useCallback } from 'react';
import { CARACA_BAR_DATA } from './data/mockData';
import { generatePrompt, generateSimplePrompt } from './utils/promptGenerator';
import { VisualVault } from './components/VisualVault';
import { DashboardTable } from './components/DashboardTable';
import { OnboardingWizard } from './components/Onboarding/OnboardingWizard';
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

function App() {
    // State
    const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard' or 'vaults' or 'logs'
    const [activeId, setActiveId] = useState('D2'); // D1-D5 or S1-S5
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [copied, setCopied] = useState(false);
    const [promptHistory, setPromptHistory] = useState([]);
    const [showWizard, setShowWizard] = useState(false);

    // Application Data (Starts with Mock, updates with Wizard)
    const [appData, setAppData] = useState(CARACA_BAR_DATA);

    // Handlers
    const handleGeneratePrompt = useCallback((item) => {
        // Only D2 items generate prompts in this version
        const prompt = generatePrompt(item, appData.vaults);
        setSelectedPrompt(prompt);
        setSelectedItem(item);
        setPromptHistory(prev => [
            { id: Date.now(), item: item.initiative, timestamp: new Date().toLocaleTimeString(), prompt },
            ...prev.slice(0, 9)
        ]);
    }, [appData.vaults]);

    const handleCopy = useCallback(async () => {
        if (selectedPrompt) {
            await navigator.clipboard.writeText(selectedPrompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [selectedPrompt]);

    const handleOnboardingComplete = (newClientData) => {
        // --- 1. VAULT GENERATION (SOURCE OF TRUTH) ---

        // S1: Brand Vault
        const newS1 = {
            ...appData.vaults.S1,
            fields: {
                ...appData.vaults.S1.fields,
                promise: newClientData.promise, // From R1
                enemy: newClientData.enemy,     // From R1
                tone: newClientData.tone.split(','),
                archetype: newClientData.mood === 'Sério' ? 'O Governante' : 'O Criador'
            }
        };

        // S2: Commerce Vault
        const newS2 = {
            ...appData.vaults.S2,
            products: [
                { id: "P_NEW_1", name: newClientData.heroProduct, role: "Hero", margin: newClientData.heroMargin, price: parseFloat(newClientData.heroPrice) },
                { id: "P_NEW_2", name: "Produto Complementar", role: "Upsell", margin: "High", price: parseFloat(newClientData.heroPrice) * 0.2 }
            ]
        };

        // S3: Funnel Vault
        const newS3 = {
            ...appData.vaults.S3,
            steps: [
                { step: "Atenção", kpi: "CPM", goal: "R$ 10,00" },
                { step: "Interesse", kpi: "CTR", goal: "2%" },
                { step: "Desejo", kpi: "Click Whatsapp", goal: newClientData.conversionLink } // From R3
            ]
        };

        // S4: Ops Vault
        const newS4 = {
            ...appData.vaults.S4,
            matrix: [
                { role: "Aprovador Final", who: newClientData.approverName }, // From R4
                { role: "Estrategista", who: "Bravvo Agent" }
            ],
            slas: {
                ...appData.vaults.S4.slas,
                approval: `${newClientData.slaHours}h` // From R4
            }
        };

        // S5: Design Vault
        const newS5 = {
            ...appData.vaults.S5,
            palette: {
                ...appData.vaults.S5.palette,
                primary: newClientData.primaryColor // From R1
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

        setShowWizard(false);
        setActiveSection('dashboard');
        setActiveId('D2');
    };

    // Navigation Config
    const dashboards = [
        { id: 'D1', label: 'Ofertas & Economia', icon: ShoppingBag },
        { id: 'D2', label: 'Comunicação (Plano)', icon: LayoutDashboard },
        { id: 'D3', label: 'Matriz Responsáveis', icon: Users },
        { id: 'D4', label: 'Tarefas em Bloco', icon: Layers },
        { id: 'D5', label: 'KPIs & Aprendizado', icon: BarChart3 }
    ];

    const vaults = [
        { id: 'S1', label: 'Brand Vault', icon: Target },
        { id: 'S2', label: 'Commerce Vault', icon: ShoppingBag },
        { id: 'S3', label: 'Funnel Vault', icon: GitBranch },
        { id: 'S4', label: 'Ops Vault', icon: Settings },
        { id: 'S5', label: 'Design Vault', icon: Palette }
    ];

    return (
        <div className="flex h-screen bg-bravvo-bg text-bravvo-text font-sans overflow-hidden">

            {showWizard && (
                <OnboardingWizard
                    onComplete={handleOnboardingComplete}
                    onCancel={() => setShowWizard(false)}
                />
            )}

            {/* Sidebar */}
            <aside className="w-64 border-r border-bravvo-border bg-bravvo-card flex flex-col">
                <div className="p-6 border-b border-bravvo-border">
                    <h1 className="text-2xl font-display font-black tracking-tighter">
                        <span className="text-bravvo-primary">BRAVVO</span>
                        <span className="text-white">OS</span>
                    </h1>
                    <p className="text-xs text-bravvo-muted mt-1">v3.8 • Integrity Lock</p>
                </div>

                <div className="p-4">
                    <button
                        onClick={() => setShowWizard(true)}
                        className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 p-3 rounded-lg flex items-center justify-center gap-2 transition-all group"
                    >
                        <PlusCircle size={18} className="text-bravvo-primary group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-sm">Novo Cliente</span>
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
                    {/* Dashboards Section */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 mb-2">Dashboards</h3>
                        <div className="space-y-1">
                            {dashboards.map(d => (
                                <SidebarItem
                                    key={d.id}
                                    icon={d.icon}
                                    label={d.label}
                                    active={activeSection === 'dashboard' && activeId === d.id}
                                    onClick={() => { setActiveSection('dashboard'); setActiveId(d.id); }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Vaults Section */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 mb-2">Sources (Vaults)</h3>
                        <div className="space-y-1">
                            {vaults.map(v => (
                                <SidebarItem
                                    key={v.id}
                                    icon={v.icon}
                                    label={v.label}
                                    active={activeSection === 'vaults' && activeId === v.id}
                                    onClick={() => { setActiveSection('vaults'); setActiveId(v.id); }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Logs Section */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 mb-2">System</h3>
                        <SidebarItem
                            icon={Terminal}
                            label="Prompt Logs"
                            active={activeSection === 'logs'}
                            onClick={() => setActiveSection('logs')}
                            badge={promptHistory.length}
                        />
                    </div>
                </nav>

                <div className="p-4 border-t border-bravvo-border">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-bravvo-primary flex items-center justify-center text-black font-bold text-sm">
                            {appData.clientName.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-medium">{appData.clientName}</p>
                            <p className="text-xs text-bravvo-accent flex items-center gap-1">
                                <span className="w-2 h-2 bg-bravvo-accent rounded-full animate-pulse"></span>
                                Online
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8 relative">
                <div className="max-w-6xl mx-auto pb-24">
                    {/* Header */}
                    <header className="mb-8 flex justify-between items-end">
                        <div>
                            <div className="flex items-center gap-2 text-bravvo-muted text-sm mb-1">
                                {activeSection === 'dashboard' ? <LayoutDashboard size={14} /> :
                                    activeSection === 'vaults' ? <Database size={14} /> : <Terminal size={14} />}
                                <span className="uppercase tracking-wide">{activeSection}</span>
                            </div>
                            <h2 className="text-3xl font-bold text-white">
                                {activeSection === 'logs' ? 'Prompt Logs' :
                                    activeSection === 'dashboard' ? dashboards.find(d => d.id === activeId)?.label :
                                        vaults.find(v => v.id === activeId)?.label}
                            </h2>
                            <p className="text-gray-400 mt-1">
                                {activeSection === 'dashboard' ? `Gerenciamento Operacional • ${activeId}` :
                                    activeSection === 'vaults' ? `Fonte de Verdade • ${activeId}` :
                                        'Histórico de geração de AI Prompts'}
                            </p>
                        </div>
                        {activeSection === 'dashboard' && activeId === 'D2' && (
                            <div className="text-xs text-gray-500 bg-white/5 px-3 py-2 rounded border border-white/5">
                                💡 Clique em uma linha para gerar o Prompt
                            </div>
                        )}
                        {selectedPrompt && (
                            <button
                                onClick={() => { setSelectedPrompt(null); setSelectedItem(null); }}
                                className="text-sm px-4 py-2 border border-dashed border-bravvo-muted hover:bg-white/5 rounded transition-colors"
                            >
                                Fechar Console
                            </button>
                        )}
                    </header>

                    {/* Content Views */}
                    <div className="min-h-[400px]">
                        {activeSection === 'dashboard' && (
                            <DashboardTable
                                id={activeId}
                                data={appData.dashboard[activeId]}
                                onRowClick={activeId === 'D2' ? handleGeneratePrompt : undefined}
                            />
                        )}

                        {activeSection === 'vaults' && (
                            <VisualVault
                                id={activeId}
                                data={appData.vaults[activeId]}
                            />
                        )}

                        {activeSection === 'logs' && (
                            <LogsView history={promptHistory} />
                        )}
                    </div>
                </div>

                {/* Prompt Terminal Overlay */}
                {selectedPrompt && (
                    <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-black/95 backdrop-blur-xl border-t-2 border-bravvo-primary p-8 shadow-2xl overflow-auto transition-all duration-300 z-50">
                        <div className="max-w-4xl mx-auto font-mono">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-bravvo-primary">
                                    <Terminal size={20} />
                                    <span className="font-bold">PROMPT GENERATOR OUTPUT</span>
                                    {selectedItem && (
                                        <div className="flex gap-2 ml-4">
                                            <span className="text-xs bg-white/10 text-white px-2 py-1 rounded">
                                                {selectedItem.initiative}
                                            </span>
                                            <span className="text-xs bg-bravvo-primary/20 text-bravvo-primary px-2 py-1 rounded">
                                                {selectedItem.format.toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300 border-l-2 border-bravvo-accent pl-4 mb-6 max-h-[35vh] overflow-auto custom-scrollbar">
                                {selectedPrompt}
                            </div>

                            <div className="flex gap-4 sticky bottom-0 bg-black/90 pt-4 border-t border-gray-800">
                                <button
                                    onClick={handleCopy}
                                    className="bg-bravvo-primary text-black font-bold px-6 py-2 rounded hover:bg-orange-600 transition-colors flex items-center gap-2"
                                >
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                    {copied ? 'Copiado!' : 'Copiar Prompt'}
                                </button>
                                <button
                                    onClick={() => {
                                        const simple = generateSimplePrompt(selectedItem, appData.vaults);
                                        navigator.clipboard.writeText(simple);
                                        alert('Prompt simplificado copiado!');
                                    }}
                                    className="border border-bravvo-primary text-bravvo-primary px-6 py-2 rounded hover:bg-bravvo-primary/10 transition-colors"
                                >
                                    Copiar Versão Curta
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// Sub-components
function SidebarItem({ icon: Icon, label, active, onClick, badge }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors text-sm ${active
                ? 'bg-bravvo-primary text-black font-bold'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
        >
            <div className="flex items-center gap-3">
                <Icon size={16} />
                <span>{label}</span>
            </div>
            {badge > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-black/20' : 'bg-bravvo-primary/20 text-bravvo-primary'}`}>
                    {badge}
                </span>
            )}
        </button>
    );
}

function LogsView({ history }) {
    if (history.length === 0) {
        return (
            <div className="glass-panel p-12 rounded-xl text-center border border-dashed border-gray-800">
                <AlertCircle className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-500">Nenhum prompt gerado ainda.</p>
                <p className="text-sm text-gray-600 mt-2">Vá para o Dashboard D2 e clique em uma iniciativa.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {history.map((log) => (
                <div key={log.id} className="glass-panel p-4 rounded-xl border border-bravvo-border hover:border-bravvo-primary/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-white">{log.item}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            {log.timestamp}
                        </span>
                    </div>
                    <pre className="text-xs text-gray-400 overflow-auto max-h-24 bg-black/30 p-3 rounded font-mono">
                        {log.prompt.substring(0, 300)}...
                    </pre>
                </div>
            ))}
        </div>
    );
}

export default App;
