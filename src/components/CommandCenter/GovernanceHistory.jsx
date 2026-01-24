import React, { useState } from 'react';
import { Clock, History, Calendar, TrendingUp, CheckCircle2, FileText, X, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

export function GovernanceHistory({
    history = [],
    onSaveSnapshot,
    open,
    onClose,
    currentSnapshot
}) {
    const [expandedId, setExpandedId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    const copyToClipboard = (entry) => {
        const text = `
📊 GOVERNANÇA - ${new Date(entry.date).toLocaleDateString('pt-BR')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 KPIs:
• Faturamento: R$ ${entry.kpiSnapshot?.revenue?.value || 0} (Meta: R$ ${entry.kpiSnapshot?.revenue?.goal || 0})
• Vendas: ${entry.kpiSnapshot?.sales?.value || 0} (Meta: ${entry.kpiSnapshot?.sales?.goal || 0})
• CPM: R$ ${entry.kpiSnapshot?.traffic?.value || 0}

📋 Tarefas:
${entry.tasksSummary || 'Sem detalhes'}

✅ Posts Aprovados: ${entry.postsApproved?.length || 0}
${entry.postsApproved?.map(p => `• ${p}`).join('\n') || ''}

📝 Notas:
${entry.notes || 'Sem notas'}
        `.trim();

        navigator.clipboard.writeText(text);
        setCopiedId(entry.id);
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
                            <p className="text-xs text-gray-500">{history.length} registros</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white p-2 hover:bg-white/10 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                {/* Timeline Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {history.length === 0 ? (
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
                            {history.map((entry, index) => (
                                <div key={entry.id} className="relative pl-12 pb-6">
                                    {/* Timeline Dot */}
                                    <div className={`absolute left-3 w-5 h-5 rounded-full border-2 ${index === 0
                                            ? 'bg-purple-500 border-purple-400'
                                            : 'bg-[#0A0A0A] border-white/20'
                                        }`}>
                                        {index === 0 && <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-20"></div>}
                                    </div>

                                    {/* Entry Card */}
                                    <div className={`bg-white/5 border rounded-xl overflow-hidden transition-all ${expandedId === entry.id ? 'border-purple-500/30' : 'border-white/10'
                                        }`}>
                                        {/* Entry Header */}
                                        <button
                                            onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                                            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Calendar size={14} />
                                                    <span className="text-sm font-medium text-white">
                                                        {new Date(entry.date).toLocaleDateString('pt-BR', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
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
                                                        R$ {(entry.kpiSnapshot?.revenue?.value || 0).toLocaleString()}
                                                    </span>
                                                    <span className="text-gray-600">|</span>
                                                    <span className="text-blue-400">
                                                        {entry.kpiSnapshot?.sales?.value || 0} vendas
                                                    </span>
                                                </div>
                                                {expandedId === entry.id ? (
                                                    <ChevronUp size={16} className="text-gray-500" />
                                                ) : (
                                                    <ChevronDown size={16} className="text-gray-500" />
                                                )}
                                            </div>
                                        </button>

                                        {/* Expanded Content */}
                                        {expandedId === entry.id && (
                                            <div className="px-4 pb-4 space-y-4 border-t border-white/10 animate-fadeIn">
                                                {/* KPI Grid */}
                                                <div className="grid grid-cols-3 gap-3 pt-4">
                                                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                                        <p className="text-[10px] text-green-400 uppercase tracking-wide mb-1">Faturamento</p>
                                                        <p className="text-lg font-bold text-white">
                                                            R$ {(entry.kpiSnapshot?.revenue?.value || 0).toLocaleString()}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500">
                                                            Meta: R$ {(entry.kpiSnapshot?.revenue?.goal || 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                                        <p className="text-[10px] text-blue-400 uppercase tracking-wide mb-1">Vendas</p>
                                                        <p className="text-lg font-bold text-white">
                                                            {entry.kpiSnapshot?.sales?.value || 0}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500">
                                                            Meta: {entry.kpiSnapshot?.sales?.goal || 0}
                                                        </p>
                                                    </div>
                                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                                                        <p className="text-[10px] text-orange-400 uppercase tracking-wide mb-1">CPM</p>
                                                        <p className="text-lg font-bold text-white">
                                                            R$ {entry.kpiSnapshot?.traffic?.value || 0}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500">
                                                            Meta: R$ {entry.kpiSnapshot?.traffic?.goal || 0}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Tasks Summary */}
                                                {entry.tasksSummary && (
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Resumo de Tarefas</p>
                                                        <p className="text-sm text-gray-300 bg-white/5 rounded-lg p-3">{entry.tasksSummary}</p>
                                                    </div>
                                                )}

                                                {/* Posts Approved */}
                                                {entry.postsApproved?.length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">
                                                            Posts Aprovados ({entry.postsApproved.length})
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {entry.postsApproved.map((post, i) => (
                                                                <span key={i} className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">
                                                                    {post}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Notes */}
                                                {entry.notes && (
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Notas</p>
                                                        <p className="text-sm text-gray-400 italic">{entry.notes}</p>
                                                    </div>
                                                )}

                                                {/* Copy Button */}
                                                <div className="flex justify-end pt-2">
                                                    <button
                                                        onClick={() => copyToClipboard(entry)}
                                                        className="flex items-center gap-2 text-xs text-gray-400 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        {copiedId === entry.id ? (
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
                        💾 Snapshots são salvos automaticamente ao processar governança
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
