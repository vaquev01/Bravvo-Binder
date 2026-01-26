import React, { useMemo } from 'react';
import { 
    AlertTriangle, Clock, Calendar, TrendingUp, 
    ImageOff, CheckCircle2, ArrowRight
} from 'lucide-react';

/**
 * InsightCards - ONDA 4.1 PRD
 * Cards de sugestão que ajudam na tomada de decisão
 * Sem automação - apenas leitura e orientação
 */

// Tipos de insight com configuração visual
const INSIGHT_TYPES = {
    delayed: {
        icon: AlertTriangle,
        color: 'red',
        priority: 1
    },
    bottleneck: {
        icon: Clock,
        color: 'orange',
        priority: 2
    },
    missing_art: {
        icon: ImageOff,
        color: 'yellow',
        priority: 3
    },
    opportunity: {
        icon: TrendingUp,
        color: 'green',
        priority: 4
    },
    reminder: {
        icon: Calendar,
        color: 'blue',
        priority: 5
    }
};

// Gera insights baseado nos dados
function generateInsights(items = [], _vaults = {}) {
    const insights = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // 1. Itens atrasados
    const delayedItems = items.filter(item => {
        if (!item.date || item.status === 'done' || item.status === 'cancelled') return false;
        const itemDate = new Date(item.date + 'T23:59:59');
        return itemDate < today && item.status !== 'scheduled';
    });
    
    if (delayedItems.length > 0) {
        const affectsTomorrow = delayedItems.length > 0; // Simplificado
        
        insights.push({
            type: 'delayed',
            title: `${delayedItems.length} ação${delayedItems.length > 1 ? 'ões' : ''} atrasada${delayedItems.length > 1 ? 's' : ''}`,
            description: affectsTomorrow 
                ? 'Isso pode impactar as entregas de amanhã' 
                : 'Revise as prioridades para retomar o cronograma',
            items: delayedItems,
            actionLabel: 'Ver atrasados'
        });
    }
    
    // 2. Gargalo em produção (muitos itens "in_production")
    const inProductionItems = items.filter(i => i.status === 'in_production');
    if (inProductionItems.length >= 3) {
        insights.push({
            type: 'bottleneck',
            title: 'Possível gargalo em produção',
            description: `${inProductionItems.length} itens em produção simultaneamente`,
            items: inProductionItems,
            actionLabel: 'Ver produção'
        });
    }
    
    // 3. Itens sem arte há mais de 3 dias
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const missingArtItems = items.filter(item => {
        if (item.status === 'done' || item.status === 'cancelled') return false;
        if (item.visual_output && item.visual_output !== 'Pending') return false;
        const itemDate = new Date(item.date + 'T12:00:00');
        return itemDate <= threeDaysAgo;
    });
    
    if (missingArtItems.length > 0) {
        insights.push({
            type: 'missing_art',
            title: `${missingArtItems.length} campanha${missingArtItems.length > 1 ? 's' : ''} sem arte`,
            description: 'Há mais de 3 dias aguardando criativo',
            items: missingArtItems,
            actionLabel: 'Gerar arte'
        });
    }
    
    // 4. Oportunidade: muitos drafts prontos
    const draftItems = items.filter(i => i.status === 'draft');
    if (draftItems.length >= 5) {
        insights.push({
            type: 'opportunity',
            title: 'Plano pronto para execução',
            description: `${draftItems.length} rascunhos aguardando produção`,
            items: draftItems,
            actionLabel: 'Iniciar produção'
        });
    }
    
    // 5. Reminder: itens de amanhã
    const tomorrowItems = items.filter(item => {
        const itemDate = new Date(item.date + 'T12:00:00');
        return itemDate.toDateString() === tomorrow.toDateString() && 
               item.status !== 'done' && item.status !== 'cancelled';
    });
    
    if (tomorrowItems.length > 0) {
        insights.push({
            type: 'reminder',
            title: `${tomorrowItems.length} entrega${tomorrowItems.length > 1 ? 's' : ''} amanhã`,
            description: 'Verifique se está tudo pronto',
            items: tomorrowItems,
            actionLabel: 'Ver entregas'
        });
    }
    
    // Ordenar por prioridade
    return insights.sort((a, b) => 
        INSIGHT_TYPES[a.type].priority - INSIGHT_TYPES[b.type].priority
    );
}

// Componente de card individual
function InsightCard({ insight, onAction, compact = false }) {
    const config = INSIGHT_TYPES[insight.type];
    const Icon = config.icon;
    
    const colorClasses = {
        red: 'bg-red-500/10 border-red-500/30 text-red-400',
        orange: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
        yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
        green: 'bg-green-500/10 border-green-500/30 text-green-400',
        blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400'
    };
    
    const iconColorClasses = {
        red: 'text-red-400',
        orange: 'text-orange-400',
        yellow: 'text-yellow-400',
        green: 'text-green-400',
        blue: 'text-blue-400'
    };

    if (compact) {
        return (
            <button
                onClick={() => onAction?.(insight)}
                className={`
                    flex items-center gap-3 p-3 rounded-lg border transition-all
                    hover:scale-[1.02] cursor-pointer
                    ${colorClasses[config.color]}
                `}
            >
                <Icon size={16} className={iconColorClasses[config.color]} />
                <span className="text-sm font-medium text-white flex-1 text-left">
                    {insight.title}
                </span>
                <ArrowRight size={14} className="opacity-50" />
            </button>
        );
    }

    return (
        <div className={`
            p-4 rounded-xl border transition-all
            ${colorClasses[config.color]}
        `}>
            <div className="flex items-start gap-3">
                <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                    bg-black/20
                `}>
                    <Icon size={20} className={iconColorClasses[config.color]} />
                </div>
                
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white mb-1">
                        {insight.title}
                    </h4>
                    <p className="text-xs text-gray-400 mb-3">
                        {insight.description}
                    </p>
                    
                    {onAction && (
                        <button
                            onClick={() => onAction(insight)}
                            className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
                        >
                            {insight.actionLabel}
                            <ArrowRight size={12} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Container de insights
export function InsightCards({ 
    items = [], 
    vaults = {},
    onInsightAction,
    maxItems = 3,
    variant = 'default', // 'default' | 'compact' | 'inline'
    showEmpty = false
}) {
    const insights = useMemo(() => 
        generateInsights(items, vaults).slice(0, maxItems),
        [items, vaults, maxItems]
    );

    if (insights.length === 0) {
        if (!showEmpty) return null;
        
        return (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
                <CheckCircle2 size={20} className="text-green-400" />
                <div>
                    <p className="text-sm font-medium text-white">Tudo em dia!</p>
                    <p className="text-xs text-green-400/70">Nenhum alerta ou sugestão no momento</p>
                </div>
            </div>
        );
    }

    if (variant === 'inline') {
        return (
            <div className="flex flex-wrap gap-2">
                {insights.map((insight, idx) => (
                    <InsightCard 
                        key={idx} 
                        insight={insight} 
                        onAction={onInsightAction}
                        compact
                    />
                ))}
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className="space-y-2">
                {insights.map((insight, idx) => (
                    <InsightCard 
                        key={idx} 
                        insight={insight} 
                        onAction={onInsightAction}
                        compact
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, idx) => (
                <InsightCard 
                    key={idx} 
                    insight={insight} 
                    onAction={onInsightAction}
                />
            ))}
        </div>
    );
}

export { generateInsights };
export default InsightCards;
