import React, { useState } from 'react';
import { Plus, Trash2, Users, Instagram, Globe } from 'lucide-react';

export function CompetitorList({ competitors = [], onChange }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCompetitor, setNewCompetitor] = useState({
        name: '',
        handle: '',
        notes: '',
        link: ''
    });

    const addCompetitor = () => {
        if (!newCompetitor.name.trim()) return;
        const competitor = {
            id: `COMP-${Date.now()}`,
            ...newCompetitor
        };
        onChange([...competitors, competitor]);
        setNewCompetitor({ name: '', handle: '', notes: '', link: '' });
        setShowAddForm(false);
    };

    const removeCompetitor = (id) => {
        onChange(competitors.filter(c => c.id !== id));
    };

    return (
        <div className="space-y-4">
            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {competitors.length === 0 && !showAddForm && (
                    <p className="text-sm text-gray-500 text-center py-4 col-span-2">Nenhum concorrente cadastrado</p>
                )}

                {competitors.map((competitor) => (
                    <div
                        key={competitor.id}
                        className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg p-4 group hover:border-orange-500/30 transition-colors"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center">
                                    <Users size={14} />
                                </div>
                                <div>
                                    <span className="font-medium text-white">{competitor.name}</span>
                                    {competitor.handle && (
                                        <p className="text-xs text-orange-400">@{competitor.handle}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => removeCompetitor(competitor.id)}
                                className="p-1 rounded text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                title="Remover"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>

                        {competitor.notes && (
                            <p className="text-xs text-gray-400 mb-2 line-clamp-2">{competitor.notes}</p>
                        )}

                        <div className="flex gap-2">
                            {competitor.handle && (
                                <a
                                    href={`https://instagram.com/${competitor.handle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)] hover:text-pink-400 bg-[var(--bg-panel)] border border-[var(--border-subtle)] px-2 py-1 rounded transition-colors"
                                >
                                    <Instagram size={10} />
                                    Instagram
                                </a>
                            )}
                            {competitor.link && (
                                <a
                                    href={competitor.link.startsWith('http') ? competitor.link : `https://${competitor.link}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)] hover:text-blue-400 bg-[var(--bg-panel)] border border-[var(--border-subtle)] px-2 py-1 rounded transition-colors"
                                >
                                    <Globe size={10} />
                                    Site
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Form */}
            {showAddForm ? (
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Nome do Concorrente</label>
                            <input
                                className="input-field"
                                placeholder="Nome da empresa"
                                value={newCompetitor.name}
                                onChange={e => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="input-label">@ Instagram</label>
                            <div className="flex">
                                <span className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] border-r-0 rounded-l-lg px-3 py-2.5 text-[var(--text-secondary)]">@</span>
                                <input
                                    className="input-field rounded-l-none flex-1"
                                    placeholder="perfil"
                                    value={newCompetitor.handle}
                                    onChange={e => setNewCompetitor({ ...newCompetitor, handle: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="input-label">Link do Site</label>
                        <input
                            className="input-field"
                            placeholder="www.concorrente.com.br"
                            value={newCompetitor.link}
                            onChange={e => setNewCompetitor({ ...newCompetitor, link: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="input-label">Notas (O que eles fazem bem? Diferencial?)</label>
                        <textarea
                            className="input-field min-h-[60px] resize-none"
                            placeholder="Observações sobre este concorrente..."
                            value={newCompetitor.notes}
                            onChange={e => setNewCompetitor({ ...newCompetitor, notes: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={addCompetitor}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors flex items-center gap-2"
                        >
                            <Plus size={14} />
                            Adicionar
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="w-full py-3 border border-dashed border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-white hover:border-[var(--border-active)] transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={16} />
                    Adicionar Concorrente
                </button>
            )}
        </div>
    );
}
