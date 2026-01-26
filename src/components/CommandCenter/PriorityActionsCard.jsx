import React from 'react';
import { AlertTriangle, Clock, User, TrendingUp, ChevronRight } from 'lucide-react';

function getPriorityColor(risk) {
    if (risk === 'high') return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500' };
    if (risk === 'medium') return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500' };
    return { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', badge: 'bg-green-500' };
}

function ActionCard({ action, index, onActionClick }) {
    const colors = getPriorityColor(action.risk);
    
    return (
        <div 
            onClick={() => onActionClick?.(action)}
            className={`relative p-4 rounded-xl border ${colors.border} ${colors.bg} hover:scale-[1.02] transition-all cursor-pointer group`}
        >
            {/* Priority Badge */}
            <div className={`absolute -top-2 -left-2 w-6 h-6 ${colors.badge} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                {index + 1}
            </div>

            {/* Content */}
            <div className="pl-2">
                <h4 className="text-sm font-bold text-white mb-2 pr-6 group-hover:text-white/90">
                    {action.name}
                </h4>

                {/* Impact */}
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={12} className="text-blue-400" />
                    <span className="text-[10px] text-gray-400">
                        Impacto: <span className="text-blue-400 font-medium">{action.impact}</span>
                    </span>
                </div>

                {/* Meta Row */}
                <div className="flex items-center gap-4 text-[10px]">
                    {/* Risk */}
                    <div className="flex items-center gap-1">
                        <AlertTriangle size={10} className={colors.text} />
                        <span className={colors.text}>
                            {action.risk === 'high' ? 'Alto Risco' : action.risk === 'medium' ? 'Médio' : 'Baixo'}
                        </span>
                    </div>

                    {/* Dependency */}
                    {action.dependency && (
                        <div className="flex items-center gap-1 text-gray-500">
                            <User size={10} />
                            <span>{action.dependency}</span>
                        </div>
                    )}

                    {/* Due */}
                    {action.due && (
                        <div className="flex items-center gap-1 text-gray-500">
                            <Clock size={10} />
                            <span>{action.due}</span>
                        </div>
                    )}
                </div>

                {/* Status */}
                <div className="mt-3 flex items-center justify-between">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        action.status === 'pending' ? 'bg-gray-500/20 text-gray-400' :
                        action.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-green-500/20 text-green-400'
                    }`}>
                        {action.status === 'pending' ? 'Pendente' : 
                         action.status === 'in_progress' ? 'Em Andamento' : 'Concluído'}
                    </span>
                    <ChevronRight size={14} className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
            </div>
        </div>
    );
}

function ActionPill({ action, index, onActionClick }) {
    const colors = getPriorityColor(action.risk);
    return (
        <button
            type="button"
            onClick={() => onActionClick?.(action)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${colors.border} ${colors.bg} text-left min-w-[220px] hover:scale-[1.01] transition-all`}
        >
            <div className={`w-5 h-5 ${colors.badge} rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                {index + 1}
            </div>
            <div className="min-w-0">
                <div className="text-[11px] font-bold text-white truncate">{action.name}</div>
                <div className="text-[10px] text-gray-500 truncate">{action.impact}</div>
            </div>
        </button>
    );
}

export function PriorityActionsCard({ items, kpis, onActionClick, variant = 'grid' }) {
    // Generate priority actions from items and KPIs
    const generatePriorityActions = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayStr = today.toISOString().split('T')[0];
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const actions = [];

        // 1. Check for overdue/at-risk items
        const overdueItems = items.filter(item => {
            const itemDate = new Date(item.date);
            itemDate.setHours(0, 0, 0, 0);
            return itemDate < today && item.status !== 'done' && item.status !== 'cancelled';
        });

        if (overdueItems.length > 0) {
            actions.push({
                id: 'overdue',
                name: `${overdueItems.length} item(s) atrasado(s) precisam de ação`,
                impact: 'Cronograma',
                risk: 'high',
                dependency: overdueItems[0]?.responsible || 'Time',
                status: 'pending',
                items: overdueItems
            });
        }

        // 2. Check for items due today without visual
        const todayItemsNoVisual = items.filter(item => 
            item.date === todayStr && 
            item.status !== 'done' && 
            !item.visual_output
        );

        if (todayItemsNoVisual.length > 0) {
            actions.push({
                id: 'today_no_visual',
                name: `Gerar arte para ${todayItemsNoVisual.length} item(s) de hoje`,
                impact: 'Entrega do Dia',
                risk: 'high',
                dependency: 'Design',
                due: 'Hoje',
                status: 'pending',
                items: todayItemsNoVisual
            });
        }

        // 3. Check KPI gaps
        if (kpis) {
            const revenueGap = kpis.revenue?.goal - kpis.revenue?.value;
            if (revenueGap > 0 && (revenueGap / kpis.revenue?.goal) > 0.3) {
                actions.push({
                    id: 'revenue_gap',
                    name: 'Receita 30%+ abaixo da meta',
                    impact: `R$ ${revenueGap.toLocaleString()} faltando`,
                    risk: 'high',
                    dependency: 'Comercial',
                    status: 'pending'
                });
            }
        }

        // 4. Items for tomorrow in draft
        const tomorrowDrafts = items.filter(item => 
            item.date === tomorrowStr && 
            item.status === 'draft'
        );

        if (tomorrowDrafts.length > 0) {
            actions.push({
                id: 'tomorrow_drafts',
                name: `Aprovar ${tomorrowDrafts.length} item(s) para amanhã`,
                impact: 'Pipeline',
                risk: 'medium',
                dependency: 'Aprovador',
                due: 'Hoje',
                status: 'pending',
                items: tomorrowDrafts
            });
        }

        // 5. Items without responsible
        const noResponsible = items.filter(item => 
            !item.responsible && 
            item.status !== 'done' && 
            item.status !== 'cancelled'
        ).slice(0, 3);

        if (noResponsible.length > 0) {
            actions.push({
                id: 'no_responsible',
                name: `Atribuir responsável a ${noResponsible.length} item(s)`,
                impact: 'Organização',
                risk: 'low',
                dependency: 'Gestor',
                status: 'pending',
                items: noResponsible
            });
        }

        // Return top 3 by risk priority
        const riskOrder = { high: 0, medium: 1, low: 2 };
        return actions
            .sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk])
            .slice(0, 3);
    };

    const priorityActions = generatePriorityActions();

    if (priorityActions.length === 0) {
        if (variant === 'strip') return null;
        return (
            <div className="bento-grid p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <TrendingUp size={16} className="text-green-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Ações Prioritárias</h3>
                        <p className="text-[10px] text-gray-500">Top 3 tarefas críticas do dia</p>
                    </div>
                </div>
                <div className="flex items-center justify-center py-8 text-gray-500 text-sm">
                    ✅ Tudo em dia! Nenhuma ação crítica pendente.
                </div>
            </div>
        );
    }

    if (variant === 'strip') {
        return (
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <AlertTriangle size={14} className="text-orange-500" />
                        </div>
                        <div>
                            <h3 className="text-[11px] font-bold text-white">Ações Prioritárias</h3>
                            <p className="text-[10px] text-gray-600">Top 3 críticas do dia</p>
                        </div>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">
                        {priorityActions.filter(a => a.risk === 'high').length} críticas
                    </span>
                </div>
                <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                    {priorityActions.map((action, index) => (
                        <ActionPill
                            key={action.id}
                            action={action}
                            index={index}
                            onActionClick={onActionClick}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bento-grid p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <AlertTriangle size={16} className="text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Ações Prioritárias</h3>
                        <p className="text-[10px] text-gray-500">Top 3 tarefas críticas do dia</p>
                    </div>
                </div>
                <span className="text-[10px] font-mono text-gray-500">
                    {priorityActions.filter(a => a.risk === 'high').length} críticas
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {priorityActions.map((action, index) => (
                    <ActionCard 
                        key={action.id} 
                        action={action} 
                        index={index}
                        onActionClick={onActionClick}
                    />
                ))}
            </div>
        </div>
    );
}
