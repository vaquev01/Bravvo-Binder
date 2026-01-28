import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
    Users,
    Shield,
    LogOut,
    Search,
    Building2,
    ArrowRight,
    TrendingUp,
    AlertTriangle,
} from 'lucide-react';
import { storageService } from '../../services/storageService';

export function MasterDashboard({ onSelectClient, onLogout }) {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAgency, setFilterAgency] = useState('all');

    const allClients = useMemo(() => {
        const discoveredIds = typeof storageService.listClientIds === 'function'
            ? storageService.listClientIds()
            : [];
        const baselineIds = ['C1', 'C2'];
        const clientIds = Array.from(new Set([...baselineIds, ...discoveredIds])).filter(Boolean);

        return clientIds.map((id) => {
            const data = storageService.loadClientData(id);
            const revenueValue = Number(data?.kpis?.revenue?.value || 0);
            const revenueGoal = Number(data?.kpis?.revenue?.goal || 0);
            const status = revenueGoal > 0 && revenueValue < revenueGoal * 0.8 ? 'attention' : 'on_track';

            return {
                id,
                name: data?.clientName || `Client ${id}`,
                agency: 'Local',
                revenue: revenueValue,
                status,
                kpis: data?.kpis,
            };
        });
    }, []);

    const agencies = useMemo(() => [{ id: 'LOCAL', name: 'Local', clients: allClients.map(c => c.id) }], [allClients]);

    const filteredClients = allClients.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAgency = filterAgency === 'all' || c.agency === filterAgency;
        return matchesSearch && matchesAgency;
    });

    // Calculate Global Stats
    const totalRevenue = allClients.reduce((acc, curr) => acc + curr.revenue, 0);
    const criticalClients = allClients.filter(c => c.status === 'attention').length;

    return (
        <div className="min-h-screen bg-[var(--bg-deep)] text-white font-sans selection:bg-white/20">
            {/* Top Navigation - Ultra Minimal */}
            <header className="h-14 border-b border-[var(--border-subtle)] flex items-center justify-between px-6 bg-[var(--bg-deep)] sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-sm">M</div>
                    <span className="text-subtitle">{t('dashboard.master.bravvo_master')}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase tracking-widest">{t('dashboard.master.admin')}</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs text-gray-400 focus-within:border-white/20 transition-colors">
                        <Search size={12} />
                        <input
                            placeholder={t('dashboard.actions.search_wide')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent outline-none w-48 focus:w-64 transition-all placeholder-gray-600"
                        />
                    </div>
                    <button
                        onClick={onLogout}
                        className="p-2 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors"
                        title={t('dashboard.actions.logout')}
                    >
                        <LogOut size={16} />
                    </button>
                    <div className="w-7 h-7 rounded bg-gray-700 border border-white/10"></div>
                </div>
            </header>

            <main className="p-6 max-w-[1600px] mx-auto space-y-6">
                {/* Stats Grid - Bento Style */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bento-grid p-5 bento-cell group">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-label">{t('dashboard.master.global_revenue')}</span>
                            <div className="p-1 bg-green-500/10 rounded text-green-500">
                                <TrendingUp size={14} />
                            </div>
                        </div>
                        <h2 className="text-metric-lg font-mono group-hover:text-success transition-colors">
                            R$ {(totalRevenue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </h2>
                    </div>

                    <div className="bento-grid p-5 bento-cell group">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-label">{t('dashboard.master.total_clients')}</span>
                            <DatabaseIcon count={allClients.length} />
                        </div>
                        <h2 className="text-metric-lg font-mono group-hover:text-info transition-colors">
                            {allClients.length}
                        </h2>
                        <p className="text-[10px] text-gray-500 mt-2 font-mono">
                            {t('dashboard.master.across_agencies').replace('{count}', agencies.length)}
                        </p>
                    </div>

                    <div className="bento-grid p-5 bento-cell group">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-label">{t('dashboard.master.system_health')}</span>
                            <AlertTriangle className={criticalClients > 0 ? "text-red-500" : "text-green-500"} size={14} />
                        </div>
                        <h2 className="text-metric-lg font-mono">
                            {criticalClients > 0 ? `${criticalClients} ${t('dashboard.master.risks')}` : '100% OK'}
                        </h2>
                        <p className="text-[10px] text-gray-500 mt-2 font-mono">
                            {criticalClients} {t('dashboard.master.requires_attention')}
                        </p>
                    </div>
                </div>

                {/* Main Table - Linear Style */}
                <div className="bento-grid">
                    <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface)]">
                        <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                            <Shield size={14} className="text-blue-500" />
                            Audit Log & Access
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 uppercase font-bold">Agency Filter:</span>
                            <select
                                value={filterAgency}
                                onChange={(e) => setFilterAgency(e.target.value)}
                                className="bg-[#111] text-[10px] text-white border border-white/10 rounded px-2 py-1 outline-none focus:border-blue-500"
                            >
                                <option value="all">All Agencies</option>
                                <option value="Direto">Direct Clients</option>
                                {agencies.map(a => (
                                    <option key={a.id} value={a.name}>{a.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="w-full">
                        {/* Header */}
                        <div className="grid grid-cols-[80px_1fr_1fr_150px_100px_120px] gap-4 px-6 py-3 border-b border-[var(--border-subtle)] bg-[#080808]">
                            <div className="text-label">ID</div>
                            <div className="text-label">{t('dashboard.master.client_name')}</div>
                            <div className="text-label">{t('dashboard.master.agency_owner')}</div>
                            <div className="text-label">{t('dashboard.master.revenue')}</div>
                            <div className="text-label text-center">{t('dashboard.master.status')}</div>
                            <div className="text-label text-right">{t('dashboard.master.action')}</div>
                        </div>

                        {/* Body */}
                        <div className="bg-[var(--bg-deep)]">
                            {filteredClients.map(client => (
                                <div key={client.id} className="grid grid-cols-[80px_1fr_1fr_150px_100px_120px] gap-4 px-6 py-3 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] group transition-colors items-center">
                                    <div className="text-mono-data text-gray-500">{client.id}</div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                            {client.name.charAt(0)}
                                        </div>
                                        <span className="font-bold text-xs text-gray-200 group-hover:text-white transition-colors">{client.name}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-gray-400">
                                            <Building2 size={10} />
                                            {client.agency}
                                        </div>
                                    </div>
                                    <div className="text-mono-data text-gray-300">
                                        R$ {client.revenue.toLocaleString()}
                                    </div>
                                    <div className="text-center">
                                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${client.status === 'on_track' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
                                    </div>
                                    <div className="text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onSelectClient(client)}
                                            className="px-3 py-1 text-[10px] font-bold bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded border border-blue-500/20 hover:border-blue-500 transition-all flex items-center gap-1 ml-auto"
                                        >
                                            Access Admin <ArrowRight size={10} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function DatabaseIcon({ count: _count }) {
    return (
        <div className="flex items-center gap-1 text-blue-500">
            <Users size={14} />
        </div>
    );
}

