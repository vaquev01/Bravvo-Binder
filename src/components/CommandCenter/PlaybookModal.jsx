import React, { useState } from 'react';
import { Book, Check, X, Play, Info } from 'lucide-react';
import { PLAYBOOKS } from '../../data/playbooks';

export function PlaybookModal({ open, onClose, onApply }) {
    const [selectedId, setSelectedId] = useState(null);

    if (!open) return null;

    const playbooksList = Object.values(PLAYBOOKS);
    const selectedPlaybook = selectedId ? PLAYBOOKS[selectedId] : null;

    const handleApply = () => {
        if (selectedPlaybook) {
            onApply(selectedPlaybook);
            onClose();
            setSelectedId(null);
        }
    };

    return (
        <div data-testid="playbook-modal" className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#0A0A0A]">
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                            <Book size={20} className="text-blue-500" />
                            Biblioteca de Playbooks
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Selecione uma estratégia para gerar tarefas automáticas.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    
                    {/* Sidebar: List */}
                    <div className="w-full md:w-1/3 border-r border-white/10 overflow-y-auto bg-[#050505]">
                        {playbooksList.map(pb => (
                            <button
                                key={pb.id}
                                onClick={() => setSelectedId(pb.id)}
                                data-testid={`playbook-select-${pb.id}`}
                                className={`w-full text-left p-4 border-b border-white/5 transition-colors hover:bg-white/5 ${selectedId === pb.id ? 'bg-white/10 border-l-2 border-l-blue-500' : ''}`}
                            >
                                <div className="text-sm font-bold text-white mb-1">{pb.name}</div>
                                <div className="text-xs text-gray-500 line-clamp-2">{pb.description}</div>
                                <div className="mt-2 flex gap-1 flex-wrap">
                                    <span className="text-[9px] bg-blue-900/30 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/20">
                                        {pb.objectiveType.replace('OBJ_', '')}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Main: Details */}
                    <div className="flex-1 overflow-y-auto p-6 bg-[#0A0A0A]">
                        {selectedPlaybook ? (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xl font-bold text-white mb-2">{selectedPlaybook.name}</h4>
                                    <p className="text-gray-400 text-sm">{selectedPlaybook.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#111] p-4 rounded-lg border border-white/5">
                                        <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Canais</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedPlaybook.channels.map(c => (
                                                <span key={c} className="text-xs text-white bg-white/10 px-2 py-1 rounded">{c}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-[#111] p-4 rounded-lg border border-white/5">
                                        <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Regras</h5>
                                        <ul className="text-xs text-gray-300 space-y-1">
                                            {Object.entries(selectedPlaybook.rules).map(([k, v]) => (
                                                <li key={k}>• <span className="text-gray-500">{k}:</span> {v}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <h5 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                        <Check size={14} /> Tarefas Geradas ({selectedPlaybook.tasks.length})
                                    </h5>
                                    <div className="space-y-2">
                                        {selectedPlaybook.tasks.map((t, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-[#111] rounded border border-white/5">
                                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-400 font-mono">
                                                    D{t.dayOffset}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm text-white font-medium">{t.title}</div>
                                                    <div className="text-xs text-gray-500">{t.role} • {t.type}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600">
                                <Info size={48} className="mb-4 opacity-20" />
                                <p className="text-sm">Selecione um playbook ao lado para ver os detalhes.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-[#0A0A0A] flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded text-xs font-bold text-gray-400 hover:text-white transition-colors">
                        CANCELAR
                    </button>
                    <button 
                        onClick={handleApply}
                        disabled={!selectedId}
                        data-testid="playbook-apply"
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Play size={14} />
                        Gerar Plano Tático
                    </button>
                </div>
            </div>
        </div>
    );
}
