import React from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2, Shield } from 'lucide-react';

function getNextMeetingDate(frequency) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    switch (frequency) {
        case 'daily': {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow;
        }
        case 'weekly': {
            const daysUntilMonday = (8 - dayOfWeek) % 7 || 7;
            const nextMonday = new Date(today);
            nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
            return nextMonday;
        }
        case 'monthly': {
            const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            return nextMonth;
        }
        default:
            return null;
    }
}

function formatDate(date) {
    if (!date) return 'Não definida';
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
}

function getGovernanceStatus(lastGovernance, frequency) {
    if (!lastGovernance) return { status: 'overdue', label: 'Nunca realizada', color: 'text-red-400', bgColor: 'bg-red-500/10' };
    
    const lastDate = new Date(lastGovernance);
    const today = new Date();
    const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    const thresholds = {
        daily: 1,
        weekly: 7,
        monthly: 30
    };
    
    const threshold = thresholds[frequency] || 7;
    
    if (daysDiff <= threshold) {
        return { status: 'ok', label: 'Em dia', color: 'text-green-400', bgColor: 'bg-green-500/10' };
    } else if (daysDiff <= threshold * 1.5) {
        return { status: 'warning', label: 'Pendente', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' };
    }
    return { status: 'overdue', label: 'Atrasada', color: 'text-red-400', bgColor: 'bg-red-500/10' };
}

export function GovernanceHeader({ 
    frequency = 'weekly', 
    lastGovernance,
    isGovernanceActive,
    onToggleGovernance,
    onChangeFrequency,
    nextWindow
}) {
    const nextMeeting = getNextMeetingDate(frequency);
    const status = getGovernanceStatus(lastGovernance, frequency);
    
    const StatusIcon = status.status === 'ok' ? CheckCircle2 : 
                       status.status === 'warning' ? Clock : AlertCircle;

    return (
        <div className={`mb-6 p-4 rounded-xl border transition-all ${
            isGovernanceActive 
                ? 'bg-purple-500/10 border-purple-500/30' 
                : 'bg-[#080808] border-white/10'
        }`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left: Governance Info */}
                <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isGovernanceActive ? 'bg-purple-500/20' : 'bg-white/5'
                    }`}>
                        <Shield size={24} className={isGovernanceActive ? 'text-purple-400' : 'text-gray-500'} />
                    </div>

                    {/* Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-white">Governança</span>
                            {/* Frequency Selector */}
                            <select
                                value={frequency}
                                onChange={(e) => onChangeFrequency?.(e.target.value)}
                                className="bg-transparent border border-white/10 rounded px-2 py-0.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider focus:outline-none focus:border-purple-500/50 cursor-pointer"
                            >
                                <option value="daily">Diária</option>
                                <option value="weekly">Semanal</option>
                                <option value="monthly">Mensal</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-3 text-[11px]">
                            {/* Status */}
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${status.bgColor}`}>
                                <StatusIcon size={10} className={status.color} />
                                <span className={`font-medium ${status.color}`}>{status.label}</span>
                            </div>
                            {/* Next Meeting */}
                            <div className="flex items-center gap-1 text-gray-500">
                                <Calendar size={10} />
                                <span>Próxima: <span className="text-gray-400">{formatDate(nextMeeting)}</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onToggleGovernance}
                        className={isGovernanceActive
                            ? "px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                            : "px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-xs font-bold rounded-lg transition-colors border border-purple-500/30 flex items-center gap-2"
                        }
                    >
                        <Shield size={14} />
                        {isGovernanceActive ? 'Encerrar Reunião' : 'Iniciar Reunião'}
                    </button>
                </div>
            </div>

            {/* Active Mode Indicator */}
            {isGovernanceActive && (
                <div className="mt-4 pt-4 border-t border-purple-500/20">
                    <div className="flex items-center gap-2 text-[11px] text-purple-300">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        <span>Modo Governança ativo — edições de KPIs habilitadas</span>
                    </div>
                </div>
            )}

            {nextWindow?.startDate && nextWindow?.endDate && (
                <div className="mt-3 text-[11px] text-gray-500">
                    Período do ciclo: <span className="text-gray-300 font-medium">{nextWindow.startDate} → {nextWindow.endDate}</span>
                </div>
            )}
        </div>
    );
}
