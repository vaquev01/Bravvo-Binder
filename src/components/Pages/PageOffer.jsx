import React from 'react';
import { ShoppingBag, ArrowRight, TrendingUp, Target, Zap } from 'lucide-react';
import { ProductList } from '../ui/ProductList';

const UPSELL_STRATEGIES = [
    { value: 'none', label: 'Nenhuma estratégia definida' },
    { value: 'combo', label: '🍔 Combo (Produto + Complemento com desconto)' },
    { value: 'bundle', label: '📦 Bundle (Pacote de produtos)' },
    { value: 'premium', label: '⭐ Versão Premium (Upgrade)' },
    { value: 'quantidade', label: '🔢 Desconto por Quantidade' },
    { value: 'assinatura', label: '🔄 Assinatura / Recorrência' },
];

export function PageOffer({ formData, setFormData, onNext }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        onNext();
    };

    const updateField = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    // Initialize products if empty
    const products = formData.products || [];

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-orange-500 mb-2">
                    <ShoppingBag size={24} />
                    <span className="font-mono text-sm tracking-widest uppercase">VAULT 2 • COMMERCE</span>
                </div>
                <h2 className="text-3xl font-display font-black text-white">Economia & Oferta</h2>
                <p className="text-gray-400 max-w-xl">
                    O que vamos vender e como? Estruture seu catálogo para o <strong>S2 (Commerce Vault)</strong>.
                </p>
            </div>

            {/* Section 1: Catálogo de Produtos */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 bg-orange-500/20 text-orange-400 rounded flex items-center justify-center text-xs">1</span>
                    <ShoppingBag size={16} className="text-orange-400" />
                    Catálogo de Produtos
                    <button
                        type="button"
                        onClick={() => {
                            // Smart Fill Logic for Products
                            const niche = formData.niche ? formData.niche.toLowerCase() : 'geral';
                            let suggestedProducts = [];

                            if (niche.includes('gastronomia') || niche.includes('restaurante') || niche.includes('bar')) {
                                suggestedProducts = [
                                    { id: `P-${Date.now()}-1`, name: "Prato Principal da Casa", role: "Hero", margin: "Medium", price: 49.90 },
                                    { id: `P-${Date.now()}-2`, name: "Drink Especial", role: "Upsell", margin: "High", price: 29.90 },
                                    { id: `P-${Date.now()}-3`, name: "Sobremesa Assinatura", role: "Cross-sell", margin: "High", price: 18.90 }
                                ];
                            } else if (niche.includes('moda') || niche.includes('roupa')) {
                                suggestedProducts = [
                                    { id: `P-${Date.now()}-1`, name: "Peça da Coleção Nova", role: "Hero", margin: "Medium", price: 199.90 },
                                    { id: `P-${Date.now()}-2`, name: "Acessório Complementar", role: "Upsell", margin: "High", price: 59.90 },
                                    { id: `P-${Date.now()}-3`, name: "Kit Básico", role: "Cross-sell", margin: "Medium", price: 149.90 }
                                ];
                            } else if (niche.includes('serviço') || niche.includes('consultoria')) {
                                suggestedProducts = [
                                    { id: `P-${Date.now()}-1`, name: "Consultoria Premium", role: "Hero", margin: "High", price: 1500.00 },
                                    { id: `P-${Date.now()}-2`, name: "Workshop Online", role: "Cross-sell", margin: "High", price: 297.00 },
                                    { id: `P-${Date.now()}-3`, name: "E-book Exclusivo", role: "Upsell", margin: "High", price: 47.00 }
                                ];
                            } else {
                                // Default Generic
                                suggestedProducts = [
                                    { id: `P-${Date.now()}-1`, name: "Produto Principal", role: "Hero", margin: "Medium", price: 100.00 },
                                    { id: `P-${Date.now()}-2`, name: "Produto Complementar", role: "Upsell", margin: "High", price: 50.00 },
                                    { id: `P-${Date.now()}-3`, name: "Serviço Adicional", role: "Cross-sell", margin: "High", price: 150.00 }
                                ];
                            }

                            // Only add if list is empty or has only 1 empty item
                            if (!formData.products || formData.products.length === 0 || (formData.products.length === 1 && !formData.products[0].name)) {
                                updateField('products', suggestedProducts);
                            }
                        }}
                        className="ml-auto text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded flex items-center gap-1 transition-colors"
                    >
                        🎲 Inspirar-me
                    </button>
                </h3>
                <p className="text-xs text-gray-500">
                    Adicione seus principais produtos. O primeiro é automaticamente marcado como "Carro-Chefe" (usado em campanhas).
                </p>

                <ProductList
                    products={products}
                    onChange={(newProducts) => updateField('products', newProducts)}
                    maxProducts={5}
                />
            </section>

            {/* Section 2: Métricas Financeiras */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 bg-orange-500/20 text-orange-400 rounded flex items-center justify-center text-xs">2</span>
                    <TrendingUp size={16} className="text-orange-400" />
                    Métricas Financeiras
                </h3>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="input-label">Ticket Médio Atual</label>
                            <p className="text-xs text-gray-500 mb-2">Valor médio por compra hoje</p>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                                <input
                                    type="number"
                                    className="input-field pl-10 font-mono text-lg"
                                    placeholder="0.00"
                                    value={formData.currentTicket || ''}
                                    onChange={e => updateField('currentTicket', e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Meta de Ticket Médio</label>
                            <p className="text-xs text-gray-500 mb-2">Onde queremos chegar</p>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                                <input
                                    type="number"
                                    className="input-field pl-10 font-mono text-lg"
                                    placeholder="0.00"
                                    value={formData.targetTicket || ''}
                                    onChange={e => updateField('targetTicket', e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Faturamento Mensal Atual</label>
                            <p className="text-xs text-gray-500 mb-2">Baseline para metas</p>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                                <input
                                    type="number"
                                    className="input-field pl-10 font-mono text-lg"
                                    placeholder="0.00"
                                    value={formData.currentRevenue || ''}
                                    onChange={e => updateField('currentRevenue', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Delta Indicator */}
                    {formData.currentTicket && formData.targetTicket && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="flex items-center gap-2">
                                <Zap size={16} className={Number(formData.targetTicket) > Number(formData.currentTicket) ? 'text-green-400' : 'text-red-400'} />
                                <span className="text-sm text-gray-400">
                                    {Number(formData.targetTicket) > Number(formData.currentTicket)
                                        ? `Meta: +${((Number(formData.targetTicket) / Number(formData.currentTicket) - 1) * 100).toFixed(0)}% de aumento no ticket`
                                        : 'Meta abaixo do atual'
                                    }
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Section 3: Estratégia de Venda */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 bg-orange-500/20 text-orange-400 rounded flex items-center justify-center text-xs">3</span>
                    <Target size={16} className="text-orange-400" />
                    Estratégia de Venda
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="input-label">Estratégia de Upsell</label>
                        <p className="text-xs text-gray-500 mb-2">Como você aumenta o valor de cada venda?</p>
                        <select
                            className="input-field"
                            value={formData.upsellStrategy || 'none'}
                            onChange={e => updateField('upsellStrategy', e.target.value)}
                        >
                            {UPSELL_STRATEGIES.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="input-label">Formato Principal de Venda</label>
                        <p className="text-xs text-gray-500 mb-2">Como o cliente compra de você?</p>
                        <select
                            className="input-field"
                            value={formData.saleFormat || 'presencial'}
                            onChange={e => updateField('saleFormat', e.target.value)}
                        >
                            <option value="presencial">🏪 Presencial (Loja/Balcão)</option>
                            <option value="delivery">🛵 Delivery</option>
                            <option value="ecommerce">🛒 E-commerce</option>
                            <option value="whatsapp">📱 WhatsApp</option>
                            <option value="agendamento">📅 Agendamento</option>
                            <option value="misto">🔄 Misto</option>
                        </select>
                    </div>
                </div>

                <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-6">
                    <h4 className="font-medium text-white mb-4">Produto Isca</h4>
                    <p className="text-xs text-gray-500 mb-4">
                        Qual produto você usa para atrair clientes novos? (Geralmente baixa margem, alto volume)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Nome do Produto Isca</label>
                            <input
                                className="input-field"
                                placeholder="Ex: Happy Hour com 50% off na primeira rodada"
                                value={formData.baitProduct || ''}
                                onChange={e => updateField('baitProduct', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="input-label">Preço Promocional</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                                <input
                                    type="number"
                                    className="input-field pl-10 font-mono"
                                    placeholder="0.00"
                                    value={formData.baitPrice || ''}
                                    onChange={e => updateField('baitPrice', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 4: Concorrência */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 bg-orange-500/20 text-orange-400 rounded flex items-center justify-center text-xs">4</span>
                    Referências de Mercado
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="input-label">Concorrente 1</label>
                        <input
                            className="input-field"
                            placeholder="Nome do concorrente"
                            value={formData.competitor1 || ''}
                            onChange={e => updateField('competitor1', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="input-label">Concorrente 2</label>
                        <input
                            className="input-field"
                            placeholder="Nome do concorrente"
                            value={formData.competitor2 || ''}
                            onChange={e => updateField('competitor2', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="input-label">Concorrente 3</label>
                        <input
                            className="input-field"
                            placeholder="Nome do concorrente"
                            value={formData.competitor3 || ''}
                            onChange={e => updateField('competitor3', e.target.value)}
                        />
                    </div>
                </div>
                <p className="text-xs text-gray-500">
                    Cite até 3 concorrentes para referência. A IA usará para diferenciar sua comunicação.
                </p>
            </section>

            {/* Submit */}
            <div className="pt-6 border-t border-white/5 flex justify-end sticky bottom-0 bg-[#050505] pb-6 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all hover:scale-105 shadow-lg shadow-orange-500/20"
                >
                    Salvar e Avançar para V3 <ArrowRight size={20} />
                </button>
            </div>
        </form>
    );
}
