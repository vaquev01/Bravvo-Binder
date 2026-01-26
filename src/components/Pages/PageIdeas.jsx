import React, { useState } from 'react';
import { Lightbulb, Link2, FileText, Plus, Trash2, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { useVaultForm } from '../../hooks/useVaultForm';

const IDEA_TAGS = [
    'Conteúdo', 'Promoção', 'Lançamento', 'Sazonal', 'Tendência', 'Reels', 'Stories', 'Carrossel', 'Collab'
];

const REFERENCE_TYPES = [
    { value: 'post', label: '📸 Post' },
    { value: 'reel', label: '🎬 Reel' },
    { value: 'story', label: '📱 Story' },
    { value: 'website', label: '🌐 Website' },
    { value: 'competitor', label: '👥 Concorrente' },
    { value: 'inspiration', label: '✨ Inspiração' },
];

export function PageIdeas({ formData: externalFormData, setFormData: externalSetFormData, onComplete }) {
    // Use unified vault form hook
    const { formData: vaultFormData, updateField: vaultUpdateField, isSynced, saveAndAdvance } = useVaultForm('V5');
    
    const formData = vaultFormData || externalFormData || {};
    const updateField = vaultUpdateField || ((field, value) => externalSetFormData?.({ ...formData, [field]: value }));
    
    const [showIdeaForm, setShowIdeaForm] = useState(false);
    const [showRefForm, setShowRefForm] = useState(false);
    const [newIdea, setNewIdea] = useState({ title: '', description: '', url: '', tags: [] });
    const [newRef, setNewRef] = useState({ title: '', url: '', type: 'post', notes: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        saveAndAdvance(onComplete, 'Vault 5 (Ideas)');
    };

    // Ideas CRUD
    const addIdea = () => {
        if (!newIdea.title.trim()) return;
        const idea = {
            id: `IDEA-${Date.now()}`,
            ...newIdea,
            createdAt: new Date().toISOString()
        };
        updateField('ideas', [...(formData.ideas || []), idea]);
        setNewIdea({ title: '', description: '', url: '', tags: [] });
        setShowIdeaForm(false);
    };

    const removeIdea = (id) => {
        updateField('ideas', (formData.ideas || []).filter(i => i.id !== id));
    };

    const toggleIdeaTag = (tag) => {
        if (newIdea.tags.includes(tag)) {
            setNewIdea({ ...newIdea, tags: newIdea.tags.filter(t => t !== tag) });
        } else {
            setNewIdea({ ...newIdea, tags: [...newIdea.tags, tag] });
        }
    };

    // References CRUD
    const addReference = () => {
        if (!newRef.title.trim()) return;
        const ref = {
            id: `REF-${Date.now()}`,
            ...newRef,
            createdAt: new Date().toISOString()
        };
        updateField('references', [...(formData.references || []), ref]);
        setNewRef({ title: '', url: '', type: 'post', notes: '' });
        setShowRefForm(false);
    };

    const removeReference = (id) => {
        updateField('references', (formData.references || []).filter(r => r.id !== id));
    };

    return (
        <form className="space-y-10 animate-fadeIn pb-24" onSubmit={handleSubmit}>
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                        <Lightbulb size={20} className="text-yellow-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">V5 • Ideas Vault</h2>
                        <p className="text-sm text-gray-400">Banco de ideias, referências e anotações rápidas</p>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* SECTION 1: IDEAS BANK */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <section className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Lightbulb size={16} className="text-yellow-400" />
                    Banco de Ideias
                </h3>
                <p className="text-sm text-gray-500 -mt-4">
                    Deposite aqui suas ideias de conteúdo para usar depois
                </p>

                {/* Ideas List */}
                <div className="space-y-3">
                    {(formData.ideas || []).length === 0 && !showIdeaForm && (
                        <div className="bg-[var(--bg-panel)] border border-dashed border-[var(--border-subtle)] rounded-xl p-8 text-center">
                            <Lightbulb size={32} className="text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500">Nenhuma ideia cadastrada ainda</p>
                        </div>
                    )}

                    {(formData.ideas || []).map((idea) => (
                        <div
                            key={idea.id}
                            data-testid={`v5-idea-${idea.id}`}
                            className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-4 group hover:border-yellow-500/30 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-white">{idea.title}</h4>
                                        {idea.url && (
                                            <a
                                                href={idea.url.startsWith('http') ? idea.url : `https://${idea.url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-yellow-400 hover:text-yellow-300"
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                    </div>
                                    {idea.description && (
                                        <p className="text-sm text-gray-400 mb-2">{idea.description}</p>
                                    )}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {idea.tags?.map(tag => (
                                            <span
                                                key={tag}
                                                className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        <span className="text-[10px] text-gray-600">
                                            {new Date(idea.createdAt).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeIdea(idea.id)}
                                    className="p-1.5 rounded text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Idea Form */}
                {showIdeaForm ? (
                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 space-y-4 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="input-label">Título da Ideia</label>
                                <input
                                    className="input-field"
                                    data-testid="v5-idea-title"
                                    placeholder="Ex: Reels com bastidores"
                                    value={newIdea.title}
                                    onChange={e => setNewIdea({ ...newIdea, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="input-label">Link (opcional)</label>
                                <input
                                    className="input-field"
                                    placeholder="URL de referência"
                                    value={newIdea.url}
                                    onChange={e => setNewIdea({ ...newIdea, url: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Descrição</label>
                            <textarea
                                className="input-field min-h-[80px] resize-none"
                                placeholder="Detalhes sobre a ideia..."
                                value={newIdea.description}
                                onChange={e => setNewIdea({ ...newIdea, description: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="input-label">Tags</label>
                            <div className="flex flex-wrap gap-2">
                                {IDEA_TAGS.map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleIdeaTag(tag)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${newIdea.tags.includes(tag)
                                            ? 'bg-yellow-500 text-black border-yellow-500'
                                            : 'bg-[var(--bg-panel)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-active)]'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowIdeaForm(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={addIdea}
                                data-testid="v5-save-idea"
                                className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium text-sm hover:bg-yellow-400 transition-colors flex items-center gap-2"
                            >
                                <Plus size={14} />
                                Salvar Ideia
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setShowIdeaForm(true)}
                        data-testid="v5-new-idea"
                        className="w-full py-3 border border-dashed border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-white hover:border-yellow-500/40 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus size={16} />
                        Nova Ideia
                    </button>
                )}
            </section>

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* SECTION 2: REFERENCES */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <section className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Link2 size={16} className="text-blue-400" />
                    Referências de Conteúdo
                </h3>
                <p className="text-sm text-gray-500 -mt-4">
                    Links de inspiração, posts de concorrentes, referências visuais
                </p>

                {/* References List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(formData.references || []).length === 0 && !showRefForm && (
                        <div className="col-span-2 bg-[var(--bg-panel)] border border-dashed border-[var(--border-subtle)] rounded-xl p-8 text-center">
                            <Link2 size={32} className="text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500">Nenhuma referência salva</p>
                        </div>
                    )}

                    {(formData.references || []).map((ref) => (
                        <div
                            key={ref.id}
                            className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-4 group hover:border-blue-500/30 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                                        {REFERENCE_TYPES.find(t => t.value === ref.type)?.label || ref.type}
                                    </span>
                                    <span className="text-[10px] text-gray-600">
                                        {new Date(ref.createdAt).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeReference(ref.id)}
                                    className="p-1 rounded text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <h4 className="font-medium text-white mb-1">{ref.title}</h4>
                            {ref.notes && <p className="text-xs text-gray-400 mb-2 line-clamp-2">{ref.notes}</p>}
                            {ref.url && (
                                <a
                                    href={ref.url.startsWith('http') ? ref.url : `https://${ref.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 truncate"
                                >
                                    <ExternalLink size={10} />
                                    {ref.url}
                                </a>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add Reference Form */}
                {showRefForm ? (
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 space-y-4 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="input-label">Título</label>
                                <input
                                    className="input-field"
                                    placeholder="Nome da referência"
                                    value={newRef.title}
                                    onChange={e => setNewRef({ ...newRef, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="input-label">Tipo</label>
                                <select
                                    className="input-field"
                                    value={newRef.type}
                                    onChange={e => setNewRef({ ...newRef, type: e.target.value })}
                                >
                                    {REFERENCE_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Link</label>
                            <input
                                className="input-field"
                                placeholder="https://..."
                                value={newRef.url}
                                onChange={e => setNewRef({ ...newRef, url: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="input-label">Notas</label>
                            <textarea
                                className="input-field min-h-[60px] resize-none"
                                placeholder="Por que essa referência é interessante?"
                                value={newRef.notes}
                                onChange={e => setNewRef({ ...newRef, notes: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowRefForm(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={addReference}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                                <Plus size={14} />
                                Salvar Referência
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setShowRefForm(true)}
                        className="w-full py-3 border border-dashed border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-white hover:border-blue-500/40 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus size={16} />
                        Nova Referência
                    </button>
                )}
            </section>

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* SECTION 3: NOTEPAD */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <section className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FileText size={16} className="text-purple-400" />
                    Bloco de Notas
                </h3>
                <p className="text-sm text-gray-500 -mt-4">
                    Anotações rápidas, brainstorm, rascunhos
                </p>

                <div className="vault-room overflow-hidden">
                    <div className="bg-purple-500/10 border-b border-[var(--border-subtle)] px-4 py-2 flex items-center gap-2">
                        <FileText size={14} className="text-purple-400" />
                        <span className="text-xs text-purple-400 font-medium">NOTEPAD</span>
                    </div>
                    <textarea
                        className="w-full bg-transparent text-[var(--text-primary)] p-4 min-h-[200px] resize-none focus:outline-none font-mono text-sm placeholder-[var(--text-tertiary)]"
                        placeholder="Digite suas anotações aqui...

• Ideias soltas
• Brainstorm de campanhas
• Lembretes rápidos
• Tendências para acompanhar"
                        value={formData.notepad || ''}
                        onChange={e => updateField('notepad', e.target.value)}
                    />
                    <div className="bg-[var(--bg-panel)] border-t border-[var(--border-subtle)] px-4 py-2 flex justify-between items-center">
                        <span className="text-[10px] text-gray-600">
                            {(formData.notepad || '').length} caracteres
                        </span>
                        <span className="text-[10px] text-gray-600">
                            Auto-save ativo
                        </span>
                    </div>
                </div>
            </section>

            {/* Submit */}
            <div className="vault-footer">
                <div className="flex items-center gap-2 text-sm">
                    {isSynced ? (
                        <span className="flex items-center gap-1.5 text-green-400">
                            <CheckCircle2 size={14} /> Sincronizado
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-yellow-400 animate-pulse">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span> Salvando...
                        </span>
                    )}
                </div>
                <button
                    type="submit"
                    data-testid="v5-complete"
                    className="btn-primary-lg"
                >
                    <Sparkles size={18} />
                    Concluir V5
                </button>
            </div>
        </form>
    );
}
