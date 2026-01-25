import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
    ShoppingBag,
    Terminal,
    Calendar as CalendarIcon,
    Edit3,
    X,
    Plus,
    Zap,
    TrendingUp,
    History,
    Share2,
    MessageCircle
} from 'lucide-react';
import { GovernanceHistory } from './GovernanceHistory';
import { useToast } from '../../contexts/ToastContext';

// ... (InlineEdit and StatusDropdown components remain unchanged)

// Detailed Edit Modal (Kept mostly same but restyled)
// ... (DetailEditModal and QuickAddModal remain unchanged)

export function OnePageDashboard({
    appData,
    setAppData,
    setActiveTab,
    formData,
    meetingState,
    setMeetingState
}) {
    const { t } = useLanguage();
    const { addToast } = useToast();

    // UI State
    const [, setCycleProcessing] = useState(false);
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

    const handleSaveMeeting = () => {
        setCycleProcessing(true);
        setTimeout(() => {
            setCycleProcessing(false);
            setMeetingState({ active: false, comments: { general: '', revenue: '', traffic: '', sales: '' } });
            addToast({ title: 'Meeting Copied to Chain', type: 'success' });
        }, 1000);
    };

    // --- INTEGRATIONS: DEEP LINKS ---
    const sendApprovalRequest = (item, e) => {
        e.stopPropagation(); // Prevent row click
        
        const clientPhone = appData?.vaults?.S4?.contacts?.emergency || ''; // Fallback contact
        // In a real app, this would be the approver's phone
        
        const text = `*BRAVVO APPROVAL REQUEST*\n\n📝 *Initiative:* ${item.initiative}\n📅 *Date:* ${item.date}\n📺 *Channel:* ${item.channel}\n\nPor favor, aprovar ou comentar.\n(Link da Arte: https://bravvo.os/p/${item.id})`;
        
        // Use wa.me with pre-filled text
        const url = `https://wa.me/${clientPhone.replace(/\D/g,'')}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        
        addToast({ title: 'WhatsApp Aberto', description: 'Mensagem de aprovação pré-preenchida.', type: 'success' });
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
                <div className="hidden md:flex items-center bg-[var(--bg-surface)] p-0.5 rounded border border-[var(--border-subtle)]">
                    {['today', 'tomorrow', 'week', 'month'].map(f => (
                        <button
                            key={f}
                            onClick={() => setDateFilter(f)}
                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all ${dateFilter === f
                                ? 'bg-white text-black shadow-sm'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {t(`os.date.${f}`)}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => setShowHistory(true)} className="btn-ghost !h-7 !px-2" title={t('os.actions.history')}>
                        <History size={14} />
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-1"></div>
                    <button onClick={() => setShowQuickAdd(true)} className="btn-primary !h-7 !px-3">
                        <Plus size={14} /> <span className="hidden md:inline ml-1">{t('os.actions.new')}</span>
                    </button>
                    {meetingState.active ? (
                        <button onClick={handleSaveMeeting} className="ml-2 h-7 px-3 bg-purple-600 text-white text-[10px] font-bold rounded animate-pulse">
                            {t('os.actions.commit')}
                        </button>
                    ) : (
                        <button onClick={toggleGovernanceMode} className="ml-2 btn-ghost !h-7 !px-3 !border-purple-500/30 text-purple-400 hover:text-purple-300">
                            <Terminal size={12} className="md:mr-1" /> <span className="hidden md:inline">{t('os.actions.run_gov')}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">

                {/* 1. KPIs - Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bento-grid p-4 bento-cell">
                        <div className="flex justify-between mb-4">
                            <span className="text-label">{t('os.kpis.revenue')}</span>
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
                            <span className="text-label">{t('os.kpis.traffic')}</span>
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
                            <span className="text-label">{t('os.kpis.sales')}</span>
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
                            <span className="text-label text-blue-400">{t('os.kpis.next_priority')}</span>
                            <Zap size={12} className="text-blue-500" />
                        </div>
                        <div className="text-sm font-medium text-white truncate">
                            {filteredCalendar[0]?.initiative || t('os.kpis.no_items_scheduled')}
                        </div>
                    </div>
                </div>

                {/* 2. TACTICAL GRID (The "Linear" List) */}
                <div className="bento-grid mb-6 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                        <div className="flex items-center gap-2">
                            <CalendarIcon size={14} className="text-gray-500" />
                            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">{t('os.roadmap.title')}</span>
                            <span className="bg-white/5 text-gray-500 text-[9px] px-1.5 py-0.5 rounded font-mono border border-white/5">{filteredCalendar.length}</span>
                        </div>
                        {/* Keyboard Hint */}
                        <div className="flex items-center gap-1.5 opacity-50">
                            <span className="text-[9px] text-gray-600 font-medium hidden sm:inline">{t('os.roadmap.quick_actions')}</span>
                            <kbd className="hidden sm:inline-flex h-4 items-center gap-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-deep)] px-1.5 font-mono text-[9px] font-medium text-[var(--text-secondary)]">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </div>
                    </div>

                    {/* Table Container with Horizontal Scroll */}
                    <div className="overflow-x-auto custom-scrollbar">
                        <div className="min-w-[800px]">
                            {/* Table Header */}
                            <div className="grid grid-cols-[100px_1fr_150px_120px_120px_100px] gap-4 px-4 py-2 border-b border-[var(--border-subtle)] bg-[#080808]">
                                <div className="text-label">{t('os.table.date')}</div>
                                <div className="text-label">{t('os.table.initiative')}</div>
                                <div className="text-label">{t('os.table.channel')}</div>
                                <div className="text-label">{t('os.table.status')}</div>
                                <div className="text-label">{t('os.table.owner')}</div>
                                <div className="text-label text-right">{t('os.table.edit')}</div>
                            </div>

                            {/* Table Body */}
                            <div className="bg-[var(--bg-deep)]">
                                {filteredCalendar.map((item) => (
                                    <div key={item.id} className="grid grid-cols-[100px_1fr_150px_120px_120px_100px] gap-4 px-4 py-3 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] group transition-all duration-200 items-center hover:pl-5">
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
                                            {item.responsible || t('os.table.unassigned')}
                                        </div>
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* WhatsApp Approval Button */}
                                            <button 
                                                onClick={(e) => sendApprovalRequest(item, e)} 
                                                className="p-1.5 hover:bg-green-500/20 rounded text-gray-400 hover:text-green-400 transform hover:scale-110 transition-all"
                                                title="Solicitar Aprovação (WhatsApp)"
                                            >
                                                <MessageCircle size={12} />
                                            </button>
                                            
                                            <button 
                                                onClick={() => setEditingItem(item)} 
                                                className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transform hover:scale-110 transition-all"
                                                title="Editar"
                                            >
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
                                        <p className="text-xs">{t('os.roadmap.no_items')}</p>
                                        <button onClick={() => setShowQuickAdd(true)} className="mt-4 text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                                            <Plus size={10} /> {t('os.roadmap.add_item')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. VAULTS & RESOURCES - Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { id: 'V1', label: t('os.vaults.brand_dna'), val: appData?.vaults?.S1?.fields?.archetype || 'N/A', class: 'border-l-2 border-red-500/50' },
                        { id: 'V2', label: t('os.vaults.offer'), val: appData?.vaults?.S2?.products?.[0]?.name || 'N/A', class: 'border-l-2 border-orange-500/50' },
                        { id: 'V3', label: t('os.vaults.traffic'), val: appData?.vaults?.S3?.traffic?.primarySource || 'N/A', class: 'border-l-2 border-blue-500/50' },
                        { id: 'V4', label: t('os.vaults.team'), val: appData?.vaults?.S4?.matrix?.[0]?.who || 'N/A', class: 'border-l-2 border-green-500/50' },
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
