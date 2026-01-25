import React from 'react';
import { Plus, Trash2, Star, GripVertical } from 'lucide-react';

/**
 * ProductList - Lista dinâmica de produtos com add/remove
 * @param {Array} products - Array de { name, price, category, margin, isHero }
 * @param {function} onChange - Callback com novo array
 * @param {number} maxProducts - Máximo de produtos permitidos
 */
export function ProductList({ products = [], onChange, maxProducts = 5 }) {
    const categories = [
        { value: 'food', label: '🍔 Comida' },
        { value: 'drink', label: '🍺 Bebida' },
        { value: 'service', label: '🛠️ Serviço' },
        { value: 'digital', label: '💻 Digital' },
        { value: 'physical', label: '📦 Físico' },
    ];

    const addProduct = () => {
        if (products.length < maxProducts) {
            onChange([
                ...products,
                { id: Date.now(), name: '', price: '', category: 'food', margin: 'medium', isHero: products.length === 0 }
            ]);
        }
    };

    const removeProduct = (id) => {
        const newProducts = products.filter(p => p.id !== id);
        // Se removeu o hero, promover o primeiro
        if (newProducts.length > 0 && !newProducts.some(p => p.isHero)) {
            newProducts[0].isHero = true;
        }
        onChange(newProducts);
    };

    const updateProduct = (id, field, value) => {
        onChange(products.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const setHero = (id) => {
        onChange(products.map(p => ({ ...p, isHero: p.id === id })));
    };

    return (
        <div className="space-y-4">
            {/* Product Cards */}
            {products.map((product) => (
                <div
                    key={product.id}
                    className={`
                        relative p-4 rounded-xl border transition-all
                        ${product.isHero
                            ? 'bg-orange-500/10 border-orange-500/30'
                            : 'bg-white/5 border-white/10'
                        }
                    `}
                >
                    {/* Hero Badge */}
                    {product.isHero && (
                        <div className="absolute -top-2 left-4 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider rounded">
                            Carro-Chefe
                        </div>
                    )}

                    <div className="flex items-start gap-4">
                        {/* Drag Handle (visual only for now) */}
                        <div className="text-gray-600 mt-3">
                            <GripVertical size={16} />
                        </div>

                        {/* Product Fields */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Name */}
                            <div className="md:col-span-2">
                                <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Nome</label>
                                <input
                                    type="text"
                                    value={product.name}
                                    onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                                    placeholder="Ex: Combo Premium"
                                    className="input-field"
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Preço</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                                    <input
                                        type="number"
                                        value={product.price}
                                        onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                                        placeholder="0.00"
                                        className="input-field pl-10 font-mono"
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Categoria</label>
                                <select
                                    value={product.category}
                                    onChange={(e) => updateProduct(product.id, 'category', e.target.value)}
                                    className="input-field"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-6">
                            {/* Set as Hero */}
                            {!product.isHero && (
                                <button
                                    type="button"
                                    onClick={() => setHero(product.id)}
                                    className="p-2 text-gray-500 hover:text-orange-400 transition-colors"
                                    title="Definir como Carro-Chefe"
                                >
                                    <Star size={16} />
                                </button>
                            )}

                            {/* Remove */}
                            <button
                                type="button"
                                onClick={() => removeProduct(product.id)}
                                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                title="Remover Produto"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Margin Selector */}
                    <div className="mt-4 flex items-center gap-4">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Margem:</span>
                        <div className="flex gap-2">
                            {['low', 'medium', 'high'].map((margin) => (
                                <button
                                    key={margin}
                                    type="button"
                                    onClick={() => updateProduct(product.id, 'margin', margin)}
                                    className={`
                                        px-3 py-1 rounded-full text-xs font-medium transition-all
                                        ${product.margin === margin
                                            ? margin === 'high' ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : margin === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            : 'bg-white/5 text-gray-500 border border-transparent hover:border-white/10'
                                        }
                                    `}
                                >
                                    {margin === 'high' ? 'Alta' : margin === 'medium' ? 'Média' : 'Baixa'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ))}

            {/* Add Button */}
            {products.length < maxProducts && (
                <button
                    type="button"
                    onClick={addProduct}
                    className="w-full p-4 border-2 border-dashed border-white/10 rounded-xl text-gray-500 hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-2 group"
                >
                    <Plus size={20} className="group-hover:scale-110 transition-transform" />
                    <span>Adicionar Produto ({products.length}/{maxProducts})</span>
                </button>
            )}

            {/* Empty State */}
            {products.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">
                    Nenhum produto adicionado. Clique no botão acima para começar.
                </p>
            )}
        </div>
    );
}
