import React, { useEffect, useMemo, useState } from 'react';
import { 
    X, CheckCircle2, AlertTriangle, Target,
    ArrowUpRight, BarChart3, Calendar, FileText, Zap,
    TrendingUp, TrendingDown, ChevronRight,
    Plus, Trash2, Save
} from 'lucide-react';
import { 
    generateATA, 
    recalibrateSystem, 
    generateNextGovernanceWindow,
    OBSERVATION_CATEGORIES,
    ROADMAP_STATUS,
    formatATAForDisplay 
} from '../../services/governanceService';

const GOVERNANCE_STEPS = [
    { id: 'period_summary', label: 'Resumo do Período', icon: BarChart3 },
    { id: 'roadmap_review', label: 'Roadmap Tático', icon: Calendar },
    { id: 'production_analysis', label: 'Análise de Produção', icon: Zap },
    { id: 'execution_analysis', label: 'Análise de Execução', icon: TrendingUp },
    { id: 'observations', label: 'Observações', icon: FileText },
];

export function GovernanceModeModal({ 
    open, 
    onClose, 
    onComplete,
    kpis,
    roadmapItems = [],
    vaults,
    governanceFrequency = 'weekly',
    currentWindow,
    calendarRule,
    currentUser,
    variant = 'modal',
}) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [generatedATA, setGeneratedATA] = useState(null);

    // Form State
    const [periodData, setPeriodData] = useState({
        startDate: '',
        endDate: '',
        notes: '',
    });

    const [blockNotes, setBlockNotes] = useState({
        roadmap: '',
        production: '',
        execution: '',
    });

    useEffect(() => {
        if (!open) return;
        if (periodData.startDate && periodData.endDate) return;

        const toDateStr = (d) => d.toISOString().split('T')[0];
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        if (currentWindow?.startDate && currentWindow?.endDate) {
            setPeriodData(p => ({
                ...p,
                startDate: p.startDate || currentWindow.startDate,
                endDate: p.endDate || currentWindow.endDate,
            }));
            return;
        }

        if (governanceFrequency === 'daily') {
            const s = toDateStr(today);
            setPeriodData(p => ({ ...p, startDate: p.startDate || s, endDate: p.endDate || s }));
            return;
        }

        if (governanceFrequency === 'weekly') {
            const day = today.getDay();
            const weekStartDay = Number.isFinite(calendarRule?.weekStartDay) ? calendarRule.weekStartDay : 1;
            const daysSinceStart = (day - weekStartDay + 7) % 7;
            const start = new Date(today);
            start.setDate(start.getDate() - daysSinceStart);
            const end = new Date(start);
            end.setDate(end.getDate() + 6);
            setPeriodData(p => ({
                ...p,
                startDate: p.startDate || toDateStr(start),
                endDate: p.endDate || toDateStr(end)
            }));
            return;
        }

        if (governanceFrequency === 'monthly') {
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            setPeriodData(p => ({
                ...p,
                startDate: p.startDate || toDateStr(start),
                endDate: p.endDate || toDateStr(end)
            }));
        }
    }, [open, currentWindow, governanceFrequency, periodData.startDate, periodData.endDate, calendarRule?.weekStartDay]);

    const [roadmapReview, setRoadmapReview] = useState(
        roadmapItems.map(item => ({
            ...item,
            governanceStatus: item.status || 'pending',
            observation: '',
        }))
    );

    const [productionData, setProductionData] = useState({
        generated: 0,
        approved: 0,
        published: 0,
        notExecuted: 0,
    });

    const [executionData, setExecutionData] = useState({
        trafficImpact: 'neutral',
        salesImpact: 'neutral',
        topPerformers: ['', '', ''],
        lowPerformers: ['', '', ''],
    });

    const [observations, setObservations] = useState(
        OBSERVATION_CATEGORIES.map(cat => ({
            categoryId: cat.id,
            categoryLabel: cat.label,
            items: [],
        }))
    );

    const [decisions, setDecisions] = useState(['']);
    const [learnings, setLearnings] = useState({
        worked: [''],
        failed: [''],
        changes: [''],
        risks: [''],
    });
    const [priorities, setPriorities] = useState(['', '', '']);

    // Calculate roadmap stats
    const roadmapStats = useMemo(() => {
        const stats = { total: roadmapReview.length, done: 0, delayed: 0, cancelled: 0, pending: 0, in_production: 0 };
        roadmapReview.forEach(item => {
            if (stats[item.governanceStatus] !== undefined) {
                stats[item.governanceStatus]++;
            }
        });
        return stats;
    }, [roadmapReview]);

    // Handle step navigation
    const goToStep = (stepIndex) => {
        if (stepIndex >= 0 && stepIndex < GOVERNANCE_STEPS.length) {
            setCurrentStep(stepIndex);
        }
    };

    const nextStep = () => goToStep(currentStep + 1);
    const prevStep = () => goToStep(currentStep - 1);

    // Add observation
    const addObservation = (categoryId) => {
        setObservations(prev => prev.map(cat => 
            cat.categoryId === categoryId 
                ? { ...cat, items: [...cat.items, { id: Date.now(), text: '' }] }
                : cat
        ));
    };

    const updateObservation = (categoryId, itemId, text) => {
        setObservations(prev => prev.map(cat => 
            cat.categoryId === categoryId 
                ? { ...cat, items: cat.items.map(item => item.id === itemId ? { ...item, text } : item) }
                : cat
        ));
    };

    const removeObservation = (categoryId, itemId) => {
        setObservations(prev => prev.map(cat => 
            cat.categoryId === categoryId 
                ? { ...cat, items: cat.items.filter(item => item.id !== itemId) }
                : cat
        ));
    };

    // Handle array fields
    const updateArrayField = (setter, index, value) => {
        setter(prev => {
            const newArr = [...prev];
            newArr[index] = value;
            return newArr;
        });
    };

    const addArrayItem = (setter) => {
        setter(prev => [...prev, '']);
    };

    const removeArrayItem = (setter, index) => {
        setter(prev => prev.filter((_, i) => i !== index));
    };

    // Update learnings helper
    const updateLearnings = (field, index, value) => {
        setLearnings(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    const addLearningItem = (field) => {
        setLearnings(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    // Complete Governance
    const handleComplete = () => {
        setIsProcessing(true);

        // Collect all observations as flat array
        const allObservations = observations.flatMap(cat => 
            cat.items.filter(item => item.text.trim()).map(item => ({
                category: cat.categoryId,
                categoryLabel: cat.categoryLabel,
                text: item.text,
            }))
        );

        // Build governance data
        const governanceData = {
            period: `${periodData.startDate} - ${periodData.endDate}`,
            periodStartDate: periodData.startDate,
            periodEndDate: periodData.endDate,
            closedAt: new Date().toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            responsible: currentUser?.name || currentUser?.role || 'Operador',
            type: governanceFrequency,
            kpiSnapshot: kpis,
            roadmapReview: roadmapStats,
            productionAnalysis: productionData,
            executionAnalysis: {
                ...executionData,
                topPerformers: executionData.topPerformers.filter(p => p.trim()),
                lowPerformers: executionData.lowPerformers.filter(p => p.trim()),
            },
            blockNotes: {
                period: periodData.notes,
                roadmap: blockNotes.roadmap,
                production: blockNotes.production,
                execution: blockNotes.execution,
            },
            observations: allObservations,
            decisions: decisions.filter(d => d.trim()),
            learnings: {
                worked: learnings.worked.filter(l => l.trim()),
                failed: learnings.failed.filter(l => l.trim()),
                changes: learnings.changes.filter(l => l.trim()),
                risks: learnings.risks.filter(l => l.trim()),
            },
            priorities: priorities.filter(p => p.trim()),
        };

        // Generate ATA
        const ata = generateATA(governanceData);
        
        // Recalibrate system
        const recalibration = recalibrateSystem(ata, vaults, roadmapItems);
        
        // Generate next governance window
        const nextWindow = generateNextGovernanceWindow(ata, governanceFrequency, calendarRule);

        setTimeout(() => {
            setIsProcessing(false);
            setGeneratedATA(ata);

            // Call onComplete with all the data
            onComplete?.({
                ata,
                recalibration,
                nextWindow,
                roadmapUpdates: roadmapReview.map(item => ({
                    id: item.id,
                    status: item.governanceStatus,
                    governanceNote: item.observation,
                })),
            });
        }, 1500);
    };

    if (!open) return null;

    const isEmbedded = variant === 'embedded';

    // Show ATA after processing
    if (generatedATA) {
        const displayATA = formatATAForDisplay(generatedATA);
        return (
            <div className={isEmbedded ? "bg-[#050508] border border-green-500/30 rounded-xl w-full flex flex-col shadow-2xl animate-fadeIn" : "fixed inset-0 z-[100] bg-[#050508] flex items-center justify-center p-4"}>
                <div className={isEmbedded ? "bg-[#0A0A0A] rounded-xl w-full flex flex-col" : "bg-[#0A0A0A] border border-green-500/30 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-fadeIn"}>
                    <div className="flex items-center justify-between p-6 border-b border-green-500/20 bg-green-500/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                                <CheckCircle2 size={24} className="text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Governança Concluída</h2>
                                <p className="text-xs text-green-400">ATA gerada e sistema recalibrado</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                            <X size={18} className="text-gray-400" />
                        </button>
                    </div>

                    <div className={isEmbedded ? "flex-1 overflow-y-auto p-6 space-y-6 max-h-[70vh]" : "flex-1 overflow-y-auto p-6 space-y-6"}>
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-white">{displayATA.title}</h3>
                            <p className="text-sm text-gray-400">{displayATA.subtitle}</p>
                        </div>

                        {displayATA.sections.map((section, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <h4 className="text-sm font-bold text-white mb-3">{section.title}</h4>
                                <ul className="space-y-1">
                                    {section.items.map((item, i) => (
                                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                            <span className="text-gray-600">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        <div className="text-center text-xs text-gray-500 pt-4 border-t border-white/10">
                            {displayATA.signature}
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/10 flex justify-end">
                        <button onClick={onClose} className="btn-primary">
                            Fechar e Aplicar Mudanças
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main Governance Modal
    return (
        <div className={isEmbedded ? "bg-[#050508] border border-purple-500/30 rounded-xl flex flex-col" : "fixed inset-0 z-[100] bg-[#050508] flex flex-col"}>
            {/* Header */}
            <div className="h-14 border-b border-purple-500/30 bg-purple-500/5 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Target size={18} className="text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white">Modo Governança</h2>
                        <p className="text-[10px] text-purple-400">Ritual de fechamento de ciclo</p>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-2">
                    {GOVERNANCE_STEPS.map((step, idx) => {
                        const StepIcon = step.icon;
                        return (
                            <button
                                key={step.id}
                                onClick={() => goToStep(idx)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    currentStep === idx 
                                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                                        : currentStep > idx 
                                            ? 'text-green-400 hover:bg-white/5'
                                            : 'text-gray-500 hover:bg-white/5'
                                }`}
                            >
                                {currentStep > idx ? (
                                    <CheckCircle2 size={14} />
                                ) : (
                                    <StepIcon size={14} />
                                )}
                                <span className="hidden lg:inline">{step.label}</span>
                            </button>
                        );
                    })}
                </div>

                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                    <X size={18} className="text-gray-400" />
                </button>
            </div>

            {/* Content */}
            <div className={isEmbedded ? "flex-1 overflow-y-auto p-6 max-h-[70vh]" : "flex-1 overflow-y-auto p-6"}>
                <div className={isEmbedded ? "w-full" : "max-w-4xl mx-auto"}>
                    
                    {/* Step 1: Period Summary */}
                    {currentStep === 0 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="flex items-center gap-3 mb-6">
                                <BarChart3 size={24} className="text-purple-400" />
                                <h3 className="text-xl font-bold text-white">Resumo do Período</h3>
                            </div>

                            {/* Period Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-label">Data Início</label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        value={periodData.startDate}
                                        onChange={e => setPeriodData(p => ({ ...p, startDate: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-label">Data Fim</label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        value={periodData.endDate}
                                        onChange={e => setPeriodData(p => ({ ...p, endDate: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-label">Comentários do bloco</label>
                                <textarea
                                    className="input-field min-h-[90px]"
                                    placeholder="Resumo do período: contexto, leitura rápida, anomalias..."
                                    value={periodData.notes}
                                    onChange={e => setPeriodData(p => ({ ...p, notes: e.target.value }))}
                                />
                            </div>

                            {/* KPIs vs Metas */}
                            <div>
                                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <TrendingUp size={16} className="text-green-400" />
                                    KPIs vs Metas
                                </h4>
                                <div className="grid grid-cols-3 gap-4">
                                    {['revenue', 'traffic', 'sales'].map(key => {
                                        const kpi = kpis?.[key] || { value: 0, goal: 0 };
                                        const achievement = kpi.goal > 0 ? (kpi.value / kpi.goal * 100).toFixed(0) : 0;
                                        const isAbove = achievement >= 100;
                                        return (
                                            <div key={key} className={`card-elevated p-4 ${isAbove ? 'border-green-500/30' : 'border-red-500/30'}`}>
                                                <p className="text-label mb-2">{key === 'revenue' ? 'Receita' : key === 'traffic' ? 'Tráfego' : 'Vendas'}</p>
                                                <p className="text-metric">{key === 'revenue' || key === 'traffic' ? `R$ ${kpi.value?.toLocaleString()}` : kpi.value}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-caption">Meta: {key === 'revenue' || key === 'traffic' ? `R$ ${kpi.goal?.toLocaleString()}` : kpi.goal}</span>
                                                    <span className={`text-xs font-bold ${isAbove ? 'text-green-400' : 'text-red-400'}`}>{achievement}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Production Stats */}
                            <div>
                                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <Calendar size={16} className="text-blue-400" />
                                    Produção Planejada vs Executada
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="card-elevated p-4">
                                        <p className="text-label mb-2">Planejado</p>
                                        <p className="text-metric-lg">{roadmapStats.total}</p>
                                        <p className="text-caption">itens no roadmap</p>
                                    </div>
                                    <div className="card-elevated p-4">
                                        <p className="text-label mb-2">Executado</p>
                                        <p className="text-metric-lg text-green-400">{roadmapStats.done}</p>
                                        <p className="text-caption">{roadmapStats.total > 0 ? ((roadmapStats.done / roadmapStats.total) * 100).toFixed(0) : 0}% concluído</p>
                                    </div>
                                </div>
                            </div>

                            {/* Atrasos e Bloqueios */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="card-elevated p-4 border-red-500/20">
                                    <p className="text-label mb-2 text-red-400">Atrasados</p>
                                    <p className="text-metric text-red-400">{roadmapStats.delayed}</p>
                                </div>
                                <div className="card-elevated p-4 border-gray-500/20">
                                    <p className="text-label mb-2">Cancelados</p>
                                    <p className="text-metric text-gray-400">{roadmapStats.cancelled}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Roadmap Review */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="flex items-center gap-3 mb-6">
                                <Calendar size={24} className="text-purple-400" />
                                <h3 className="text-xl font-bold text-white">Leitura do Roadmap Tático</h3>
                            </div>

                            <p className="text-body mb-4">Revise cada atividade e atualize o status final.</p>

                            <div>
                                <label className="text-label">Comentários do bloco</label>
                                <textarea
                                    className="input-field min-h-[80px]"
                                    placeholder="Observações gerais do roadmap (bloqueios, decisões de execução, replanejamento)..."
                                    value={blockNotes.roadmap}
                                    onChange={e => setBlockNotes(p => ({ ...p, roadmap: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-3">
                                {roadmapReview.map((item, idx) => (
                                    <div key={item.id || idx} className="card-elevated p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <p className="text-subtitle mb-1">{item.initiative}</p>
                                                <p className="text-caption">{item.date} • {item.channel}</p>
                                            </div>
                                            <select
                                                value={item.governanceStatus}
                                                onChange={e => {
                                                    const newReview = [...roadmapReview];
                                                    newReview[idx].governanceStatus = e.target.value;
                                                    setRoadmapReview(newReview);
                                                }}
                                                className="input-field !w-auto !min-w-[140px]"
                                            >
                                                {Object.entries(ROADMAP_STATUS).map(([key, val]) => (
                                                    <option key={key} value={key}>{val.icon} {val.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <input
                                            placeholder="Observação rápida (opcional)"
                                            value={item.observation}
                                            onChange={e => {
                                                const newReview = [...roadmapReview];
                                                newReview[idx].observation = e.target.value;
                                                setRoadmapReview(newReview);
                                            }}
                                            className="input-field mt-3 text-sm"
                                        />
                                    </div>
                                ))}

                                {roadmapReview.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                                        <p>Nenhum item no roadmap para revisar</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Production Analysis */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="flex items-center gap-3 mb-6">
                                <Zap size={24} className="text-purple-400" />
                                <h3 className="text-xl font-bold text-white">Análise de Produção</h3>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-label">Artes Geradas</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={productionData.generated}
                                        onChange={e => setProductionData(p => ({ ...p, generated: parseInt(e.target.value) || 0 }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-label">Aprovadas</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={productionData.approved}
                                        onChange={e => setProductionData(p => ({ ...p, approved: parseInt(e.target.value) || 0 }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-label">Publicadas</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={productionData.published}
                                        onChange={e => setProductionData(p => ({ ...p, published: parseInt(e.target.value) || 0 }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-label">Não Executadas</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={productionData.notExecuted}
                                        onChange={e => setProductionData(p => ({ ...p, notExecuted: parseInt(e.target.value) || 0 }))}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-label">Comentários do bloco</label>
                                <textarea
                                    className="input-field min-h-[80px]"
                                    placeholder="Observações gerais da produção (onde travou, qualidade, dependências)..."
                                    value={blockNotes.production}
                                    onChange={e => setBlockNotes(p => ({ ...p, production: e.target.value }))}
                                />
                            </div>

                            {/* Production Funnel Visualization */}
                            <div className="card-elevated p-6">
                                <h4 className="text-sm font-bold text-white mb-4">Funil de Produção</h4>
                                <div className="flex items-center justify-between">
                                    {[
                                        { label: 'Geradas', value: productionData.generated, color: 'bg-blue-500' },
                                        { label: 'Aprovadas', value: productionData.approved, color: 'bg-yellow-500' },
                                        { label: 'Publicadas', value: productionData.published, color: 'bg-green-500' },
                                    ].map((stage, idx) => (
                                        <React.Fragment key={stage.label}>
                                            <div className="text-center">
                                                <div className={`w-16 h-16 ${stage.color}/20 rounded-xl flex items-center justify-center mx-auto mb-2`}>
                                                    <span className="text-xl font-bold text-white">{stage.value}</span>
                                                </div>
                                                <p className="text-xs text-gray-400">{stage.label}</p>
                                            </div>
                                            {idx < 2 && <ChevronRight size={20} className="text-gray-600" />}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Execution Analysis */}
                    {currentStep === 3 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="flex items-center gap-3 mb-6">
                                <TrendingUp size={24} className="text-purple-400" />
                                <h3 className="text-xl font-bold text-white">Análise de Execução</h3>
                            </div>

                            {/* Impact Assessment */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-label">Impacto no Tráfego</label>
                                    <select
                                        className="input-field"
                                        value={executionData.trafficImpact}
                                        onChange={e => setExecutionData(p => ({ ...p, trafficImpact: e.target.value }))}
                                    >
                                        <option value="positive">↑ Positivo</option>
                                        <option value="neutral">→ Neutro</option>
                                        <option value="negative">↓ Negativo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-label">Impacto nas Vendas</label>
                                    <select
                                        className="input-field"
                                        value={executionData.salesImpact}
                                        onChange={e => setExecutionData(p => ({ ...p, salesImpact: e.target.value }))}
                                    >
                                        <option value="positive">↑ Positivo</option>
                                        <option value="neutral">→ Neutro</option>
                                        <option value="negative">↓ Negativo</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-label">Comentários do bloco</label>
                                <textarea
                                    className="input-field min-h-[80px]"
                                    placeholder="Observações gerais da execução (o que funcionou, por quê, próximos testes)..."
                                    value={blockNotes.execution}
                                    onChange={e => setBlockNotes(p => ({ ...p, execution: e.target.value }))}
                                />
                            </div>

                            {/* Top Performers */}
                            <div>
                                <label className="text-label flex items-center gap-2">
                                    <TrendingUp size={14} className="text-green-400" />
                                    Ações que Performaram
                                </label>
                                <div className="space-y-2 mt-2">
                                    {executionData.topPerformers.map((item, idx) => (
                                        <input
                                            key={idx}
                                            className="input-field"
                                            placeholder={`Top performer ${idx + 1}`}
                                            value={item}
                                            onChange={e => {
                                                const newArr = [...executionData.topPerformers];
                                                newArr[idx] = e.target.value;
                                                setExecutionData(p => ({ ...p, topPerformers: newArr }));
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Low Performers */}
                            <div>
                                <label className="text-label flex items-center gap-2">
                                    <TrendingDown size={14} className="text-red-400" />
                                    Ações que Não Performaram
                                </label>
                                <div className="space-y-2 mt-2">
                                    {executionData.lowPerformers.map((item, idx) => (
                                        <input
                                            key={idx}
                                            className="input-field"
                                            placeholder={`Low performer ${idx + 1}`}
                                            value={item}
                                            onChange={e => {
                                                const newArr = [...executionData.lowPerformers];
                                                newArr[idx] = e.target.value;
                                                setExecutionData(p => ({ ...p, lowPerformers: newArr }));
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Observations */}
                    {currentStep === 4 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="flex items-center gap-3 mb-6">
                                <FileText size={24} className="text-purple-400" />
                                <h3 className="text-xl font-bold text-white">Observações da Reunião</h3>
                            </div>

                            {/* Observation Categories */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {observations.map(cat => {
                                    const catConfig = OBSERVATION_CATEGORIES.find(c => c.id === cat.categoryId);
                                    return (
                                        <div key={cat.categoryId} className="card-elevated p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                                    <span>{catConfig?.icon}</span>
                                                    {cat.categoryLabel}
                                                </h4>
                                                <button
                                                    onClick={() => addObservation(cat.categoryId)}
                                                    className="btn-ghost !h-6 !px-2 !text-xs"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {cat.items.map(item => (
                                                    <div key={item.id} className="flex items-center gap-2">
                                                        <input
                                                            className="input-field flex-1 !py-1.5"
                                                            placeholder="Digite a observação..."
                                                            value={item.text}
                                                            onChange={e => updateObservation(cat.categoryId, item.id, e.target.value)}
                                                        />
                                                        <button
                                                            onClick={() => removeObservation(cat.categoryId, item.id)}
                                                            className="text-gray-500 hover:text-red-400"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                                {cat.items.length === 0 && (
                                                    <p className="text-xs text-gray-500 italic">Clique em + para adicionar</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Decisions */}
                            <div className="card-elevated p-4">
                                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <Target size={16} className="text-blue-400" />
                                    Decisões Tomadas
                                </h4>
                                <div className="space-y-2">
                                    {decisions.map((dec, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input
                                                className="input-field flex-1"
                                                placeholder="Decisão..."
                                                value={dec}
                                                onChange={e => updateArrayField(setDecisions, idx, e.target.value)}
                                            />
                                            {decisions.length > 1 && (
                                                <button onClick={() => removeArrayItem(setDecisions, idx)} className="text-gray-500 hover:text-red-400">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayItem(setDecisions)} className="btn-ghost !h-7 !text-xs">
                                        <Plus size={12} className="mr-1" /> Adicionar
                                    </button>
                                </div>
                            </div>

                            {/* Learnings Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { key: 'worked', label: 'O que Funcionou', icon: CheckCircle2, color: 'green' },
                                    { key: 'failed', label: 'O que Falhou', icon: AlertTriangle, color: 'red' },
                                    { key: 'changes', label: 'O que Fazer Diferente', icon: ArrowUpRight, color: 'blue' },
                                    { key: 'risks', label: 'Riscos Identificados', icon: AlertTriangle, color: 'yellow' },
                                ].map(({ key, label, icon: Icon, color }) => (
                                    <div key={key} className="card-elevated p-4">
                                        <h4 className={`text-sm font-bold text-white mb-3 flex items-center gap-2`}>
                                            <Icon size={16} className={`text-${color}-400`} />
                                            {label}
                                        </h4>
                                        <div className="space-y-2">
                                            {learnings[key].map((item, idx) => (
                                                <input
                                                    key={idx}
                                                    className="input-field !py-1.5"
                                                    placeholder="..."
                                                    value={item}
                                                    onChange={e => updateLearnings(key, idx, e.target.value)}
                                                />
                                            ))}
                                            <button onClick={() => addLearningItem(key)} className="btn-ghost !h-6 !text-xs">
                                                <Plus size={10} className="mr-1" /> Adicionar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Priorities */}
                            <div className="card-elevated p-4 border-purple-500/30">
                                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <ArrowUpRight size={16} className="text-purple-400" />
                                    Top 3 Prioridades (Próximo Ciclo)
                                </h4>
                                <div className="space-y-2">
                                    {priorities.map((priority, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <span className="w-6 h-6 flex items-center justify-center bg-purple-500/20 text-purple-400 rounded text-xs font-bold">
                                                {idx + 1}
                                            </span>
                                            <input
                                                className="input-field flex-1"
                                                placeholder={`Prioridade ${idx + 1}`}
                                                value={priority}
                                                onChange={e => updateArrayField(setPriorities, idx, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="h-16 border-t border-purple-500/30 bg-[#080808] flex items-center justify-between px-6 shrink-0">
                <div className="text-xs text-gray-500">
                    Passo {currentStep + 1} de {GOVERNANCE_STEPS.length}
                </div>
                <div className="flex items-center gap-3">
                    {currentStep > 0 && (
                        <button onClick={prevStep} className="btn-ghost">
                            Voltar
                        </button>
                    )}
                    {currentStep < GOVERNANCE_STEPS.length - 1 ? (
                        <button onClick={nextStep} className="btn-primary">
                            Próximo <ChevronRight size={14} className="ml-1" />
                        </button>
                    ) : (
                        <button 
                            onClick={handleComplete} 
                            disabled={isProcessing}
                            className="btn-primary !bg-green-600 hover:!bg-green-500"
                        >
                            {isProcessing ? (
                                <>Processando...</>
                            ) : (
                                <>
                                    <Save size={14} className="mr-1" />
                                    Fechar Ciclo e Gerar ATA
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
