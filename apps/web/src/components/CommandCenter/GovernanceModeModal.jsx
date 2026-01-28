import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    X, CheckCircle2, AlertTriangle, Target,
    ArrowUpRight, BarChart3, Calendar, FileText, Zap,
    TrendingUp, TrendingDown, ChevronRight,
    Plus, Trash2, Save,
    Timer,
    Pause,
    Play,
    RotateCcw,
    Bot,
    Loader2,
    Sparkles,
    Brain
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import {
    generateATA,
    recalibrateSystem,
    generateNextGovernanceWindow,
    OBSERVATION_CATEGORIES,
    ROADMAP_STATUS,
    formatATAForDisplay
} from '../../services/governanceService';
import { aiService } from '../../services/aiService';

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
    lastGovernance = null
}) {
    const { addToast } = useToast();
    const [currentStep, setCurrentStep] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [generatedATA, setGeneratedATA] = useState(null);

    // AI Generation State
    const [isAIGenerating, setIsAIGenerating] = useState(false);
    const [aiGeneratedPlan, setAiGeneratedPlan] = useState(null);
    const [aiError, setAiError] = useState(null);

    const [meetingStartedAt, setMeetingStartedAt] = useState(null);
    const [meetingElapsedSeconds, setMeetingElapsedSeconds] = useState(0);
    const [meetingTimerRunning, setMeetingTimerRunning] = useState(true);

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

    const initialGoalsRef = useRef(null);
    const [goalDraft, setGoalDraft] = useState({});
    const [goalChangedAt, setGoalChangedAt] = useState({});

    const [kpiNotes, setKpiNotes] = useState({
        revenue: '',
        traffic: '',
        sales: ''
    });
    const [openKpiNoteId, setOpenKpiNoteId] = useState(null);

    useEffect(() => {
        if (!open) return;
        setMeetingStartedAt(new Date().toISOString());
        setMeetingElapsedSeconds(0);
        setMeetingTimerRunning(true);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        if (!meetingTimerRunning) return;
        const id = setInterval(() => {
            setMeetingElapsedSeconds(s => s + 1);
        }, 1000);
        return () => clearInterval(id);
    }, [open, meetingTimerRunning]);

    useEffect(() => {
        if (!open) return;

        const baseline = {
            revenue: kpis?.revenue?.goal || 0,
            traffic: kpis?.traffic?.goal || 0,
            sales: kpis?.sales?.goal || 0,
        };

        if (!initialGoalsRef.current) {
            initialGoalsRef.current = baseline;
        }

        setGoalDraft(prev => {
            if (prev && Object.keys(prev).length > 0) return prev;
            return baseline;
        });
    }, [open, kpis?.revenue?.goal, kpis?.traffic?.goal, kpis?.sales?.goal]);

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

    // AI Conclusion State
    const [aiConclusion, setAiConclusion] = useState(null);
    const [isGeneratingConclusion, setIsGeneratingConclusion] = useState(false);

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

    // AI Application Helpers
    const applyAiTaskToPriority = (taskTitle) => {
        setPriorities(prev => {
            const emptyIdx = prev.findIndex(p => !p.trim());
            if (emptyIdx !== -1) {
                const newP = [...prev];
                newP[emptyIdx] = taskTitle;
                return newP;
            }
            return [...prev, taskTitle];
        });
        addToast({ title: 'Adicionado à Prioridade', description: 'Item incluído na lista de prioridades.', type: 'success', duration: 2000 });
    };

    const applyAiGoal = (type, value) => {
        // Simple heuristic to clean string values "R$ 10.000" -> 10000
        const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, ''));

        if (!isNaN(numericValue)) {
            setGoalDraft(prev => ({ ...prev, [type]: numericValue }));
            setGoalChangedAt(prev => ({ ...prev, [type]: new Date().toISOString() }));

            const label = type === 'revenue' ? 'Receita' : type === 'traffic' ? 'Tráfego' : 'Vendas';
            addToast({ title: 'Meta Atualizada', description: `Nova meta de ${label} aplicada.`, type: 'success', duration: 2000 });
        }
    };

    const applyAiRecToDecisions = (text) => {
        updateArrayField(setDecisions, decisions.length, text);
        addToast({ title: 'Decisão Adicionada', description: 'Recomendação incluída nas decisões.', type: 'success', duration: 2000 });
    };

    // Handle AI Plan Generation
    const handleGenerateWithAI = async () => {
        if (!aiService.isAIConfigured()) {
            setAiError('API de IA não configurada. Vá em Configurações → IA para configurar sua API Key.');
            return;
        }

        setIsAIGenerating(true);
        setAiError(null);

        try {
            const result = await aiService.generatePlanWithAI(vaults, lastGovernance);
            setAiGeneratedPlan(result);

            // Auto-fill priorities from AI recommendation if list is empty
            //Removed generic auto-fill to prioritize manual selection via applyAiTaskToPriority
            // but we can offer a "Apply All" if needed. For now, selective is better.
        } catch (err) {
            console.error('AI Generation Error:', err);
            setAiError(err.message || 'Erro ao gerar plano com IA.');
        } finally {
            setIsAIGenerating(false);
        }
    };


    // Complete Governance
    const aiConclusionPrompt = async () => {
        const config = aiService.getAIConfig();
        if (!config || !config.apiKey) {
            addToast({ title: 'Configure a API Key primeiro', description: 'Vá em Ferramentas > IA', type: 'error' });
            return;
        }
        setIsGeneratingConclusion(true);
        try {
            // Build ATA snapshot from current form state
            const ataSnapshot = {
                score: roadmapStats.done / roadmapStats.total * 100 || 0, // Simplified score calculation
                kpis: {
                    revenue: kpis?.revenue || {},
                    traffic: kpis?.traffic || {},
                    sales: kpis?.sales || {}
                },
                decisions: decisions.filter(d => d.trim().length > 0)
            };
            const result = await aiService.generateGovernanceConclusion(ataSnapshot);
            if (result) {
                setAiConclusion(result);
                addToast({ title: 'Conclusão Gerada', type: 'success' });
            }
        } catch (error) {
            console.error(error);
            addToast({ title: 'Erro na IA', description: error.message, type: 'error' });
        } finally {
            setIsGeneratingConclusion(false);
        }
    };

    const handleComplete = () => {
        if (isProcessing) return;
        setIsProcessing(true);

        // Collect observations from all categories
        const allObservations = observations.flatMap(cat =>
            cat.items.filter(item => item.text.trim()).map(item => ({
                category: cat.categoryId,
                text: item.text
            }))
        );

        const goalChanges = ['revenue', 'traffic', 'sales']
            .map((id) => {
                const fromGoal = Number(initialGoalsRef.current?.[id] ?? 0);
                const toGoal = Number(goalDraft?.[id] ?? fromGoal);
                if (Number.isNaN(toGoal) || toGoal === fromGoal) return null;
                return {
                    id,
                    fromGoal,
                    toGoal,
                    changedAt: goalChangedAt?.[id] || new Date().toISOString(),
                };
            })
            .filter(Boolean);

        const kpiSnapshotWithGoals = {
            revenue: { ...(kpis?.revenue || {}), goal: Number(goalDraft?.revenue ?? kpis?.revenue?.goal ?? 0) },
            traffic: { ...(kpis?.traffic || {}), goal: Number(goalDraft?.traffic ?? kpis?.traffic?.goal ?? 0) },
            sales: { ...(kpis?.sales || {}), goal: Number(goalDraft?.sales ?? kpis?.sales?.goal ?? 0) },
        };

        // Build governance data
        const governanceData = {
            period: `${periodData.startDate} - ${periodData.endDate}`,
            periodStartDate: periodData.startDate,
            periodEndDate: periodData.endDate,
            closedAt: new Date().toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            responsible: currentUser?.name || currentUser?.role || 'Operador',
            type: governanceFrequency,
            kpiSnapshot: kpiSnapshotWithGoals,
            goalChanges,
            meetingTimer: {
                startedAt: meetingStartedAt,
                durationSeconds: meetingElapsedSeconds,
                paused: !meetingTimerRunning
            },
            kpiNotes,
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
                goalChanges,
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
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${currentStep === idx
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

                <div className="hidden lg:flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/30 border border-white/10">
                        <Timer size={14} className="text-purple-300" />
                        <span className="text-[11px] font-mono text-gray-200">
                            {String(Math.floor(meetingElapsedSeconds / 60)).padStart(2, '0')}:{String(meetingElapsedSeconds % 60).padStart(2, '0')}
                        </span>
                        <button
                            type="button"
                            onClick={() => setMeetingTimerRunning(v => !v)}
                            className="p-1 rounded hover:bg-white/10 text-gray-300"
                            title={meetingTimerRunning ? 'Pausar' : 'Continuar'}
                        >
                            {meetingTimerRunning ? <Pause size={12} /> : <Play size={12} />}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMeetingElapsedSeconds(0);
                                setMeetingTimerRunning(true);
                            }}
                            className="p-1 rounded hover:bg-white/10 text-gray-400"
                            title="Reset"
                        >
                            <RotateCcw size={12} />
                        </button>
                    </div>
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
                                        const goalValue = Number(goalDraft?.[key] ?? kpi.goal ?? 0);
                                        const achievement = goalValue > 0 ? (kpi.value / goalValue * 100).toFixed(0) : 0;
                                        const isAbove = achievement >= 100;
                                        return (
                                            <div key={key} className={`card-elevated p-4 ${isAbove ? 'border-green-500/30' : 'border-red-500/30'}`}>
                                                <p className="text-label mb-2">{key === 'revenue' ? 'Receita' : key === 'traffic' ? 'Tráfego' : 'Vendas'}</p>
                                                <p className="text-metric">{key === 'revenue' || key === 'traffic' ? `R$ ${kpi.value?.toLocaleString()}` : kpi.value}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-caption">Meta:</span>
                                                        <input
                                                            type="number"
                                                            className="bg-black/30 border border-white/10 rounded px-2 py-1 w-[110px] text-[11px] font-mono text-gray-200 focus:outline-none focus:border-purple-500/50"
                                                            data-testid={`gov-goal-${key}`}
                                                            value={goalValue}
                                                            onChange={e => {
                                                                const next = parseFloat(e.target.value);
                                                                setGoalDraft(prev => ({ ...prev, [key]: Number.isFinite(next) ? next : 0 }));
                                                                setGoalChangedAt(prev => ({ ...prev, [key]: new Date().toISOString() }));
                                                            }}
                                                        />
                                                    </div>
                                                    <span className={`text-xs font-bold ${isAbove ? 'text-green-400' : 'text-red-400'}`}>{achievement}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-white mb-3">Comentários por KPI</h4>
                                <div className="space-y-2">
                                    {[
                                        { id: 'revenue', label: 'Receita' },
                                        { id: 'traffic', label: 'Tráfego' },
                                        { id: 'sales', label: 'Vendas' }
                                    ].map(k => (
                                        <div key={k.id} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => setOpenKpiNoteId(prev => (prev === k.id ? null : k.id))}
                                                className="w-full px-3 py-2 flex items-center justify-between text-left"
                                            >
                                                <span className="text-[11px] font-bold text-gray-200 uppercase tracking-wider">{k.label}</span>
                                                <span className="text-[10px] text-gray-500 truncate max-w-[240px]">
                                                    {kpiNotes?.[k.id] ? kpiNotes[k.id] : 'Adicionar comentário'}
                                                </span>
                                            </button>
                                            {openKpiNoteId === k.id && (
                                                <div className="px-3 pb-3">
                                                    <textarea
                                                        className="input-field min-h-[70px]"
                                                        placeholder="Observação do KPI (contexto/decisão)..."
                                                        value={kpiNotes?.[k.id] || ''}
                                                        onChange={e => setKpiNotes(prev => ({ ...prev, [k.id]: e.target.value }))}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
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

                            {/* AI Generation Button */}
                            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                            <Bot size={20} className="text-purple-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">Geração Inteligente</h4>
                                            <p className="text-[10px] text-gray-400">Gere um plano tático e KPIs com IA baseado nos seus Vaults</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleGenerateWithAI}
                                        disabled={isAIGenerating}
                                        className="btn-primary !bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-500 hover:!to-blue-500 flex items-center gap-2"
                                    >
                                        {isAIGenerating ? (
                                            <><Loader2 size={14} className="animate-spin" /> Gerando...</>
                                        ) : (
                                            <><Sparkles size={14} /> Gerar com IA</>
                                        )}
                                    </button>
                                </div>

                                {aiError && (
                                    <div className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                                        {aiError}
                                    </div>
                                )}

                                {aiGeneratedPlan && (
                                    <div className="mt-4 space-y-3">
                                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                            <div className="flex items-center gap-2 text-green-400 text-xs font-bold mb-2">
                                                <CheckCircle2 size={14} /> Plano Gerado com Sucesso
                                            </div>
                                            <p className="text-[11px] text-gray-300">{aiGeneratedPlan.recommendation}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                                <h5 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Tarefas Sugeridas ({aiGeneratedPlan.tasks?.length || 0})</h5>
                                                <ul className="space-y-2">
                                                    {aiGeneratedPlan.tasks?.slice(0, 5).map((task, i) => (
                                                        <li key={i} className="flex items-start justify-between gap-2 group/item">
                                                            <div className="text-[11px] text-gray-300 flex items-start gap-1">
                                                                <span className="text-purple-400 mt-0.5">•</span>
                                                                <span>{task.title}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => applyAiTaskToPriority(task.title)}
                                                                className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded text-purple-400"
                                                                title="Adicionar às Prioridades"
                                                            >
                                                                <Plus size={12} />
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                                <h5 className="text-[10px] font-bold text-gray-400 uppercase mb-2">KPIs Recomendados ({aiGeneratedPlan.kpis?.length || 0})</h5>
                                                <ul className="space-y-2">
                                                    {aiGeneratedPlan.kpis?.map((kpi, i) => {
                                                        // Heuristic mapping
                                                        let type = null;
                                                        const name = kpi.name.toLowerCase();
                                                        if (name.includes('receita') || name.includes('faturamento')) type = 'revenue';
                                                        else if (name.includes('tráfego') || name.includes('visita')) type = 'traffic';
                                                        else if (name.includes('vendas') || name.includes('conversão')) type = 'sales';

                                                        return (
                                                            <li key={i} className="flex items-start justify-between gap-2 group/item">
                                                                <div className="text-[11px] text-gray-300 flex items-start gap-1">
                                                                    <span className="text-blue-400 mt-0.5">•</span>
                                                                    <span>{kpi.name}: {kpi.target}</span>
                                                                </div>
                                                                {type && (
                                                                    <button
                                                                        onClick={() => applyAiGoal(type, kpi.target)}
                                                                        className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded text-blue-400"
                                                                        title={`Aplicar meta de ${type === 'revenue' ? 'Receita' : type === 'traffic' ? 'Tráfego' : 'Vendas'}`}
                                                                    >
                                                                        <Target size={12} />
                                                                    </button>
                                                                )}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <button
                                                onClick={() => applyAiRecToDecisions(aiGeneratedPlan.recommendation)}
                                                className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
                                            >
                                                <Plus size={10} /> Adicionar recomendação às decisões
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

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
                                    <div key={item.id || idx} className="card-elevated p-4 group hover:shadow-lg hover:shadow-black/30 transition-shadow">
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
                                        <div className="mt-3">
                                            <div className="text-[10px] text-gray-500 group-hover:hidden">
                                                {item.observation ? `Comentário: ${item.observation}` : 'Sem comentário'}
                                            </div>
                                            <input
                                                placeholder="Comentário (passar o mouse para editar)"
                                                value={item.observation}
                                                onChange={e => {
                                                    const newReview = [...roadmapReview];
                                                    newReview[idx].observation = e.target.value;
                                                    setRoadmapReview(newReview);
                                                }}
                                                className="input-field text-sm hidden group-hover:block"
                                            />
                                        </div>
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
                                                data-testid={`gov-priority-${idx}`}
                                                value={priority}
                                                onChange={e => updateArrayField(setPriorities, idx, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* AI CONCLUSION SECTION */}
                            <div className="card-elevated p-4 border-purple-500/30 bg-purple-500/5 mt-6">
                                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <Brain size={16} className="text-purple-400" />
                                    Conclusão Executiva (IA)
                                </h4>

                                {!aiConclusion ? (
                                    <div className="text-center py-6">
                                        <p className="text-sm text-gray-400 mb-4">
                                            Use a IA para analisar todos os dados desta reunião e gerar um veredito final.
                                        </p>
                                        <button
                                            onClick={aiConclusionPrompt}
                                            disabled={isGeneratingConclusion}
                                            className="btn-secondary mx-auto"
                                        >
                                            {isGeneratingConclusion ? (
                                                <Loader2 size={16} className="animate-spin mr-2" />
                                            ) : (
                                                <Sparkles size={16} className="text-yellow-400 mr-2" />
                                            )}
                                            {isGeneratingConclusion ? 'Analisando...' : 'Gerar Conclusão com IA'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-fadeIn">
                                        <div className="bg-black/30 p-3 rounded border border-white/5">
                                            <p className="text-sm text-gray-300 italic">"{aiConclusion.conclusion_summary}"</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                                                Próximos Passos Sugeridos
                                            </label>
                                            <ul className="space-y-1">
                                                {aiConclusion.next_steps.map((step, idx) => (
                                                    <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                                                        <span className="text-purple-500">•</span> {step}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => setAiConclusion(null)}
                                                className="text-xs text-red-400 hover:text-red-300"
                                            >
                                                Descartar e Tentar Novamente
                                            </button>
                                        </div>
                                    </div>
                                )}
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
                        <button onClick={nextStep} className="btn-primary" data-testid="governance-next">
                            Próximo <ChevronRight size={14} className="ml-1" />
                        </button>
                    ) : (
                        <button
                            onClick={handleComplete}
                            disabled={isProcessing}
                            data-testid="governance-complete"
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
