import React from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';

function generateAISummary(items, kpis) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const bullets = [];

    // 1. What changed since yesterday
    const completedYesterday = items.filter(item => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return item.status === 'done' && itemDate >= yesterday && itemDate < today;
    });

    if (completedYesterday.length > 0) {
        bullets.push({
            type: 'success',
            icon: CheckCircle2,
            text: `${completedYesterday.length} item(s) concluído(s) ontem`,
            detail: completedYesterday.map(i => i.initiative).slice(0, 2).join(', ')
        });
    } else {
        bullets.push({
            type: 'neutral',
            icon: Clock,
            text: 'Nenhum item concluído ontem',
            detail: 'Verifique se há bloqueios'
        });
    }

    // 2. What's blocked
    const blocked = items.filter(item => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate < today && item.status !== 'done' && item.status !== 'cancelled';
    });

    if (blocked.length > 0) {
        bullets.push({
            type: 'warning',
            icon: AlertTriangle,
            text: `${blocked.length} item(s) atrasado(s) precisam de atenção`,
            detail: blocked[0]?.initiative || 'Verifique o roadmap'
        });
    }

    // 3. What's due today
    const dueToday = items.filter(item => item.date === todayStr && item.status !== 'done' && item.status !== 'cancelled');
    
    if (dueToday.length > 0) {
        const withoutVisual = dueToday.filter(i => !i.visual_output);
        if (withoutVisual.length > 0) {
            bullets.push({
                type: 'action',
                icon: Sparkles,
                text: `${dueToday.length} item(s) para hoje, ${withoutVisual.length} sem arte`,
                detail: 'Gere as artes pendentes'
            });
        } else {
            bullets.push({
                type: 'info',
                icon: CheckCircle2,
                text: `${dueToday.length} item(s) para hoje, todos com arte`,
                detail: 'Pronto para publicação'
            });
        }
    } else {
        bullets.push({
            type: 'neutral',
            icon: Clock,
            text: 'Nenhum item agendado para hoje',
            detail: 'Dia livre ou planejamento pendente'
        });
    }

    // 4. What can be ignored today
    const lowPriority = items.filter(item => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return itemDate > nextWeek && item.status === 'draft';
    });

    if (lowPriority.length > 0) {
        bullets.push({
            type: 'skip',
            icon: XCircle,
            text: `${lowPriority.length} item(s) podem esperar`,
            detail: 'Agendados para depois da próxima semana'
        });
    }

    // 5. KPI Alert (if critical)
    if (kpis) {
        const revenueRatio = kpis.revenue?.value / kpis.revenue?.goal;
        if (revenueRatio < 0.7) {
            bullets.push({
                type: 'warning',
                icon: AlertTriangle,
                text: 'Receita abaixo de 70% da meta',
                detail: `R$ ${(kpis.revenue?.goal - kpis.revenue?.value).toLocaleString()} faltando`
            });
        }
    }

    return bullets.slice(0, 4); // Max 4 bullets as per PRD
}

const typeStyles = {
    success: { bg: 'bg-green-500/10', border: 'border-green-500/20', iconColor: 'text-green-400' },
    warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', iconColor: 'text-yellow-400' },
    action: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', iconColor: 'text-purple-400' },
    info: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', iconColor: 'text-blue-400' },
    neutral: { bg: 'bg-gray-500/10', border: 'border-gray-500/20', iconColor: 'text-gray-400' },
    skip: { bg: 'bg-gray-500/5', border: 'border-gray-500/10', iconColor: 'text-gray-500' },
};

export function DaySummaryAI({ items, kpis, clientName }) {
    const bullets = generateAISummary(items || [], kpis);
    
    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
    });

    return (
        <div className="mb-6 p-5 rounded-xl bg-gradient-to-br from-[#0A0A0A] to-[#080808] border border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                        <Sparkles size={20} className="text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white">Resumo do Dia</h2>
                        <p className="text-[10px] text-gray-500 capitalize">{dateStr}</p>
                    </div>
                </div>
                <div className="text-[10px] text-gray-600 font-mono">
                    {clientName && <span>Cliente: {clientName}</span>}
                </div>
            </div>

            {/* AI Bullets */}
            <div className="space-y-2">
                {bullets.map((bullet, idx) => {
                    const styles = typeStyles[bullet.type] || typeStyles.neutral;
                    const Icon = bullet.icon;
                    
                    return (
                        <div 
                            key={idx}
                            className={`flex items-start gap-3 p-3 rounded-lg ${styles.bg} border ${styles.border} transition-all hover:scale-[1.01]`}
                        >
                            <Icon size={16} className={`${styles.iconColor} mt-0.5 shrink-0`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white font-medium">{bullet.text}</p>
                                {bullet.detail && (
                                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">{bullet.detail}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] text-gray-600 font-mono uppercase tracking-wider">
                    Atualizado automaticamente
                </span>
                <div className="flex items-center gap-1 text-[9px] text-purple-400">
                    <Sparkles size={10} />
                    <span>Gerado por IA</span>
                </div>
            </div>
        </div>
    );
}
