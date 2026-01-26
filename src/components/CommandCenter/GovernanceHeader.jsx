import React, { useEffect, useState } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2, Shield, Settings2 } from 'lucide-react';

function getNextMeetingDate(frequency, calendarRule) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    switch (frequency) {
        case 'daily': {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow;
        }
        case 'weekly': {
            const meetingWeekday = Number.isFinite(calendarRule?.meetingWeekday) ? calendarRule.meetingWeekday : 1;
            const daysUntil = (meetingWeekday - dayOfWeek + 7) % 7 || 7;
            const next = new Date(today);
            next.setDate(next.getDate() + daysUntil);
            return next;
        }
        case 'monthly': {
            const day = Number.isFinite(calendarRule?.monthlyMeetingDay) ? calendarRule.monthlyMeetingDay : 1;
            const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
            nextMonth.setDate(Math.max(1, Math.min(day, lastDay)));
            return nextMonth;
        }
        default:
            return null;
    }
}

function computeCycleWindow(frequency, calendarRule) {
    const toDateStr = (d) => d.toISOString().split('T')[0];
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    if (frequency === 'daily') {
        const s = toDateStr(today);
        return { startDate: s, endDate: s };
    }

    if (frequency === 'weekly') {
        const weekStartDay = Number.isFinite(calendarRule?.weekStartDay) ? calendarRule.weekStartDay : 1;
        const dow = today.getDay();
        const daysSinceStart = (dow - weekStartDay + 7) % 7;
        const start = new Date(today);
        start.setDate(start.getDate() - daysSinceStart);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return { startDate: toDateStr(start), endDate: toDateStr(end) };
    }

    if (frequency === 'monthly') {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { startDate: toDateStr(start), endDate: toDateStr(end) };
    }

    const s = toDateStr(today);
    return { startDate: s, endDate: s };
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
    nextWindow,
    calendarRule,
    onUpdateCalendarRule
}) {
    const today = new Date();
    const todayWeekday = today.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
    const todayDay = today.toLocaleDateString('pt-BR', { day: '2-digit' });
    const todayMonth = today.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();

    const nextMeeting = getNextMeetingDate(frequency, calendarRule);
    const status = getGovernanceStatus(lastGovernance, frequency);
    const computedWindow = computeCycleWindow(frequency, calendarRule);
    const windowToShow = nextWindow?.startDate && nextWindow?.endDate ? nextWindow : computedWindow;

    const [showEditor, setShowEditor] = useState(false);
    const [ruleDraft, setRuleDraft] = useState({
        weekStartDay: Number.isFinite(calendarRule?.weekStartDay) ? calendarRule.weekStartDay : 1,
        meetingWeekday: Number.isFinite(calendarRule?.meetingWeekday) ? calendarRule.meetingWeekday : 1,
        monthlyMeetingDay: Number.isFinite(calendarRule?.monthlyMeetingDay) ? calendarRule.monthlyMeetingDay : 1,
    });

    useEffect(() => {
        setRuleDraft({
            weekStartDay: Number.isFinite(calendarRule?.weekStartDay) ? calendarRule.weekStartDay : 1,
            meetingWeekday: Number.isFinite(calendarRule?.meetingWeekday) ? calendarRule.meetingWeekday : 1,
            monthlyMeetingDay: Number.isFinite(calendarRule?.monthlyMeetingDay) ? calendarRule.monthlyMeetingDay : 1,
        });
    }, [calendarRule?.weekStartDay, calendarRule?.meetingWeekday, calendarRule?.monthlyMeetingDay]);
    
    const StatusIcon = status.status === 'ok' ? CheckCircle2 : 
                       status.status === 'warning' ? Clock : AlertCircle;

    return (
        <div className={`mb-6 p-4 rounded-xl border transition-all ${
            isGovernanceActive 
                ? 'bg-purple-500/10 border-purple-500/30' 
                : 'bg-[#080808] border-white/10'
        }`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-stretch gap-4">
                    <div className="w-[86px] shrink-0 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center justify-center px-3 py-2">
                        <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{todayWeekday}</div>
                        <div className="text-2xl font-bold text-white leading-tight mt-0.5">{todayDay}</div>
                        <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">{todayMonth}</div>
                    </div>

                    <div className="w-px bg-white/10 my-2" />

                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isGovernanceActive ? 'bg-purple-500/20' : 'bg-white/5'
                        }`}>
                            <Shield size={24} className={isGovernanceActive ? 'text-purple-400' : 'text-gray-500'} />
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-bold text-white">Governança</span>
                                <select
                                    value={frequency}
                                    onChange={(e) => onChangeFrequency?.(e.target.value)}
                                    className="bg-transparent border border-white/10 rounded px-2 py-0.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider focus:outline-none focus:border-purple-500/50 cursor-pointer"
                                >
                                    <option value="daily">Diária</option>
                                    <option value="weekly">Semanal</option>
                                    <option value="monthly">Mensal</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setShowEditor(v => !v)}
                                    className="ml-1 p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors"
                                    title="Calendário"
                                >
                                    <Settings2 size={14} />
                                </button>
                            </div>

                            <div className="flex items-center gap-3 text-[11px]">
                                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${status.bgColor}`}>
                                    <StatusIcon size={10} className={status.color} />
                                    <span className={`font-medium ${status.color}`}>{status.label}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-500">
                                    <Calendar size={10} />
                                    <span>Próxima: <span className="text-gray-400">{formatDate(nextMeeting)}</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onToggleGovernance}
                        className={isGovernanceActive
                            ? "relative px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-2 border border-purple-500/40 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all"
                            : "relative px-4 py-2 rounded-lg text-xs font-bold text-purple-200 flex items-center gap-2 border border-purple-500/40 bg-gradient-to-r from-purple-500/20 via-fuchsia-500/10 to-purple-500/20 hover:from-purple-500/25 hover:via-fuchsia-500/20 hover:to-purple-500/25 hover:shadow-md hover:shadow-purple-500/10 transition-all"
                        }
                    >
                        <span className={isGovernanceActive ? "absolute -inset-[1px] rounded-lg bg-gradient-to-r from-purple-500/30 via-fuchsia-500/10 to-purple-500/30 blur-sm" : "absolute -inset-[1px] rounded-lg bg-gradient-to-r from-purple-500/15 via-fuchsia-500/5 to-purple-500/15 blur-sm"} />
                        <span className="relative flex items-center gap-2">
                            <Shield size={14} />
                            {isGovernanceActive ? (
                                <span className="flex items-center gap-2">
                                    <span>Encerrar Reunião</span>
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/30 border border-white/10 text-[10px] font-mono">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        LIVE
                                    </span>
                                </span>
                            ) : 'Iniciar Reunião'}
                        </span>
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

            {windowToShow?.startDate && windowToShow?.endDate && (
                <div className="mt-3 text-[11px] text-gray-500">
                    Período do ciclo: <span className="text-gray-300 font-medium">{windowToShow.startDate} → {windowToShow.endDate}</span>
                </div>
            )}

            {showEditor && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="text-label">Início da semana</label>
                            <select
                                className="bg-transparent border border-white/10 rounded px-2 py-1 text-[11px] text-gray-300 w-full"
                                value={ruleDraft.weekStartDay}
                                onChange={(e) => setRuleDraft(p => ({ ...p, weekStartDay: parseInt(e.target.value, 10) }))}
                            >
                                <option value={0}>Dom</option>
                                <option value={1}>Seg</option>
                                <option value={2}>Ter</option>
                                <option value={3}>Qua</option>
                                <option value={4}>Qui</option>
                                <option value={5}>Sex</option>
                                <option value={6}>Sáb</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-label">Dia da reunião (semanal)</label>
                            <select
                                className="bg-transparent border border-white/10 rounded px-2 py-1 text-[11px] text-gray-300 w-full"
                                value={ruleDraft.meetingWeekday}
                                onChange={(e) => setRuleDraft(p => ({ ...p, meetingWeekday: parseInt(e.target.value, 10) }))}
                            >
                                <option value={0}>Dom</option>
                                <option value={1}>Seg</option>
                                <option value={2}>Ter</option>
                                <option value={3}>Qua</option>
                                <option value={4}>Qui</option>
                                <option value={5}>Sex</option>
                                <option value={6}>Sáb</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-label">Dia da reunião (mensal)</label>
                            <input
                                type="number"
                                min={1}
                                max={31}
                                className="bg-transparent border border-white/10 rounded px-2 py-1 text-[11px] text-gray-300 w-full"
                                value={ruleDraft.monthlyMeetingDay}
                                onChange={(e) => setRuleDraft(p => ({ ...p, monthlyMeetingDay: parseInt(e.target.value, 10) || 1 }))}
                            />
                        </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                        <button type="button" className="btn-ghost !h-7 !px-3" onClick={() => setShowEditor(false)}>
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="btn-primary !h-7 !px-3"
                            onClick={() => {
                                onUpdateCalendarRule?.(ruleDraft);
                                setShowEditor(false);
                            }}
                        >
                            Salvar calendário
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
