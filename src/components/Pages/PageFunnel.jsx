import React from 'react';
import { GitBranch, ArrowRight, Link as LinkIcon, Target, BarChart3, MousePointer, CheckCircle2 } from 'lucide-react';
import { ChannelGrid } from '../ui/ChannelGrid';
import { useVaultForm } from '../../hooks/useVaultForm';

const CTA_OPTIONS = [
    { value: 'whatsapp', label: '💬 Falar no WhatsApp' },
    { value: 'comprar', label: '🛒 Comprar Agora' },
    { value: 'agendar', label: '📅 Agendar Horário' },
    { value: 'ifood', label: '🍔 Pedir pelo iFood' },
    { value: 'reservar', label: '🪑 Fazer Reserva' },
    { value: 'orcamento', label: '📝 Solicitar Orçamento' },
    { value: 'saibamais', label: 'ℹ️ Saiba Mais' },
    { value: 'baixar', label: '📥 Baixar Material' },
    { value: 'inscrever', label: '✉️ Inscrever-se' },
];

export function PageFunnel({ formData: externalFormData, setFormData: externalSetFormData, onNext }) {
    // Use unified vault form hook
    const { formData: vaultFormData, updateField: vaultUpdateField, isSynced, saveAndAdvance } = useVaultForm('V3');
    
    const formData = vaultFormData || externalFormData || {};
    const updateField = (field, value) => {
        if (vaultUpdateField) {
            vaultUpdateField(field, value);
        } else {
            externalSetFormData?.({ ...formData, [field]: value });
        }
        if (field === 'conversionLink' && value) setValidationError(false);
    };
    
    const [validationError, setValidationError] = React.useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.conversionLink) {
            setValidationError(true);
            alert("⚠️ Por favor, insira o Link de Conversão (WhatsApp ou Site) para continuar.");
            return;
        }
        saveAndAdvance(onNext, 'Vault 3 (Funnel)');
    };

    const activeChannels = formData.channels || [];

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-info mb-2">
                    <GitBranch size={24} />
                    <span className="text-mono-data uppercase">VAULT 3 • FUNNEL</span>
                </div>
                <h2 className="text-title text-2xl">Funil & Conversão</h2>
                <p className="text-body max-w-xl">
                    Onde você está presente e como converte. Dados para o <strong>S3 (Funnel Vault)</strong>.
                </p>
            </div>

            {/* Section 1: Canais de Marketing */}
            <section className="space-y-6">
                <h3 className="text-subtitle flex items-center gap-2">
                    <span className="w-6 h-6 bg-info/20 text-info rounded flex items-center justify-center text-xs">1</span>
                    Canais de Marketing
                </h3>
                <p className="text-caption">
                    Selecione todos os canais onde sua marca está presente ou planeja estar.
                </p>

                <ChannelGrid
                    value={activeChannels}
                    onChange={(channels) => updateField('channels', channels)}
                />

                {/* Selected Channels Count */}
                <p className="text-caption">
                    {activeChannels.length} canal(is) selecionado(s)
                </p>
            </section>

            {/* Section 2: Links de Conversão */}
            <section className="space-y-6">
                <h3 className="text-subtitle flex items-center gap-2">
                    <span className="w-6 h-6 bg-info/20 text-info rounded flex items-center justify-center text-xs">2</span>
                    <LinkIcon size={16} className="text-info" />
                    Links de Conversão
                </h3>

                <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6 space-y-6">
                    {/* Main Link */}
                    <div>
                        <label className="input-label">Link Principal (WhatsApp/Site)</label>
                        <div className="flex gap-2">
                            <span className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-secondary)] font-mono text-sm flex items-center">https://</span>
                            <input
                                required
                                placeholder="wa.me/5511999999999"
                                value={formData.conversionLink || ''}
                                onChange={e => updateField('conversionLink', e.target.value)}
                                className={`input-field font-mono flex-1 ${validationError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                            />
                        </div>
                        <p className="text-xs text-blue-400/80 mt-2">
                            ⚡ Este link será injetado automaticamente em todos os CTAs criados pela IA.
                        </p>
                    </div>

                    {/* Channel-specific Links */}
                    {activeChannels.includes('instagram') && (
                        <div>
                            <label className="input-label">Link do Instagram</label>
                            <div className="flex gap-2">
                                <span className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-secondary)] font-mono text-sm flex items-center">@</span>
                                <input
                                    className="input-field font-mono flex-1"
                                    placeholder="seuperfil"
                                    value={formData.instagramHandle || ''}
                                    onChange={e => updateField('instagramHandle', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {activeChannels.includes('website') && (
                        <div>
                            <label className="input-label">URL do Site</label>
                            <div className="flex gap-2">
                                <span className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-secondary)] font-mono text-sm flex items-center">https://</span>
                                <input
                                    className="input-field font-mono flex-1"
                                    placeholder="www.seusite.com.br"
                                    value={formData.websiteUrl || ''}
                                    onChange={e => updateField('websiteUrl', e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Section 3: CTAs */}
            <section className="space-y-6">
                <h3 className="text-subtitle flex items-center gap-2">
                    <span className="w-6 h-6 bg-info/20 text-info rounded flex items-center justify-center text-xs">3</span>
                    <MousePointer size={16} className="text-info" />
                    Chamadas para Ação (CTAs)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="input-label">CTA Principal</label>
                        <p className="text-caption mb-2">Ação mais importante que o cliente deve tomar</p>
                        <select
                            className="input-field"
                            value={formData.primaryCTA || 'whatsapp'}
                            onChange={e => updateField('primaryCTA', e.target.value)}
                        >
                            {CTA_OPTIONS.map(cta => (
                                <option key={cta.value} value={cta.value}>{cta.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="input-label">CTA Secundário</label>
                        <p className="text-xs text-gray-500 mb-2">Ação alternativa para quem não está pronto</p>
                        <select
                            className="input-field"
                            value={formData.secondaryCTA || 'saibamais'}
                            onChange={e => updateField('secondaryCTA', e.target.value)}
                        >
                            <option value="none">Nenhum</option>
                            {CTA_OPTIONS.map(cta => (
                                <option key={cta.value} value={cta.value}>{cta.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="input-label">Texto Customizado do CTA</label>
                    <p className="text-xs text-gray-500 mb-2">Opcional: texto específico para os botões</p>
                    <input
                        className="input-field"
                        placeholder="Ex: Quero minha mesa! / Peça agora pelo WhatsApp"
                        value={formData.ctaText || ''}
                        onChange={e => updateField('ctaText', e.target.value)}
                    />
                </div>
            </section>

            {/* Section 4: Metas e Tracking */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded flex items-center justify-center text-xs">4</span>
                    <BarChart3 size={16} className="text-blue-400" />
                    Metas & Tracking (Calculadora Reversa)
                </h3>

                <div className="vault-room vault-room-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="input-label">Meta Financeira do Ciclo</label>
                            <p className="text-xs text-gray-500 mb-2">Quanto você quer faturar neste ciclo?</p>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                                <input
                                    required
                                    type="number"
                                    className="input-field pl-10 font-mono text-lg"
                                    placeholder="50000"
                                    value={formData.monthlyGoal || ''}
                                    onChange={e => updateField('monthlyGoal', e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Ticket Médio (Estimado)</label>
                            <p className="text-xs text-gray-500 mb-2">Puxado do V2 ou insira manual</p>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                                <input
                                    type="number"
                                    className="input-field pl-10 font-mono text-lg"
                                    placeholder="50"
                                    value={formData.targetTicket || ''}
                                    onChange={e => updateField('targetTicket', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Reverse Calculator Results */}
                    {(formData.monthlyGoal > 0 && formData.targetTicket > 0) && (
                        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg animate-fadeIn">
                            <h4 className="text-sm font-bold text-blue-400 mb-4 flex items-center gap-2">
                                <Target size={14} />
                                Para bater essa meta, você precisa de:
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                <div>
                                    <p className="text-2xl font-black text-white">
                                        {Math.ceil(formData.monthlyGoal / formData.targetTicket).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Vendas</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-[var(--border-subtle)] -z-10 hidden md:block"></div>
                                    <p className="text-xs text-gray-500 bg-[var(--bg-deep)] px-2 inline-block relative z-10 mb-1">
                                        Se conv. {formData.targetConversion || 2}%
                                    </p>
                                    <div>
                                        <p className="text-xl font-bold text-gray-300">
                                            {Math.ceil((formData.monthlyGoal / formData.targetTicket) / ((formData.targetConversion || 2) / 100)).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Leads / Cliques</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-gray-300">
                                        R$ {Math.ceil(((formData.monthlyGoal / formData.targetTicket) / ((formData.targetConversion || 2) / 100)) * (formData.cpl || 1.5)).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Investimento Est. (CPL R$ {formData.cpl || 1.5})</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label className="input-label">Estratégia de Tráfego</label>
                            <select
                                className="input-field"
                                value={formData.trafficType || 'Misto'}
                                onChange={e => updateField('trafficType', e.target.value)}
                            >
                                <option value="Misto">🔄 Misto (Pago + Orgânico)</option>
                                <option value="Pago">💸 100% Tráfego Pago (Ads)</option>
                                <option value="Orgânico">🌱 100% Orgânico (Content)</option>
                                <option value="Influencer">🤳 Influenciadores</option>
                                <option value="Indicacao">🗣️ Indicação / Boca a Boca</option>
                            </select>
                        </div>
                        {/* UTM Configuration */}
                        <div>
                            <label className="input-label">UTM Campaign Base</label>
                            <input
                                className="input-field font-mono"
                                placeholder="ex: bravvo_jan2026"
                                value={formData.utmCampaign || ''}
                                onChange={e => updateField('utmCampaign', e.target.value.replace(/\s/g, '_').toLowerCase())}
                            />
                            {formData.utmCampaign && (
                                <p className="text-xs text-blue-400 mt-2 font-mono">
                                    ?utm_source=ig&utm_campaign={formData.utmCampaign}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 5: Taxa de Conversão */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded flex items-center justify-center text-xs">5</span>
                    <Target size={16} className="text-blue-400" />
                    Benchmarks de Conversão
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="input-label">Taxa de Conversão Atual</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                className="input-field pr-8 font-mono"
                                placeholder="2.5"
                                value={formData.currentConversion || ''}
                                onChange={e => updateField('currentConversion', e.target.value)}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Meta de Conversão</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                className="input-field pr-8 font-mono"
                                placeholder="5.0"
                                value={formData.targetConversion || ''}
                                onChange={e => updateField('targetConversion', e.target.value)}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Custo por Lead (CPL)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                            <input
                                type="number"
                                className="input-field pl-10 font-mono"
                                placeholder="15"
                                value={formData.cpl || ''}
                                onChange={e => updateField('cpl', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Submit */}
            <div className="vault-footer">
                <div className="flex items-center gap-2 text-sm">
                    {isSynced ? (
                        <span className="flex items-center gap-1.5 text-green-400">
                            <CheckCircle2 size={14} /> Sincronizado
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-yellow-400 animate-pulse">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span> Salvando...
                        </span>
                    )}
                </div>
                <button
                    type="submit"
                    className="btn-primary-lg"
                >
                    Salvar e Avançar para V4 <ArrowRight size={20} />
                </button>
            </div>
        </form>
    );
}
