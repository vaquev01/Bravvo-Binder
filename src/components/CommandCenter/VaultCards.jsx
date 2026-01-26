import React from 'react';
import { 
    Fingerprint, 
    ShoppingBag, 
    Target, 
    Users, 
    Lightbulb,
    CheckCircle2,
    AlertTriangle,
    Clock,
    ChevronRight
} from 'lucide-react';

const vaultConfigs = {
    V1: { 
        id: 'V1',
        key: 'S1',
        icon: Fingerprint, 
        color: 'red',
        labelKey: 'brand_dna',
        checkFields: ['fields.archetype', 'fields.mission', 'fields.values']
    },
    V2: { 
        id: 'V2',
        key: 'S2',
        icon: ShoppingBag, 
        color: 'orange',
        labelKey: 'offer',
        checkFields: ['products', 'pricing']
    },
    V3: { 
        id: 'V3',
        key: 'S3',
        icon: Target, 
        color: 'blue',
        labelKey: 'traffic',
        checkFields: ['traffic.primarySource', 'traffic.budget']
    },
    V4: { 
        id: 'V4',
        key: 'S4',
        icon: Users, 
        color: 'green',
        labelKey: 'team',
        checkFields: ['matrix', 'contacts']
    },
    V5: { 
        id: 'V5',
        key: 'S5',
        icon: Lightbulb, 
        color: 'purple',
        labelKey: 'ideas',
        checkFields: ['ideas']
    },
};

const colorClasses = {
    red: {
        bg: 'bg-red-500/5',
        border: 'border-red-500/20 hover:border-red-500/40',
        icon: 'bg-red-500/10 text-red-400',
        accent: 'bg-red-500',
        text: 'text-red-400'
    },
    orange: {
        bg: 'bg-orange-500/5',
        border: 'border-orange-500/20 hover:border-orange-500/40',
        icon: 'bg-orange-500/10 text-orange-400',
        accent: 'bg-orange-500',
        text: 'text-orange-400'
    },
    blue: {
        bg: 'bg-blue-500/5',
        border: 'border-blue-500/20 hover:border-blue-500/40',
        icon: 'bg-blue-500/10 text-blue-400',
        accent: 'bg-blue-500',
        text: 'text-blue-400'
    },
    green: {
        bg: 'bg-green-500/5',
        border: 'border-green-500/20 hover:border-green-500/40',
        icon: 'bg-green-500/10 text-green-400',
        accent: 'bg-green-500',
        text: 'text-green-400'
    },
    purple: {
        bg: 'bg-purple-500/5',
        border: 'border-purple-500/20 hover:border-purple-500/40',
        icon: 'bg-purple-500/10 text-purple-400',
        accent: 'bg-purple-500',
        text: 'text-purple-400'
    },
};

function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function getVaultStatus(vault, checkFields) {
    if (!vault) return { status: 'incomplete', label: 'Incompleto', filled: 0, total: checkFields.length };
    
    let filled = 0;
    for (const field of checkFields) {
        const value = getNestedValue(vault, field);
        if (value && (Array.isArray(value) ? value.length > 0 : true)) {
            filled++;
        }
    }

    const ratio = filled / checkFields.length;
    if (ratio >= 1) return { status: 'ok', label: 'Completo', filled, total: checkFields.length };
    if (ratio >= 0.5) return { status: 'partial', label: 'Parcial', filled, total: checkFields.length };
    return { status: 'incomplete', label: 'Incompleto', filled, total: checkFields.length };
}

function getVaultPreview(vault, key) {
    if (!vault) return 'Não configurado';
    
    switch (key) {
        case 'S1':
            return vault.fields?.archetype || vault.fields?.mission?.substring(0, 30) || 'Não configurado';
        case 'S2':
            return vault.products?.[0]?.name || 'Nenhum produto';
        case 'S3':
            return vault.traffic?.primarySource || 'Não definido';
        case 'S4':
            return vault.matrix?.[0]?.who || 'Nenhum membro';
        case 'S5':
            return vault.ideas?.[0]?.title || 'Nenhuma ideia';
        default:
            return 'N/A';
    }
}

function VaultCard({ config, vault, label, onClick }) {
    const colors = colorClasses[config.color];
    const Icon = config.icon;
    const status = getVaultStatus(vault, config.checkFields);
    const preview = getVaultPreview(vault, config.key);

    const StatusIcon = status.status === 'ok' ? CheckCircle2 : 
                       status.status === 'partial' ? Clock : AlertTriangle;
    const statusColor = status.status === 'ok' ? 'text-green-400' : 
                        status.status === 'partial' ? 'text-yellow-400' : 'text-red-400';

    return (
        <div
            onClick={onClick}
            data-testid={`os-vault-card-${config.id}`}
            className={`relative p-4 rounded-xl border ${colors.border} ${colors.bg} cursor-pointer transition-all hover:scale-[1.02] group`}
        >
            {/* Status Badge */}
            <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full ${
                status.status === 'ok' ? 'bg-green-500/10' : 
                status.status === 'partial' ? 'bg-yellow-500/10' : 'bg-red-500/10'
            }`}>
                <StatusIcon size={10} className={statusColor} />
                <span className={`text-[9px] font-bold uppercase tracking-wider ${statusColor}`}>
                    {status.label}
                </span>
            </div>

            {/* Icon */}
            <div className={`w-10 h-10 rounded-lg ${colors.icon} flex items-center justify-center mb-3`}>
                <Icon size={20} />
            </div>

            {/* Label */}
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                {label}
            </div>

            {/* Preview */}
            <div className="text-sm font-medium text-white truncate mb-2 pr-4">
                {preview}
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-1 w-16 bg-white/10 rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${colors.accent}`}
                            style={{ width: `${(status.filled / status.total) * 100}%` }}
                        />
                    </div>
                    <span className="text-[9px] text-gray-600 font-mono">
                        {status.filled}/{status.total}
                    </span>
                </div>
                <ChevronRight size={14} className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>

            {/* Vault ID */}
            <div className="absolute bottom-3 right-3 text-[9px] text-gray-700 font-mono">
                {config.id}
            </div>
        </div>
    );
}

export function VaultCards({ vaults, labels, onVaultClick }) {
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Vaults Estratégicos
                </h3>
                <span className="text-[10px] text-gray-600">
                    Fonte de dados para IA
                </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(vaultConfigs).map(([id, config]) => (
                    <VaultCard
                        key={id}
                        config={config}
                        vault={vaults?.[config.key]}
                        label={labels?.[config.labelKey] || config.labelKey}
                        onClick={() => onVaultClick?.(id)}
                    />
                ))}
            </div>
        </div>
    );
}
