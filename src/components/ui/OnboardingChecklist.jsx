import React, { useMemo } from 'react';
import { 
    Target, ShoppingBag, GitBranch, Users, Calendar, CheckCircle2,
    Circle, ChevronRight, Sparkles
} from 'lucide-react';

/**
 * OnboardingChecklist - ONDA 3.2 PRD
 * Checklist de onboarding para novos usuários
 * Passos: DNA → Vaults → Plano → Delegar → Aprovar → Analisar
 * Barra de progresso 0-100%
 */

const ONBOARDING_STEPS = [
    {
        id: 'dna',
        label: 'Definir DNA da Marca',
        description: 'Configure o Vault 1 com a identidade',
        icon: Target,
        checkFn: (data) => !!(data?.vaults?.S1?.fields?.archetype && data?.vaults?.S1?.fields?.promise),
        navTarget: 'V1'
    },
    {
        id: 'products',
        label: 'Cadastrar Produtos',
        description: 'Adicione ao menos 1 produto no Vault 2',
        icon: ShoppingBag,
        checkFn: (data) => (data?.vaults?.S2?.products?.length || 0) > 0,
        navTarget: 'V2'
    },
    {
        id: 'channels',
        label: 'Configurar Canais',
        description: 'Selecione onde você vai estar presente',
        icon: GitBranch,
        checkFn: (data) => (data?.vaults?.S3?.channels?.length || 0) > 0,
        navTarget: 'V3'
    },
    {
        id: 'team',
        label: 'Definir Time',
        description: 'Configure o aprovador no Vault 4',
        icon: Users,
        checkFn: (data) => !!(data?.vaults?.S4?.matrix?.find(m => m.role === 'Aprovador Final')?.who),
        navTarget: 'V4'
    },
    {
        id: 'plan',
        label: 'Criar Plano',
        description: 'Adicione ações ao roadmap',
        icon: Calendar,
        checkFn: (data) => (data?.dashboard?.D2?.length || 0) > 0,
        navTarget: 'OS'
    },
    {
        id: 'execute',
        label: 'Executar Ação',
        description: 'Mude uma ação para "Em Produção"',
        icon: Sparkles,
        checkFn: (data) => data?.dashboard?.D2?.some(i => i.status === 'in_production' || i.status === 'done'),
        navTarget: 'OS'
    }
];

export function OnboardingChecklist({ 
    appData, 
    onNavigate,
    variant = 'full', // 'full' | 'compact' | 'inline'
    showWhenComplete = false
}) {
    // Calcula progresso
    const { completedSteps, progress, allComplete } = useMemo(() => {
        const completed = ONBOARDING_STEPS.filter(step => step.checkFn(appData));
        const pct = Math.round((completed.length / ONBOARDING_STEPS.length) * 100);
        return {
            completedSteps: completed.map(s => s.id),
            progress: pct,
            allComplete: pct === 100
        };
    }, [appData]);

    // Não renderiza se completo e showWhenComplete é false
    if (allComplete && !showWhenComplete) {
        return null;
    }

    // Próximo passo incompleto
    const nextStep = ONBOARDING_STEPS.find(s => !completedSteps.includes(s.id));

    // Variante inline (só mostra próximo passo)
    if (variant === 'inline' && nextStep) {
        const Icon = nextStep.icon;
        return (
            <button
                onClick={() => onNavigate?.(nextStep.navTarget)}
                className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-colors w-full text-left"
            >
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Icon size={16} className="text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">Próximo Passo</p>
                    <p className="text-sm text-white truncate">{nextStep.label}</p>
                </div>
                <ChevronRight size={16} className="text-purple-400" />
            </button>
        );
    }

    // Variante compact (só barra de progresso)
    if (variant === 'compact') {
        return (
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Setup</span>
                    <span className="text-xs font-mono text-white">{progress}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                {nextStep && (
                    <p className="mt-2 text-[10px] text-gray-500">
                        Próximo: {nextStep.label}
                    </p>
                )}
            </div>
        );
    }

    // Variante full (checklist completo)
    return (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-sm font-bold text-white">Setup do Bravvo Binder</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Configure o sistema para começar</p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-white">{progress}%</span>
                        <p className="text-[10px] text-gray-500">completo</p>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
            
            {/* Steps */}
            <div className="divide-y divide-white/5">
                {ONBOARDING_STEPS.map((step, index) => {
                    const isComplete = completedSteps.includes(step.id);
                    const isCurrent = step.id === nextStep?.id;
                    
                    return (
                        <button
                            key={step.id}
                            onClick={() => onNavigate?.(step.navTarget)}
                            className={`
                                w-full flex items-center gap-4 p-4 text-left transition-colors
                                ${isCurrent ? 'bg-purple-500/10' : 'hover:bg-white/5'}
                            `}
                        >
                            {/* Step Icon visible on hover */}
                            {/* Step Number / Check */}
                            <div className={`
                                w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                                ${isComplete 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : isCurrent
                                        ? 'bg-purple-500/20 text-purple-400'
                                        : 'bg-white/5 text-gray-600'
                                }
                            `}>
                                {isComplete ? (
                                    <CheckCircle2 size={18} />
                                ) : (
                                    <span className="text-xs font-bold">{index + 1}</span>
                                )}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${isComplete ? 'text-gray-400' : 'text-white'}`}>
                                    {step.label}
                                </p>
                                <p className="text-xs text-gray-600 truncate">
                                    {step.description}
                                </p>
                            </div>
                            
                            {/* Icon / Action */}
                            <div className="shrink-0">
                                {isComplete ? (
                                    <CheckCircle2 size={16} className="text-green-500" />
                                ) : isCurrent ? (
                                    <ChevronRight size={16} className="text-purple-400" />
                                ) : (
                                    <Circle size={16} className="text-gray-700" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
            
            {/* Complete State */}
            {allComplete && (
                <div className="p-4 bg-green-500/10 border-t border-green-500/30">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={20} className="text-green-400" />
                        <div>
                            <p className="text-sm font-bold text-green-400">Setup Completo!</p>
                            <p className="text-xs text-green-500/70">O Bravvo Binder está pronto para uso</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OnboardingChecklist;
