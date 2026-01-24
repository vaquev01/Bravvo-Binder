import React, { useState, useRef, useEffect } from 'react';
import {
    Target, ShoppingBag, GitBranch, Users, LayoutDashboard, Clock, Terminal,
    CheckCircle2, Calendar as CalendarIcon, BarChart3, Wand2, Edit3, Check, X,
    Plus, Trash2, ChevronDown, MoreHorizontal, ArrowRight, Zap, TrendingUp,
    Eye, Copy, Video, Image as ImageIcon, FileText, ExternalLink, Settings2,
    History, Palette
} from 'lucide-react';
import { GovernanceHistory } from './GovernanceHistory';

// Inline Editable Component
function InlineEdit({ value, onSave, type = 'text', prefix = '', suffix = '', className = '' }) {
    const [editing, setEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const inputRef = useRef(null);

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editing]);

    const handleSave = () => {
        onSave(tempValue);
        setEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') {
            setTempValue(value);
            setEditing(false);
        }
    };

    if (editing) {
        return (
            <div className="flex items-center gap-1">
                {prefix && <span className="text-gray-500">{prefix}</span>}
                <input
                    ref={inputRef}
                    type={type}
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className={`bg-white/10 border border-white/20 rounded px-2 py-1 text-white focus:outline-none focus:border-bravvo-primary ${className}`}
                />
                {suffix && <span className="text-gray-500">{suffix}</span>}
            </div>
        );
    }

    return (
        <span
            onClick={() => setEditing(true)}
            className={`cursor-pointer hover:bg-white/10 px-1 rounded transition-colors group ${className}`}
            title="Clique para editar"
        >
            {prefix}{value}{suffix}
            <Edit3 size={10} className="inline ml-1 opacity-0 group-hover:opacity-50" />
        </span>
    );
}

// Status Dropdown Component
function StatusDropdown({ value, onChange, options }) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const statusStyles = {
        scheduled: 'border-green-500/30 text-green-400 bg-green-500/10',
        draft: 'border-gray-500/30 text-gray-400 bg-gray-500/10',
        in_production: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10',
        done: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
        cancelled: 'border-red-500/30 text-red-400 bg-red-500/10',
    };

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold border uppercase tracking-wide transition-all ${statusStyles[value] || statusStyles.draft}`}
            >
                {value.replace('_', ' ')}
                <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50 min-w-[140px] py-1">
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 flex items-center gap-2 transition-colors ${value === opt.value ? 'text-white' : 'text-gray-400'}`}
                        >
                            <span className={`w-2 h-2 rounded-full ${opt.color}`}></span>
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Detailed Edit Modal for Calendar Items
function DetailEditModal({ open, onClose, item, onSave }) {
    const [form, setForm] = useState(item || {});

    useEffect(() => {
        if (item) setForm(item);
    }, [item]);

    if (!open || !item) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-2xl my-4 animate-fadeIn">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <div>
                        <h3 className="text-lg font-bold text-white">Editar Iniciativa</h3>
                        <p className="text-xs text-gray-500 mt-1">ID: {item.id}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white p-2 hover:bg-white/10 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Row 1: Basic Info */}
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="input-label">Título da Iniciativa</label>
                            <input
                                required
                                className="input-field text-lg"
                                placeholder="Ex: Post lançamento coleção verão"
                                value={form.initiative || ''}
                                onChange={e => setForm({ ...form, initiative: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Row 2: Date, Channel, Format */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="input-label">Data</label>
                            <input
                                type="date"
                                className="input-field"
                                value={form.date || ''}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="input-label">Canal</label>
                            <select
                                className="input-field"
                                value={form.channel || 'Instagram Feed'}
                                onChange={e => setForm({ ...form, channel: e.target.value })}
                            >
                                <option value="Instagram Feed">📸 Instagram Feed</option>
                                <option value="Instagram Reels">🎬 Instagram Reels</option>
                                <option value="Instagram Stories">📱 Instagram Stories</option>
                                <option value="TikTok">🎵 TikTok</option>
                                <option value="WhatsApp Status">💬 WhatsApp Status</option>
                                <option value="YouTube Shorts">▶️ YouTube Shorts</option>
                                <option value="Google Ads">🔍 Google Ads</option>
                                <option value="Meta Ads">📊 Meta Ads</option>
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Formato</label>
                            <select
                                className="input-field"
                                value={form.format || 'post'}
                                onChange={e => setForm({ ...form, format: e.target.value })}
                            >
                                <option value="post">📷 Post Estático</option>
                                <option value="carousel">🎠 Carrossel</option>
                                <option value="reel">🎬 Reels/Video</option>
                                <option value="story">📱 Story</option>
                                <option value="ad">💰 Anúncio</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 3: Responsible, Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Responsável</label>
                            <input
                                className="input-field"
                                placeholder="Nome do responsável"
                                value={form.responsible || ''}
                                onChange={e => setForm({ ...form, responsible: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="input-label">Status</label>
                            <select
                                className="input-field"
                                value={form.status || 'draft'}
                                onChange={e => setForm({ ...form, status: e.target.value })}
                            >
                                <option value="draft">📝 Rascunho</option>
                                <option value="in_production">🔧 Em Produção</option>
                                <option value="scheduled">📅 Agendado</option>
                                <option value="done">✅ Publicado</option>
                                <option value="cancelled">❌ Cancelado</option>
                            </select>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/10 pt-6">
                        <h4 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                            <FileText size={14} />
                            Conteúdo & Copy
                        </h4>
                    </div>

                    {/* Row 4: Headline, CTA */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Headline Principal</label>
                            <input
                                className="input-field"
                                placeholder="Ex: A promoção que você esperava!"
                                value={form.headline || ''}
                                onChange={e => setForm({ ...form, headline: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="input-label">CTA (Call to Action)</label>
                            <select
                                className="input-field"
                                value={form.ctaId || 'whatsapp'}
                                onChange={e => setForm({ ...form, ctaId: e.target.value })}
                            >
                                <option value="whatsapp">💬 Falar no WhatsApp</option>
                                <option value="comprar">🛒 Comprar Agora</option>
                                <option value="saibamais">ℹ️ Saiba Mais</option>
                                <option value="reservar">📅 Reservar</option>
                                <option value="baixar">📥 Baixar</option>
                                <option value="inscrever">✉️ Inscrever-se</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 5: Caption */}
                    <div>
                        <label className="input-label">Legenda / Caption</label>
                        <textarea
                            className="input-field min-h-[100px] resize-none"
                            placeholder="Digite a legenda completa do post aqui..."
                            value={form.caption || ''}
                            onChange={e => setForm({ ...form, caption: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1 text-right">{(form.caption || '').length}/2200</p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/10 pt-6">
                        <h4 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                            <ImageIcon size={14} />
                            Direção de Arte / Vídeo
                        </h4>
                    </div>

                    {/* Row 6: Visual Direction */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Produto Destaque</label>
                            <select
                                className="input-field"
                                value={form.offerId || 'hero'}
                                onChange={e => setForm({ ...form, offerId: e.target.value })}
                            >
                                <option value="hero">⭐ Produto Carro-Chefe</option>
                                <option value="promo">🏷️ Produto em Promoção</option>
                                <option value="new">🆕 Lançamento</option>
                                <option value="bundle">📦 Combo/Bundle</option>
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Estilo Visual</label>
                            <select
                                className="input-field"
                                value={form.visualStyle || 'product_hero'}
                                onChange={e => setForm({ ...form, visualStyle: e.target.value })}
                            >
                                <option value="product_hero">📸 Product Hero Shot</option>
                                <option value="lifestyle">🌅 Lifestyle/Ambiente</option>
                                <option value="ux_demo">📱 Demo/Tutorial</option>
                                <option value="testimonial">💬 Depoimento</option>
                                <option value="before_after">↔️ Antes/Depois</option>
                                <option value="flat_lay">🎨 Flat Lay</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 7: Visual Notes */}
                    <div>
                        <label className="input-label">Notas de Direção Visual</label>
                        <textarea
                            className="input-field min-h-[80px] resize-none"
                            placeholder="Ex: Usar paleta quente, fundo desfocado, produto em destaque central..."
                            value={form.visualNotes || ''}
                            onChange={e => setForm({ ...form, visualNotes: e.target.value })}
                        />
                    </div>

                    {/* Row 8: Video Specific (if reel) */}
                    {(form.format === 'reel' || form.format === 'story') && (
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                            <h5 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">
                                <Video size={14} />
                                Especificações de Vídeo
                            </h5>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="input-label">Duração</label>
                                    <select
                                        className="input-field"
                                        value={form.videoDuration || '15'}
                                        onChange={e => setForm({ ...form, videoDuration: e.target.value })}
                                    >
                                        <option value="5">5 segundos</option>
                                        <option value="10">10 segundos</option>
                                        <option value="15">15 segundos</option>
                                        <option value="30">30 segundos</option>
                                        <option value="60">60 segundos</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label">Música/Áudio</label>
                                    <input
                                        className="input-field"
                                        placeholder="Ex: Trending audio"
                                        value={form.audioTrack || ''}
                                        onChange={e => setForm({ ...form, audioTrack: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="input-label">Estilo de Edição</label>
                                    <select
                                        className="input-field"
                                        value={form.editStyle || 'dynamic'}
                                        onChange={e => setForm({ ...form, editStyle: e.target.value })}
                                    >
                                        <option value="dynamic">⚡ Dinâmico (cuts rápidos)</option>
                                        <option value="smooth">🌊 Suave (transições)</option>
                                        <option value="minimal">✨ Minimalista</option>
                                        <option value="storytelling">📖 Narrativo</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Row 9: Hashtags */}
                    <div>
                        <label className="input-label">Hashtags</label>
                        <input
                            className="input-field font-mono text-sm"
                            placeholder="#marca #promocao #lancamento"
                            value={form.hashtags || ''}
                            onChange={e => setForm({ ...form, hashtags: e.target.value })}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-6 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-white text-black rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors flex items-center gap-2"
                            >
                                <Check size={16} />
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Quick Add Modal
function QuickAddModal({ open, onClose, onAdd }) {
    const [form, setForm] = useState({
        initiative: '',
        channel: 'Instagram Feed',
        format: 'post',
        date: new Date().toISOString().split('T')[0],
        responsible: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({
            id: `NEW-${Date.now()}`,
            ...form,
            status: 'draft',
            offerId: 'hero',
            ctaId: 'whatsapp',
        });
        onClose();
        setForm({
            initiative: '',
            channel: 'Instagram Feed',
            format: 'post',
            date: new Date().toISOString().split('T')[0],
            responsible: '',
        });
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-6 animate-fadeIn">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Nova Iniciativa</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="input-label">Título</label>
                        <input
                            required
                            className="input-field"
                            placeholder="Ex: Post sobre promoção de verão"
                            value={form.initiative}
                            onChange={e => setForm({ ...form, initiative: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Data</label>
                            <input
                                type="date"
                                className="input-field"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="input-label">Canal</label>
                            <select
                                className="input-field"
                                value={form.channel}
                                onChange={e => setForm({ ...form, channel: e.target.value })}
                            >
                                <option>Instagram Feed</option>
                                <option>Instagram Reels</option>
                                <option>Instagram Stories</option>
                                <option>TikTok</option>
                                <option>WhatsApp</option>
                                <option>Google Ads</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Formato</label>
                            <select
                                className="input-field"
                                value={form.format}
                                onChange={e => setForm({ ...form, format: e.target.value })}
                            >
                                <option value="post">📷 Post</option>
                                <option value="reel">🎬 Reels/Video</option>
                                <option value="story">📱 Story</option>
                                <option value="carousel">🎠 Carrossel</option>
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Responsável</label>
                            <input
                                className="input-field"
                                placeholder="Nome"
                                value={form.responsible}
                                onChange={e => setForm({ ...form, responsible: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white">
                            Cancelar
                        </button>
                        <button type="submit" className="px-6 py-2 bg-white text-black rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors flex items-center gap-2">
                            <Plus size={16} />
                            Adicionar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Main Dashboard Component
export function OnePageDashboard({
    appData,
    setAppData,
    setActiveTab,
    onGeneratePrompt,
    formData,
    setFormData,
    meetingState,
    setMeetingState
}) {
    // UI State
    const [cycleProcessing, setCycleProcessing] = useState(false);
    const [dateFilter, setDateFilter] = useState('week');
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [customTheme, setCustomTheme] = useState(false);

    // Editable KPI State
    const [kpis, setKpis] = useState({
        revenue: { value: 32500, goal: 50000 },
        traffic: { value: 12, goal: 15 },
        sales: { value: 154, goal: 120 },
    });

    // Helper functions for updating meeting state
    const updateComment = (field, value) => {
        setMeetingState(prev => ({
            ...prev,
            comments: {
                ...prev.comments,
                [field]: value
            }
        }));
    };

    const toggleGovernanceMode = () => {
        setMeetingState(prev => ({
            ...prev,
            active: !prev.active
        }));
    };

    // Status Options
    const statusOptions = [
        { value: 'draft', label: 'Rascunho', color: 'bg-gray-500' },
        { value: 'in_production', label: 'Produzindo', color: 'bg-yellow-500' },
        { value: 'scheduled', label: 'Agendado', color: 'bg-green-500' },
        { value: 'done', label: 'Publicado', color: 'bg-blue-500' },
        { value: 'cancelled', label: 'Cancelado', color: 'bg-red-500' },
    ];

    // Format Display
    const formatIcons = {
        post: { icon: '📷', label: 'Post' },
        reel: { icon: '🎬', label: 'Reel' },
        story: { icon: '📱', label: 'Story' },
        carousel: { icon: '🎠', label: 'Carrossel' },
        ad: { icon: '💰', label: 'Ad' },
    };

    // Date Filter Logic
    const getFilteredData = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        return appData.dashboard.D2.filter(item => {
            const itemDateStr = item.date;
            const todayStr = today.toISOString().split('T')[0];
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            const itemDate = new Date(item.date);
            itemDate.setHours(0, 0, 0, 0);

            if (dateFilter === 'today') return itemDateStr === todayStr;
            if (dateFilter === 'tomorrow') return itemDateStr === tomorrowStr;
            if (dateFilter === 'week') return itemDate <= nextWeek && itemDate >= today;
            if (dateFilter === 'month') return itemDateStr.substring(0, 7) === todayStr.substring(0, 7);
            return true;
        });
    };

    const filteredCalendar = getFilteredData();

    // Handlers
    const handleStatusChange = (itemId, newStatus) => {
        const updatedD2 = appData.dashboard.D2.map(item =>
            item.id === itemId ? { ...item, status: newStatus } : item
        );
        setAppData({
            ...appData,
            dashboard: { ...appData.dashboard, D2: updatedD2 }
        });
    };

    const handleSaveItem = (updatedItem) => {
        const updatedD2 = appData.dashboard.D2.map(item =>
            item.id === updatedItem.id ? updatedItem : item
        );
        setAppData({
            ...appData,
            dashboard: { ...appData.dashboard, D2: updatedD2 }
        });
    };

    const handleAddItem = (newItem) => {
        setAppData({
            ...appData,
            dashboard: {
                ...appData.dashboard,
                D2: [...appData.dashboard.D2, newItem]
            }
        });
    };

    const handleDeleteItem = (itemId) => {
        if (!confirm('Remover esta iniciativa?')) return;
        const updatedD2 = appData.dashboard.D2.filter(item => item.id !== itemId);
        setAppData({
            ...appData,
            dashboard: { ...appData.dashboard, D2: updatedD2 }
        });
    };

    const handleMarkDone = (itemId) => {
        handleStatusChange(itemId, 'done');
    };

    const handleSaveMeeting = () => {
        setCycleProcessing(true);

        // 1. Create Snapshot
        const snapshot = {
            id: Date.now(),
            date: new Date().toISOString(),
            kpiSnapshot: {
                revenue: { ...kpis.revenue, comment: meetingState.comments.revenue },
                traffic: { ...kpis.traffic, comment: meetingState.comments.traffic },
                sales: { ...kpis.sales, comment: meetingState.comments.sales }
            },
            notes: meetingState.comments.general,
            tasksSummary: `${appData.dashboard.D2.filter(t => t.status === 'done').length} conclusas, ${appData.dashboard.D2.filter(t => t.status === 'scheduled').length} agendadas`,
            postsApproved: appData.dashboard.D2.filter(t => t.status === 'scheduled' || t.status === 'done').map(t => t.initiative)
        };

        // 2. Update History
        const updatedHistory = [snapshot, ...(formData?.governanceHistory || [])];
        const updatedFormData = { ...formData, governanceHistory: updatedHistory };

        // Save to parent state
        if (setFormData) {
            setFormData(updatedFormData);
        }

        setTimeout(() => {
            setCycleProcessing(false);
            setMeetingState({ // Reset meeting state completely
                active: false,
                comments: { general: '', revenue: '', traffic: '', sales: '' }
            });
            alert("✅ REUNIÃO SALVA! Histórico de governança atualizado.");
        }, 1500);
    };

    // Calculate Progress
    const revenueProgress = Math.min((kpis.revenue.value / kpis.revenue.goal) * 100, 100);
    const salesProgress = Math.min((kpis.sales.value / kpis.sales.goal) * 100, 100);

    return (
        <div className="h-full bg-[#050505] text-gray-100 font-sans relative flex flex-col">

            {/* HEADER */}
            <div className="sticky top-0 z-50 h-14 border-b border-white/5 bg-[#050505]/95 backdrop-blur-md flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${meetingState.active ? 'bg-purple-500 shadow-[0_0_12px_#A855F7]' : 'bg-green-500 shadow-[0_0_12px_#22c55e]'}`}></div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {meetingState.active ? <span className="text-purple-400">Governance Mode</span> : `BRAVVO OS • ${appData.clientName}`}
                    </span>
                </div>

                {/* Date Filter Pills */}
                <div className="flex items-center gap-1 bg-[#0A0A0A] rounded-lg border border-white/5 p-1">
                    {['today', 'tomorrow', 'week', 'month'].map(f => (
                        <button
                            key={f}
                            onClick={() => setDateFilter(f)}
                            className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all
                                ${dateFilter === f
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                        >
                            {f === 'today' ? 'Hoje' : f === 'tomorrow' ? 'Amanhã' : f === 'week' ? 'Semana' : 'Mês'}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    {/* History Button */}
                    <button
                        onClick={() => setShowHistory(true)}
                        className="h-8 px-3 rounded-lg text-xs font-bold bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
                        title="Histórico de Governança"
                    >
                        <History size={14} />
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={() => {
                            setCustomTheme(!customTheme);
                            // Apply theme via CSS variables
                            if (!customTheme && formData) {
                                document.documentElement.style.setProperty('--client-primary', formData.primaryColor || '#F97316');
                                document.documentElement.style.setProperty('--client-secondary', formData.secondaryColor || '#1E293B');
                                document.documentElement.style.setProperty('--client-accent', formData.accentColor || '#10B981');
                            } else {
                                document.documentElement.style.removeProperty('--client-primary');
                                document.documentElement.style.removeProperty('--client-secondary');
                                document.documentElement.style.removeProperty('--client-accent');
                            }
                        }}
                        className={`h-8 px-3 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${customTheme
                            ? 'bg-gradient-to-r from-pink-500/20 to-orange-500/20 text-orange-400 border-orange-500/50'
                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                            }`}
                        title="Personalizar Cores"
                    >
                        <Palette size={14} />
                        {customTheme ? 'ON' : ''}
                    </button>

                    {/* New Initiative */}
                    <button
                        onClick={() => setShowQuickAdd(true)}
                        className="h-8 px-4 rounded-lg text-xs font-bold bg-bravvo-primary text-white hover:bg-bravvo-primary/80 transition-all flex items-center gap-2"
                    >
                        <Plus size={14} />
                        NOVA
                    </button>

                    {/* Governance Mode / Save Meeting */}
                    {meetingState.active ? (
                        <button
                            onClick={handleSaveMeeting}
                            className="h-8 px-4 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 bg-purple-500 text-white border-purple-500 hover:bg-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-pulse"
                        >
                            <CheckCircle2 size={14} />
                            CONCLUIR REUNIÃO
                        </button>
                    ) : (
                        <button
                            onClick={toggleGovernanceMode}
                            className="h-8 px-4 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                        >
                            <Terminal size={14} />
                            REUNIÃO
                        </button>
                    )}
                </div>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">

                {/* SECTION 1: EDITABLE KPIs */}
                <div className="grid grid-cols-4 border-b border-white/5 bg-gradient-to-r from-[#080808] to-[#0A0A0A]">

                    {/* KPI: REVENUE */}
                    <div className="p-6 border-r border-white/5 group hover:bg-[#0C0C0C] transition-colors">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Faturamento</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${revenueProgress >= 100 ? 'text-green-400 bg-green-500/10 border-green-500/20' : revenueProgress >= 50 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                                {revenueProgress.toFixed(0)}%
                            </span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <InlineEdit
                                value={kpis.revenue.value}
                                onSave={(v) => setKpis({ ...kpis, revenue: { ...kpis.revenue, value: Number(v) } })}
                                type="number"
                                prefix="R$ "
                                className="text-xl font-semibold"
                            />
                            <div className="flex items-center gap-2">
                                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500" style={{ width: `${revenueProgress}%` }}></div>
                                </div>
                                <InlineEdit
                                    value={kpis.revenue.goal}
                                    onSave={(v) => setKpis({ ...kpis, revenue: { ...kpis.revenue, goal: Number(v) } })}
                                    type="number"
                                    prefix="Meta: R$ "
                                    className="text-[10px] text-gray-500 font-mono"
                                />
                            </div>
                            {meetingState.active && (
                                <textarea
                                    className="mt-3 w-full bg-[#111] border border-white/10 rounded p-2 text-xs text-gray-300 focus:border-purple-500 focus:outline-none resize-none"
                                    placeholder="Comentário sobre faturamento..."
                                    rows={2}
                                    value={meetingState.comments.revenue}
                                    onChange={(e) => updateComment('revenue', e.target.value)}
                                />
                            )}
                        </div>
                    </div>

                    {/* KPI: TRAFFIC COST */}
                    <div className="p-6 border-r border-white/5 group hover:bg-[#0C0C0C] transition-colors">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">CPM Tráfego</span>
                            <TrendingUp size={12} className="text-blue-500" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <InlineEdit
                                value={kpis.traffic.value}
                                onSave={(v) => setKpis({ ...kpis, traffic: { ...kpis.traffic, value: Number(v) } })}
                                type="number"
                                prefix="R$ "
                                className="text-xl font-semibold"
                            />
                            <div className="flex items-center gap-2">
                                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${Math.min((kpis.traffic.goal / kpis.traffic.value) * 100, 100)}%` }}></div>
                                </div>
                                <InlineEdit
                                    value={kpis.traffic.goal}
                                    onSave={(v) => setKpis({ ...kpis, traffic: { ...kpis.traffic, goal: Number(v) } })}
                                    type="number"
                                    prefix="Meta: R$ "
                                    className="text-[10px] text-gray-500 font-mono"
                                />
                            </div>
                            {meetingState.active && (
                                <textarea
                                    className="mt-3 w-full bg-[#111] border border-white/10 rounded p-2 text-xs text-gray-300 focus:border-purple-500 focus:outline-none resize-none"
                                    placeholder="Comentário sobre tráfego..."
                                    rows={2}
                                    value={meetingState.comments.traffic}
                                    onChange={(e) => updateComment('traffic', e.target.value)}
                                />
                            )}
                        </div>
                    </div>

                    {/* KPI: SALES */}
                    <div className="p-6 border-r border-white/5 group hover:bg-[#0C0C0C] transition-colors">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Vendas</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${salesProgress >= 100 ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-orange-400 bg-orange-500/10 border-orange-500/20'}`}>
                                {salesProgress >= 100 ? '🎯 META!' : `${salesProgress.toFixed(0)}%`}
                            </span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <InlineEdit
                                value={kpis.sales.value}
                                onSave={(v) => setKpis({ ...kpis, sales: { ...kpis.sales, value: Number(v) } })}
                                type="number"
                                className="text-xl font-semibold"
                            />
                            <div className="flex items-center gap-2">
                                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500" style={{ width: `${salesProgress}%` }}></div>
                                </div>
                                <InlineEdit
                                    value={kpis.sales.goal}
                                    onSave={(v) => setKpis({ ...kpis, sales: { ...kpis.sales, goal: Number(v) } })}
                                    type="number"
                                    prefix="Meta: "
                                    className="text-[10px] text-gray-500 font-mono"
                                />
                            </div>
                            {meetingState.active && (
                                <textarea
                                    className="mt-3 w-full bg-[#111] border border-white/10 rounded p-2 text-xs text-gray-300 focus:border-purple-500 focus:outline-none resize-none"
                                    placeholder="Comentário sobre vendas..."
                                    rows={2}
                                    value={meetingState.comments.sales}
                                    onChange={(e) => updateComment('sales', e.target.value)}
                                />
                            )}
                        </div>
                    </div>

                    {/* KPI: PRIORITY */}
                    <div className="p-6 bg-gradient-to-br from-blue-500/10 to-transparent group hover:from-blue-500/15 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Prioridade</span>
                            <Zap size={12} className="text-blue-400" />
                        </div>
                        <p className="text-sm font-bold text-white leading-relaxed mb-1">
                            {filteredCalendar[0]?.initiative || 'Sem prioridade'}
                        </p>
                        <p className="text-[10px] text-blue-300">
                            {filteredCalendar[0]?.date || 'Adicione uma iniciativa'}
                        </p>
                    </div>
                </div>

                {/* GENERAL STRATEGY NOTE (Visible only in Governance Mode) */}
                {meetingState.active && (
                    <div className="p-6 border-b border-white/5 bg-[#080808]">
                        <label className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2 block">
                            Notas Gerais da Estratégia / Plano de Ação
                        </label>
                        <textarea
                            className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-sm text-gray-200 focus:border-purple-500 focus:outline-none resize-none"
                            placeholder="Escreva aqui as observações gerais, mudanças de rota ou decisões tomadas nesta reunião..."
                            rows={3}
                            value={meetingState.comments.general}
                            onChange={(e) => updateComment('general', e.target.value)}
                        />
                    </div>
                )}

                {/* SECTION 2: TACTICAL CALENDAR - EXPANDED */}
                <div className="min-h-[500px] bg-[#050505]">
                    <div className="h-12 flex items-center justify-between px-6 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <CalendarIcon size={14} className="text-gray-500" />
                            <span className="text-xs font-bold text-gray-300 tracking-wide">CALENDÁRIO TÁTICO</span>
                            <span className="text-[10px] text-gray-600 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                {filteredCalendar.length} ITENS
                            </span>
                        </div>
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-[#080808]">
                                <th className="py-3 px-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest w-24">Data</th>
                                <th className="py-3 px-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest w-28">Canal</th>
                                <th className="py-3 px-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest w-20">Formato</th>
                                <th className="py-3 px-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Iniciativa</th>
                                <th className="py-3 px-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest w-20">Resp.</th>
                                <th className="py-3 px-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest w-28">Status</th>
                                <th className="py-3 px-4 w-36 text-right text-[10px] text-gray-500 font-bold uppercase tracking-widest">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCalendar.length > 0 ? (
                                filteredCalendar.map((item) => (
                                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] group transition-colors">
                                        <td className="py-3 px-4">
                                            <span className="font-mono text-xs text-gray-400">{item.date}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${item.channel?.includes('Reel') ? 'bg-pink-500' : item.channel?.includes('Stories') ? 'bg-purple-500' : item.channel?.includes('TikTok') ? 'bg-cyan-500' : 'bg-blue-500'}`}></div>
                                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wide">{item.channel?.replace('Instagram ', '')}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-xs">
                                                {formatIcons[item.format]?.icon || '📷'} {formatIcons[item.format]?.label || 'Post'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div>
                                                <span className="text-sm font-medium text-gray-200">{item.initiative}</span>
                                                {item.headline && (
                                                    <p className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[300px]">"{item.headline}"</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-xs text-gray-400">{item.responsible}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <StatusDropdown
                                                value={item.status}
                                                onChange={(newStatus) => handleStatusChange(item.id, newStatus)}
                                                options={statusOptions}
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditingItem(item)}
                                                    className="p-1.5 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                                                    title="Editar Detalhes"
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleMarkDone(item.id)}
                                                    className="p-1.5 rounded hover:bg-green-500/20 text-gray-500 hover:text-green-400 transition-colors"
                                                    title="Marcar como Feito"
                                                >
                                                    <Check size={14} />
                                                </button>
                                                <button
                                                    onClick={() => onGeneratePrompt && onGeneratePrompt(item)}
                                                    className="p-1.5 rounded hover:bg-purple-500/20 text-gray-500 hover:text-purple-400 transition-colors"
                                                    title="Gerar Brief de Produção (IA)"
                                                >
                                                    <Wand2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="p-1.5 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                                                    title="Remover"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <CalendarIcon size={32} className="text-gray-700" />
                                            <p className="text-sm text-gray-500">Nenhuma iniciativa para este período</p>
                                            <button
                                                onClick={() => setShowQuickAdd(true)}
                                                className="text-xs text-bravvo-primary hover:underline flex items-center gap-1"
                                            >
                                                <Plus size={12} />
                                                Adicionar nova
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* SECTION 3: VAULT CARDS */}
                <div className="p-6 border-t border-white/5 bg-[#080808]">
                    <div className="flex items-center gap-2 mb-4">
                        <LayoutDashboard size={14} className="text-gray-500" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Estrutura Estratégica</span>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { id: 'V1', label: 'BRAND', val: appData.vaults.S1.fields.archetype, color: 'text-red-400', hoverBorder: 'hover:border-red-500/40', bg: 'hover:bg-red-500/5' },
                            { id: 'V2', label: 'OFFER', val: appData.vaults.S2.products[0]?.name || 'Sem produto', color: 'text-orange-400', hoverBorder: 'hover:border-orange-500/40', bg: 'hover:bg-orange-500/5' },
                            { id: 'V3', label: 'TRAFFIC', val: appData.vaults.S3.traffic.primarySource, color: 'text-blue-400', hoverBorder: 'hover:border-blue-500/40', bg: 'hover:bg-blue-500/5' },
                            { id: 'V4', label: 'TEAM', val: appData.vaults.S4.matrix[0]?.who || 'Sem time', color: 'text-green-400', hoverBorder: 'hover:border-green-500/40', bg: 'hover:bg-green-500/5' },
                        ].map(v => (
                            <button
                                key={v.id}
                                onClick={() => setActiveTab(v.id)}
                                className={`bg-[#050505] border border-white/5 rounded-lg p-4 text-left transition-all duration-200 ${v.hoverBorder} ${v.bg} group`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.15em]">{v.label}</span>
                                    <span className={`text-[9px] font-mono font-bold ${v.color} opacity-50 group-hover:opacity-100`}>{v.id}</span>
                                </div>
                                <p className="text-sm font-medium text-gray-300 truncate group-hover:text-white transition-colors">{v.val}</p>
                                <div className="flex items-center gap-1 mt-2 text-[9px] text-gray-600 group-hover:text-gray-400">
                                    <Edit3 size={10} />
                                    <span>Clique para editar</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* SECTION 4: OPS STATUS */}
                <div className="p-6 pb-24 bg-[#050505]">
                    <div className="flex items-center gap-2 mb-4">
                        <Users size={14} className="text-gray-500" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status Operacional</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        {appData.dashboard.D3.map(task => (
                            <div key={task.id} className="flex items-center justify-between border-b border-white/5 py-2.5 group hover:bg-white/[0.02] px-2 rounded transition-colors">
                                <span className="text-sm text-gray-400 group-hover:text-gray-200">{task.task}</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-gray-600 uppercase">{task.owner}</span>
                                    <span className={`w-2 h-2 rounded-full ${task.status === 'Late' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MODALS */}
            <QuickAddModal
                open={showQuickAdd}
                onClose={() => setShowQuickAdd(false)}
                onAdd={handleAddItem}
            />

            <DetailEditModal
                open={!!editingItem}
                onClose={() => setEditingItem(null)}
                item={editingItem}
                onSave={handleSaveItem}
            />

            {/* GOVERNANCE HISTORY MODAL */}
            <GovernanceHistory
                open={showHistory}
                onClose={() => setShowHistory(false)}
                history={formData?.governanceHistory || []}
            />

            {/* LOADING OVERLAY */}
            {cycleProcessing && (
                <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-bold text-purple-400 animate-pulse tracking-widest uppercase">Processando Governança...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
