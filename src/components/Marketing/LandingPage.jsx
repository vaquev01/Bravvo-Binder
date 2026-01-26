import React from 'react';
import {
    Calendar,
    Palette,
    CheckCircle2,
    User,
    Play,
    Database,
    LayoutDashboard,
    Wand2,
    FileCheck,
    Share2,
    Layers,
    Building2,
    Users,
    Briefcase,
    ChevronDown
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';

export function LandingPage({ onLogin }) {
    const { t } = useLanguage();

    const scrollToSection = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#030303] text-gray-200 font-sans selection:bg-white/20">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 bg-[#030303]/90 backdrop-blur-xl border-b border-white/[0.06]">
                <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-black rounded-[1px]" />
                        </div>
                        <span className="text-sm font-bold tracking-tight text-white">BRAVVO<span className="text-gray-600">BINDER</span></span>
                    </div>

                    <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-gray-400">
                        <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">{t('landing.how_it_works.title')}</button>
                        <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">{t('landing.features.title')}</button>
                        <button onClick={() => scrollToSection('use-cases')} className="hover:text-white transition-colors">{t('landing.use_cases.title')}</button>
                        <LanguageSwitcher />
                    </div>

                    <button
                        onClick={onLogin}
                        data-testid="landing-login"
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-[13px] font-bold text-white transition-all flex items-center gap-2"
                    >
                        <User size={14} />
                        {t('common.sign_in')}
                    </button>

                    {/* Mobile Language Switcher */}
                    <div className="md:hidden flex items-center gap-4">
                        <LanguageSwitcher />
                    </div>
                </div>
            </nav>

            {/* 1. HERO */}
            <header className="relative pt-32 pb-20 overflow-hidden border-b border-white/[0.06]">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light animate-fadeIn" />
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />

                <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-gray-400 mb-8 tracking-wider uppercase backdrop-blur-sm animate-fadeInUp">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            {t('landing.status')}
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-[-0.03em] text-white mb-8 leading-[1.1] drop-shadow-2xl animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                            {t('landing.hero.title_line1')} <br />
                            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{t('landing.hero.title_line2')}</span>
                        </h1>

                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                            {t('landing.hero.subtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                            <button
                                onClick={onLogin}
                                className="h-14 px-10 bg-white text-black text-[14px] font-bold tracking-wide rounded-lg hover:bg-gray-200 transition-all flex items-center gap-3 hover:translate-y-[-2px] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] duration-300 group"
                            >
                                <Play size={16} className="group-hover:scale-110 transition-transform" />
                                {t('landing.hero.cta_primary')}
                            </button>
                            <button
                                onClick={() => scrollToSection('how-it-works')}
                                className="h-14 px-10 bg-transparent border-2 border-white/30 text-white text-[14px] font-bold tracking-wide rounded-lg hover:bg-white/10 hover:border-white/50 transition-all flex items-center gap-2"
                            >
                                {t('landing.hero.cta_secondary')}
                                <ChevronDown size={16} />
                            </button>
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

            {/* 3. HOW IT WORKS - 4 Steps */}
            <section id="how-it-works" className="py-24 bg-[#030303]">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">{t('landing.how_it_works.title')}</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">{t('landing.how_it_works.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Step 1 - Vaults */}
                        <div className="bg-[#080808] border border-white/[0.08] rounded-xl p-8 group hover:border-purple-500/30 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-5xl font-black text-white/10 group-hover:text-purple-500/30 transition-colors">{t('landing.how_it_works.step1.number')}</span>
                                <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/30 rounded-lg flex items-center justify-center text-purple-400">
                                    <Database size={24} />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{t('landing.how_it_works.step1.title')}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{t('landing.how_it_works.step1.desc')}</p>
                        </div>

                        {/* Step 2 - Calendar */}
                        <div className="bg-[#080808] border border-white/[0.08] rounded-xl p-8 group hover:border-blue-500/30 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-5xl font-black text-white/10 group-hover:text-blue-500/30 transition-colors">{t('landing.how_it_works.step2.number')}</span>
                                <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-center text-blue-400">
                                    <Calendar size={24} />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{t('landing.how_it_works.step2.title')}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{t('landing.how_it_works.step2.desc')}</p>
                        </div>

                        {/* Step 3 - Creative */}
                        <div className="bg-[#080808] border border-white/[0.08] rounded-xl p-8 group hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-5xl font-black text-white/10 group-hover:text-orange-500/30 transition-colors">{t('landing.how_it_works.step3.number')}</span>
                                <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-center justify-center text-orange-400">
                                    <Wand2 size={24} />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{t('landing.how_it_works.step3.title')}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{t('landing.how_it_works.step3.desc')}</p>
                        </div>

                        {/* Step 4 - Approve */}
                        <div className="bg-[#080808] border border-white/[0.08] rounded-xl p-8 group hover:border-green-500/30 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-5xl font-black text-white/10 group-hover:text-green-500/30 transition-colors">{t('landing.how_it_works.step4.number')}</span>
                                <div className="w-12 h-12 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-center text-green-400">
                                    <CheckCircle2 size={24} />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{t('landing.how_it_works.step4.title')}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{t('landing.how_it_works.step4.desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. FEATURES GRID */}
            <section id="features" className="py-24 bg-[#050505] border-t border-b border-white/[0.06]">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">{t('landing.features.title')}</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">{t('landing.features.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Feature 1 - Vaults */}
                        <div className="bg-[#080808] border border-white/[0.08] rounded-xl p-8 hover:bg-[#0A0A0A] transition-colors group">
                            <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                                <Database size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-3">{t('landing.features.vaults.title')}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{t('landing.features.vaults.desc')}</p>
                        </div>

                        {/* Feature 2 - Dashboard */}
                        <div className="bg-[#080808] border border-white/[0.08] rounded-xl p-8 hover:bg-[#0A0A0A] transition-colors group">
                            <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                                <LayoutDashboard size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-3">{t('landing.features.dashboard.title')}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{t('landing.features.dashboard.desc')}</p>
                        </div>

                        {/* Feature 3 - Creative Studio */}
                        <div className="bg-[#080808] border border-white/[0.08] rounded-xl p-8 hover:bg-[#0A0A0A] transition-colors group">
                            <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 mb-6 group-hover:scale-110 transition-transform">
                                <Palette size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-3">{t('landing.features.creative.title')}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{t('landing.features.creative.desc')}</p>
                        </div>

                        {/* Feature 4 - Governance */}
                        <div className="bg-[#080808] border border-white/[0.08] rounded-xl p-8 hover:bg-[#0A0A0A] transition-colors group">
                            <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center text-green-400 mb-6 group-hover:scale-110 transition-transform">
                                <FileCheck size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-3">{t('landing.features.governance.title')}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{t('landing.features.governance.desc')}</p>
                        </div>

                        {/* Feature 5 - Channels */}
                        <div className="bg-[#080808] border border-white/[0.08] rounded-xl p-8 hover:bg-[#0A0A0A] transition-colors group">
                            <div className="w-14 h-14 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center text-pink-400 mb-6 group-hover:scale-110 transition-transform">
                                <Share2 size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-3">{t('landing.features.multicanal.title')}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{t('landing.features.multicanal.desc')}</p>
                        </div>

                        {/* Feature 6 - Formats */}
                        <div className="bg-[#080808] border border-white/[0.08] rounded-xl p-8 hover:bg-[#0A0A0A] transition-colors group">
                            <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                                <Layers size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-3">{t('landing.features.formats.title')}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{t('landing.features.formats.desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. USE CASES */}
            <section id="use-cases" className="py-24 bg-[#030303]">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">{t('landing.use_cases.title')}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Case 1 - Agencies */}
                        <div className="bg-gradient-to-b from-[#0A0A0A] to-[#080808] border border-white/[0.08] rounded-2xl p-10 text-center hover:border-purple-500/30 transition-all duration-300 group">
                            <div className="w-20 h-20 mx-auto mb-8 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                <Building2 size={36} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{t('landing.use_cases.case1.title')}</h3>
                            <p className="text-gray-400 leading-relaxed">{t('landing.use_cases.case1.desc')}</p>
                        </div>

                        {/* Case 2 - In-House */}
                        <div className="bg-gradient-to-b from-[#0A0A0A] to-[#080808] border border-white/[0.08] rounded-2xl p-10 text-center hover:border-blue-500/30 transition-all duration-300 group">
                            <div className="w-20 h-20 mx-auto mb-8 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <Users size={36} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{t('landing.use_cases.case2.title')}</h3>
                            <p className="text-gray-400 leading-relaxed">{t('landing.use_cases.case2.desc')}</p>
                        </div>

                        {/* Case 3 - Entrepreneurs */}
                        <div className="bg-gradient-to-b from-[#0A0A0A] to-[#080808] border border-white/[0.08] rounded-2xl p-10 text-center hover:border-green-500/30 transition-all duration-300 group">
                            <div className="w-20 h-20 mx-auto mb-8 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                                <Briefcase size={36} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{t('landing.use_cases.case3.title')}</h3>
                            <p className="text-gray-400 leading-relaxed">{t('landing.use_cases.case3.desc')}</p>
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
                            <li className="hover:text-white cursor-pointer transition-colors">Command Center</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Intelligence</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Governance</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">{t('landing.footer.company')}</h4>
                        <ul className="space-y-4 text-gray-500">
                            <li className="hover:text-white cursor-pointer transition-colors">Manifesto</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Careers</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Legal</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">{t('landing.footer.social')}</h4>
                        <ul className="space-y-4 text-gray-500">
                            <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter / X</a></li>
                            <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a></li>
                            <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
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

