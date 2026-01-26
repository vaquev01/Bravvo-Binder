import React from 'react';
import { Calendar, AlertTriangle, Clock, CheckCircle2, Zap, ArrowRight } from 'lucide-react';

/**
 * DaySummary - ONDA 1.1 PRD
 * Resumo visual do dia com hierarquia clara
 * Objetivo: operador entende o dia em < 5 segundos
 */

// Status config com cores e ícones (ONDA 1.2)
export const STATUS_CONFIG = {
    draft: { 
        color: 'bg-gray-500', 
        textColor: 'text-gray-400',
        borderColor: 'border-gray-500/30',
        label: 'Rascunho',
        icon: Clock
    },
    in_production: { 
        color: 'bg-blue-500', 
        textColor: 'text-blue-400',
        borderColor: 'border-blue-500/30',
        label: 'Em Produção',
        icon: Zap
    },
    scheduled: { 
        color: 'bg-green-500', 
        textColor: 'text-green-400',
        borderColor: 'border-green-500/30',
        label: 'Agendado',
        icon: CheckCircle2
    },
    done: { 
        color: 'bg-emerald-500', 
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/30',
        label: 'Concluído',
        icon: CheckCircle2
    },
    cancelled: { 
        color: 'bg-red-500', 
        textColor: 'text-red-400',
        borderColor: 'border-red-500/30',
        label: 'Cancelado',
        icon: AlertTriangle
    },
    delayed: { 
        color: 'bg-red-500', 
        textColor: 'text-red-400',
        borderColor: 'border-red-500/30',
        label: 'Atrasado',
        icon: AlertTriangle
    }
};

// Formata data para formato humano (ONDA 1.3)
export function formatHumanDate(dateStr, locale = 'pt-BR') {
    if (!dateStr) return '';
    
    const date = new Date(dateStr + 'T12:00:00');
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check special dates
    if (date.toDateString() === today.toDateString()) {
        return 'Hoje';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
        return 'Amanhã';
    }
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Ontem';
    }
    
    // Format: "Seg, 26 Jan"
    const weekday = date.toLocaleDateString(locale, { weekday: 'short' });
    const day = date.getDate();
    const month = date.toLocaleDateString(locale, { month: 'short' });
    
    return `${weekday}, ${day} ${month}`;
}

// Verifica se item está atrasado
function isDelayed(item) {
    if (!item.date || item.status === 'done' || item.status === 'cancelled') return false;
    const itemDate = new Date(item.date + 'T23:59:59');
    const now = new Date();
    return itemDate < now && item.status !== 'scheduled';
}

// Componente StatusBadge (ONDA 1.2)
export function StatusBadge({ status, size = 'sm' }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
    const Icon = config.icon;
    
    const sizeClasses = {
        xs: 'text-[9px] px-1.5 py-0.5 gap-1',
        sm: 'text-[10px] px-2 py-1 gap-1.5',
        md: 'text-xs px-3 py-1.5 gap-2'
    };
    
    return (
        <span className={`
            inline-flex items-center font-bold uppercase tracking-wider rounded-full
            ${config.textColor} ${config.borderColor} border bg-black/30
            ${sizeClasses[size]}
        `}>
            <Icon size={size === 'xs' ? 10 : size === 'sm' ? 12 : 14} />
            {config.label}
        </span>
    );
}

export function DaySummary({ items = [], clientName, onPriorityClick }) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Calcular métricas do dia
    const todayItems = items.filter(i => i.date === todayStr);
    const delayedItems = items.filter(isDelayed);
    const draftItems = items.filter(i => i.status === 'draft');
    const inProductionItems = items.filter(i => i.status === 'in_production');
    
    // Ação prioritária: primeiro atrasado, ou primeiro de hoje, ou próximo
    const priorityItem = delayedItems[0] || todayItems[0] || items[0];
    
    // Próxima entrega agendada
    const nextScheduled = items.find(i => 
        i.status === 'scheduled' && 
        new Date(i.date + 'T12:00:00') >= today
    );
    
    // Formatar data atual
    const currentDate = today.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
    });
    
    return (
        <div className="mb-6 space-y-4">
            {/* Header com Data em Destaque */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar size={16} className="text-gray-500" />
                        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                            Resumo do Dia
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white capitalize">
                        {currentDate}
                    </h2>
                    {clientName && (
                        <p className="text-sm text-gray-500 mt-0.5">{clientName}</p>
                    )}
                </div>
                
                {/* Quick Stats */}
                <div className="flex items-center gap-3">
                    {delayedItems.length > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <AlertTriangle size={14} className="text-red-400" />
                            <span className="text-xs font-bold text-red-400">{delayedItems.length} atrasado{delayedItems.length > 1 ? 's' : ''}</span>
                        </div>
                    )}
                    {inProductionItems.length > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <Zap size={14} className="text-blue-400" />
                            <span className="text-xs font-bold text-blue-400">{inProductionItems.length} em produção</span>
                        </div>
                    )}
                    {draftItems.length > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-500/10 border border-gray-500/30 rounded-lg">
                            <Clock size={14} className="text-gray-400" />
                            <span className="text-xs font-bold text-gray-400">{draftItems.length} rascunho{draftItems.length > 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Cards de Destaque */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ação Prioritária */}
                {priorityItem && (
                    <div 
                        onClick={() => onPriorityClick?.(priorityItem)}
                        className={`
                            p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01]
                            ${isDelayed(priorityItem) 
                                ? 'bg-gradient-to-br from-red-500/10 to-red-900/5 border-red-500/30 hover:border-red-500/50' 
                                : 'bg-gradient-to-br from-blue-500/10 to-blue-900/5 border-blue-500/30 hover:border-blue-500/50'}
                        `}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Zap size={14} className={isDelayed(priorityItem) ? 'text-red-400' : 'text-blue-400'} />
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isDelayed(priorityItem) ? 'text-red-400' : 'text-blue-400'}`}>
                                    {isDelayed(priorityItem) ? '⚠️ Ação Urgente' : '🎯 Ação Prioritária'}
                                </span>
                            </div>
                            <StatusBadge status={isDelayed(priorityItem) ? 'delayed' : priorityItem.status} size="xs" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                            {priorityItem.initiative}
                        </h3>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                                {formatHumanDate(priorityItem.date)} • {priorityItem.channel}
                            </span>
                            <ArrowRight size={14} className="text-gray-500" />
                        </div>
                    </div>
                )}
                
                {/* Próxima Entrega */}
                {nextScheduled && nextScheduled.id !== priorityItem?.id && (
                    <div 
                        onClick={() => onPriorityClick?.(nextScheduled)}
                        className="p-4 rounded-xl border bg-gradient-to-br from-green-500/10 to-green-900/5 border-green-500/30 hover:border-green-500/50 cursor-pointer transition-all hover:scale-[1.01]"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-green-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-green-400">
                                    📅 Próxima Entrega
                                </span>
                            </div>
                            <StatusBadge status="scheduled" size="xs" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                            {nextScheduled.initiative}
                        </h3>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                                {formatHumanDate(nextScheduled.date)} • {nextScheduled.channel}
                            </span>
                            <ArrowRight size={14} className="text-gray-500" />
                        </div>
                    </div>
                )}
                
                {/* Empty State se não houver próxima entrega diferente */}
                {(!nextScheduled || nextScheduled.id === priorityItem?.id) && priorityItem && (
                    <div className="p-4 rounded-xl border border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center text-center">
                        <Calendar size={24} className="text-gray-600 mb-2" />
                        <p className="text-sm text-gray-500">Nenhuma entrega agendada</p>
                        <p className="text-xs text-gray-600 mt-1">Crie uma nova ação com status "Agendado"</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DaySummary;
