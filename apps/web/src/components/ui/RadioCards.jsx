import React from 'react';

/**
 * RadioCards - Grid de cards selecionáveis com ícone e descrição
 * @param {string} value - Valor selecionado atual
 * @param {function} onChange - Callback com novo valor
 * @param {Array} options - Array de { value, label, emoji, description }
 * @param {number} columns - Número de colunas (default 3)
 */
export function RadioCards({ value, onChange, options = [], columns = 3 }) {
    return (
        <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${Math.min(columns, options.length)}, minmax(0, 1fr))` }}>
            {options.map((option) => {
                const isSelected = value === option.value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={`
                            relative p-4 rounded-xl border text-left transition-all duration-200 group
                            ${isSelected
                                ? 'bg-white/10 border-white/30 ring-1 ring-white/20'
                                : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                            }
                        `}
                    >
                        {/* Selected Indicator */}
                        {isSelected && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full" />
                        )}

                        {/* Emoji/Icon */}
                        <div className="text-2xl mb-2">{option.emoji}</div>

                        {/* Label */}
                        <div className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                            {option.label}
                        </div>

                        {/* Description */}
                        {option.description && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {option.description}
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
