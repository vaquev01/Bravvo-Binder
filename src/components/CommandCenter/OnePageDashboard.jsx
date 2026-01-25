import React, { useState, useRef, useEffect } from 'react';
import {
    Target, ShoppingBag, GitBranch, Users, LayoutDashboard, Clock, Terminal,
    CheckCircle2, Calendar as CalendarIcon, BarChart3, Wand2, Edit3, Check, X,
    Plus, Trash2, ChevronDown, MoreHorizontal, ArrowRight, Zap, TrendingUp,
    Eye, Copy, Video, Image as ImageIcon, FileText, ExternalLink, Settings2,
    History, Palette
} from 'lucide-react';
import { GovernanceHistory } from './GovernanceHistory';
import { Accordion, AccordionGroup } from '../ui/Accordion';
import { useToast } from '../../contexts/ToastContext';

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
                {prefix && <span className="text-gray-500 text-xs">{prefix}</span>}
                <input
                    ref={inputRef}
                    type={type}
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className={`bg-black/50 border border-purple-500/50 rounded px-1 min-w-[60px] text-white focus:outline-none ${className}`}
                />
                {suffix && <span className="text-gray-500 text-xs">{suffix}</span>}
            </div>
        );
    }

    return (
        <span
            onClick={() => setEditing(true)}
            className={`cursor-pointer hover:bg-white/10 px-1 rounded transition-colors group relative ${className}`}
            title="Click to edit"
        >
            {prefix}{value}{suffix}
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

    const statusColors = {
        scheduled: 'bg-green-500',
        draft: 'bg-gray-500',
        in_production: 'bg-yellow-500',
        done: 'bg-blue-500',
        cancelled: 'bg-red-500',
    };

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 transition-colors"
            >
                <div className={`w-1.5 h-1.5 rounded-full ${statusColors[value] || 'bg-gray-500'}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
                    {value.replace('_', ' ')}
                </span>
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-1 bg-[#111] border border-white/10 rounded-lg shadow-xl z-50 min-w-[140px] py-1 overflow-hidden">
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                            className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${opt.color.replace('bg-', 'bg-')}`}></span>
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Detailed Edit Modal (Kept mostly same but restyled)
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
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-lg w-full max-w-2xl animate-fadeIn flex flex-col max-h-[90vh] shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-white/10 bg-[#0A0A0A]">
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Edit Initiative</h3>
                        <p className="text-[10px] text-gray-500 font-mono">ID: {item.id}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white p-2">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-label">Title</label>
                            <input
                                required
                                className="premium-input bg-[#111]"
                                value={form.initiative || ''}
                                onChange={e => setForm({ ...form, initiative: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-label">Date</label>
                                <input
                                    type="date"
                                    className="premium-input bg-[#111]"
                                    value={form.date || ''}
                                    onChange={e => setForm({ ...form, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-label">Channel</label>
                                <select
                                    className="premium-input bg-[#111]"
                                    value={form.channel || 'Instagram Feed'}
                                    onChange={e => setForm({ ...form, channel: e.target.value })}
                                >
                                    <option value="Instagram Feed">Instagram Feed</option>
                                    <option value="Instagram Reels">Instagram Reels</option>
                                    <option value="Instagram Stories">Instagram Stories</option>
                                    <option value="TikTok">TikTok</option>
                                    <option value="WhatsApp Status">WhatsApp Status</option>
                                    <option value="Google Ads">Google Ads</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-label">Copy</label>
                            <textarea
                                className="premium-input bg-[#111] min-h-[100px]"
                                placeholder="Caption..."
                                value={form.caption || ''}
                                onChange={e => setForm({ ...form, caption: e.target.value })}
                            />
                        </div>
                    </div>
                </form>

                <div className="p-4 border-t border-white/10 bg-[#0A0A0A] flex justify-end gap-2">
                    <button onClick={onClose} className="btn-ghost">Cancel</button>
                    <button onClick={handleSubmit} className="btn-primary">Save Changes</button>
                </div>
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
            <div className="bg-[#0A0A0A] border border-white/10 rounded-lg w-full max-w-lg p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">New Initiative</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={16} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-label">Title</label>
                        <input
                            required
                            className="premium-input"
                            value={form.initiative}
                            onChange={e => setForm({ ...form, initiative: e.target.value })}
                            placeholder="e.g. Summer Launch Post"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-label">Date</label>
                            <input
                                type="date"
                                className="premium-input"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-label">Channel</label>
                            <select
                                className="premium-input"
                                value={form.channel}
                                onChange={e => setForm({ ...form, channel: e.target.value })}
                            >
                                <option>Instagram Feed</option>
                                <option>Instagram Reels</option>
                                <option>TikTok</option>
                                <option>WhatsApp</option>
                            </select>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
                        <button type="submit" className="btn-primary">Create Item</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

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
    const { addToast } = useToast();

    // UI State
    const [cycleProcessing, setCycleProcessing] = useState(false);
    const [dateFilter, setDateFilter] = useState('week');
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showHistory, setShowHistory] = useState(false);

    // Editable KPI State
    const [kpis, setKpis] = useState({
        revenue: { value: 32500, goal: 50000 },
        traffic: { value: 12, goal: 15 },
        sales: { value: 154, goal: 120 },
    });

    const updateComment = (field, value) => {
        setMeetingState(prev => ({
            ...prev,
            comments: { ...prev.comments, [field]: value }
        }));
    };

    const toggleGovernanceMode = () => {
        const newActive = !meetingState.active;
        setMeetingState(prev => ({ ...prev, active: newActive }));
        if (newActive) addToast({ title: 'Governance Mode Active', type: 'info' });
    };

    const statusOptions = [
        { value: 'draft', label: 'Draft', color: 'bg-gray-500' },
        { value: 'in_production', label: 'In Prod', color: 'bg-yellow-500' },
        { value: 'scheduled', label: 'Scheduled', color: 'bg-green-500' },
        { value: 'done', label: 'Published', color: 'bg-blue-500' },
        { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
    ];

    const formatIcons = {
        post: { icon: '📷', label: 'Post' },
        reel: { icon: '🎬', label: 'Reel' },
        story: { icon: '📱', label: 'Story' },
        carousel: { icon: '🎠', label: 'Carousel' },
        ad: { icon: '💰', label: 'Ad' },
    };

    const getFilteredData = () => {
        const d2Items = appData.dashboard?.D2 || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        return d2Items.filter(item => {
            if (!item.date) return false;
            const itemDateStr = item.date;
            const todayStr = today.toISOString().split('T')[0];
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            const itemDate = new Date(item.date);
            itemDate.setHours(0, 0, 0, 0);

            if (dateFilter === 'today') return itemDateStr === todayStr;
            if (dateFilter === 'tomorrow') return itemDateStr === tomorrowStr;
            if (dateFilter === 'week') return itemDate <= nextWeek && itemDate >= today;
            return true;
        });
    };

    const filteredCalendar = getFilteredData();

    const handleStatusChange = (itemId, newStatus) => {
        const updatedD2 = appData.dashboard.D2.map(item =>
            item.id === itemId ? { ...item, status: newStatus } : item
        );
        setAppData({ ...appData, dashboard: { ...appData.dashboard, D2: updatedD2 } });
    };

    const handleSaveItem = (updatedItem) => {
        const updatedD2 = appData.dashboard.D2.map(item =>
            item.id === updatedItem.id ? updatedItem : item
        );
        setAppData({ ...appData, dashboard: { ...appData.dashboard, D2: updatedD2 } });
        addToast({ title: 'Item Saved', type: 'success' });
    };

    const handleAddItem = (newItem) => {
        const safeItem = {
            ...newItem,
            id: newItem.id || `NEW-${Date.now()}`
        };
        setAppData({
            ...appData,
            dashboard: { ...appData.dashboard, D2: [...(appData.dashboard.D2 || []), safeItem] }
        });
        addToast({ title: 'Item Created', type: 'success' });
    };

    const handleDeleteItem = (itemId) => {
        if (!confirm('Cancel this initiative?')) return;
        const updatedD2 = (appData.dashboard.D2 || []).filter(item => item.id !== itemId);
        setAppData({ ...appData, dashboard: { ...appData.dashboard, D2: updatedD2 } });
    };

    const handleSaveMeeting = () => {
        setCycleProcessing(true);
        setTimeout(() => {
            setCycleProcessing(false);
            setMeetingState({ active: false, comments: { general: '', revenue: '', traffic: '', sales: '' } });
            addToast({ title: 'Meeting Copied to Chain', type: 'success' });
        }, 1000);
    };

    return (
        <div className="h-full bg-[var(--bg-deep)] text-[var(--text-primary)] font-sans relative flex flex-col selection:bg-white/20">

            {/* HEADER - Linear Style */}
            <div className="h-12 border-b border-[var(--border-subtle)] bg-[var(--bg-deep)] flex items-center justify-between px-4 shrink-0 transition-colors sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-2 py-1 hover:bg-white/5 rounded cursor-pointer transition-colors">
                        <div className={`w-2 h-2 rounded-full ${meetingState.active ? 'bg-purple-500 animate-pulse' : 'bg-green-500'}`}></div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-white transition-colors">
                            {meetingState.active ? 'Governance Active' : appData.clientName}
                        </span>
                    </div>
                </div>

                {/* Segmented Control for Date */}
                <div className="flex items-center bg-[var(--bg-surface)] p-0.5 rounded border border-[var(--border-subtle)]">
                    {['today', 'tomorrow', 'week', 'month'].map(f => (
                        <button
                            key={f}
                            onClick={() => setDateFilter(f)}
                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all ${dateFilter === f
                                ? 'bg-white text-black shadow-sm'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => setShowHistory(true)} className="btn-ghost !h-7 !px-2" title="History">
                        <History size={14} />
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-1"></div>
                    <button onClick={() => setShowQuickAdd(true)} className="btn-primary !h-7 !px-3">
                        <Plus size={14} /> New
                    </button>
                    {meetingState.active ? (
                        <button onClick={handleSaveMeeting} className="ml-2 h-7 px-3 bg-purple-600 text-white text-[10px] font-bold rounded animate-pulse">
                            COMMIT
                        </button>
                    ) : (
                        <button onClick={toggleGovernanceMode} className="ml-2 btn-ghost !h-7 !px-3 !border-purple-500/30 text-purple-400 hover:text-purple-300">
                            <Terminal size={12} className="mr-1" /> RUN GOV
                        </button>
                    )}
                </div>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

                {/* 1. KPIs - Bento Row */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bento-grid p-4 bento-cell">
                        <div className="flex justify-between mb-4">
                            <span className="text-label">Revenue</span>
                            <span className="text-mono-data text-green-500">+12%</span>
                        </div>
                        <InlineEdit
                            value={kpis.revenue.value}
                            onSave={(v) => setKpis(prev => ({ ...prev, revenue: { ...prev.revenue, value: v } }))}
                            className="text-2xl font-mono font-medium text-white tracking-tight"
                            prefix="R$ "
                        />
                        <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: '65%' }}></div>
                        </div>
                    </div>

                    <div className="bento-grid p-4 bento-cell">
                        <div className="flex justify-between mb-4">
                            <span className="text-label">Traffic CPM</span>
                            <TrendingUp size={12} className="text-blue-500" />
                        </div>
                        <InlineEdit
                            value={kpis.traffic.value}
                            onSave={(v) => setKpis(prev => ({ ...prev, traffic: { ...prev.traffic, value: v } }))}
                            className="text-2xl font-mono font-medium text-white tracking-tight"
                            prefix="R$ "
                        />
                        <div className="mt-2 text-[10px] text-gray-500 font-mono">
                            Goal: R$ {kpis.traffic.goal}
                        </div>
                    </div>

                    <div className="bento-grid p-4 bento-cell">
                        <div className="flex justify-between mb-4">
                            <span className="text-label">Sales Vol</span>
                            <ShoppingBag size={12} className="text-orange-500" />
                        </div>
                        <InlineEdit
                            value={kpis.sales.value}
                            onSave={(v) => setKpis(prev => ({ ...prev, sales: { ...prev.sales, value: v } }))}
                            className="text-2xl font-mono font-medium text-white tracking-tight"
                        />
                        <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500" style={{ width: '82%' }}></div>
                        </div>
                    </div>

                    <div className="bento-grid p-4 bento-cell bg-gradient-to-br from-[var(--bg-surface)] to-blue-900/10">
                        <div className="flex justify-between mb-2">
                            <span className="text-label text-blue-400">Next Priority</span>
                            <Zap size={12} className="text-blue-500" />
                        </div>
                        <div className="text-sm font-medium text-white truncate">
                            {filteredCalendar[0]?.initiative || 'No Items Scheduled'}
                        </div>
                    </div>
                </div>

                {/* 2. TACTICAL GRID (The "Linear" List) */}
                <div className="bento-grid mb-6">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                        <div className="flex items-center gap-2">
                            <CalendarIcon size={14} className="text-gray-500" />
                            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">Tactical Roadmap</span>
                            <span className="bg-white/5 text-gray-500 text-[9px] px-1.5 py-0.5 rounded font-mono border border-white/5">{filteredCalendar.length}</span>
                        </div>
                        {/* Keyboard Hint */}
                        <div className="flex items-center gap-1.5 opacity-50">
                            <span className="text-[9px] text-gray-600 font-medium">Quick Actions</span>
                            <kbd className="hidden sm:inline-flex h-4 items-center gap-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-deep)] px-1.5 font-mono text-[9px] font-medium text-[var(--text-secondary)]">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </div>
                    </div>

                    {/* Table Header */}
                    <div className="grid grid-cols-[100px_1fr_150px_120px_120px_60px] gap-4 px-4 py-2 border-b border-[var(--border-subtle)] bg-[#080808]">
                        <div className="text-label">Date</div>
                        <div className="text-label">Initiative</div>
                        <div className="text-label">Channel</div>
                        <div className="text-label">Status</div>
                        <div className="text-label">Owner</div>
                        <div className="text-label text-right">Edit</div>
                    </div>

                    {/* Table Body */}
                    <div className="bg-[var(--bg-deep)]">
                        {filteredCalendar.map((item) => (
                            <div key={item.id} className="grid grid-cols-[100px_1fr_150px_120px_120px_60px] gap-4 px-4 py-3 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] group transition-all duration-200 items-center hover:pl-5">
                                <div className="text-mono-data text-gray-400 group-hover:text-white transition-colors">
                                    {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                </div>
                                <div className="text-sm font-medium text-white truncate pr-4 group-hover:translate-x-1 transition-transform">
                                    {item.initiative}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                                    <span>{formatIcons[item.format]?.icon}</span>
                                    <span className="truncate">{item.channel}</span>
                                </div>
                                <div>
                                    <StatusDropdown
                                        value={item.status}
                                        onChange={(newStatus) => handleStatusChange(item.id, newStatus)}
                                        options={statusOptions}
                                    />
                                </div>
                                <div className="text-xs text-gray-600 truncate">
                                    {item.responsible || ' Unassigned'}
                                </div>
                                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditingItem(item)} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transform group-hover:scale-110 transition-transform">
                                        <Edit3 size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredCalendar.length === 0 && (
                            <div className="py-12 flex flex-col items-center justify-center text-gray-600 animate-fadeInUp">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <CalendarIcon size={20} opacity={0.5} />
                                </div>
                                <p className="text-xs">No initiatives found for this period</p>
                                <button onClick={() => setShowQuickAdd(true)} className="mt-4 text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                                    <Plus size={10} /> Add Item
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. VAULTS & RESOURCES */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { id: 'V1', label: 'BRAND DNA', val: appData.vaults.S1.fields.archetype, class: 'border-l-2 border-red-500/50' },
                        { id: 'V2', label: 'OFFER', val: appData.vaults.S2.products[0]?.name || 'N/A', class: 'border-l-2 border-orange-500/50' },
                        { id: 'V3', label: 'TRAFFIC', val: appData.vaults.S3.traffic.primarySource, class: 'border-l-2 border-blue-500/50' },
                        { id: 'V4', label: 'TEAM', val: appData.vaults.S4.matrix[0]?.who || 'N/A', class: 'border-l-2 border-green-500/50' },
                    ].map(v => (
                        <div key={v.id} onClick={() => setActiveTab(v.id)} className={`bento-grid p-4 hover:bg-[var(--bg-surface)] cursor-pointer transition-colors ${v.class}`}>
                            <div className="text-label mb-2">{v.label}</div>
                            <div className="text-sm font-medium text-white truncate">{v.val}</div>
                            <div className="mt-2 text-[10px] text-gray-600 font-mono">VAULT {v.id}</div>
                        </div>
                    ))}
                </div>

                {/* Modal Mounts */}
                <QuickAddModal open={showQuickAdd} onClose={() => setShowQuickAdd(false)} onAdd={handleAddItem} />
                <DetailEditModal open={!!editingItem} onClose={() => setEditingItem(null)} item={editingItem || {}} onSave={handleSaveItem} />
                <GovernanceHistory open={showHistory} onClose={() => setShowHistory(false)} history={formData?.governanceHistory || []} />
            </div>
        </div>
    );
}
