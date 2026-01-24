import React from 'react';
import { Target, ArrowRight, Palette, Users, Sparkles } from 'lucide-react';
import { TagInput } from '../ui/TagInput';
import { RadioCards } from '../ui/RadioCards';

const ARCHETYPES = [
    { value: 'O Criador', emoji: '🎨', label: 'O Criador', description: 'Inovação e originalidade' },
    { value: 'O Herói', emoji: '🦸', label: 'O Herói', description: 'Superação e maestria' },
    { value: 'O Rebelde', emoji: '⚡', label: 'O Rebelde', description: 'Libertação e ruptura' },
    { value: 'O Sábio', emoji: '🧠', label: 'O Sábio', description: 'Conhecimento e verdade' },
    { value: 'O Amante', emoji: '❤️', label: 'O Amante', description: 'Intimidade e paixão' },
    { value: 'O Governante', emoji: '👑', label: 'O Governante', description: 'Controle e liderança' },
    { value: 'O Explorador', emoji: '🗺️', label: 'O Explorador', description: 'Liberdade e descoberta' },
    { value: 'O Inocente', emoji: '👼', label: 'O Inocente', description: 'Segurança e otimismo' },
    { value: 'O Mago', emoji: '✨', label: 'O Mago', description: 'Transformação e poder' },
    { value: 'O Cara Comum', emoji: '🤝', label: 'O Cara Comum', description: 'Pertencimento e autenticidade' },
    { value: 'O Bobo da Corte', emoji: '🤡', label: 'O Bobo da Corte', description: 'Prazer e diversão' },
    { value: 'O Prestativo', emoji: '🤲', label: 'O Prestativo', description: 'Serviço e cuidado' },
];

const NICHOS = [
    { value: 'gastronomia', label: '🍽️ Gastronomia' },
    { value: 'saude', label: '🏥 Saúde & Bem-estar' },
    { value: 'beleza', label: '💄 Beleza & Estética' },
    { value: 'fitness', label: '💪 Fitness & Academia' },
    { value: 'educacao', label: '📚 Educação' },
    { value: 'tech', label: '💻 Tecnologia' },
    { value: 'varejo', label: '🛍️ Varejo' },
    { value: 'servicos', label: '🔧 Serviços' },
    { value: 'financeiro', label: '💰 Financeiro' },
    { value: 'entretenimento', label: '🎬 Entretenimento' },
    { value: 'imobiliario', label: '🏠 Imobiliário' },
    { value: 'outro', label: '📁 Outro' },
];

const BRAND_VALUES_SUGGESTIONS = [
    'Qualidade', 'Inovação', 'Transparência', 'Sustentabilidade', 'Excelência',
    'Confiança', 'Criatividade', 'Autenticidade', 'Agilidade', 'Proximidade',
    'Simplicidade', 'Tradição', 'Modernidade', 'Elegância', 'Acessibilidade'
];

export function PageBrand({ formData, setFormData, onNext }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        onNext();
    };

    const updateField = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-500 mb-2">
                    <Target size={24} />
                    <span className="font-mono text-sm tracking-widest uppercase">VAULT 1 • BRAND</span>
                </div>
                <h2 className="text-3xl font-display font-black text-white">Identidade da Marca</h2>
                <p className="text-gray-400 max-w-xl">
                    Defina a alma do negócio. Esses dados alimentam o <strong>S1 (Brand Vault)</strong> e guiam toda a comunicação da IA.
                </p>
            </div>

            {/* Section 1: Dados Básicos */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 bg-red-500/20 text-red-400 rounded flex items-center justify-center text-xs">1</span>
                    Dados Básicos
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="input-label">Nome do Cliente</label>
                        <input
                            required
                            className="input-field text-lg"
                            placeholder="Ex: Bar do Zé"
                            value={formData.clientName || ''}
                            onChange={e => updateField('clientName', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="input-label">Setor / Nicho</label>
                        <select
                            className="input-field"
                            value={formData.niche || 'gastronomia'}
                            onChange={e => updateField('niche', e.target.value)}
                        >
                            {NICHOS.map(n => (
                                <option key={n.value} value={n.value}>{n.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="input-label">Tagline / Slogan</label>
                    <p className="text-xs text-gray-500 mb-2">Uma frase curta que resume a essência da marca</p>
                    <input
                        className="input-field"
                        placeholder="Ex: A cerveja mais gelada do bairro"
                        value={formData.tagline || ''}
                        onChange={e => updateField('tagline', e.target.value)}
                    />
                </div>
            </section>

            {/* Section 2: Posicionamento */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 bg-red-500/20 text-red-400 rounded flex items-center justify-center text-xs">2</span>
                    Posicionamento Estratégico
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="input-label">A Promessa</label>
                        <p className="text-xs text-gray-500 mb-2">Qual a transformação única que você oferece?</p>
                        <input
                            required
                            className="input-field"
                            placeholder="Ex: Você vai ter a melhor experiência de happy hour"
                            value={formData.promise || ''}
                            onChange={e => updateField('promise', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="input-label">O Inimigo</label>
                        <p className="text-xs text-gray-500 mb-2">Contra o que você luta?</p>
                        <input
                            required
                            className="input-field"
                            placeholder="Ex: Cerveja quente e atendimento ruim"
                            value={formData.enemy || ''}
                            onChange={e => updateField('enemy', e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="input-label">Valores da Marca</label>
                    <p className="text-xs text-gray-500 mb-2">Selecione ou digite até 5 valores que definem sua marca</p>
                    <TagInput
                        value={formData.brandValues || []}
                        onChange={(values) => updateField('brandValues', values)}
                        placeholder="Digite um valor e pressione Enter"
                        maxTags={5}
                        suggestions={BRAND_VALUES_SUGGESTIONS}
                    />
                </div>
            </section>

            {/* Section 3: Público */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 bg-red-500/20 text-red-400 rounded flex items-center justify-center text-xs">3</span>
                    <Users size={16} className="text-red-400" />
                    Público-Alvo
                </h3>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="input-label">Faixa Etária</label>
                            <select
                                className="input-field"
                                value={formData.audienceAge || '25-34'}
                                onChange={e => updateField('audienceAge', e.target.value)}
                            >
                                <option value="18-24">18-24 anos</option>
                                <option value="25-34">25-34 anos</option>
                                <option value="35-44">35-44 anos</option>
                                <option value="45-54">45-54 anos</option>
                                <option value="55+">55+ anos</option>
                                <option value="todas">Todas as idades</option>
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Gênero Principal</label>
                            <select
                                className="input-field"
                                value={formData.audienceGender || 'todos'}
                                onChange={e => updateField('audienceGender', e.target.value)}
                            >
                                <option value="todos">Todos</option>
                                <option value="masculino">Majoritariamente Masculino</option>
                                <option value="feminino">Majoritariamente Feminino</option>
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Classe Social</label>
                            <select
                                className="input-field"
                                value={formData.audienceClass || 'bc'}
                                onChange={e => updateField('audienceClass', e.target.value)}
                            >
                                <option value="a">Classe A (Premium)</option>
                                <option value="ab">Classes A/B</option>
                                <option value="bc">Classes B/C</option>
                                <option value="cd">Classes C/D</option>
                                <option value="todas">Todas</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="input-label">Dor Principal do Cliente</label>
                        <p className="text-xs text-gray-500 mb-2">Qual o problema que seu público mais quer resolver?</p>
                        <textarea
                            className="input-field min-h-[80px] resize-none"
                            placeholder="Ex: Não encontra um lugar com preço justo e ambiente agradável para relaxar depois do trabalho"
                            value={formData.audiencePain || ''}
                            onChange={e => updateField('audiencePain', e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* Section 4: Arquétipo */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 bg-red-500/20 text-red-400 rounded flex items-center justify-center text-xs">4</span>
                    <Sparkles size={16} className="text-red-400" />
                    Arquétipo da Marca
                </h3>
                <p className="text-xs text-gray-500">O arquétipo define a personalidade que a IA usará ao escrever textos</p>

                <RadioCards
                    value={formData.archetype || 'O Cara Comum'}
                    onChange={(value) => updateField('archetype', value)}
                    options={ARCHETYPES}
                    columns={4}
                />
            </section>

            {/* Section 5: Design */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 bg-red-500/20 text-red-400 rounded flex items-center justify-center text-xs">5</span>
                    <Palette size={16} className="text-red-400" />
                    Identidade Visual
                </h3>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="input-label">Tom de Voz</label>
                            <select
                                className="input-field"
                                value={formData.tone || 'casual'}
                                onChange={e => updateField('tone', e.target.value)}
                            >
                                <option value="formal">Formal e Profissional</option>
                                <option value="casual">Casual e Amigável</option>
                                <option value="divertido">Divertido e Descontraído</option>
                                <option value="inspirador">Inspirador e Motivacional</option>
                                <option value="tecnico">Técnico e Especializado</option>
                                <option value="luxo">Sofisticado e Premium</option>
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Estilo Visual (Mood)</label>
                            <select
                                className="input-field"
                                value={formData.mood || 'moderno'}
                                onChange={e => updateField('mood', e.target.value)}
                            >
                                <option value="minimalista">Minimalista</option>
                                <option value="moderno">Moderno</option>
                                <option value="rustico">Rústico / Industrial</option>
                                <option value="colorido">Vibrante / Colorido</option>
                                <option value="elegante">Elegante / Luxuoso</option>
                                <option value="organico">Orgânico / Natural</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div>
                            <label className="input-label">Cor Primária</label>
                            <div className="flex items-center gap-3 bg-black/30 p-3 rounded-lg border border-white/10">
                                <input
                                    type="color"
                                    className="h-10 w-10 rounded bg-transparent cursor-pointer border-0"
                                    value={formData.primaryColor || '#F97316'}
                                    onChange={e => updateField('primaryColor', e.target.value)}
                                />
                                <span className="font-mono text-sm text-gray-400">{formData.primaryColor || '#F97316'}</span>
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Cor Secundária</label>
                            <div className="flex items-center gap-3 bg-black/30 p-3 rounded-lg border border-white/10">
                                <input
                                    type="color"
                                    className="h-10 w-10 rounded bg-transparent cursor-pointer border-0"
                                    value={formData.secondaryColor || '#1E293B'}
                                    onChange={e => updateField('secondaryColor', e.target.value)}
                                />
                                <span className="font-mono text-sm text-gray-400">{formData.secondaryColor || '#1E293B'}</span>
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Cor de Acento</label>
                            <div className="flex items-center gap-3 bg-black/30 p-3 rounded-lg border border-white/10">
                                <input
                                    type="color"
                                    className="h-10 w-10 rounded bg-transparent cursor-pointer border-0"
                                    value={formData.accentColor || '#10B981'}
                                    onChange={e => updateField('accentColor', e.target.value)}
                                />
                                <span className="font-mono text-sm text-gray-400">{formData.accentColor || '#10B981'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 6: Biografia */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 bg-red-500/20 text-red-400 rounded flex items-center justify-center text-xs">6</span>
                    Biografia / Sobre
                </h3>

                <div>
                    <label className="input-label">Texto de Apresentação</label>
                    <p className="text-xs text-gray-500 mb-2">Texto para usar em "Sobre Nós", bio do Instagram, etc.</p>
                    <textarea
                        className="input-field min-h-[120px] resize-none"
                        placeholder="Ex: O Bar do Zé nasceu em 2010 com um sonho simples: oferecer a melhor experiência de happy hour da região. Localizado no coração do bairro, somos conhecidos pela cerveja sempre gelada, petiscos caseiros e um ambiente acolhedor onde todos se sentem em casa."
                        value={formData.bio || ''}
                        onChange={e => updateField('bio', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-2 text-right">{(formData.bio || '').length}/500 caracteres</p>
                </div>
            </section>

            {/* Submit */}
            <div className="pt-8 border-t border-white/5 flex justify-end">
                <button
                    type="submit"
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all hover:scale-105 shadow-lg shadow-red-500/20"
                >
                    Salvar e Avançar para V2 <ArrowRight size={20} />
                </button>
            </div>
        </form>
    );
}
