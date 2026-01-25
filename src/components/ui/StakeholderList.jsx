import React, { useState } from 'react';
import { Plus, Trash2, Users, Phone, Mail, Check } from 'lucide-react';

export function StakeholderList({ stakeholders = [], onChange }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newStakeholder, setNewStakeholder] = useState({
        name: '',
        role: '',
        contact: '',
        contactType: 'whatsapp',
        canApprove: false
    });

    const addStakeholder = () => {
        if (!newStakeholder.name.trim()) return;
        const stakeholder = {
            id: `SH-${Date.now()}`,
            ...newStakeholder
        };
        onChange([...stakeholders, stakeholder]);
        setNewStakeholder({ name: '', role: '', contact: '', contactType: 'whatsapp', canApprove: false });
        setShowAddForm(false);
    };

    const removeStakeholder = (id) => {
        onChange(stakeholders.filter(s => s.id !== id));
    };

    const toggleApprover = (id) => {
        onChange(stakeholders.map(s =>
            s.id === id ? { ...s, canApprove: !s.canApprove } : s
        ));
    };

    return (
        <div className="space-y-4">
            {/* List */}
            <div className="space-y-2">
                {stakeholders.length === 0 && !showAddForm && (
                    <p className="text-sm text-gray-500 text-center py-4">Nenhum stakeholder cadastrado</p>
                )}

                {stakeholders.map((stakeholder) => (
                    <div
                        key={stakeholder.id}
                        className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between group hover:border-white/20 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
                                <Users size={18} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-white">{stakeholder.name}</span>
                                    {stakeholder.canApprove && (
                                        <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30">
                                            APROVADOR
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">{stakeholder.role}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {stakeholder.contact && (
                                <a
                                    href={stakeholder.contactType === 'whatsapp'
                                        ? `https://wa.me/${stakeholder.contact.replace(/\D/g, '')}`
                                        : `mailto:${stakeholder.contact}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-white bg-white/5 px-2 py-1 rounded transition-colors"
                                >
                                    {stakeholder.contactType === 'whatsapp' ? <Phone size={12} /> : <Mail size={12} />}
                                    {stakeholder.contact}
                                </a>
                            )}
                            <button
                                onClick={() => toggleApprover(stakeholder.id)}
                                className={`p-1.5 rounded transition-colors ${stakeholder.canApprove
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-white/5 text-gray-500 hover:text-white'
                                    }`}
                                title={stakeholder.canApprove ? 'Remover permissão de aprovador' : 'Definir como aprovador'}
                            >
                                <Check size={14} />
                            </button>
                            <button
                                onClick={() => removeStakeholder(stakeholder.id)}
                                className="p-1.5 rounded bg-white/5 text-gray-500 hover:bg-red-500/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                title="Remover"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Form */}
            {showAddForm ? (
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Nome</label>
                            <input
                                className="input-field"
                                placeholder="Nome do stakeholder"
                                value={newStakeholder.name}
                                onChange={e => setNewStakeholder({ ...newStakeholder, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="input-label">Cargo / Função</label>
                            <input
                                className="input-field"
                                placeholder="Ex: Gestor de Marketing"
                                value={newStakeholder.role}
                                onChange={e => setNewStakeholder({ ...newStakeholder, role: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="input-label">Tipo de Contato</label>
                            <select
                                className="input-field"
                                value={newStakeholder.contactType}
                                onChange={e => setNewStakeholder({ ...newStakeholder, contactType: e.target.value })}
                            >
                                <option value="whatsapp">📱 WhatsApp</option>
                                <option value="email">📧 E-mail</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="input-label">Contato</label>
                            <input
                                className="input-field"
                                placeholder={newStakeholder.contactType === 'whatsapp' ? '11999999999' : 'email@exemplo.com'}
                                value={newStakeholder.contact}
                                onChange={e => setNewStakeholder({ ...newStakeholder, contact: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="canApprove"
                            type="checkbox"
                            checked={newStakeholder.canApprove}
                            onChange={e => setNewStakeholder({ ...newStakeholder, canApprove: e.target.checked })}
                            className="w-4 h-4 rounded bg-white/10 border-white/20"
                        />
                        <label htmlFor="canApprove" className="text-sm text-gray-400">
                            Este stakeholder pode aprovar conteúdos
                        </label>
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
                            onClick={addStakeholder}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium text-sm hover:bg-green-600 transition-colors flex items-center gap-2"
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
                    className="w-full py-3 border border-dashed border-white/20 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={16} />
                    Adicionar Stakeholder
                </button>
            )}
        </div>
    );
}
