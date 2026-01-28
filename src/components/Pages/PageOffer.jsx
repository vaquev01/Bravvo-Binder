import React from 'react';
import { CARACA_BAR_DATA } from '../../services/demoData';
import { ShoppingBag, ArrowRight, TrendingUp, Target, Zap, CheckCircle2 } from 'lucide-react';
import { ProductList } from '../ui/ProductList';
import { useVaultForm } from '../../hooks/useVaultForm';
// import { useVaults } from '../../contexts/VaultContext';
import { useToast } from '../../contexts/ToastContext';

const UPSELL_STRATEGIES = [
    { value: 'none', label: 'Nenhuma estratégia definida' },
    { value: 'combo', label: '🍔 Combo (Produto + Complemento com desconto)' },
    { value: 'bundle', label: '📦 Bundle (Pacote de produtos)' },
    { value: 'premium', label: '⭐ Versão Premium (Upgrade)' },
    { value: 'quantidade', label: '🔢 Desconto por Quantidade' },
    { value: 'assinatura', label: '🔄 Assinatura / Recorrência' },
];

export function PageOffer({ formData: externalFormData, setFormData: externalSetFormData, onNext }) {
    // Use unified vault form hook
    const { formData: vaultFormData, updateField: vaultUpdateField, isSynced, saveAndAdvance } = useVaultForm('V2');

    // const { appData } = useVaults();
    const { addToast } = useToast();

    const formData = vaultFormData || externalFormData || {};
    const updateField = vaultUpdateField || ((field, value) => externalSetFormData?.({ ...formData, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        saveAndAdvance(onNext, 'Vault 2 (Commerce)');
    };

    // Initialize products if empty
    const products = formData.products || [];

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-warning mb-2">
                    <ShoppingBag size={24} />
                    <span className="text-mono-data uppercase">VAULT 2 • COMMERCE</span>
                </div>
                <h2 className="text-title text-2xl">Economia & Oferta</h2>
                <p className="text-body max-w-xl">
                    O que vamos vender e como? Estruture seu catálogo para o <strong>S2 (Commerce Vault)</strong>.
                </p>
            </div>

            {/* Section 1: Catálogo de Produtos */}
            <section className="space-y-6">
                <h3 className="text-subtitle flex items-center gap-2">
                    <span className="w-6 h-6 bg-warning/20 text-warning rounded flex items-center justify-center text-xs">1</span>
                    <ShoppingBag size={16} className="text-warning" />
                    Catálogo de Produtos
                    <button
                        type="button"
                        onClick={() => {
                            // Demo Caraca Bar
                            const demo = CARACA_BAR_DATA.S2;

                            if (updateField) {
                                updateField('products', demo.products);
                                updateField('targetTicket', demo.ticketAverage);
                                updateField('currentTicket', 45.00); // Exemplo baseline
                                updateField('currentRevenue', 65000); // Exemplo baseline
                            }

                            addToast({
                                title: 'Modo Caraca Bar Ativado! 🍢',
                                description: 'Produtos e preços de exemplo carregados.',
                                type: 'success'
                            });
                        }}
                        className="btn-ghost btn-sm ml-auto"
                    >
                        🎲 Inspirar-me
                    </button>
                </h3>
                <p className="text-caption">
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

                <div className="vault-room vault-room-body">
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
                        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
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
                    data-testid="v2-save-next"
                    className="btn-primary-lg"
                >
                    Salvar e Avançar para V3 <ArrowRight size={20} />
                </button>
            </div>
        </form >
    );
}
