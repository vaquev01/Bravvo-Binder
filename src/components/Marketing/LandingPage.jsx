import React from 'react';
import {
    Shield,
    ArrowRight,
    BrainCircuit,
    Command,
    User,
    Play
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';

export function LandingPage({ onLogin }) {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-[#030303] text-gray-200 font-sans selection:bg-white/20">
            {/* Nav - Ultra Minimal */}
            <nav className="fixed top-0 w-full z-50 bg-[#030303]/90 backdrop-blur-xl border-b border-white/[0.06]">
                <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-black rounded-[1px]" />
                        </div>
                        <span className="text-sm font-bold tracking-tight text-white">BRAVVO<span className="text-gray-600">BINDER</span></span>
                    </div>

                    <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-gray-400">
                        <a href="#manifesto" className="hover:text-white transition-colors">Manifesto</a>
                        <a href="#platform" className="hover:text-white transition-colors">Platform</a>
                        <LanguageSwitcher />
                    </div>

                    <button
                        onClick={onLogin}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-[13px] font-bold text-white transition-all flex items-center gap-2"
                    >
                        <User size={14} />
                        {t('common.sign_in')}
                    </button>

                    {/* Mobile Language Switcher (visible only on small screens) */}
                    <div className="md:hidden flex items-center gap-4">
                        <LanguageSwitcher />
                    </div>
                </div>
            </nav>

            {/* 1. HERO - Enterprise Scale */}
            <header className="relative pt-32 pb-24 overflow-hidden border-b border-white/[0.06]">
                {/* Subtle Grid Background */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light animate-fadeIn" />
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />

                <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-gray-400 mb-8 tracking-wider uppercase backdrop-blur-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                {t('landing.status')}
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold tracking-[-0.03em] text-white mb-8 leading-[1] drop-shadow-2xl">
                                {t('landing.hero.title_line1')} <br />
                                {t('landing.hero.title_line2')}
                            </h1>

                            <p className="text-lg text-gray-500 max-w-xl mb-10 leading-relaxed font-light">
                                {t('landing.hero.subtitle')}
                            </p>

                            <div className="flex flex-col sm:flex-row items-start gap-4">
                                <button
                                    onClick={onLogin}
                                    className="h-14 px-10 bg-white text-black text-[14px] font-bold tracking-wide rounded hover:bg-gray-200 transition-all flex items-center gap-3 hover:translate-y-[-2px] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] duration-300 group"
                                >
                                    <Play size={16} className="group-hover:scale-110 transition-transform" />
                                    {t('landing.hero.cta_primary')}
                                </button>
                                <button
                                    onClick={onLogin}
                                    className="h-14 px-10 bg-transparent border-2 border-white/30 text-white text-[14px] font-bold tracking-wide rounded hover:bg-white/10 hover:border-white/50 transition-all"
                                >
                                    {t('landing.hero.cta_secondary')}
                                </button>
                            </div>
                        </div>

                        {/* High-Fidelity UI Fragment */}
                        <div className="relative animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                            <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 blur-2xl rounded-lg animate-pulse" />
                            <div className="relative bg-[#080808] rounded-xl border border-white/[0.08] shadow-2xl overflow-hidden aspect-[4/3] glass-panel-premium">
                                {/* Mock UI Header */}
                                <div className="h-10 border-b border-white/[0.06] bg-[#0A0A0A] flex items-center px-4 gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                                    </div>
                                    <div className="flex-1 text-center">
                                        <div className="inline-block px-3 py-1 bg-black rounded text-[10px] text-gray-500 font-mono">bravvo.os / dashboard</div>
                                    </div>
                                </div>
                                {/* Mock UI Content */}
                                <div className="p-6 grid grid-cols-12 gap-4 h-full relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none animate-shimmer" />
                                    <div className="col-span-3 border-r border-white/[0.06] pr-4 space-y-3">
                                        <div className="h-2 w-12 bg-white/10 rounded-sm" />
                                        <div className="h-8 w-full bg-white/[0.03] rounded-sm" />
                                        <div className="h-8 w-full bg-white/[0.03] rounded-sm" />
                                        <div className="h-8 w-full bg-white/10 rounded-sm border-l-2 border-white" />
                                        <div className="h-8 w-full bg-white/[0.03] rounded-sm" />
                                    </div>
                                    <div className="col-span-9 space-y-4">
                                        <div className="flex justify-between">
                                            <div className="h-8 w-32 bg-white/10 rounded-sm" />
                                            <div className="h-8 w-8 bg-blue-500 rounded-sm" />
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="h-24 bg-white/[0.03] border border-white/[0.06] rounded-sm" />
                                            <div className="h-24 bg-white/[0.03] border border-white/[0.06] rounded-sm" />
                                            <div className="h-24 bg-white/[0.03] border border-white/[0.06] rounded-sm" />
                                        </div>
                                        <div className="h-32 bg-white/[0.02] border border-white/[0.06] rounded-sm mt-4 w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. NUMBERS - The 'Scale' Proof */}
            <section className="border-b border-white/[0.06] bg-[#050505]">
                <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
                    {[
                        { label: t('landing.stats.agencies'), value: '14+' },
                        { label: t('landing.stats.campaigns'), value: '2.5k' },
                        { label: t('landing.stats.assets'), value: '18M' },
                        { label: t('landing.stats.uptime'), value: '99.99%' },
                    ].map((stat, i) => (
                        <div key={i} className="py-10 px-8 text-center md:text-left hover:bg-white/[0.02] transition-colors cursor-default group animate-fadeInUp" style={{ animationDelay: `${0.4 + (i * 0.1)}s` }}>
                            <div className="text-3xl md:text-4xl font-light text-white mb-2 group-hover:tracking-wider transition-all duration-500">{stat.value}</div>
                            <div className="text-[11px] uppercase tracking-widest text-gray-600 font-bold">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. PLATFORM ARCHITECTURE (The 'Feature' Grid) */}
            <section id="platform" className="py-32 bg-[#030303]">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="mb-20 animate-fadeInUp">
                        <h2 className="text-3xl font-bold text-white mb-4">{t('landing.architecture.title')}</h2>
                        <p className="text-gray-500 max-w-lg">{t('landing.architecture.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-px bg-white/[0.08] border border-white/[0.08] overflow-hidden rounded-lg">

                        {/* Big Cell - Command Center */}
                        <div className="md:col-span-2 md:row-span-2 bg-[#080808] p-12 flex flex-col justify-between group overflow-hidden relative cursor-default hover:bg-[#090909] transition-colors">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded flex items-center justify-center mb-8 text-white group-hover:scale-110 transition-transform duration-500">
                                    <Command strokeWidth={1.5} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">{t('landing.architecture.card_command.title')}</h3>
                                <p className="text-gray-400 max-w-md leading-relaxed">
                                    {t('landing.architecture.card_command.desc')}
                                </p>
                            </div>
                            <div className="relative mt-12 z-10">
                                <div className="h-64 bg-[#030303] border border-white/10 rounded-t-lg shadow-2xl p-6 group-hover:translate-y-[-12px] group-hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.05)] transition-all duration-700 ease-out">
                                    <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                                        <span className="text-sm font-bold text-gray-300">Global Revenue</span>
                                        <span className="text-sm font-mono text-green-500">+24.5%</span>
                                    </div>
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded bg-white/5" />
                                                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-white/20 w-2/3 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cell - AI */}
                        <div className="bg-[#080808] p-10 group hover:bg-[#0A0A0A] transition-colors relative cursor-default">
                            <div className="absolute top-6 right-6 text-white/10 group-hover:text-purple-500/50 transition-colors duration-500 group-hover:scale-110 transform">
                                <BrainCircuit size={32} />
                            </div>
                            <div className="mt-20">
                                <h3 className="text-lg font-bold text-white mb-2">{t('landing.architecture.card_ai.title')}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {t('landing.architecture.card_ai.desc')}
                                </p>
                            </div>
                        </div>

                        {/* Cell - Governance */}
                        <div className="bg-[#080808] p-10 group hover:bg-[#0A0A0A] transition-colors relative cursor-default">
                            <div className="absolute top-6 right-6 text-white/10 group-hover:text-blue-500/50 transition-colors duration-500 group-hover:scale-110 transform">
                                <Shield size={32} />
                            </div>
                            <div className="mt-20">
                                <h3 className="text-lg font-bold text-white mb-2">{t('landing.architecture.card_gov.title')}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {t('landing.architecture.card_gov.desc')}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 4. MANIFESTO - Typography Focus */}
            <section id="manifesto" className="py-32 bg-white text-black">
                <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-24">
                    <div>
                        <h2 className="text-[11px] font-bold tracking-widest uppercase text-gray-500 mb-8 font-mono">
                            {t('landing.manifesto.label')}
                        </h2>
                        <h3 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.1] mb-8">
                            {t('landing.manifesto.title')}
                        </h3>
                    </div>
                    <div className="space-y-10">
                        <p className="text-xl font-medium leading-relaxed max-w-lg">
                            {t('landing.manifesto.p1')}
                        </p>
                        <p className="text-gray-600 leading-relaxed max-w-lg">
                            {t('landing.manifesto.p2')}
                        </p>

                        <div className="pt-8 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-bold text-sm mb-2">{t('landing.manifesto.agency_title')}</h4>
                                    <p className="text-sm text-gray-500">{t('landing.manifesto.agency_desc')}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm mb-2">{t('landing.manifesto.enterprise_title')}</h4>
                                    <p className="text-sm text-gray-500">{t('landing.manifesto.enterprise_desc')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. CTA - Minimalist */}
            <section className="py-40 bg-[#030303] border-t border-white/[0.06] text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:64px_64px]" />
                <div className="relative z-10 max-w-2xl mx-auto px-6">
                    <h2 className="text-4xl md:text-6xl font-bold tabular-nums tracking-tight text-white mb-10">
                        {t('common.ready_to_operate')}
                    </h2>
                    <div className="flex flex-col items-center gap-6">
                        <button
                            onClick={onLogin}
                            className="h-16 px-14 bg-white text-black text-base font-bold tracking-wide rounded-lg hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.3)] flex items-center gap-3 group"
                        >
                            <Play size={18} className="group-hover:scale-110 transition-transform" />
                            {t('landing.hero.cta_primary')}
                        </button>
                        <p className="text-xs text-gray-600 font-mono">
                            v5.0 Stable • Enterprise Grade Security
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer - Multi-column */}
            <footer className="py-20 bg-[#050505] border-t border-white/[0.06] text-sm">
                <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-2 md:grid-cols-6 gap-10">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-4 h-4 bg-white rounded-sm" />
                            <span className="font-bold text-white">BRAVVO</span>
                        </div>
                        <p className="text-gray-500 max-w-xs">
                            {t('landing.hero.subtitle').split('.')[0]}.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">{t('landing.footer.platform')}</h4>
                        <ul className="space-y-4 text-gray-500">
                            <li className="hover:text-white cursor-pointer">Command Center</li>
                            <li className="hover:text-white cursor-pointer">Intelligence</li>
                            <li className="hover:text-white cursor-pointer">Governance</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">{t('landing.footer.company')}</h4>
                        <ul className="space-y-4 text-gray-500">
                            <li className="hover:text-white cursor-pointer">Manifesto</li>
                            <li className="hover:text-white cursor-pointer">Careers</li>
                            <li className="hover:text-white cursor-pointer">Legal</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">{t('landing.footer.social')}</h4>
                        <ul className="space-y-4 text-gray-500">
                            <li className="hover:text-white cursor-pointer">Twitter / X</li>
                            <li className="hover:text-white cursor-pointer">LinkedIn</li>
                            <li className="hover:text-white cursor-pointer">GitHub</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">{t('common.status')}</h4>
                        <div className="flex items-center gap-2 text-green-500">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span>{t('common.all_systems_normal')}</span>
                        </div>
                    </div>
                </div>
                <div className="max-w-[1400px] mx-auto px-6 mt-20 pt-10 border-t border-white/[0.06] flex justify-between text-gray-600 text-xs">
                    <p>{t('landing.footer.rights')}</p>
                    <p>San Francisco • São Paulo • London</p>
                </div>
            </footer>
        </div>
    );
}

