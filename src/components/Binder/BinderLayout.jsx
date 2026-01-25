import React from 'react';
import { Target, ShoppingBag, GitBranch, Users, LayoutDashboard, CheckCircle2, Lightbulb, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function BinderLayout({ activeTab, setActiveTab, completedTabs, children, onBack }) {
    const { t } = useLanguage();
    const tabs = [
        { id: 'OS', label: 'BRAVVO OS', icon: LayoutDashboard, color: 'text-purple-400', border: 'border-purple-500/50', bg: 'bg-purple-500/10', special: true },
        { id: 'V1', label: 'VAULT 1', icon: Target, color: 'text-red-400', border: 'border-red-500/50', bg: 'bg-red-500/10' },
        { id: 'V2', label: 'VAULT 2', icon: ShoppingBag, color: 'text-orange-400', border: 'border-orange-500/50', bg: 'bg-orange-500/10' },
        { id: 'V3', label: 'VAULT 3', icon: GitBranch, color: 'text-blue-400', border: 'border-blue-500/50', bg: 'bg-blue-500/10' },
        { id: 'V4', label: 'VAULT 4', icon: Users, color: 'text-green-400', border: 'border-green-500/50', bg: 'bg-green-500/10' },
        { id: 'V5', label: 'VAULT 5', icon: Lightbulb, color: 'text-yellow-400', border: 'border-yellow-500/50', bg: 'bg-yellow-500/10' },
    ];

    return (
        <div className="flex h-screen bg-[#0a0a0a] text-gray-100 overflow-hidden font-sans">

            {/* Left Binder Tabs */}
            <div className="w-16 flex flex-col items-center py-6 gap-3 border-r border-white/5 bg-[#030303] z-10 shrink-0">
                {/* Minimal Logo Mark */}
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-bravvo-primary/30 to-transparent border border-white/10 flex items-center justify-center mb-4">
                    <span className="text-[9px] font-bold text-white/50">B</span>
                </div>

                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const isCompleted = completedTabs.includes(tab.id);
                    // User requested to remove restrictions ("nao precisa proibir")
                    // We keep the visual indicators of completion but allow clicking everything
                    const canClick = true;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                relative w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all duration-300 group
                                ${isActive ? `${tab.bg} ${tab.border} border-2 shadow-[0_0_20px_rgba(0,0,0,0.5)] scale-110 z-20` : 'bg-white/5 border border-white/5 hover:bg-white/10'}
                                ${!canClick && !isActive ? 'opacity-30 cursor-not-allowed grayscale' : 'opacity-100 cursor-pointer'}
                            `}
                        >
                            <tab.icon size={20} className={`${isActive ? tab.color : 'text-gray-400'} mb-1`} />
                            <span className={`text-[9px] font-bold ${isActive ? 'text-white' : 'text-gray-500'}`}>{tab.id}</span>

                            {/* Status Indicator */}
                            {isCompleted && !isActive && (
                                <div className="absolute -top-1 -right-1 bg-green-500 text-black rounded-full p-0.5">
                                    <CheckCircle2 size={10} />
                                </div>
                            )}

                            {/* Removed Lock Icon since everything is open now */}

                            {/* Active Tab Connector (Visual Trick) */}
                            {isActive && (
                                <div className={`absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-8 ${tab.bg} opacity-100 clip-path-triangle`} />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Main Content Area (The "Paper") */}
            <main className="flex-1 overflow-hidden relative flex flex-col">
                {/* Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-sm shrink-0">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                title={t('binder.actions.back_to_agency')}
                            >
                                <ArrowLeft size={16} />
                            </button>
                        )}
                        <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-0.5 font-mono">
                                <span>{onBack ? t('binder.nav.agency') : t('binder.nav.bravvo_os')}</span>
                                <span className="text-gray-600">/</span>
                                <span className={activeTab === 'OS' ? 'text-white font-bold' : ''}>
                                    {activeTab === 'OS' ? t('binder.nav.command_center') : t('binder.nav.binder')}
                                </span>
                                {activeTab !== 'OS' && (
                                    <>
                                        <span className="text-gray-600">/</span>
                                        <span className="text-white font-bold">{tabs.find(t => t.id === activeTab)?.label}</span>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-display font-black text-xl tracking-tight text-white leading-none">
                                    {tabs.find(tab => tab.id === activeTab)?.label || t('binder.nav.dashboard')}
                                </h1>
                                {/* Autosave Indicator (Mocked for now, but valid UI) */}
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20 ml-2" title="Todas as alterações salvas">
                                    <CheckCircle2 size={10} className="text-green-500" />
                                    <span className="text-[9px] font-bold text-green-400 uppercase tracking-wide">{t('binder.status.saved')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Progress Indicator */}
                        <div className="hidden md:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                            <div className="flex gap-1">
                                {['V1', 'V2', 'V3', 'V4'].map((vaultId) => {
                                    const isComplete = completedTabs.includes(vaultId);
                                    const isCurrent = activeTab === vaultId;
                                    return (
                                        <button
                                            key={vaultId}
                                            onClick={() => setActiveTab(vaultId)}
                                            className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 cursor-pointer ${isCurrent ? 'bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]' :
                                                isComplete ? 'bg-green-500 hover:bg-green-400' :
                                                    'bg-white/20 hover:bg-white/40'
                                                }`}
                                            title={`Go to ${vaultId}`}
                                        />
                                    );
                                })}
                            </div>
                            <span className="text-xs font-mono text-gray-400">
                                {completedTabs.filter(t => t.startsWith('V')).length}/4 {t('binder.progress.vaults')}
                            </span>
                        </div>

                        <div className="text-right">
                            <p className="text-xs text-gray-400">{t('binder.actions.current_phase')}</p>
                            <p className={`text-sm font-bold ${tabs.find(tab => tab.id === activeTab)?.color}`}>
                                {tabs.find(tab => tab.id === activeTab)?.label}
                            </p>
                        </div>
                    </div>
                </header>

                {/* Page Content Container */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#050505]">
                    {/* Clean Background (Pattern removed for professional look) */}

                    {/* Conditional Wrapper: Dashboard gets full width, others get focused document view */}
                    <div className={`${activeTab === 'OS' ? 'w-full h-full' : 'max-w-5xl mx-auto w-full min-h-full p-4 sm:p-8'}`}>
                        {/* The "Sheet" Effect */}
                        <div className={`
                            relative overflow-hidden animate-fadeIn h-full
                            ${activeTab === 'OS' ? 'bg-[#050505] p-0' : 'bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-8'}
                        `}>
                            {/* Top Accent Line (Only for non-OS) */}
                            {activeTab !== 'OS' && <div className={`absolute top-0 left-0 right-0 h-1 ${tabs.find(t => t.id === activeTab)?.bg.replace('/10', '')}`} />}

                            {children}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
