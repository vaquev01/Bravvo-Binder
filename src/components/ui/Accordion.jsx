import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function Accordion({ title, icon: Icon, defaultOpen = false, children, className = '' }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-panel)] ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {Icon && <Icon size={18} className="text-bravvo-primary" />}
                    <span className="font-bold text-sm text-gray-200">{title}</span>
                </div>
                <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <div
                className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                    {children}
                </div>
            </div>
        </div>
    );
}

export function AccordionGroup({ children, className = '' }) {
    return (
        <div className={`space-y-4 ${className}`}>
            {children}
        </div>
    );
}
