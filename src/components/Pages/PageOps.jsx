import React, { useState } from 'react';
import { Users, ArrowRight, Clock, Shield, Sparkles, Calendar, UserCheck, Zap, Target } from 'lucide-react';
import { StakeholderList } from '../ui/StakeholderList';
import { CompetitorList } from '../ui/CompetitorList';

const POSTING_FREQUENCIES = [
    { value: 'diario', label: '📆 Diário (1 post/dia)', posts: 30 },
    { value: '3x', label: '📅 3x por Semana', posts: 12 },
    { value: 'semanal', label: '📋 Semanal (1 post/semana)', posts: 4 },
    { value: 'quinzenal', label: '🗓️ Quinzenal', posts: 2 },
    { value: 'customizado', label: '⚙️ Customizado', posts: 0 },
];

const DAYS_OF_WEEK = [
    { value: 'seg', label: 'Seg' },
    { value: 'ter', label: 'Ter' },
    { value: 'qua', label: 'Qua' },
    { value: 'qui', label: 'Qui' },
    { value: 'sex', label: 'Sex' },
    { value: 'sab', label: 'Sáb' },
    { value: 'dom', label: 'Dom' },
];

const TIME_SLOTS = [
    { value: 'manha', label: '🌅 Manhã (6h-12h)' },
    { value: 'almoco', label: '☀️ Almoço (12h-14h)' },
    { value: 'tarde', label: '🌤️ Tarde (14h-18h)' },
    { value: 'noite', label: '🌙 Noite (18h-22h)' },
];

export function PageOps({ formData, setFormData, onComplete }) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setTimeout(() => {
            onComplete();
        }, 2000);
    };

    const updateField = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const toggleArrayValue = (field, value) => {
        const current = formData[field] || [];
        if (current.includes(value)) {
            updateField(field, current.filter(v => v !== value));
        } else {
            updateField(field, [...current, value]);
        }
    };

    if (isProcessing) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-8 animate-fadeIn">
                <div className="relative">
                    <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-20 animate-pulse"></div>
                    <Sparkles size={80} className="text-purple-400 animate-pulse relative z-10" />
                </div>
                <h2 className="text-3xl font-bold text-white">Processando Estratégia...</h2>
                <div className="space-y-2 text-center text-gray-400 font-mono text-sm">
                    <p>Compilando Vaults S1, S2, S3, S4...</p>
                    <p>Gerando Dashboards D1, D2, D3...</p>
                    <p>Aplicando Identidade Visual...</p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-500 mb-2">
                    <Users size={24} />
                    <span className="font-mono text-sm tracking-widest uppercase">VAULT 4 • OPS</span>
                </div>
                <h2 className="text-3xl font-display font-black text-white">Operação & Governança</h2>
                <p className="text-gray-400 max-w-xl">
                    Quem faz o quê e quando. Configure o <strong>S4 (Ops Vault)</strong> para organizar a execução.
                </p>
            </div>

            {/* Section 1: Governança */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 bg-green-500/20 text-green-400 rounded flex items-center justify-center text-xs">1</span>
                    <Shield size={16} className="text-green-400" />
                    Governança
                </h3>

                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="input-label">Aprovador Final</label>
                            <p className="text-xs text-gray-500 mb-2">Quem tem a palavra final sobre os criativos?</p>
                            <input
                                required
                                className="input-field text-lg"
                                placeholder="Ex: Nome do Dono"
                                value={formData.approverName || ''}
                                onChange={e => updateField('approverName', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="input-label">Estrutura de Time</label>
                            <p className="text-xs text-gray-500 mb-2">Quem executará a estratégia?</p>
                            <select
                                className="input-field"
                                value={formData.teamStructure || 'Enxuta'}
                                onChange={e => updateField('teamStructure', e.target.value)}
                            >
                                <option value="Enxuta">⚡ Eu-quipe (Solo/Enxuta)</option>
                                <option value="Completa">🏢 Time Interno Completo</option>
                                <option value="Terceirizada">🤝 Agência/Freelancers</option>
                                <option value="Hibrida">🔄 Híbrida (Interno + Terceiros)</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <label className="input-label">SLA de Aprovação</label>
                        <p className="text-xs text-gray-500 mb-4">Tempo máximo para aprovar conteúdos antes de alertas de atraso</p>
                        <div className="grid grid-cols-4 gap-3">
                            {[12, 24, 48, 72].map(hours => (
                                <button
                                    key={hours}
                                    type="button"
                                    onClick={() => updateField('slaHours', hours)}
                                    className={`
                                        p-3 rounded-lg border text-center transition-all
                                        ${formData.slaHours === hours
                                            ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                        }
                                    `}
                                >
                                    <div className="text-xl font-bold">{hours}</div>
                                    <div className="text-xs">horas</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: Time */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 bg-green-500/20 text-green-400 rounded flex items-center justify-center text-xs">2</span>
                    <UserCheck size={16} className="text-green-400" />
                    Responsáveis
                </h3>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="input-label">Responsável por Conteúdo</label>
                            <p className="text-xs text-gray-500 mb-2">Quem cria e posta?</p>
                            <input
                                className="input-field"
                                placeholder="Nome ou cargo"
                                value={formData.contentOwner || ''}
                                onChange={e => updateField('contentOwner', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="input-label">Responsável por Tráfego Pago</label>
                            <p className="text-xs text-gray-500 mb-2">Quem gerencia os anúncios?</p>
                            <input
                                className="input-field"
                                placeholder="Nome ou cargo"
                                value={formData.trafficOwner || ''}
                                onChange={e => updateField('trafficOwner', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="input-label">Responsável por Atendimento</label>
                            <p className="text-xs text-gray-500 mb-2">Quem responde mensagens?</p>
                            <input
                                className="input-field"
                                placeholder="Nome ou cargo"
                                value={formData.supportOwner || ''}
                                onChange={e => updateField('supportOwner', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="input-label">Contato de Emergência</label>
                            <p className="text-xs text-gray-500 mb-2">Para problemas fora do horário</p>
                            <input
                                className="input-field"
                                placeholder="WhatsApp ou telefone"
                                value={formData.emergencyContact || ''}
                                onChange={e => updateField('emergencyContact', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Frequência de Postagem */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 bg-green-500/20 text-green-400 rounded flex items-center justify-center text-xs">3</span>
                    <Zap size={16} className="text-green-400" />
                    Frequência de Postagem
                </h3>

                <div>
                    <label className="input-label">Ritmo de Publicação</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
                        {POSTING_FREQUENCIES.map(freq => (
                            <button
                                key={freq.value}
                                type="button"
                                onClick={() => updateField('postingFrequency', freq.value)}
                                className={`
                                    p-3 rounded-lg border text-left transition-all
                                    ${formData.postingFrequency === freq.value
                                        ? 'bg-green-500/20 border-green-500/50'
                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }
                                `}
                            >
                                <div className={`text-sm font-medium ${formData.postingFrequency === freq.value ? 'text-green-400' : 'text-gray-300'}`}>
                                    {freq.label.split(' ')[0]}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {freq.label.split(' ').slice(1).join(' ')}
                                </div>
                                {freq.posts > 0 && (
                                    <div className="text-xs text-gray-600 mt-1">
                                        ~{freq.posts} posts/mês
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Best Days */}
                <div>
                    <label className="input-label">Melhores Dias para Postar</label>
                    <p className="text-xs text-gray-500 mb-2">Dias com maior engajamento do seu público</p>
                    <div className="flex gap-2">
                        {DAYS_OF_WEEK.map(day => {
                            const isSelected = (formData.bestDays || []).includes(day.value);
                            return (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => toggleArrayValue('bestDays', day.value)}
                                    className={`
                                        w-12 h-12 rounded-lg border font-medium transition-all
                                        ${isSelected
                                            ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                            : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                                        }
                                    `}
                                >
                                    {day.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Best Times */}
                <div>
                    <label className="input-label">Melhores Horários</label>
                    <p className="text-xs text-gray-500 mb-2">Quando seu público está mais ativo</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {TIME_SLOTS.map(slot => {
                            const isSelected = (formData.bestTimes || []).includes(slot.value);
                            return (
                                <button
                                    key={slot.value}
                                    type="button"
                                    onClick={() => toggleArrayValue('bestTimes', slot.value)}
                                    className={`
                                        p-3 rounded-lg border text-center transition-all
                                        ${isSelected
                                            ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                        }
                                    `}
                                >
                                    {slot.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Section 4: Calendário */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 bg-green-500/20 text-green-400 rounded flex items-center justify-center text-xs">4</span>
                    <Calendar size={16} className="text-green-400" />
                    Ciclo de Planejamento
                </h3>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="input-label">Data de Início</label>
                            <p className="text-xs text-gray-500 mb-2">Quando a estratégia começa?</p>
                            <input
                                type="date"
                                className="input-field"
                                value={formData.startDate || ''}
                                onChange={e => updateField('startDate', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="input-label">Duração do Ciclo</label>
                            <p className="text-xs text-gray-500 mb-2">Período de planejamento</p>
                            <select
                                className="input-field"
                                value={formData.cycleDuration || '30'}
                                onChange={e => updateField('cycleDuration', e.target.value)}
                            >
                                <option value="7">7 dias (Semanal)</option>
                                <option value="15">15 dias (Quinzenal)</option>
                                <option value="30">30 dias (Mensal)</option>
                                <option value="60">60 dias (Bimestral)</option>
                                <option value="90">90 dias (Trimestral)</option>
                            </select>
                        </div>
                    </div>

                    {formData.startDate && formData.cycleDuration && (
                        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-sm text-green-400">
                                📅 Ciclo: {new Date(formData.startDate).toLocaleDateString('pt-BR')} até{' '}
                                {new Date(new Date(formData.startDate).getTime() + Number(formData.cycleDuration) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Section 5: Stakeholders */}
            <section className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users size={16} className="text-green-400" />
                    Stakeholders (Contatos para Push)
                </h3>
                <p className="text-sm text-gray-500 -mt-4">
                    Cadastre as pessoas envolvidas na aprovação e produção de conteúdo
                </p>

                <StakeholderList
                    stakeholders={formData.stakeholders || []}
                    onChange={(stakeholders) => updateField('stakeholders', stakeholders)}
                />
            </section>

            {/* Section 6: Competitors */}
            <section className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Target size={16} className="text-orange-400" />
                    Concorrentes (Monitoramento)
                </h3>
                <p className="text-sm text-gray-500 -mt-4">
                    Acompanhe o que a concorrência está fazendo
                </p>

                <CompetitorList
                    competitors={formData.competitors || []}
                    onChange={(competitors) => updateField('competitors', competitors)}
                />
            </section>

            {/* Submit */}
            <div className="pt-8 border-t border-white/5 flex justify-end">
                <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all hover:scale-105 shadow-lg shadow-purple-600/20"
                >
                    <Sparkles size={20} />
                    Finalizar & Gerar Bravvo OS
                </button>
            </div>
        </form>
    );
}
