import React, { useState, useEffect } from 'react';
import { Briefcase, Zap, User, Check, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

function PricingModal({ open, onClose }) {
    const { t } = useLanguage();

    if (!open) return null;

    const plans = [
        {
            name: t('auth.pricing.tier1.name'),
            badge: t('auth.pricing.tier1.badge'),
            price: "R$ 497",
            period: "/mês",
            description: t('auth.pricing.tier1.desc'),
            features: [
                "Acesso ao Agency Command Center",
                "Brevvo OS (Client Dashboards)",
                "Gerador de Prompts IA",
                "Vaults de Marca & Oferta",
                "Suporte via Ticket"
            ],
            cta: t('auth.pricing.tier1.cta'),
            highlight: false
        },
        {
            name: t('auth.pricing.tier2.name'),
            badge: t('auth.pricing.tier2.badge'),
            price: "R$ 1.497",
            period: "/mês",
            description: t('auth.pricing.tier2.desc'),
            features: [
                "Tudo do plano OS",
                "1h Setup Assistido (Onboarding)",
                "1h/mês de Reunião de Governança",
                "Auditoria de Processos",
                "Suporte Prioritário (WhatsApp)"
            ],
            cta: t('auth.pricing.tier2.cta'),
            highlight: true
        },
        {
            name: t('auth.pricing.tier3.name'),
            badge: t('auth.pricing.tier3.badge'),
            price: "Sob Consulta",
            period: "",
            description: t('auth.pricing.tier3.desc'),
            features: [
                "Acesso Full ao Sistema",
                "Preenchimento mensal dos Vaults",
                "Geração Manual de Briefings",
                "Curadoria Criativa",
                "Reunião Quinzenal de Estratégia"
            ],
            cta: t('auth.pricing.tier3.cta'),
            highlight: false
        }
    ];

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="max-w-5xl w-full bg-[#050505] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors z-10"
                >
                    <X size={24} />
                </button>

                <div className="text-center pt-10 pb-6 px-6">
                    <h2 className="text-3xl font-bold text-white mb-2">{t('auth.pricing.title')}</h2>
                    <p className="text-gray-400">{t('auth.pricing.subtitle')}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan, idx) => (
                            <div
                                key={idx}
                                className={`relative flex flex-col p-6 rounded-xl border transition-all duration-300 ${plan.highlight
                                    ? 'bg-white/[0.03] border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.1)] scale-105 z-10'
                                    : 'bg-white/[0.01] border-white/10 hover:border-white/20'
                                    }`}
                            >
                                {plan.highlight && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                        Mais Escolhido
                                    </div>
                                )}

                                <div className="mb-6">
                                    <div className="inline-block px-2 py-1 rounded border border-white/10 text-[10px] text-gray-400 font-mono mb-3 uppercase tracking-wider">
                                        {plan.badge}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-white tracking-tight">{plan.price}</span>
                                        <span className="text-sm text-gray-500">{plan.period}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-3 leading-relaxed min-h-[40px]">
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((feat, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                                            <Check size={14} className={`shrink-0 ${plan.highlight ? 'text-purple-400' : 'text-gray-600'}`} />
                                            <span>{feat}</span>
                                        </div>
                                    ))}
                                </div>

                                <button className={`w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${plan.highlight
                                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg'
                                    : 'bg-white text-black hover:bg-gray-200'
                                    }`}>
                                    {plan.cta}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function LoginScreen({ onLogin }) {
    const { t } = useLanguage();
    const [showPricing, setShowPricing] = useState(false);
    const [, setShowAdmin] = useState(false);

    // Secret Key Combo to reveal Admin: Cmd+Shift+M
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'm') {
                e.preventDefault();
                setShowAdmin(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleLogin = (role, credentials) => {
        onLogin(role, credentials);
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-purple-500/30">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />

            <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Left Side: Brand */}
                <div className="space-y-8 md:pr-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-400 backdrop-blur-sm">
                        <Zap size={12} className="text-yellow-500" />
                        <span>{t('auth.login.badge')}</span>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
                            {t('auth.login.title_line1')} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{t('auth.login.title_line2')}</span>
                        </h1>
                        <p className="text-lg text-gray-400 max-w-md leading-relaxed font-light">
                            {t('auth.login.subtitle')}
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowPricing(true)}
                            className="h-12 px-8 bg-white text-black text-xs font-bold uppercase tracking-wider rounded hover:bg-gray-200 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2"
                        >
                            {t('auth.login.cta_pricing')}
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5">
                        <div className="group cursor-default">
                            <h4 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">15+</h4>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Agências</span>
                        </div>
                        <div className="group cursor-default">
                            <h4 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">200+</h4>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Marcas</span>
                        </div>
                        <div className="group cursor-default">
                            <h4 className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors">R$ 12M</h4>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Gerenciados</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Unified Login Form */}
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full group-hover:bg-purple-500/10 transition-colors"></div>

                        <h3 className="text-xl font-bold text-white mb-6">{t('auth.login.form_title')}</h3>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const user = e.target.username.value;
                            const pass = e.target.password.value;
                            const remember = e.target.remember.checked;

                            if (user === 'bravvo' && pass === '1@Wardogs') {
                                handleLogin('agency', { username: user, remember });
                            } else if (user === 'client' && pass === 'client') {
                                handleLogin('client', { username: user, remember });
                            } else {
                                alert('Credenciais inválidas. Tente novamente.');
                            }
                        }} className="space-y-4 relative z-10">

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{t('auth.login.label_user')}</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 text-gray-600" size={16} />
                                    <input
                                        name="username"
                                        type="text"
                                        placeholder={t('auth.login.placeholder_user')}
                                        className="w-full bg-[#111] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-all placeholder-gray-700"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{t('auth.login.label_pass')}</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-2.5 text-gray-600" size={16} /> {/* Using Briefcase as lock icon substitute if don't want to import Lock */}
                                    <input
                                        name="password"
                                        type="password"
                                        placeholder={t('auth.login.placeholder_pass')}
                                        className="w-full bg-[#111] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-all placeholder-gray-700"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    id="remember"
                                    className="rounded bg-[#111] border-white/10 text-purple-600 focus:ring-purple-500/20 focus:ring-offset-0"
                                />
                                <label htmlFor="remember" className="text-xs text-gray-400 select-none cursor-pointer hover:text-white transition-colors">
                                    {t('auth.login.remember')}
                                </label>
                            </div>

                            <button
                                type="submit"
                                data-testid="login-submit"
                                className="w-full bg-white text-black font-bold h-10 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mt-4"
                            >
                                <Zap size={16} className="fill-black" />
                                {t('auth.login.submit')}
                            </button>
                        </form>
                    </div>

                    <div className="pt-6 text-center">
                        <p className="text-[10px] text-gray-600 font-mono">
                            {t('auth.login.help')}<br />
                            <span className="opacity-30">Status: All Systems Operational</span>
                        </p>
                    </div>
                </div>
            </div>

            <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />
        </div>
    );
}
