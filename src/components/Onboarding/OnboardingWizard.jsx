import React, { useState, useEffect } from 'react';
import {
    ArrowRight,
    Sparkles,
    CheckCircle2,
    Loader2,
    Target,
    Shield,
    Palette,
    ShoppingBag,
    GitBranch,
    Users,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';

export function OnboardingWizard({ onComplete, onCancel }) {
    // Steps: 1=R1(Brand), 2=R2(Offer), 3=R3(Funnel), 4=R4(Ops), 5=Processing, 6=Review
    const [step, setStep] = useState(1);
    const [loadingText, setLoadingText] = useState("");

    useEffect(() => {
        console.log("Current Step:", step);
    }, [step]);

    // Form Data State covering ALL Vaults
    const [formData, setFormData] = useState({
        // R1: Brand (S1/S5)
        clientName: "",
        promise: "",
        enemy: "",
        tone: "",
        mood: "",
        primaryColor: "#000000",

        // R2: Offer (S2)
        heroProduct: "",
        heroPrice: "",
        heroMargin: "High",

        // R3: Funnel (S3)
        conversionLink: "",
        monthlyGoal: "",

        // R4: Ops (S4)
        approverName: "",
        slaHours: "24"
    });

    // AI Simulation Effect
    useEffect(() => {
        if (step === 5) {
            const sequence = [
                "Analisando DNA da Marca (R1)...",
                "Estruturando Tabela Comercial (R2)...",
                "Configurando Rastreadores de Funil (R3)...",
                "Definindo Matriz de Responsabilidade (R4)...",
                "Gerando Plano de Comunicação Inicial..."
            ];

            let i = 0;
            const interval = setInterval(() => {
                setLoadingText(sequence[i]);
                i++;
                if (i >= sequence.length) {
                    clearInterval(interval);
                    setTimeout(() => setStep(6), 800);
                }
            }, 1200);
            return () => clearInterval(interval);
        }
    }, [step]);

    const handleNext = (e) => {
        e.preventDefault();

        // Basic validation checking required fields for current step
        const form = document.getElementById('wizard-form');
        if (form && !form.checkValidity()) {
            form.reportValidity();
            return;
        }

        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    return (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
            <div className="max-w-3xl w-full bg-bravvo-card border border-bravvo-border rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">

                {/* Header with Progress */}
                <div className="p-6 border-b border-bravvo-border bg-gradient-to-r from-bravvo-card to-bravvo-card/50 shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-display font-black text-white flex items-center gap-2">
                                {step === 1 && <><Target className="text-bravvo-primary" /> R1: MARCA & DESIGN</>}
                                {step === 2 && <><ShoppingBag className="text-bravvo-primary" /> R2: ECONOMIA & OFERTA</>}
                                {step === 3 && <><GitBranch className="text-bravvo-primary" /> R3: FUNIL & VENDAS</>}
                                {step === 4 && <><Users className="text-bravvo-primary" /> R4: OPERAÇÃO</>}
                                {step === 5 && <><Sparkles className="text-bravvo-primary" /> BRAVVO AI ENGINE</>}
                                {step === 6 && "SISTEMA PRONTO"}
                            </h2>
                        </div>
                        <div className="text-xs font-mono text-gray-500">
                            PASSO {step > 4 ? 'FINAL' : step} DE 4
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden w-full">
                        <div
                            className="h-full bg-bravvo-primary transition-all duration-500"
                            style={{ width: `${Math.min((step / 4) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Content Area - Scrollable */}
                <div className="overflow-y-auto p-8 flex-1">
                    <form id="wizard-form" onSubmit={handleNext} className="space-y-6">

                        {/* STEP 1: BRAND (R1) */}
                        {step === 1 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="p-4 bg-bravvo-primary/5 border border-bravvo-primary/20 rounded-lg text-sm text-gray-300">
                                    <p>🏗️ <strong>Objetivo:</strong> Definir a alma e a cara do negócio. Isso alimenta o <strong>S1</strong> e <strong>S5</strong>.</p>
                                </div>

                                <div>
                                    <label className="input-label">Nome do Cliente</label>
                                    <input required className="input-field" placeholder="Ex: Bar do Zé"
                                        value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="input-label">Promessa (S1)</label>
                                        <input required className="input-field" placeholder="Ex: A cerveja mais gelada"
                                            value={formData.promise} onChange={e => setFormData({ ...formData, promise: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="input-label">Inimigo (S1)</label>
                                        <input required className="input-field" placeholder="Ex: Cerveja quente"
                                            value={formData.enemy} onChange={e => setFormData({ ...formData, enemy: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="input-label">Tom de Voz</label>
                                        <input required className="input-field" placeholder="Ex: Divertido"
                                            value={formData.tone} onChange={e => setFormData({ ...formData, tone: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="input-label">Design Mood</label>
                                        <input required className="input-field" placeholder="Ex: Raiz"
                                            value={formData.mood} onChange={e => setFormData({ ...formData, mood: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="input-label">Cor Principal</label>
                                        <div className="flex gap-2">
                                            <input type="color" className="h-10 w-10 bg-transparent cursor-pointer"
                                                value={formData.primaryColor} onChange={e => setFormData({ ...formData, primaryColor: e.target.value })} />
                                            <input className="input-field font-mono text-center" readOnly value={formData.primaryColor} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: OFFER (R2) */}
                        {step === 2 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg text-sm text-gray-300">
                                    <p>💰 <strong>Objetivo:</strong> O que vamos vender? Isso alimenta o <strong>S2 Commerce Vault</strong>.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                        <h3 className="font-bold text-white mb-4 flex items-center gap-2"><ShoppingBag size={16} /> Produto Carro-Chefe</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="input-label">Nome do Produto</label>
                                                <input required className="input-field" placeholder="Ex: Combo Churrasco"
                                                    value={formData.heroProduct} onChange={e => setFormData({ ...formData, heroProduct: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="input-label">Preço de Venda (R$)</label>
                                                <input required className="input-field" type="number" placeholder="0.00"
                                                    value={formData.heroPrice} onChange={e => setFormData({ ...formData, heroPrice: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                        <h3 className="font-bold text-white mb-4 flex items-center gap-2"><TrendingUp size={16} /> Estratégia</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="input-label">Margem Estimada</label>
                                                <select className="input-field" value={formData.heroMargin} onChange={e => setFormData({ ...formData, heroMargin: e.target.value })}>
                                                    <option value="High">Alta (Lucro)</option>
                                                    <option value="Medium">Média</option>
                                                    <option value="Low">Baixa (Isca)</option>
                                                </select>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-2">
                                                *O sistema usará isso para decidir se este produto deve ser usado em campanhas de tráfego ou retenção.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: FUNNEL (R3) */}
                        {step === 3 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg text-sm text-gray-300">
                                    <p>🔗 <strong>Objetivo:</strong> Onde o dinheiro entra? Isso alimenta o <strong>S3 Funnel Vault</strong>.</p>
                                </div>

                                <div>
                                    <label className="input-label">Link de Conversão Principal</label>
                                    <input required className="input-field" placeholder="Ex: wa.me/551199999999"
                                        value={formData.conversionLink} onChange={e => setFormData({ ...formData, conversionLink: e.target.value })} />
                                    <p className="text-xs text-gray-500 mt-1">Este link será inserido automaticamente em todos os botões CTA.</p>
                                </div>

                                <div>
                                    <label className="input-label">Meta de Faturamento (Ciclo)</label>
                                    <input required className="input-field" placeholder="Ex: R$ 50.000,00"
                                        value={formData.monthlyGoal} onChange={e => setFormData({ ...formData, monthlyGoal: e.target.value })} />
                                </div>
                            </div>
                        )}

                        {/* STEP 4: OPS (R4) */}
                        {step === 4 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg text-sm text-gray-300">
                                    <p>⚙️ <strong>Objetivo:</strong> Quem manda? Isso alimenta o <strong>S4 Ops Vault</strong>.</p>
                                </div>

                                <div>
                                    <label className="input-label">Quem Aprova os Materiais?</label>
                                    <input required className="input-field" placeholder="Ex: Nome do Dono"
                                        value={formData.approverName} onChange={e => setFormData({ ...formData, approverName: e.target.value })} />
                                </div>

                                <div>
                                    <label className="input-label">SLA de Aprovação (Horas)</label>
                                    <input required className="input-field" type="number" placeholder="24"
                                        value={formData.slaHours} onChange={e => setFormData({ ...formData, slaHours: e.target.value })} />
                                </div>
                            </div>
                        )}

                        {/* STEP 5: SIMULAÇÃO */}
                        {step === 5 && (
                            <div className="flex flex-col items-center justify-center space-y-8 py-12">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-bravvo-primary blur-2xl opacity-20 animate-pulse"></div>
                                    <Loader2 size={80} className="text-bravvo-primary animate-spin relative z-10" />
                                </div>
                                <div className="space-y-2 text-center">
                                    <h3 className="text-2xl font-bold text-white animate-pulse">{loadingText}</h3>
                                    <p className="text-gray-500">Construindo o Cérebro da Agência...</p>
                                </div>
                                <div className="w-96 h-1 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-bravvo-primary animate-progress"></div>
                                </div>
                            </div>
                        )}

                        {/* STEP 6: REVIEW */}
                        {step === 6 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg flex gap-3 text-green-400">
                                    <CheckCircle2 className="shrink-0" />
                                    <div>
                                        <h4 className="font-bold">Sistema Gerado com Sucesso</h4>
                                        <p className="text-sm opacity-80">Todos os 5 Vaults foram populados e o primeiro Plano de Comunicação (D2) foi criado.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <ReviewCard title="S1 Marca" content={`${formData.promise} vs ${formData.enemy}`} />
                                    <ReviewCard title="S2 Oferta" content={`${formData.heroProduct} (R$ ${formData.heroPrice})`} />
                                    <ReviewCard title="S3 Funnel" content={`Meta: ${formData.monthlyGoal}`} />
                                    <ReviewCard title="S4 Ops" content={`Aprovador: ${formData.approverName}`} />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="button"
                                        onClick={() => onComplete(formData)}
                                        className="w-full py-4 bg-white text-black font-black text-lg rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        Inicializar Bravvo OS <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Footer Buttons */}
                        {step < 5 && (
                            <div className="flex justify-between pt-6 border-t border-gray-800 mt-8">
                                {step > 1 ? (
                                    <button type="button" onClick={handleBack} className="text-gray-500 hover:text-white font-bold flex items-center gap-2">
                                        <ChevronLeft size={16} /> Voltar
                                    </button>
                                ) : (
                                    <button type="button" onClick={onCancel} className="text-gray-500 hover:text-white font-bold">
                                        Cancelar
                                    </button>
                                )}

                                <button type="submit" className="bg-bravvo-primary text-black font-bold px-8 py-3 rounded hover:bg-orange-600 transition-colors flex items-center gap-2">
                                    {step === 4 ? "Processar Inteligência" : "Próximo Passo"}
                                    {step === 4 ? <Sparkles size={16} /> : <ChevronRight size={16} />}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            <style>{`
                .input-label { @apply block text-xs font-bold text-gray-500 uppercase mb-1.5; }
                .input-field { @apply w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-bravvo-primary outline-none transition-colors; }
                @keyframes progress { 0% { width: 0% } 100% { width: 100% } }
                .animate-progress { animation: progress 5s ease-in-out infinite; }
            `}</style>
        </div>
    );
}

function ReviewCard({ title, content }) {
    return (
        <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
            <h5 className="text-xs font-bold text-bravvo-primary uppercase mb-1">{title}</h5>
            <p className="text-gray-300 truncate">{content}</p>
        </div>
    );
}
