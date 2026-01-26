import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Drawer - ONDA 2.1 PRD
 * Painel lateral que substitui modais para manter contexto visível
 * Usado para: editar ação, gerar arte, solicitar aprovação
 */

export function Drawer({ 
    open, 
    onClose, 
    title, 
    subtitle,
    children, 
    width = 'md',
    position = 'right',
    showOverlay = true,
    testId
}) {
    const drawerRef = useRef(null);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && open) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    if (!open) return null;

    const widthClasses = {
        sm: 'w-full max-w-sm',
        md: 'w-full max-w-md',
        lg: 'w-full max-w-lg',
        xl: 'w-full max-w-xl',
        '2xl': 'w-full max-w-2xl'
    };

    const positionClasses = {
        right: 'right-0',
        left: 'left-0'
    };

    const slideAnimation = position === 'right' 
        ? 'animate-slideInRight' 
        : 'animate-slideInLeft';

    return (
        <div className="fixed inset-0 z-[100]" data-testid={testId}>
            {/* Overlay - clicável para fechar */}
            {showOverlay && (
                <div 
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
                    onClick={onClose}
                />
            )}
            
            {/* Drawer Panel */}
            <div
                ref={drawerRef}
                className={`
                    absolute top-0 bottom-0 ${positionClasses[position]}
                    ${widthClasses[width]}
                    bg-[#0A0A0A] border-l border-white/10
                    flex flex-col shadow-2xl
                    ${slideAnimation}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#080808]">
                    <div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
}

/**
 * DrawerFooter - Área fixa no rodapé do drawer para botões de ação
 */
export function DrawerFooter({ children, className = '' }) {
    return (
        <div className={`
            px-6 py-4 border-t border-white/10 bg-[#080808]
            flex items-center justify-end gap-3
            ${className}
        `}>
            {children}
        </div>
    );
}

/**
 * DrawerSection - Seção com título dentro do drawer
 */
export function DrawerSection({ title, children, className = '' }) {
    return (
        <div className={`px-6 py-4 ${className}`}>
            {title && (
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                    {title}
                </h3>
            )}
            {children}
        </div>
    );
}

export default Drawer;
