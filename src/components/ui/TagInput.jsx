import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

/**
 * TagInput - Input de múltiplas tags com add/remove
 * @param {string[]} value - Array de tags atuais
 * @param {function} onChange - Callback com novo array
 * @param {string} placeholder - Placeholder do input
 * @param {number} maxTags - Máximo de tags permitidas
 * @param {string[]} suggestions - Sugestões para autocomplete
 */
export function TagInput({ value = [], onChange, placeholder = "Digite e pressione Enter", maxTags = 5, suggestions = [] }) {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const addTag = (tag) => {
        const trimmed = tag.trim();
        if (trimmed && !value.includes(trimmed) && value.length < maxTags) {
            onChange([...value, trimmed]);
            setInputValue('');
        }
    };

    const removeTag = (tagToRemove) => {
        onChange(value.filter(tag => tag !== tagToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            removeTag(value[value.length - 1]);
        }
    };

    const filteredSuggestions = suggestions.filter(
        s => s.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(s)
    );

    return (
        <div className="space-y-2">
            {/* Tags Display */}
            <div className="flex flex-wrap gap-2 min-h-[32px]">
                {value.map((tag, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-full text-sm text-white group hover:border-[var(--border-active)] hover:bg-white/5 transition-colors"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                            <X size={12} />
                        </button>
                    </span>
                ))}
            </div>

            {/* Input */}
            {value.length < maxTags && (
                <div className="relative">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setShowSuggestions(e.target.value.length > 0);
                        }}
                        onKeyDown={handleKeyDown}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onFocus={() => inputValue && setShowSuggestions(true)}
                        placeholder={placeholder}
                        className="input-field pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => addTag(inputValue)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <Plus size={16} />
                    </button>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg shadow-xl z-50 max-h-40 overflow-y-auto">
                            {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => addTag(suggestion)}
                                    className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Counter */}
            <p className="text-xs text-gray-500">
                {value.length}/{maxTags} tags
            </p>
        </div>
    );
}
