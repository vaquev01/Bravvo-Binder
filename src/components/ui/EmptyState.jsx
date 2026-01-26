import React from 'react';
import { 
    Calendar, Target, ShoppingBag, GitBranch, Users, Lightbulb,
    Plus, ArrowRight, Sparkles
} from 'lucide-react';

/**
 * EmptyState - ONDA 3.1 PRD
 * Estados vazios inteligentes que orientam o usuário
 * Em vez de telas vazias, sugerimos próximos passos
 */

// Configuração de empty states por contexto
const EMPTY_STATE_CONFIG = {
    roadmap: {
        icon: Calendar,
        title: 'Nenhuma ação no roadmap',
        description: 'Crie seu primeiro item para começar a planejar',
        action: {
            label: 'Criar Primeira Ação',
            icon: Plus
        },
        tip: 'Dica: Use playbooks para gerar um plano completo automaticamente'
    },
    vaults: {
        icon: Target,
        title: 'Vaults não configurados',
        description: 'Defina o DNA da marca para gerar ações melhores',
        action: {
            label: 'Configurar DNA',
            icon: ArrowRight
        },
        tip: 'Os Vaults alimentam a inteligência do sistema'
    },
    products: {
        icon: ShoppingBag,
        title: 'Nenhum produto cadastrado',
        description: 'Adicione seus produtos para criar ofertas',
        action: {
            label: 'Adicionar Produto',
            icon: Plus
        },
        tip: 'Produtos aparecem nas ações do roadmap'
    },
    channels: {
        icon: GitBranch,
        title: 'Nenhum canal selecionado',
        description: 'Escolha onde você quer estar presente',
        action: {
            label: 'Selecionar Canais',
            icon: ArrowRight
        },
        tip: 'Canais definem onde suas ações serão publicadas'
    },
    team: {
        icon: Users,
        title: 'Time não configurado',
        description: 'Defina quem aprova e executa as ações',
        action: {
            label: 'Configurar Time',
            icon: ArrowRight
        },
        tip: 'O aprovador receberá solicitações pelo WhatsApp'
    },
    ideas: {
        icon: Lightbulb,
        title: 'Nenhuma ideia salva',
        description: 'Guarde suas inspirações e referências aqui',
        action: {
            label: 'Adicionar Ideia',
            icon: Plus
        },
        tip: 'Ideias podem virar ações no roadmap'
    },
    governance: {
        icon: Sparkles,
        title: 'Nenhum histórico de governança',
        description: 'Ative o modo Governança para registrar decisões',
        action: {
            label: 'Ativar Governança',
            icon: Sparkles
        },
        tip: 'Governança cria um histórico de auditoria'
    }
};

export function EmptyState({ 
    type = 'roadmap',
    onAction,
    customTitle,
    customDescription,
    customAction,
    showTip = true,
    size = 'md'
}) {
    const config = EMPTY_STATE_CONFIG[type] || EMPTY_STATE_CONFIG.roadmap;
    const Icon = config.icon;
    const ActionIcon = customAction?.icon || config.action.icon;
    
    const sizeClasses = {
        sm: 'py-6',
        md: 'py-12',
        lg: 'py-16'
    };
    
    const iconSizes = {
        sm: 20,
        md: 28,
        lg: 36
    };

    return (
        <div className={`flex flex-col items-center justify-center text-center ${sizeClasses[size]} animate-fadeIn`}>
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Icon size={iconSizes[size]} className="text-gray-500" />
            </div>
            
            {/* Title */}
            <h3 className="text-lg font-semibold text-white mb-2">
                {customTitle || config.title}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-gray-500 max-w-xs mb-6">
                {customDescription || config.description}
            </p>
            
            {/* Action Button */}
            {onAction && (
                <button
                    onClick={onAction}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <ActionIcon size={16} />
                    {customAction?.label || config.action.label}
                </button>
            )}
            
            {/* Tip */}
            {showTip && config.tip && (
                <p className="mt-6 text-xs text-gray-600 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-purple-500" />
                    {config.tip}
                </p>
            )}
        </div>
    );
}

/**
 * EmptyStateInline - Versão compacta para uso em cards/listas
 */
export function EmptyStateInline({ 
    type = 'roadmap',
    onAction,
    customMessage
}) {
    const config = EMPTY_STATE_CONFIG[type] || EMPTY_STATE_CONFIG.roadmap;
    const Icon = config.icon;

    return (
        <div className="flex items-center justify-between p-4 bg-white/5 border border-dashed border-white/10 rounded-lg">
            <div className="flex items-center gap-3">
                <Icon size={18} className="text-gray-600" />
                <span className="text-sm text-gray-500">
                    {customMessage || config.description}
                </span>
            </div>
            {onAction && (
                <button
                    onClick={onAction}
                    className="text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                    <Plus size={12} />
                    Adicionar
                </button>
            )}
        </div>
    );
}

export default EmptyState;
