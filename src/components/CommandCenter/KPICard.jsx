import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';

function getAttentionBadge(value, goal) {
    if (!goal || goal === 0) return { color: 'bg-gray-500', label: 'N/A', level: 'neutral' };
    const ratio = value / goal;
    if (ratio >= 0.9) return { color: 'bg-green-500', label: 'OK', level: 'ok' };
    if (ratio >= 0.7) return { color: 'bg-yellow-500', label: 'Atenção', level: 'warning' };
    return { color: 'bg-red-500', label: 'Crítico', level: 'critical' };
}

function getTrend(current, previous) {
    if (!previous || previous === 0) return { icon: Minus, color: 'text-gray-500', label: '→' };
    const change = ((current - previous) / previous) * 100;
    if (change > 5) return { icon: TrendingUp, color: 'text-green-500', label: `↑ ${change.toFixed(1)}%` };
    if (change < -5) return { icon: TrendingDown, color: 'text-red-500', label: `↓ ${Math.abs(change).toFixed(1)}%` };
    return { icon: Minus, color: 'text-gray-500', label: '→ 0%' };
}

function InlineKPIEdit({ value, onSave, prefix = '', suffix = '', disabled = false }) {
    const [editing, setEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const inputRef = useRef(null);

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editing]);

    const handleSave = () => {
        onSave(tempValue);
        setEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') {
            setTempValue(value);
            setEditing(false);
        }
    };

    if (editing) {
        return (
            <div className="flex items-center gap-1">
                {prefix && <span className="text-gray-500 text-lg">{prefix}</span>}
                <input
                    ref={inputRef}
                    type="number"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className="bg-black/50 border border-purple-500/50 rounded px-2 py-1 w-28 text-2xl font-mono font-bold text-white focus:outline-none"
                />
                {suffix && <span className="text-gray-500 text-lg">{suffix}</span>}
            </div>
        );
    }

    return (
        <span
            onClick={() => !disabled && setEditing(true)}
            className={`${disabled ? 'cursor-default' : 'cursor-pointer hover:bg-white/10'} px-1 py-0.5 rounded transition-colors text-2xl font-mono font-bold text-white`}
            title={disabled ? "Ative Governança para editar" : "Clique para editar"}
        >
            {prefix}{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}{suffix}
        </span>
    );
}

export function KPICard({ 
    id,
    label, 
    value, 
    goal, 
    previousValue,
    prefix = '', 
    suffix = '',
    icon: Icon,
    iconColor = 'text-blue-500',
    onUpdate,
    disabled = false 
}) {
    const badge = getAttentionBadge(value, goal);
    const trend = getTrend(value, previousValue);
    const TrendIcon = trend.icon;
    
    const gap = goal - value;
    const gapPercent = goal > 0 ? ((gap / goal) * 100).toFixed(0) : 0;
    const progress = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;

    return (
        <div className={`bento-grid p-4 relative overflow-hidden transition-all ${
            badge.level === 'critical' ? 'ring-1 ring-red-500/30' : 
            badge.level === 'warning' ? 'ring-1 ring-yellow-500/20' : ''
        }`}>
            {/* Attention Badge */}
            <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full ${badge.color}/20`}>
                {badge.level === 'critical' && <AlertCircle size={10} className="text-red-400" />}
                <span className={`text-[9px] font-bold uppercase tracking-wider ${
                    badge.level === 'ok' ? 'text-green-400' :
                    badge.level === 'warning' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                    {badge.label}
                </span>
            </div>

            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                {Icon && <Icon size={14} className={iconColor} />}
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
            </div>

            {/* Value (Realizado) */}
            <div className="mb-2">
                <InlineKPIEdit
                    value={value}
                    onSave={(v) => onUpdate?.(id, parseFloat(v) || 0)}
                    prefix={prefix}
                    suffix={suffix}
                    disabled={disabled}
                />
            </div>

            {/* Meta vs Realizado Row */}
            <div className="flex items-center justify-between text-[10px] mb-2">
                <span className="text-gray-500">
                    Meta: <span className="text-gray-400 font-mono">{prefix}{goal?.toLocaleString('pt-BR') || 0}{suffix}</span>
                </span>
                <div className="flex items-center gap-1">
                    <TrendIcon size={12} className={trend.color} />
                    <span className={trend.color}>{trend.label}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                <div 
                    className={`h-full transition-all duration-500 ${
                        badge.level === 'ok' ? 'bg-green-500' :
                        badge.level === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Gap */}
            <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-600">
                    Gap: <span className={`font-mono ${gap > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {gap > 0 ? '-' : '+'}{prefix}{Math.abs(gap).toLocaleString('pt-BR')}{suffix}
                    </span>
                </span>
                <span className={`font-mono ${gap > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {gap > 0 ? `-${gapPercent}%` : `+${Math.abs(gapPercent)}%`}
                </span>
            </div>
        </div>
    );
}

export function KPIGrid({ kpis, onKpiUpdate, disabled }) {
    const kpiConfigs = [
        { 
            id: 'revenue', 
            label: 'Receita', 
            prefix: 'R$ ', 
            iconColor: 'text-green-500',
            previousValue: kpis?.revenue?.previousValue || kpis?.revenue?.value * 0.88 // Mock previous if not available
        },
        { 
            id: 'traffic', 
            label: 'Tráfego (R$)', 
            prefix: 'R$ ', 
            iconColor: 'text-blue-500',
            previousValue: kpis?.traffic?.previousValue || kpis?.traffic?.value * 0.95
        },
        { 
            id: 'sales', 
            label: 'Vendas', 
            prefix: '', 
            suffix: ' un',
            iconColor: 'text-orange-500',
            previousValue: kpis?.sales?.previousValue || kpis?.sales?.value * 1.05
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {kpiConfigs.map(config => (
                <KPICard
                    key={config.id}
                    id={config.id}
                    label={config.label}
                    value={kpis?.[config.id]?.value || 0}
                    goal={kpis?.[config.id]?.goal || 0}
                    previousValue={config.previousValue}
                    prefix={config.prefix}
                    suffix={config.suffix || ''}
                    iconColor={config.iconColor}
                    onUpdate={onKpiUpdate}
                    disabled={disabled}
                />
            ))}
        </div>
    );
}
