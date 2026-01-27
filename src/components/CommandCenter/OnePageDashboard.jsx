import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
    Calendar as CalendarIcon,
    Edit3,
    X,
    Plus,
    Wand2,
    History,
    MessageCircle,
    Upload,
    Book,
    Palette,
    Trash2
} from 'lucide-react';
import { formatHumanDate } from './DaySummary';
import { OnboardingChecklist } from '../ui/OnboardingChecklist';
import { InsightCards } from '../ui/InsightCards';
import { EmptyState } from '../ui/EmptyState';
import { Drawer } from '../ui/Drawer';
import { SkeletonDashboard } from '../ui/Skeleton';
import { GovernanceHistory } from './GovernanceHistory';
import { ImportDataModal } from './ImportDataModal';
import { PlaybookModal } from './PlaybookModal';
import { CreativeStudioModal } from './CreativeStudioModal';
import { GovernanceModal } from './GovernanceModal';
import { GovernanceModeModal } from './GovernanceModeModal';
import { GovernanceHeader } from './GovernanceHeader';
import { KPIGrid } from './KPICard';
import { PriorityActionsCard } from './PriorityActionsCard';
import { VaultCards } from './VaultCards';
import { useToast } from '../../contexts/ToastContext';
import { getFeatureFlag } from '../../utils/featureFlags';
import { useUndo } from '../../hooks/useUndo';
import { generateNextGovernanceWindow } from '../../services/governanceService';
import { storageService } from '../../services/storageService';
import {
    listChannels,
    listSubchannels,
    getDefaultSubchannelId,
    toLegacyChannelLabel,
    getDefaultContentType,
    parseLegacyChannelLabel
} from '../../services/channelTaxonomy';

// Inline Editable Component (kept for future roadmap inline edits)
function _InlineEdit({ value, onSave, type = 'text', prefix = '', suffix = '', className = '', disabled = false }) {
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
            onClick={() => !disabled && setEditing(true)}
            className={`${disabled ? 'cursor-default opacity-90' : 'cursor-pointer hover:bg-white/10'} px-1 rounded transition-colors group relative ${className}`}
            title={disabled ? "Habilite o Modo Governança para editar" : "Clique para editar"}
        >
            {prefix}{value}{suffix}
        </span>
    );
}

function QuickAddForm({ onAdd, onClose }) {
    const { t } = useLanguage();
    const [form, setForm] = useState({
        initiative: '',
        microDescription: '',
        channelId: 'instagram',
        subchannelId: 'feed',
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
            microDescription: '',
            channelId: 'instagram',
            subchannelId: 'feed',
            channel: 'Instagram Feed',
            format: 'post',
            date: new Date().toISOString().split('T')[0],
            responsible: '',
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-label">{t('os.quick_add.title_label')}</label>
                <input
                    required
                    className="premium-input"
                    value={form.initiative}
                    onChange={e => setForm({ ...form, initiative: e.target.value })}
                    placeholder={t('os.quick_add.placeholder')}
                    data-testid="quickadd-initiative"
                />
            </div>
            <div>
                <label className="text-label">Micro descrição</label>
                <input
                    className="premium-input"
                    value={form.microDescription}
                    onChange={e => setForm({ ...form, microDescription: e.target.value })}
                    placeholder="1 linha: objetivo / CTA / detalhe"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-label">{t('os.quick_add.date_label')}</label>
                    <input
                        type="date"
                        className="premium-input"
                        value={form.date}
                        onChange={e => setForm({ ...form, date: e.target.value })}
                        data-testid="quickadd-date"
                    />
                </div>
                <div>
                    <label className="text-label">{t('os.quick_add.channel_label')}</label>
                    <div className="grid grid-cols-2 gap-2">
                        <select
                            className="premium-input"
                            value={form.channelId}
                            onChange={e => {
                                const nextChannelId = e.target.value;
                                const nextSubchannelId = getDefaultSubchannelId(nextChannelId);
                                setForm(prev => ({
                                    ...prev,
                                    channelId: nextChannelId,
                                    subchannelId: nextSubchannelId,
                                    channel: toLegacyChannelLabel(nextChannelId, nextSubchannelId),
                                    format: getDefaultContentType(nextChannelId, nextSubchannelId)
                                }));
                            }}
                        >
                            {listChannels().map(c => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                        </select>
                        <select
                            className="premium-input"
                            value={form.subchannelId}
                            onChange={e => {
                                const nextSub = e.target.value;
                                const nextChannelId = form.channelId;
                                setForm(prev => ({
                                    ...prev,
                                    subchannelId: nextSub,
                                    channel: toLegacyChannelLabel(nextChannelId, nextSub),
                                    format: getDefaultContentType(nextChannelId, nextSub)
                                }));
                            }}
                        >
                            {listSubchannels(form.channelId).map(sc => (
                                <option key={sc.id} value={sc.id}>{sc.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            <div>
                <label className="text-label">Responsável</label>
                <input
                    className="premium-input"
                    value={form.responsible}
                    onChange={e => setForm({ ...form, responsible: e.target.value })}
                    placeholder="Quem executa?"
                />
            </div>
            <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={onClose} className="btn-ghost">{t('common.cancel')}</button>
                <button type="submit" className="btn-primary" data-testid="quickadd-submit">{t('os.quick_add.create_button')}</button>
            </div>
        </form>
    );
}

// Status Dropdown Component
function StatusDropdown({ value, onChange, options, testId }) {
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
        pending: 'bg-yellow-500',
        in_production: 'bg-yellow-500',
        done: 'bg-blue-500',
        delayed: 'bg-red-500',
        cancelled: 'bg-gray-500',
    };

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 transition-colors"
                data-testid={testId ? `${testId}-trigger` : undefined}
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
                            data-testid={testId ? `${testId}-opt-${opt.value}` : undefined}
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

function DetailEditForm({ item, onSave, onClose }) {
    const { t } = useLanguage();
    const [form, setForm] = useState(item || {});

    useEffect(() => {
        if (!item) return;
        const parsed = parseLegacyChannelLabel(item.channel || 'Instagram Feed');
        const channelId = item.channelId || parsed.channelId;
        const subchannelId = item.subchannelId || parsed.subchannelId || getDefaultSubchannelId(channelId);
        const nextChannel = item.channel || toLegacyChannelLabel(channelId, subchannelId);
        const nextFormat = item.format || getDefaultContentType(channelId, subchannelId);
        setForm({
            ...item,
            channelId,
            subchannelId,
            channel: nextChannel,
            format: nextFormat
        });
    }, [item]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                <div className="space-y-4">
                <div>
                    <label className="text-label">{t('os.detail_edit.title_label')}</label>
                    <input
                        required
                        className="premium-input bg-[#111]"
                        value={form.initiative || ''}
                        onChange={e => setForm({ ...form, initiative: e.target.value })}
                        data-testid="detail-edit-initiative"
                    />
                </div>
                <div>
                    <label className="text-label">Micro descrição</label>
                    <input
                        className="premium-input bg-[#111]"
                        value={form.microDescription || ''}
                        onChange={e => setForm({ ...form, microDescription: e.target.value })}
                        placeholder="1 linha: objetivo / CTA / detalhe"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-label">Objetivo</label>
                        <input
                            className="premium-input bg-[#111]"
                            value={form.objective || ''}
                            onChange={e => setForm({ ...form, objective: e.target.value })}
                            placeholder="Qual é o objetivo desta atividade?"
                        />
                    </div>
                    <div>
                        <label className="text-label">CTA</label>
                        <input
                            className="premium-input bg-[#111]"
                            value={form.ctaText || ''}
                            onChange={e => setForm({ ...form, ctaText: e.target.value })}
                            placeholder="Ex: Chamar no WhatsApp"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-label">Dependências</label>
                        <input
                            className="premium-input bg-[#111]"
                            value={form.dependencies || ''}
                            onChange={e => setForm({ ...form, dependencies: e.target.value })}
                            placeholder="Ex: aprovação do dono / fotos"
                        />
                    </div>
                    <div>
                        <label className="text-label">Critério de sucesso</label>
                        <input
                            className="premium-input bg-[#111]"
                            value={form.successCriteria || ''}
                            onChange={e => setForm({ ...form, successCriteria: e.target.value })}
                            placeholder="Ex: 30 cliques / 5 reservas"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-label">{t('os.detail_edit.date_label')}</label>
                        <input
                            type="date"
                            className="premium-input bg-[#111]"
                            value={form.date || ''}
                            onChange={e => setForm({ ...form, date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-label">Responsável</label>
                        <input
                            className="premium-input bg-[#111]"
                            value={form.responsible || ''}
                            onChange={e => setForm({ ...form, responsible: e.target.value })}
                            placeholder="Quem executa?"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-label">{t('os.detail_edit.channel_label')}</label>
                        <div className="grid grid-cols-2 gap-2">
                            <select
                                className="premium-input bg-[#111]"
                                value={form.channelId || 'instagram'}
                                onChange={e => {
                                    const nextChannelId = e.target.value;
                                    const nextSubchannelId = getDefaultSubchannelId(nextChannelId);
                                    setForm(prev => ({
                                        ...prev,
                                        channelId: nextChannelId,
                                        subchannelId: nextSubchannelId,
                                        channel: toLegacyChannelLabel(nextChannelId, nextSubchannelId),
                                        format: getDefaultContentType(nextChannelId, nextSubchannelId)
                                    }));
                                }}
                            >
                                {listChannels().map(c => (
                                    <option key={c.id} value={c.id}>{c.label}</option>
                                ))}
                            </select>
                            <select
                                className="premium-input bg-[#111]"
                                value={form.subchannelId || getDefaultSubchannelId(form.channelId || 'instagram') || ''}
                                onChange={e => {
                                    const nextSub = e.target.value;
                                    const nextChannelId = form.channelId || 'instagram';
                                    setForm(prev => ({
                                        ...prev,
                                        subchannelId: nextSub,
                                        channel: toLegacyChannelLabel(nextChannelId, nextSub),
                                        format: getDefaultContentType(nextChannelId, nextSub)
                                    }));
                                }}
                            >
                                {listSubchannels(form.channelId || 'instagram').map(sc => (
                                    <option key={sc.id} value={sc.id}>{sc.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="text-label">{t('os.detail_edit.copy_label')}</label>
                    <textarea
                        className="premium-input bg-[#111] min-h-[100px]"
                        placeholder={t('os.detail_edit.copy_placeholder')}
                        value={form.caption || ''}
                        onChange={e => setForm({ ...form, caption: e.target.value })}
                        data-testid="detail-edit-caption"
                    />
                </div>
                </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-[#0A0A0A] flex justify-end gap-2">
                <button type="button" onClick={onClose} className="btn-ghost">{t('common.cancel')}</button>
                <button type="submit" className="btn-primary" data-testid="detail-edit-save">
                    {t('os.detail_edit.save')}
                </button>
            </div>
        </form>
    );
}

function DetailEditModal({ open, onClose, item, onSave }) {
    const { t } = useLanguage();
    if (!open || !item) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" data-testid="detail-edit-modal">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-lg w-full max-w-2xl animate-fadeIn flex flex-col max-h-[90vh] shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-white/10 bg-[#0A0A0A]">
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">{t('os.detail_edit.title')}</h3>
                        <p className="text-[10px] text-gray-500 font-mono">ID: {item.id}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white p-2">
                        <X size={16} />
                    </button>
                </div>

                <DetailEditForm item={item} onSave={onSave} onClose={onClose} />
            </div>
        </div>
    );
}

// Quick Add Modal
function QuickAddModal({ open, onClose, onAdd }) {
    const { t } = useLanguage();

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" data-testid="quickadd-modal">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-lg w-full max-w-lg p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">{t('os.quick_add.title')}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={16} /></button>
                </div>
                <QuickAddForm onAdd={onAdd} onClose={onClose} />
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
    setMeetingState,
    currentUser,
    isWorkspaceLoading
}) {
    const { t } = useLanguage();
    const { addToast } = useToast();

    const handleResetWorkspace = () => {
        const clientId = currentUser?.client?.id || appData?.id || null;
        if (!clientId) {
            addToast({ title: 'Reset indisponível', description: 'Nenhum cliente ativo.', type: 'error' });
            return;
        }

        const ok = window.confirm('Isso vai zerar TODOS os dados do workspace deste cliente (Vaults, Dashboards, KPIs, Governança). Deseja continuar?');
        if (!ok) return;

        const blank = storageService.resetClientData(clientId, { clientName: currentUser?.client?.name || '' });

        const blankBinderFormData = {
            clientName: currentUser?.client?.name || '',
            niche: 'gastronomia',
            tagline: '',
            promise: '',
            enemy: '',
            brandValues: [],
            audienceAge: '25-34',
            audienceGender: 'todos',
            audienceClass: 'bc',
            audiencePain: '',
            archetype: 'O Cara Comum',
            tone: 'casual',
            mood: 'moderno',
            primaryColor: '#F97316',
            secondaryColor: '#1E293B',
            accentColor: '#10B981',
            bio: '',
            products: [],
            currentTicket: '',
            targetTicket: '',
            currentRevenue: '',
            upsellStrategy: 'none',
            saleFormat: 'presencial',
            baitProduct: '',
            baitPrice: '',
            channels: [],
            conversionLink: '',
            instagramHandle: '',
            websiteUrl: '',
            primaryCTA: 'whatsapp',
            secondaryCTA: 'saibamais',
            ctaText: '',
            monthlyGoal: '',
            trafficType: 'Misto',
            utmCampaign: '',
            currentConversion: '',
            targetConversion: '',
            cpl: '',
            approverName: '',
            teamStructure: 'Enxuta',
            slaHours: 24,
            contentOwner: '',
            trafficOwner: '',
            supportOwner: '',
            emergencyContact: '',
            postingFrequency: '3x',
            bestDays: [],
            bestTimes: [],
            startDate: '',
            cycleDuration: '30',
            stakeholders: [],
            competitors: [],
            ideas: [],
            references: [],
            notepad: '',
            governanceHistory: [],
            brandAssets: {
                logos: [],
                textures: [],
                icons: [],
                postTemplates: []
            },
            brandIdentity: {
                musicalStyle: '',
                visualVibes: [],
                keyElements: [],
                prohibitedElements: [],
                colorMeanings: '',
                photoStyle: '',
                typographyNotes: ''
            },
            customThemeEnabled: false,
            _schemaVersion: 1
        };

        setMeetingState({ active: false, comments: { general: '', revenue: '', traffic: '', sales: '' } });
        if (setFormData) {
            setFormData(blankBinderFormData);
        }
        setAppData(blank);

        addToast({ title: 'Workspace zerado', description: 'Dados de teste/simulação removidos. Pode preencher novamente.', type: 'success' });
    };

    const governanceHistory = useMemo(() => {
        if (Array.isArray(appData?.governanceHistory) && appData.governanceHistory.length > 0) {
            return appData.governanceHistory;
        }
        if (Array.isArray(formData?.governanceHistory)) {
            return formData.governanceHistory;
        }
        return [];
    }, [appData?.governanceHistory, formData?.governanceHistory]);

    const ataEntries = useMemo(() => {
        return governanceHistory.filter(h => h?.signature?.closedAt && h?.kpis);
    }, [governanceHistory]);

    const latestAta = useMemo(() => {
        return appData?.lastGovernanceATA || ataEntries[0] || null;
    }, [appData?.lastGovernanceATA, ataEntries]);

    const previousAta = useMemo(() => {
        return ataEntries[1] || null;
    }, [ataEntries]);

    const FLAG_DASH_ONBOARDING = getFeatureFlag('DASH_ONBOARDING', false);
    const FLAG_DASH_INSIGHTS = getFeatureFlag('DASH_INSIGHTS', false);
    const FLAG_DASH_INSIGHTS_ACTIONS = getFeatureFlag('DASH_INSIGHTS_ACTIONS', false);
    const FLAG_DASH_EDIT_DRAWER = getFeatureFlag('DASH_EDIT_DRAWER', false);
    const FLAG_DASH_QUICKADD_DRAWER = getFeatureFlag('DASH_QUICKADD_DRAWER', false);
    const FLAG_DASH_UNDO = getFeatureFlag('DASH_UNDO', false);
    const FLAG_DASH_SKELETON_REAL = getFeatureFlag('DASH_SKELETON_REAL', false);
    const FLAG_DASH_EMPTY_STATES = getFeatureFlag('DASH_EMPTY_STATES', false);

    // UI State
    const [dateFilter, setDateFilter] = useState('week');
    const [roadmapStatusFilter, setRoadmapStatusFilter] = useState(null);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [showPlaybooks, setShowPlaybooks] = useState(false);
    const [showCreativeStudio, setShowCreativeStudio] = useState(false);
    const [creativeItem, setCreativeItem] = useState(null);
    const [highlightedRowId, setHighlightedRowId] = useState(null);
    const highlightTimeoutRef = useRef(null);
    const [roadmapNoteDrafts, setRoadmapNoteDrafts] = useState({});
    const [showGovernanceModal, setShowGovernanceModal] = useState(false);
    const [showGovernanceModeModal, setShowGovernanceModeModal] = useState(false);
    const [historyFocusEntryId, setHistoryFocusEntryId] = useState(null);
    const [governanceFrequency, setGovernanceFrequency] = useState(appData.governanceFrequency || 'weekly');

    const governanceCalendarRule = appData?.vaults?.S4?.governanceCalendar;

    const { executeWithUndo } = useUndo();

    // Editable KPI State - Linked to Global Data
    const [kpis, setKpis] = useState(appData.kpis || {
        revenue: { value: 0, goal: 0 },
        traffic: { value: 0, goal: 0 },
        sales: { value: 0, goal: 0 },
    });

    // Update local state when appData changes (e.g. client switch)
    useEffect(() => {
        if (appData.kpis) {
            setKpis(appData.kpis);
        }
    }, [appData.kpis]);

    useEffect(() => {
        return () => {
            if (highlightTimeoutRef.current) {
                clearTimeout(highlightTimeoutRef.current);
                highlightTimeoutRef.current = null;
            }
        };
    }, []);

    const highlightRow = (rowId) => {
        if (!rowId) return;
        setHighlightedRowId(rowId);
        if (highlightTimeoutRef.current) {
            clearTimeout(highlightTimeoutRef.current);
        }
        highlightTimeoutRef.current = setTimeout(() => {
            setHighlightedRowId(null);
            highlightTimeoutRef.current = null;
        }, 2500);
    };

    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const focusItem = params.get('focusItem');
            if (!focusItem) return;

            setDateFilter('month');
            requestAnimationFrame(() => {
                const el = document.querySelector(`[data-testid="d2-row-${focusItem}"]`);
                if (el && typeof el.scrollIntoView === 'function') {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                highlightRow(focusItem);
            });
        } catch {
            // no-op
        }
    }, []);

    const handleInsightAction = (insight) => {
        if (!FLAG_DASH_INSIGHTS_ACTIONS) return;
        const targetItem = Array.isArray(insight?.items) ? insight.items[0] : null;
        if (!targetItem?.id) return;

        setDateFilter('month');

        requestAnimationFrame(() => {
            const el = document.querySelector(`[data-testid="d2-row-${targetItem.id}"]`);
            if (el && typeof el.scrollIntoView === 'function') {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            highlightRow(targetItem.id);
        });
    };

    if (FLAG_DASH_SKELETON_REAL && isWorkspaceLoading) {
        return (
            <div className="h-full bg-[var(--bg-deep)] text-[var(--text-primary)] font-sans relative flex flex-col selection:bg-white/20">
                <SkeletonDashboard />
            </div>
        );
    }

    const handleKpiUpdate = (key, val) => {
        if (!meetingState.active) {
            addToast({ title: 'Modo Leitura', description: 'Ative a Governança para editar KPIs.', type: 'info' });
            return;
        }

        const newVal = parseFloat(val) || 0;
        const oldValue = kpis[key]?.value;
        const updatedKpis = {
            ...kpis,
            [key]: { ...kpis[key], value: newVal }
        };
        
        setKpis(updatedKpis);

        // Audit Log Entry
        const logEntry = {
            id: Date.now(),
            ts: new Date().toISOString(),
            actor: currentUser?.role ? `${currentUser.role} (${currentUser.client?.name || 'System'})` : 'Unknown',
            action: 'UPDATE_KPI',
            target: key,
            oldValue,
            newValue: newVal
        };

        // Persist to global state with Audit Log
        setAppData(prev => ({
            ...prev,
            kpis: updatedKpis,
            measurementContract: {
                ...(prev.measurementContract || {}),
                kpis: prev.measurementContract?.kpis?.map(k => k.id === key ? { ...k, value: newVal } : k) || [],
                auditLog: [logEntry, ...(prev.measurementContract?.auditLog || [])]
            }
        }));
    };

    const toggleGovernanceMode = () => {
        const newActive = !meetingState.active;
        setMeetingState(prev => ({ ...prev, active: newActive }));
        if (newActive) {
            addToast({ title: 'Modo Governança', description: 'Reunião iniciada. Edite KPIs e registre decisões.', type: 'info' });
            setShowGovernanceModal(false);
            setShowGovernanceModeModal(true);
        } else {
            setShowGovernanceModal(false);
            setShowGovernanceModeModal(false);
            addToast({ title: 'Modo Governança', description: 'Reunião encerrada.', type: 'success' });
        }
    };

    const handleGovernanceModeComplete = (result) => {
        const { ata, recalibration, nextWindow, roadmapUpdates, goalChanges } = result;

        const nextKpis = { ...kpis };
        const autoGoalUpdates = [];
        if (recalibration?.suggestedKpis) {
            Object.entries(recalibration.suggestedKpis).forEach(([key, data]) => {
                if (nextKpis[key] && data?.newGoal) {
                    nextKpis[key].goal = data.newGoal;
                    autoGoalUpdates.push({ id: key, fromGoal: kpis?.[key]?.goal ?? 0, toGoal: data.newGoal, reason: data?.reason || 'recalibration' });
                }
            });
        }

        const manualGoalUpdates = Array.isArray(goalChanges)
            ? goalChanges.map(ch => ({
                id: ch.id,
                fromGoal: ch.fromGoal,
                toGoal: ch.toGoal,
                changedAt: ch.changedAt
            }))
            : [];

        // Manual changes override any auto suggested goals
        manualGoalUpdates.forEach(ch => {
            if (!nextKpis[ch.id]) return;
            nextKpis[ch.id].goal = ch.toGoal;
        });

        setKpis(nextKpis);

        const updatedHistoryForForm = [ata, ...(appData.governanceHistory || [])];

        setAppData(prev => {
            const prevHistory = Array.isArray(prev?.governanceHistory) ? prev.governanceHistory : [];
            const updatedHistory = [ata, ...prevHistory];

            const prevD2 = Array.isArray(prev?.dashboard?.D2) ? prev.dashboard.D2 : [];
            const nextD2 = (roadmapUpdates && roadmapUpdates.length > 0)
                ? prevD2.map(item => {
                    const update = roadmapUpdates.find(u => String(u.id) === String(item.id));
                    if (update) return { ...item, status: update.status, governanceNote: update.governanceNote };
                    return item;
                })
                : prevD2;

            const prevContractKpis = Array.isArray(prev?.measurementContract?.kpis) ? prev.measurementContract.kpis : [];
            const finalGoalMap = {
                revenue: nextKpis?.revenue?.goal,
                traffic: nextKpis?.traffic?.goal,
                sales: nextKpis?.sales?.goal,
            };

            const nextContractKpis = prevContractKpis.map(k => {
                const nextTarget = finalGoalMap?.[k.id];
                if (typeof nextTarget !== 'number') return k;
                return { ...k, target: nextTarget };
            });

            const goalAuditEntries = [
                ...autoGoalUpdates.map(u => ({
                    id: Date.now() + Math.random(),
                    ts: new Date().toISOString(),
                    actor: currentUser?.role ? `${currentUser.role} (${currentUser.client?.name || 'System'})` : 'System',
                    action: 'GOVERNANCE_RECALIBRATION',
                    target: u.id,
                    oldValue: u.fromGoal,
                    newValue: u.toGoal,
                    details: u.reason
                })),
                ...manualGoalUpdates.map(u => ({
                    id: Date.now() + Math.random(),
                    ts: u.changedAt || new Date().toISOString(),
                    actor: currentUser?.role ? `${currentUser.role} (${currentUser.client?.name || 'System'})` : 'Operador',
                    action: 'GOVERNANCE_GOAL_CHANGE',
                    target: u.id,
                    oldValue: u.fromGoal,
                    newValue: u.toGoal,
                    details: 'Alteração manual durante a governança'
                }))
            ];

            return {
                ...prev,
                kpis: nextKpis,
                dashboard: {
                    ...(prev?.dashboard || {}),
                    D2: nextD2
                },
                governanceHistory: updatedHistory,
                lastGovernance: new Date().toISOString(),
                lastGovernanceATA: ata,
                nextGovernanceWindow: nextWindow,
                recalibration,
                governanceFrequency,
                measurementContract: {
                    ...(prev.measurementContract || {}),
                    kpis: nextContractKpis,
                    lastUpdate: new Date().toISOString(),
                    auditLog: [...goalAuditEntries, ...(prev.measurementContract?.auditLog || [])]
                }
            };
        });

        if (setFormData) {
            setFormData(prev => ({
                ...prev,
                governanceHistory: updatedHistoryForForm
            }));
        }

        addToast({
            title: 'Governança Concluída',
            description: 'ATA gerada e sistema recalibrado.',
            type: 'success'
        });
    };

    const handleGovernanceSave = (governanceData) => {
        // Update KPI goals if adjusted
        if (governanceData.goalAdjustments) {
            const newKpis = { ...kpis };
            Object.entries(governanceData.goalAdjustments).forEach(([key, val]) => {
                if (val && newKpis[key]) {
                    newKpis[key].goal = parseFloat(val);
                }
            });
            setKpis(newKpis);
            setAppData(prev => ({ ...prev, kpis: newKpis }));
        }

        // Save governance snapshot
        const snapshot = {
            id: `GOV-${Date.now()}`,
            date: new Date().toISOString(),
            type: 'governance_commit',
            ...governanceData,
            kpiSnapshot: kpis,
        };

        const updatedHistory = [snapshot, ...(appData.governanceHistory || [])];
        
        setAppData(prev => ({
            ...prev,
            governanceHistory: updatedHistory,
            lastGovernance: new Date().toISOString(),
            governanceFrequency
        }));

        if (setFormData) {
            setFormData(prev => ({
                ...prev,
                governanceHistory: updatedHistory
            }));
        }

        // Close governance mode if checklist complete
        if (governanceData.checklistProgress >= 1) {
            setMeetingState({ active: false, comments: { general: '', revenue: '', traffic: '', sales: '' } });
            addToast({ title: 'Ciclo Fechado', description: 'Governança salva com sucesso.', type: 'success' });
        } else {
            addToast({ title: 'Rascunho Salvo', description: 'Continue o checklist depois.', type: 'info' });
        }
    };

    const handleFrequencyChange = (newFreq) => {
        setGovernanceFrequency(newFreq);
        setAppData(prev => {
            const next = { ...prev, governanceFrequency: newFreq };
            const ata = prev?.lastGovernanceATA || null;
            const rule = prev?.vaults?.S4?.governanceCalendar;
            if (ata) {
                next.nextGovernanceWindow = generateNextGovernanceWindow(ata, newFreq, rule);
            }
            return next;
        });
    };

    const handleUpdateCalendarRule = (ruleDraft) => {
        setAppData(prev => {
            const prevVaults = prev?.vaults || {};
            const prevS4 = prevVaults?.S4 || {};
            const nextS4 = { ...prevS4, governanceCalendar: { ...(prevS4?.governanceCalendar || {}), ...ruleDraft } };

            const next = {
                ...prev,
                vaults: {
                    ...prevVaults,
                    S4: nextS4
                }
            };

            const ata = prev?.lastGovernanceATA || null;
            if (ata) {
                next.nextGovernanceWindow = generateNextGovernanceWindow(ata, governanceFrequency, nextS4.governanceCalendar);
            }

            return next;
        });
    };

    const handlePriorityAction = (action) => {
        if (action.items && action.items.length > 0) {
            setEditingItem(action.items[0]);
        }
    };

    const statusOptions = [
        { value: 'draft', label: 'Draft', color: 'bg-gray-500' },
        { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
        { value: 'in_production', label: 'In Prod', color: 'bg-yellow-500' },
        { value: 'scheduled', label: 'Scheduled', color: 'bg-green-500' },
        { value: 'done', label: 'Published', color: 'bg-blue-500' },
        { value: 'delayed', label: 'Delayed', color: 'bg-red-500' },
        { value: 'cancelled', label: 'Cancelado', color: 'bg-gray-500' },
    ];

    const formatIcons = {
        post: { icon: '📷', label: 'Post' },
        reel: { icon: '🎬', label: 'Reel' },
        story: { icon: '📱', label: 'Story' },
        carousel: { icon: '🎠', label: 'Carousel' },
        ad: { icon: '💰', label: 'Ad' },
    };

    const getFilteredData = (ignoreStatusFilter = false) => {
        const d2Items = appData.dashboard?.D2 || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const dateFiltered = d2Items.filter(item => {
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

        if (ignoreStatusFilter) return dateFiltered;
        if (!roadmapStatusFilter) return dateFiltered;
        return dateFiltered.filter(item => item.status === roadmapStatusFilter);
    };

    const calendarForStats = getFilteredData(true);
    const filteredCalendar = getFilteredData();

    const roadmapStatusStats = (() => {
        const statuses = ['draft', 'pending', 'in_production', 'scheduled', 'done', 'delayed', 'cancelled'];
        const base = statuses.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
        const total = Array.isArray(calendarForStats) ? calendarForStats.length : 0;
        (calendarForStats || []).forEach(item => {
            const s = item?.status || 'draft';
            if (base[s] !== undefined) base[s] += 1;
        });
        const pct = statuses.reduce((acc, s) => ({
            ...acc,
            [s]: total > 0 ? Math.round((base[s] / total) * 100) : 0
        }), {});
        return { total, counts: base, pct };
    })();

    const handleStatusChange = (itemId, newStatus) => {
        if (!FLAG_DASH_UNDO) {
            const updatedD2 = appData.dashboard.D2.map(item =>
                item.id === itemId ? { ...item, status: newStatus } : item
            );
            setAppData({ ...appData, dashboard: { ...appData.dashboard, D2: updatedD2 } });
            return;
        }

        const prevItem = appData.dashboard?.D2?.find(it => it.id === itemId);
        if (!prevItem) return;

        executeWithUndo({
            description: 'Status atualizado',
            type: 'info',
            action: () => {
                setAppData(prev => {
                    const prevD2 = Array.isArray(prev?.dashboard?.D2) ? prev.dashboard.D2 : [];
                    const nextD2 = prevD2.map(item =>
                        item.id === itemId ? { ...item, status: newStatus } : item
                    );
                    return { ...prev, dashboard: { ...(prev?.dashboard || {}), D2: nextD2 } };
                });
            },
            undoAction: () => {
                setAppData(prev => {
                    const prevD2 = Array.isArray(prev?.dashboard?.D2) ? prev.dashboard.D2 : [];
                    const nextD2 = prevD2.map(item =>
                        item.id === itemId ? { ...item, status: prevItem.status } : item
                    );
                    return { ...prev, dashboard: { ...(prev?.dashboard || {}), D2: nextD2 } };
                });
            }
        });
    };

    const handleSaveItem = (updatedItem) => {
        if (!FLAG_DASH_UNDO) {
            const updatedD2 = appData.dashboard.D2.map(item =>
                item.id === updatedItem.id ? updatedItem : item
            );
            setAppData({ ...appData, dashboard: { ...appData.dashboard, D2: updatedD2 } });
            addToast({ title: 'Item Saved', type: 'success' });
            return;
        }

        const prevItem = appData.dashboard?.D2?.find(it => it.id === updatedItem?.id);
        if (!prevItem) return;

        executeWithUndo({
            description: 'Item atualizado',
            type: 'info',
            action: () => {
                setAppData(prev => {
                    const prevD2 = Array.isArray(prev?.dashboard?.D2) ? prev.dashboard.D2 : [];
                    const nextD2 = prevD2.map(item =>
                        item.id === updatedItem.id ? updatedItem : item
                    );
                    return { ...prev, dashboard: { ...(prev?.dashboard || {}), D2: nextD2 } };
                });
            },
            undoAction: () => {
                setAppData(prev => {
                    const prevD2 = Array.isArray(prev?.dashboard?.D2) ? prev.dashboard.D2 : [];
                    const nextD2 = prevD2.map(item =>
                        item.id === prevItem.id ? prevItem : item
                    );
                    return { ...prev, dashboard: { ...(prev?.dashboard || {}), D2: nextD2 } };
                });
            }
        });
    };

    const handleOpenCreativeStudio = (item) => {
        setCreativeItem(item);
        setShowCreativeStudio(true);
    };

    const handleSaveCreativeAsset = (asset) => {
        setAppData(prev => {
            const prevAssets = Array.isArray(prev?.creativeAssets) ? prev.creativeAssets : [];
            const nextAssets = [asset, ...prevAssets];
            const prevD2 = Array.isArray(prev?.dashboard?.D2) ? prev.dashboard.D2 : [];
            const nextD2 = prevD2.map(it => (it.id === asset.itemId ? { ...it, visual_output: asset.id } : it));

            return {
                ...prev,
                creativeAssets: nextAssets,
                dashboard: {
                    ...(prev?.dashboard || {}),
                    D2: nextD2
                }
            };
        });

        addToast({ title: 'Arte salva', type: 'success' });
    };

    const handleAddItem = (newItem) => {
        const safeItem = {
            ...newItem,
            id: newItem.id || `NEW-${Date.now()}`
        };

        if (!FLAG_DASH_UNDO) {
            setAppData({
                ...appData,
                dashboard: { ...appData.dashboard, D2: [...(appData.dashboard.D2 || []), safeItem] }
            });
            addToast({ title: 'Item Created', type: 'success' });
            return;
        }

        executeWithUndo({
            description: 'Item criado',
            type: 'success',
            action: () => {
                setAppData(prev => {
                    const prevD2 = Array.isArray(prev?.dashboard?.D2) ? prev.dashboard.D2 : [];
                    return {
                        ...prev,
                        dashboard: { ...(prev?.dashboard || {}), D2: [...prevD2, safeItem] }
                    };
                });
            },
            undoAction: () => {
                setAppData(prev => {
                    const prevD2 = Array.isArray(prev?.dashboard?.D2) ? prev.dashboard.D2 : [];
                    const nextD2 = prevD2.filter(it => it.id !== safeItem.id);
                    return { ...prev, dashboard: { ...(prev?.dashboard || {}), D2: nextD2 } };
                });
            }
        });
    };

    // (legacy) handleSaveMeeting removed: governance now happens only through the meeting panel

    const handleImport = (importData) => {
        const newKpis = { ...kpis };
        const newContractKpis = appData.measurementContract?.kpis ? [...appData.measurementContract.kpis] : [];
        const logEntries = [];

        if (importData.mode === 'manual') {
            Object.entries(importData.values).forEach(([id, val]) => {
                const numVal = parseFloat(val);
                // Update local state if it matches our core keys
                if (newKpis[id]) newKpis[id].value = numVal;
                
                // Update contract
                const kpiIndex = newContractKpis.findIndex(k => k.id === id);
                if (kpiIndex >= 0) {
                    const oldVal = newContractKpis[kpiIndex].value;
                    newContractKpis[kpiIndex] = { ...newContractKpis[kpiIndex], value: numVal };
                    
                    logEntries.push({
                        id: Date.now() + Math.random(),
                        ts: new Date().toISOString(),
                        actor: currentUser?.role ? `${currentUser.role} (${currentUser.client?.name || 'System'})` : 'Import Tool',
                        action: 'IMPORT_DATA',
                        target: id,
                        oldValue: oldVal,
                        newValue: numVal,
                        details: 'Manual Import'
                    });
                }
            });
        }

        setKpis(newKpis);
        setAppData(prev => ({
            ...prev,
            kpis: newKpis,
            measurementContract: {
                ...(prev.measurementContract || {}),
                kpis: newContractKpis,
                lastUpdate: new Date().toISOString(),
                auditLog: [...logEntries, ...(prev.measurementContract?.auditLog || [])]
            }
        }));

        addToast({ title: 'Importação Concluída', description: `${logEntries.length} métricas atualizadas.`, type: 'success' });
    };

    const handleApplyPlaybook = (playbook) => {
        const products = appData?.vaults?.S2?.products || [];
        const heroProduct = products.find(p => p?.isHero) || products.find(p => String(p?.role || '').toLowerCase() === 'hero') || products[0] || null;
        const heroProductId = heroProduct?.id != null ? heroProduct.id : 'hero';

        // Generate tasks starting from tomorrow
        const newTasks = playbook.tasks.map((task, idx) => {
            const date = new Date();
            date.setDate(date.getDate() + task.dayOffset + 1); // Start D+1
            
            const legacyChannel = playbook.channels[idx % playbook.channels.length] || 'Instagram Feed';
            const parsed = parseLegacyChannelLabel(legacyChannel);
            const channelId = parsed.channelId || 'instagram';
            const subchannelId = parsed.subchannelId || getDefaultSubchannelId(channelId) || 'feed';
            return {
                id: `PB-${Date.now()}-${idx}`,
                date: date.toISOString().split('T')[0],
                initiative: task.title,
                channelId,
                subchannelId,
                channel: toLegacyChannelLabel(channelId, subchannelId),
                format: getDefaultContentType(channelId, subchannelId),
                offerId: heroProductId,
                ctaId: 'whatsapp',
                responsible: task.role,
                status: 'draft',
                visual_output: 'Pending',
                origin: `Playbook: ${playbook.name}`
            };
        });

        // Add to D2 (Roadmap)
        setAppData(prev => ({
            ...prev,
            dashboard: {
                ...prev.dashboard,
                D2: [...(prev.dashboard.D2 || []), ...newTasks]
            },
            // Log the action
            measurementContract: {
                ...(prev.measurementContract || {}),
                auditLog: [
                    {
                        id: Date.now(),
                        ts: new Date().toISOString(),
                        actor: currentUser?.role ? `${currentUser.role} (${currentUser.client?.name || 'System'})` : 'System',
                        action: 'APPLY_PLAYBOOK',
                        target: 'Roadmap',
                        details: `Applied: ${playbook.name}`
                    },
                    ...(prev.measurementContract?.auditLog || [])
                ]
            }
        }));

        addToast({ title: 'Plano Gerado', description: `${newTasks.length} tarefas criadas a partir do playbook.`, type: 'success' });
    };

    // Helper for Data Freshness
    const getLastUpdateLabel = () => {
        if (!appData.measurementContract?.lastUpdate) return 'Nunca atualizado';
        const date = new Date(appData.measurementContract.lastUpdate);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    // --- INTEGRATIONS: DEEP LINKS ---
    const buildRoadmapDeepLink = (itemId) => {
        try {
            const url = new URL(window.location.href);
            url.searchParams.set('focusItem', String(itemId));
            url.hash = '';
            return url.toString();
        } catch {
            return `?focusItem=${encodeURIComponent(String(itemId))}`;
        }
    };

    const sendApprovalRequest = (item, e) => {
        e.stopPropagation(); // Prevent row click
        
        const clientPhone = appData?.vaults?.S4?.contacts?.emergency || '';
        const phoneDigits = String(clientPhone).replace(/\D/g, '');
        const deepLink = buildRoadmapDeepLink(item.id);

        const text = `*BRAVVO APPROVAL REQUEST*\n\n📝 *Initiative:* ${item.initiative}\n📅 *Date:* ${item.date}\n📺 *Channel:* ${item.channel}\n\nPor favor, aprovar ou comentar.\n(Link interno: ${deepLink})`;

        if (!phoneDigits || phoneDigits.length < 10) {
            try {
                navigator.clipboard.writeText(text);
                addToast({ title: 'Contato não configurado', description: 'Telefone inválido. Mensagem copiada.', type: 'info' });
            } catch {
                addToast({ title: 'Contato não configurado', description: 'Telefone inválido.', type: 'info' });
            }
            return;
        }

        const url = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}`;
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
                    {/* Data Freshness Indicator */}
                    <div className="hidden md:flex flex-col items-start ml-2">
                        <span className="text-[9px] text-gray-600 font-mono uppercase tracking-wider">Dados: {getLastUpdateLabel()}</span>
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
                    <button onClick={() => setShowImport(true)} className="btn-ghost !h-7 !px-2" title="Importar Dados">
                        <Upload size={14} />
                    </button>
                    <button
                        data-testid="os-reset-workspace"
                        onClick={handleResetWorkspace}
                        className="btn-ghost !h-7 !px-2 !border-red-500/30 text-red-400 hover:text-red-300"
                        title="Zerar dados do workspace"
                    >
                        <Trash2 size={14} />
                    </button>
                    <button
                        onClick={() => {
                            setAppData(prev => ({ ...prev, customThemeEnabled: !prev?.customThemeEnabled }));
                        }}
                        className="btn-ghost !h-7 !px-2"
                        title="Personalizar (usar paleta da marca)"
                    >
                        <Palette size={14} />
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-1"></div>
                    {meetingState.active && (
                        <button
                            onClick={() => setShowPlaybooks(true)}
                            data-testid="os-open-playbooks"
                            className="btn-ghost !h-7 !px-3 !border-blue-500/30 text-blue-400 hover:text-blue-300"
                            title="Gerar Plano (Playbooks)"
                        >
                            <Book size={12} className="md:mr-1" /> <span className="hidden md:inline">Gerar Plano</span>
                        </button>
                    )}
                    <button onClick={() => setShowQuickAdd(true)} className="btn-primary !h-7 !px-3" data-testid="os-quick-add">
                        <Plus size={14} /> <span className="hidden md:inline ml-1">{t('os.actions.new')}</span>
                    </button>
                </div>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">

                {/* 0. GOVERNANCE HEADER - PRD 3.1 */}
                <GovernanceHeader
                    frequency={governanceFrequency}
                    lastGovernance={appData.lastGovernance}
                    isGovernanceActive={meetingState.active}
                    onToggleGovernance={toggleGovernanceMode}
                    onChangeFrequency={handleFrequencyChange}
                    nextWindow={appData?.nextGovernanceWindow}
                    calendarRule={governanceCalendarRule}
                    onUpdateCalendarRule={handleUpdateCalendarRule}
                />

                {/* MEETING MODE (embedded) */}
                {meetingState.active ? (
                    <div className="mb-6">
                        <GovernanceModeModal
                            open={meetingState.active && showGovernanceModeModal}
                            variant="embedded"
                            onClose={() => {
                                setShowGovernanceModeModal(false);
                                setMeetingState({ active: false, comments: { general: '', revenue: '', traffic: '', sales: '' } });
                            }}
                            onComplete={handleGovernanceModeComplete}
                            kpis={kpis}
                            roadmapItems={appData?.dashboard?.D2 || []}
                            vaults={appData?.vaults}
                            governanceFrequency={governanceFrequency}
                            currentUser={currentUser}
                            currentWindow={appData?.nextGovernanceWindow}
                            calendarRule={governanceCalendarRule}
                        />
                    </div>
                ) : (
                    <>
                {latestAta && (() => {
                    const lastClosed = latestAta?.signature?.closedAt;
                    const lastLabel = lastClosed ? new Date(lastClosed).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : latestAta?.id;
                    const rev = parseFloat(latestAta?.kpis?.revenue?.achievement || 0);
                    const prevRev = parseFloat(previousAta?.kpis?.revenue?.achievement || 0);
                    const delta = previousAta ? (rev - prevRev) : 0;
                    const trend = !previousAta ? '→' : delta > 2 ? '↑' : delta < -2 ? '↓' : '→';

                    return (
                        <div className="mb-4 px-4 py-2 rounded-xl border border-white/10 bg-[#080808] flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Última governança</span>
                                <span className="text-[11px] text-gray-300 font-medium truncate">{lastLabel}</span>
                                <span className="text-[11px] text-gray-500 font-mono">{trend}{previousAta ? ` ${delta >= 0 ? '+' : ''}${delta.toFixed(1)}pp` : ''}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setHistoryFocusEntryId(latestAta?.id);
                                        setShowHistory(true);
                                    }}
                                    className="btn-ghost !h-7 !px-3 !border-purple-500/30 text-purple-300 hover:text-purple-200"
                                >
                                    Ver ATA
                                </button>
                            </div>
                        </div>
                    );
                })()}

                <KPIGrid
                    kpis={kpis}
                    onKpiUpdate={handleKpiUpdate}
                    disabled={!meetingState.active}
                />

                <PriorityActionsCard
                    items={appData?.dashboard?.D2 || []}
                    kpis={kpis}
                    onActionClick={handlePriorityAction}
                    variant="strip"
                />

                {(appData?.recalibration || appData?.nextGovernanceWindow) && (
                    <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {appData?.nextGovernanceWindow && (
                            <div className="bento-grid p-4">
                                <div className="text-label mb-2">Próxima Janela</div>
                                <div className="text-sm text-white font-bold">
                                    {appData.nextGovernanceWindow.startDate} → {appData.nextGovernanceWindow.endDate}
                                </div>
                                <div className="mt-2 text-[11px] text-gray-500">
                                    Foco: <span className="text-gray-300">{appData.nextGovernanceWindow.periodGoals?.focus || '—'}</span>
                                </div>
                                <div className="mt-3 space-y-1 text-[11px] text-gray-400">
                                    <div>Receita: <span className="text-gray-200">R$ {(appData.nextGovernanceWindow.periodGoals?.kpiTargets?.revenue || 0).toLocaleString('pt-BR')}</span></div>
                                    <div>Tráfego: <span className="text-gray-200">R$ {(appData.nextGovernanceWindow.periodGoals?.kpiTargets?.traffic || 0).toLocaleString('pt-BR')}</span></div>
                                    <div>Vendas: <span className="text-gray-200">{(appData.nextGovernanceWindow.periodGoals?.kpiTargets?.sales || 0).toLocaleString('pt-BR')}</span></div>
                                </div>
                            </div>
                        )}

                        {appData?.recalibration && (
                            <div className="bento-grid p-4">
                                <div className="text-label mb-2">Ordens do Ciclo</div>
                                {Array.isArray(appData.recalibration.dailyOrders) && appData.recalibration.dailyOrders.length > 0 ? (
                                    <div className="space-y-2">
                                        {appData.recalibration.dailyOrders.slice(0, 5).map(order => (
                                            <div key={order.id} className="flex items-start justify-between gap-3 bg-white/5 border border-white/10 rounded-lg p-2">
                                                <div className="min-w-0">
                                                    <div className="text-[11px] text-white font-medium truncate">{order.priority}. {order.title}</div>
                                                    <div className="text-[10px] text-gray-600 font-mono">{order.source}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-[11px] text-gray-600">—</div>
                                )}
                            </div>
                        )}

                        {appData?.recalibration && (
                            <div className="bento-grid p-4">
                                <div className="text-label mb-2">Foco + Alertas</div>
                                {Array.isArray(appData.recalibration.executionFocus) && appData.recalibration.executionFocus.length > 0 ? (
                                    <div className="space-y-2">
                                        {appData.recalibration.executionFocus.slice(0, 3).map((f, idx) => (
                                            <div key={idx} className="text-[11px] text-gray-300 bg-white/5 border border-white/10 rounded-lg p-2">
                                                {f.message}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-[11px] text-gray-600">—</div>
                                )}

                                {Array.isArray(appData.recalibration.alerts) && appData.recalibration.alerts.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {appData.recalibration.alerts.slice(0, 3).map((a, idx) => (
                                            <div key={idx} className="text-[11px] text-gray-400 bg-white/5 border border-white/10 rounded-lg p-2">
                                                <div className="text-gray-300">{a.title}</div>
                                                <div className="text-gray-600">{a.action}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                    </>
                )}

                {/* PHASE 1 (read-only): Onboarding */}
                {FLAG_DASH_ONBOARDING && (
                    <div className="mb-6">
                        <OnboardingChecklist
                            appData={appData}
                            onNavigate={setActiveTab}
                            variant="compact"
                        />
                    </div>
                )}

                {/* PHASE 1 (read-only): Insights */}
                {FLAG_DASH_INSIGHTS && (
                    <div className="mb-6">
                        <InsightCards
                            items={appData?.dashboard?.D2 || []}
                            vaults={appData?.vaults}
                            onInsightAction={FLAG_DASH_INSIGHTS_ACTIONS ? handleInsightAction : undefined}
                            maxItems={3}
                        />
                    </div>
                )}

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

                    <div className="px-4 py-2 border-b border-[var(--border-subtle)] bg-[#080808]">
                        <div className="flex flex-wrap items-center gap-2">
                            {[
                                { id: null, label: 'Todos', pct: null, color: 'bg-white/10 text-gray-300 border-white/10' },
                                { id: 'delayed', label: 'Atrasado', pct: roadmapStatusStats.pct.delayed, color: 'bg-red-500/10 text-red-300 border-red-500/30' },
                                { id: 'in_production', label: 'Em produção', pct: roadmapStatusStats.pct.in_production, color: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
                                { id: 'draft', label: 'Em edição', pct: roadmapStatusStats.pct.draft, color: 'bg-gray-500/10 text-gray-300 border-white/10' },
                                { id: 'scheduled', label: 'Agendado', pct: roadmapStatusStats.pct.scheduled, color: 'bg-green-500/10 text-green-300 border-green-500/30' },
                                { id: 'done', label: 'Concluído', pct: roadmapStatusStats.pct.done, color: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
                                { id: 'cancelled', label: 'Cancelado', pct: roadmapStatusStats.pct.cancelled, color: 'bg-gray-500/10 text-gray-300 border-white/10' },
                            ].map(s => (
                                <button
                                    key={String(s.id)}
                                    type="button"
                                    onClick={() => setRoadmapStatusFilter(s.id)}
                                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${s.color} ${roadmapStatusFilter === s.id ? 'ring-1 ring-white/20' : ''}`}
                                >
                                    {s.label}{s.pct !== null ? (
                                        <span className="font-mono opacity-70"> {s.pct || 0}%</span>
                                    ) : null}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table Container with Horizontal Scroll */}
                    <div className="overflow-x-auto custom-scrollbar">
                        <div className="min-w-[800px]">
                            {/* Table Header */}
                            <div className="grid grid-cols-[100px_1fr_150px_120px_120px_120px] gap-4 px-4 py-2 border-b border-[var(--border-subtle)] bg-[#080808]">
                                <div className="text-label">{t('os.table.date')}</div>
                                <div className="text-label">{t('os.table.initiative')}</div>
                                <div className="text-label">{t('os.table.channel')}</div>
                                <div className="text-label">{t('os.table.status')}</div>
                                <div className="text-label">{t('os.table.owner')}</div>
                                <div className="text-label text-right">{t('os.table.edit')}</div>
                            </div>

                            {/* Table Body */}
                            <div className="bg-[var(--bg-deep)]">
                                {filteredCalendar.map((item) => {
                                    const noteDraft = roadmapNoteDrafts?.[item.id];
                                    const noteValue = typeof noteDraft === 'string' ? noteDraft : (item.governanceNote || '');
                                    const previewText = item.microDescription || item.governanceNote || item.origin || String(item.caption || '').split('\n')[0];

                                    return (
                                    <div
                                        key={item.id}
                                        data-testid={`d2-row-${item.id}`}
                                        className={`grid grid-cols-[100px_1fr_150px_120px_120px_120px] gap-4 px-4 py-3 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] group transition-all duration-200 items-center hover:pl-5 ${highlightedRowId === item.id ? 'bg-purple-500/10 ring-1 ring-purple-500/30' : ''}`}
                                    >
                                        <div className="text-mono-data text-gray-400 group-hover:text-white transition-colors">
                                            {formatHumanDate(item.date)}
                                        </div>
                                        <div
                                            className="min-w-0 pr-4"
                                            data-testid={`d2-initiative-${item.id}`}
                                            title={[
                                                item.microDescription,
                                                item.objective,
                                                item.ctaText,
                                                item.dependencies,
                                                item.successCriteria
                                            ].filter(Boolean).join(' | ')}
                                            onClick={() => setEditingItem(item)}
                                        >
                                            <div className="text-sm font-medium text-white truncate group-hover:translate-x-1 transition-transform">
                                                {item.initiative}
                                            </div>
                                            {!!previewText && (
                                                <div className="text-[11px] text-gray-500 truncate mt-0.5 group-hover:hidden">
                                                    {previewText}
                                                </div>
                                            )}

                                            {meetingState.active && (
                                                <div className="mt-1 hidden group-hover:block">
                                                    <input
                                                        value={noteValue}
                                                        placeholder="Comentário rápido (somente na Governança)"
                                                        className="bg-black/30 border border-white/10 rounded px-2 py-1 w-full text-[11px] text-gray-200 focus:outline-none focus:border-purple-500/50"
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            setRoadmapNoteDrafts(prev => ({ ...prev, [item.id]: v }));
                                                        }}
                                                        onBlur={(e) => {
                                                            const finalValue = String(e.target.value || '');
                                                            setAppData(prev => {
                                                                const prevD2 = Array.isArray(prev?.dashboard?.D2) ? prev.dashboard.D2 : [];
                                                                const nextD2 = prevD2.map(it => (String(it.id) === String(item.id) ? { ...it, governanceNote: finalValue } : it));
                                                                return { ...prev, dashboard: { ...(prev?.dashboard || {}), D2: nextD2 } };
                                                            });
                                                            setRoadmapNoteDrafts(prev => {
                                                                const next = { ...(prev || {}) };
                                                                delete next[item.id];
                                                                return next;
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                                            <span>{formatIcons[item.format]?.icon || '🧩'}</span>
                                            <span className="truncate">{item.channel}</span>
                                        </div>
                                        <div>
                                            <StatusDropdown
                                                value={item.status}
                                                onChange={(newStatus) => handleStatusChange(item.id, newStatus)}
                                                options={statusOptions}
                                                testId={`d2-status-${item.id}`}
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
                                                onClick={() => handleOpenCreativeStudio(item)}
                                                className="p-1.5 hover:bg-purple-500/20 rounded text-gray-400 hover:text-purple-300 transform hover:scale-110 transition-all"
                                                title="Gerar Arte"
                                                data-testid={`d2-generate-art-${item.id}`}
                                            >
                                                <Wand2 size={12} />
                                            </button>
                                            
                                            <button 
                                                onClick={() => setEditingItem(item)} 
                                                className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transform hover:scale-110 transition-all"
                                                title="Editar"
                                                data-testid={`d2-edit-${item.id}`}
                                            >
                                                <Edit3 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                );
                                })}
                                {filteredCalendar.length === 0 && (
                                    FLAG_DASH_EMPTY_STATES ? (
                                        <EmptyState
                                            type="roadmap"
                                            onAction={() => setShowQuickAdd(true)}
                                            size="md"
                                        />
                                    ) : (
                                        <div className="py-12 flex flex-col items-center justify-center text-gray-600 animate-fadeInUp">
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                                <CalendarIcon size={20} opacity={0.5} />
                                            </div>
                                            <p className="text-xs">{t('os.roadmap.no_items')}</p>
                                            <button onClick={() => setShowQuickAdd(true)} className="mt-4 text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                                                <Plus size={10} /> {t('os.roadmap.add_item')}
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. VAULTS - PRD 3.6 (Rework Visual) */}
                <VaultCards
                    vaults={appData?.vaults}
                    labels={{
                        brand_dna: t('os.vaults.brand_dna'),
                        offer: t('os.vaults.offer'),
                        traffic: t('os.vaults.traffic'),
                        team: t('os.vaults.team'),
                        ideas: t('os.vaults.ideas'),
                    }}
                    onVaultClick={(vaultId) => setActiveTab(vaultId)}
                />

                {/* Modal Mounts */}
                {FLAG_DASH_QUICKADD_DRAWER ? (
                    <Drawer
                        open={showQuickAdd}
                        onClose={() => setShowQuickAdd(false)}
                        title={t('os.quick_add.title')}
                        width="lg"
                        testId="quickadd-drawer"
                    >
                        <div className="p-6">
                            <QuickAddForm onAdd={handleAddItem} onClose={() => setShowQuickAdd(false)} />
                        </div>
                    </Drawer>
                ) : (
                    <QuickAddModal open={showQuickAdd} onClose={() => setShowQuickAdd(false)} onAdd={handleAddItem} />
                )}
                {FLAG_DASH_EDIT_DRAWER ? (
                    <Drawer
                        open={!!editingItem}
                        onClose={() => setEditingItem(null)}
                        title={t('os.detail_edit.title')}
                        subtitle={editingItem?.id ? `ID: ${editingItem.id}` : undefined}
                        width="lg"
                        testId="detail-edit-drawer"
                    >
                        {editingItem && (
                            <DetailEditForm
                                item={editingItem}
                                onSave={handleSaveItem}
                                onClose={() => setEditingItem(null)}
                            />
                        )}
                    </Drawer>
                ) : (
                    <DetailEditModal open={!!editingItem} onClose={() => setEditingItem(null)} item={editingItem} onSave={handleSaveItem} />
                )}
                <GovernanceHistory
                    open={showHistory}
                    onClose={() => {
                        setShowHistory(false);
                        setHistoryFocusEntryId(null);
                    }}
                    history={appData?.governanceHistory || formData?.governanceHistory || []}
                    focusEntryId={historyFocusEntryId}
                />
                <ImportDataModal open={showImport} onClose={() => setShowImport(false)} contract={appData.measurementContract} onImport={handleImport} />
                <PlaybookModal open={showPlaybooks} onClose={() => setShowPlaybooks(false)} onApply={handleApplyPlaybook} />
                <CreativeStudioModal
                    open={showCreativeStudio}
                    onClose={() => {
                        setShowCreativeStudio(false);
                        setCreativeItem(null);
                    }}
                    item={creativeItem}
                    vaults={appData?.vaults}
                    onSave={handleSaveCreativeAsset}
                    onGeneratePrompt={onGeneratePrompt}
                />
                {/* GOVERNANCE MODAL - PRD 4.1 */}
                <GovernanceModal
                    open={showGovernanceModal}
                    onClose={() => setShowGovernanceModal(false)}
                    onSave={handleGovernanceSave}
                    governanceData={appData?.lastGovernanceData}
                    kpis={kpis}
                />
                {/* GOVERNANCE MODE MODAL - Enhanced Ritual */}
                {/* Rendered embedded inside scroll area when active */}
            </div>
        </div>
    );
}
