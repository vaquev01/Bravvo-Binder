import React, { useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
    LayoutGrid,
    Users,
    ArrowRight,
    Activity,
    Search,
    LogOut,
    Command,
    TrendingUp,
} from 'lucide-react';
import { api } from '../../data/mockDB';

export function AgencyDashboard({ onSelectClient, onLogout }) {
    const { t } = useLanguage();
    // Mock Agency Data (Agency A1 for demo)
    const agencyId = 'A1';

    // Fetch clients from Mock DB
    const clients = useMemo(() => api.getAgencyClients(agencyId), []);

    // Calculate aggregated stats
    const agencyStats = {
        totalRevenue: clients.reduce((acc, c) => acc + (c.kpis?.revenue?.value || 0), 0),
        activeClients: clients.length,
        pendingApprovals: 8,
        teamOnline: 4,
        avgHealth: 94
    };

    return (
        <div className="min-h-screen bg-[var(--bg-deep)] text-white font-sans selection:bg-white/20">
            {/* Top Navigation - Ultra Minimal */}
            <header className="h-14 border-b border-[var(--border-subtle)] flex items-center justify-between px-6 bg-[var(--bg-deep)] sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center">
                        <Command size={18} className="text-black" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('dashboard.agency.command_center')}</span>
                        <span className="text-sm font-bold text-white">{t('dashboard.agency.bravvo_hq')}</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-1 bg-[var(--bg-surface)] p-1 rounded-lg border border-[var(--border-subtle)]">
                        {[t('dashboard.nav.overview'), t('dashboard.nav.financials'), t('dashboard.nav.team'), t('dashboard.nav.audit')].map(tab => (
                            <button key={tab} className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide rounded ${tab === t('dashboard.nav.overview') ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-white hover:bg-white/5'} transition-all`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs text-gray-400 group focus-within:border-white/20 transition-colors">
                        <Search size={12} />
                        <input className="bg-transparent outline-none w-24 focus:w-48 transition-all placeholder-gray-600" placeholder={t('dashboard.actions.search')} />
                        <span className="text-[10px] text-gray-600 border border-white/10 px-1 rounded">⌘K</span>
                    </div>
                    <button
                        onClick={onLogout}
                        className="p-2 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors"
                    >
                        <LogOut size={16} />
                    </button>
                    <div className="w-8 h-8 rounded bg-gradient-to-tr from-gray-700 to-gray-600 border border-white/10"></div>
                </div>
            </header>

            <main className="p-6 max-w-[1600px] mx-auto space-y-6">
                {/* Stats Grid - Bento Style */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bento-grid p-5 bento-cell group relative">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-label">{t('dashboard.agency.total_revenue')}</span>
                            <div className="p-1.5 bg-green-500/10 rounded text-green-500">
                                <TrendingUp size={14} />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-3xl font-mono font-medium tracking-tighter text-white">
                                {(agencyStats.totalRevenue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </h2>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    <div className="bento-grid p-5 bento-cell group relative">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-label">{t('dashboard.agency.active_workspaces')}</span>
                            <Users maxLength={16} className="text-gray-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-3xl font-mono font-medium tracking-tighter text-white">
                                {agencyStats.activeClients}
                            </h2>
                            <span className="text-xs text-gray-500">/ 20 {t('dashboard.agency.slots')}</span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    <div className="bento-grid p-5 bento-cell group relative">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-label">{t('dashboard.stats.pending')}</span>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-mono font-medium tracking-tighter text-white">
                            {agencyStats.pendingApprovals}
                        </h2>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    <div className="bento-grid p-5 bento-cell group relative">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-label">{t('dashboard.stats.health')}</span>
                            <Activity size={16} className="text-gray-600 group-hover:text-green-500 transition-colors" />
                        </div>
                        <h2 className="text-3xl font-mono font-medium tracking-tighter text-white">
                            {agencyStats.avgHealth}%
                        </h2>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                </div>

                {/* Clients Table / Grid */}
                <div className="pt-4 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <LayoutGrid size={14} className="text-gray-500" />
                            Client Workspaces
                        </h3>
                        <div className="flex gap-2">
                            <button className="btn-ghost">
                                Filter
                            </button>
                            <button className="btn-primary">
                                + New Workspace
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-lg overflow-hidden">
                        {clients.map((client) => (
                            <div key={client.id} className="bg-[var(--bg-surface)] hover:bg-[#151515] p-6 transition-all group flex flex-col justify-between h-48 relative">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-300">
                                                {client.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-gray-200 group-hover:text-white">{client.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'critical' ? 'bg-red-500' : client.status === 'attention' ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest leading-none">{client.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div>
                                            <p className="text-label">Monthly Rev</p>
                                            <p className="text-mono-data text-white">{(client.revenue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                        </div>
                                        <div>
                                            <p className="text-label">Head</p>
                                            <p className="text-mono-data text-white">{client.responsible}</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onSelectClient(client)}
                                    className="mt-4 w-full h-8 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wide border border-white/10 rounded hover:bg-white hover:text-black transition-all text-gray-500 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-200"
                                >
                                    {t('dashboard.actions.access_os')} <ArrowRight size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
