import React, { useEffect, useMemo, useState } from 'react';
import { History, Calendar, X, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

function isAtaEntry(entry) {
    return Boolean(entry?.signature?.closedAt && entry?.kpis);
}

function getEntryId(entry) {
    return entry?.id || entry?.signature?.closedAt || entry?.date || String(Math.random());
}

function getEntryDate(entry) {
    return entry?.signature?.closedAt || entry?.date || new Date().toISOString();
}

function getEntryKpis(entry) {
    if (isAtaEntry(entry)) return entry.kpis;
    return entry?.kpiSnapshot;
}

function formatDateTime(dateStr) {
    try {
        return new Date(dateStr).toLocaleString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return String(dateStr || '');
    }
}

export function GovernanceHistory({
    history = [],
    open,
    onClose,
    focusEntryId = null,
    ..._unused
}) {
    const [expandedId, setExpandedId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    const normalizedHistory = useMemo(() => {
        return (Array.isArray(history) ? history : []).map((entry) => ({
            raw: entry,
            kind: isAtaEntry(entry) ? 'ata' : 'snapshot',
            id: getEntryId(entry),
            date: getEntryDate(entry),
            kpis: getEntryKpis(entry)
        }));
    }, [history]);

    useEffect(() => {
        if (!open) return;
        if (focusEntryId) {
            setExpandedId(focusEntryId);
            return;
        }
        if (normalizedHistory.length > 0 && !expandedId) {
            setExpandedId(normalizedHistory[0].id);
        }
    }, [open, focusEntryId, normalizedHistory, expandedId]);

    const copyToClipboard = (entryWrapper) => {
        const entry = entryWrapper?.raw;
        const kpis = entryWrapper?.kpis;

        if (isAtaEntry(entry)) {
            const text = `
 � ATA DE GOVERNANÇA
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 
 🕒 Fechamento: ${formatDateTime(entry.signature?.closedAt)} (${entry.signature?.timezone || ''})
 🧑 Responsável: ${entry.signature?.responsible || '—'}
 📆 Tipo: ${entry.signature?.type || '—'}
 📅 Período: ${entry.signature?.period || '—'}
 
 📈 KPIs:
 • Receita: R$ ${kpis?.revenue?.value || 0} (Meta: R$ ${kpis?.revenue?.goal || 0})
 • Vendas: ${kpis?.sales?.value || 0} (Meta: ${kpis?.sales?.goal || 0})
 • Tráfego: R$ ${kpis?.traffic?.value || 0} (Meta: R$ ${kpis?.traffic?.goal || 0})
 
 ✅ Decisões:
 ${(entry.decisions || []).map(d => `• ${d}`).join('\n') || '• —'}
 
 ⚠️ Riscos:
 ${(entry.risks || []).map(r => `• ${r}`).join('\n') || '• —'}
 
 🎯 Próximas Prioridades:
 ${(entry.nextPriorities || []).map(p => `• ${p}`).join('\n') || '• —'}
            `.trim();

            navigator.clipboard.writeText(text);
            setCopiedId(entryWrapper.id);
            setTimeout(() => setCopiedId(null), 2000);
            return;
        }

        const text = `
 📊 GOVERNANÇA - ${formatDateTime(entry?.date)}
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 
 📈 KPIs:
 • Faturamento: R$ ${kpis?.revenue?.value || 0} (Meta: R$ ${kpis?.revenue?.goal || 0})
 • Vendas: ${kpis?.sales?.value || 0} (Meta: ${kpis?.sales?.goal || 0})
 • CPM: R$ ${kpis?.traffic?.value || 0}
 
 📋 Tarefas:
 ${entry?.tasksSummary || 'Sem detalhes'}
 
 ✅ Posts Aprovados: ${entry?.postsApproved?.length || 0}
 ${entry?.postsApproved?.map(p => `• ${p}`).join('\n') || ''}
 
 📝 Notas:
 ${entry?.notes || 'Sem notas'}
        `.trim();

        navigator.clipboard.writeText(text);
        setCopiedId(entryWrapper.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-fadeIn">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                            <History size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Histórico de Governança</h3>
                            <p className="text-xs text-gray-500">{normalizedHistory.length} registros</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white p-2 hover:bg-white/10 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                {/* Timeline Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {normalizedHistory.length === 0 ? (
                        <div className="text-center py-16">
                            <History size={48} className="text-gray-700 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-400 mb-2">Nenhum registro ainda</h4>
                            <p className="text-sm text-gray-600 max-w-sm mx-auto">
                                Quando você processar um ciclo de governança, os KPIs e status serão salvos aqui automaticamente.
                            </p>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Timeline Line */}
                            <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10"></div>

                            {/* Timeline Items */}
                            {normalizedHistory.map((entryWrapper, index) => (
                                <div key={entryWrapper.id} className="relative pl-12 pb-6">
                                    {/* Timeline Dot */}
                                    <div className={`absolute left-3 w-5 h-5 rounded-full border-2 ${index === 0
                                        ? 'bg-purple-500 border-purple-400'
                                        : 'bg-[#0A0A0A] border-white/20'
                                        }`}>
                                        {index === 0 && <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-20"></div>}
                                    </div>

                                    {/* Entry Card */}
                                    <div className={`bg-white/5 border rounded-xl overflow-hidden transition-all ${expandedId === entryWrapper.id ? 'border-purple-500/30' : 'border-white/10'
                                        }`}>
                                        {/* Entry Header */}
                                        <button
                                            onClick={() => setExpandedId(expandedId === entryWrapper.id ? null : entryWrapper.id)}
                                            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Calendar size={14} />
                                                    <span className="text-sm font-medium text-white">
                                                        {formatDateTime(entryWrapper.date)}
                                                    </span>
                                                </div>
                                                {index === 0 && (
                                                    <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded border border-purple-500/30">
                                                        MAIS RECENTE
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-green-400">
                                                        R$ {(entryWrapper.kpis?.revenue?.value || 0).toLocaleString()}
                                                    </span>
                                                    <span className="text-gray-600">|</span>
                                                    <span className="text-blue-400">
                                                        {entryWrapper.kpis?.sales?.value || 0} vendas
                                                    </span>
                                                </div>
                                                {expandedId === entryWrapper.id ? (
                                                    <ChevronUp size={16} className="text-gray-500" />
                                                ) : (
                                                    <ChevronDown size={16} className="text-gray-500" />
                                                )}
                                            </div>
                                        </button>

                                        {/* Expanded Content */}
                                        {expandedId === entryWrapper.id && (
                                            <div className="px-4 pb-4 space-y-4 border-t border-white/10 animate-fadeIn">
                                                {/* KPI Grid */}
                                                <div className="grid grid-cols-3 gap-3 pt-4">
                                                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                                        <p className="text-[10px] text-green-400 uppercase tracking-wide mb-1">Faturamento</p>
                                                        <p className="text-lg font-bold text-white">
                                                            R$ {(entryWrapper.kpis?.revenue?.value || 0).toLocaleString()}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 mb-2">
                                                            Meta: R$ {(entryWrapper.kpis?.revenue?.goal || 0).toLocaleString()}
                                                        </p>
                                                        {!isAtaEntry(entryWrapper.raw) && entryWrapper.raw?.kpiSnapshot?.revenue?.comment && (
                                                            <div className="pt-2 border-t border-green-500/20 mt-2">
                                                                <p className="text-[10px] text-gray-400 italic">"{entryWrapper.raw.kpiSnapshot.revenue.comment}"</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                                        <p className="text-[10px] text-blue-400 uppercase tracking-wide mb-1">Vendas</p>
                                                        <p className="text-lg font-bold text-white">
                                                            {entryWrapper.kpis?.sales?.value || 0}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 mb-2">
                                                            Meta: {entryWrapper.kpis?.sales?.goal || 0}
                                                        </p>
                                                        {!isAtaEntry(entryWrapper.raw) && entryWrapper.raw?.kpiSnapshot?.sales?.comment && (
                                                            <div className="pt-2 border-t border-blue-500/20 mt-2">
                                                                <p className="text-[10px] text-gray-400 italic">"{entryWrapper.raw.kpiSnapshot.sales.comment}"</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                                                        <p className="text-[10px] text-orange-400 uppercase tracking-wide mb-1">CPM</p>
                                                        <p className="text-lg font-bold text-white">
                                                            R$ {entryWrapper.kpis?.traffic?.value || 0}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 mb-2">
                                                            Meta: R$ {entryWrapper.kpis?.traffic?.goal || 0}
                                                        </p>
                                                        {!isAtaEntry(entryWrapper.raw) && entryWrapper.raw?.kpiSnapshot?.traffic?.comment && (
                                                            <div className="pt-2 border-t border-orange-500/20 mt-2">
                                                                <p className="text-[10px] text-gray-400 italic">"{entryWrapper.raw.kpiSnapshot.traffic.comment}"</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {isAtaEntry(entryWrapper.raw) && (
                                                    <>
                                                        {(entryWrapper.raw?.decisions || []).length > 0 && (
                                                            <div>
                                                                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Decisões</p>
                                                                <div className="text-sm text-gray-300 bg-white/5 rounded-lg p-3 space-y-1">
                                                                    {entryWrapper.raw.decisions.map((d, i) => (
                                                                        <div key={i}>• {d}</div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {(entryWrapper.raw?.risks || []).length > 0 && (
                                                            <div>
                                                                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Riscos</p>
                                                                <div className="text-sm text-gray-300 bg-white/5 rounded-lg p-3 space-y-1">
                                                                    {entryWrapper.raw.risks.map((r, i) => (
                                                                        <div key={i}>• {r}</div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {(entryWrapper.raw?.nextPriorities || []).length > 0 && (
                                                            <div>
                                                                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Próximas Prioridades</p>
                                                                <div className="text-sm text-gray-300 bg-white/5 rounded-lg p-3 space-y-1">
                                                                    {entryWrapper.raw.nextPriorities.map((p, i) => (
                                                                        <div key={i}>• {p}</div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {/* Tasks Summary */}
                                                {!isAtaEntry(entryWrapper.raw) && entryWrapper.raw?.tasksSummary && (
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Resumo de Tarefas</p>
                                                        <p className="text-sm text-gray-300 bg-white/5 rounded-lg p-3">{entryWrapper.raw.tasksSummary}</p>
                                                    </div>
                                                )}

                                                {/* Posts Approved */}
                                                {!isAtaEntry(entryWrapper.raw) && entryWrapper.raw?.postsApproved?.length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">
                                                            Posts Aprovados ({entryWrapper.raw.postsApproved.length})
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {entryWrapper.raw.postsApproved.map((post, i) => (
                                                                <span key={i} className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">
                                                                    {post}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Notes */}
                                                {!isAtaEntry(entryWrapper.raw) && entryWrapper.raw?.notes && (
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Estratégia Geral / Plano de Ação</p>
                                                        <p className="text-sm text-gray-300 italic bg-white/5 p-3 rounded-lg border border-white/5">{entryWrapper.raw.notes}</p>
                                                    </div>
                                                )}

                                                {/* Copy Button */}
                                                <div className="flex justify-end pt-2">
                                                    <button
                                                        onClick={() => copyToClipboard(entryWrapper)}
                                                        className="flex items-center gap-2 text-xs text-gray-400 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        {copiedId === entryWrapper.id ? (
                                                            <>
                                                                <Check size={12} className="text-green-400" />
                                                                Copiado!
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy size={12} />
                                                                Copiar Resumo
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex justify-between items-center shrink-0">
                    <p className="text-xs text-gray-500">
                        💾 Registros são salvos automaticamente ao processar governança
                    </p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium text-sm hover:bg-white/20 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
