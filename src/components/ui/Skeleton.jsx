import React from 'react';

/**
 * Skeleton - ONDA 5 PRD
 * Loading placeholders para percepção de performance
 * Prazer de uso e percepção premium
 */

// Skeleton base com animação shimmer
export function Skeleton({ className = '', variant = 'text' }) {
    const baseClasses = 'bg-white/5 rounded animate-pulse';
    
    const variantClasses = {
        text: 'h-4 w-full',
        title: 'h-6 w-3/4',
        avatar: 'h-10 w-10 rounded-full',
        card: 'h-24 w-full rounded-xl',
        button: 'h-9 w-24 rounded-lg',
        badge: 'h-5 w-16 rounded-full'
    };

    return (
        <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
    );
}

// Skeleton para linha de tabela/lista
export function SkeletonRow({ columns = 5 }) {
    return (
        <div className="flex items-center gap-4 px-4 py-3 border-b border-white/5">
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton 
                    key={i} 
                    className={i === 0 ? 'w-20' : i === 1 ? 'flex-1' : 'w-24'}
                />
            ))}
        </div>
    );
}

// Skeleton para card de KPI
export function SkeletonKpiCard() {
    return (
        <div className="bento-grid p-4 bento-cell space-y-4">
            <div className="flex justify-between">
                <Skeleton variant="badge" />
                <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton variant="title" />
            <Skeleton className="h-1 w-full rounded-full" />
        </div>
    );
}

// Skeleton para card de vault
export function SkeletonVaultCard() {
    return (
        <div className="bento-grid p-4 bento-cell space-y-3">
            <div className="flex items-center gap-2">
                <Skeleton variant="avatar" className="h-8 w-8" />
                <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton variant="text" />
            <Skeleton className="h-3 w-2/3" />
        </div>
    );
}

// Skeleton para o DaySummary
export function SkeletonDaySummary() {
    return (
        <div className="mb-6 space-y-4 animate-pulse">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton variant="title" className="h-8 w-64" />
                </div>
                <div className="flex gap-2">
                    <Skeleton variant="badge" className="w-24" />
                    <Skeleton variant="badge" className="w-28" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Skeleton variant="card" className="h-32" />
                <Skeleton variant="card" className="h-32" />
            </div>
        </div>
    );
}

// Skeleton para tabela/roadmap completo
export function SkeletonTable({ rows = 5 }) {
    return (
        <div className="bento-grid overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                <Skeleton className="h-4 w-32" />
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <SkeletonRow key={i} />
            ))}
        </div>
    );
}

// Skeleton para dashboard completo
export function SkeletonDashboard() {
    return (
        <div className="space-y-6 p-4 md:p-6">
            <SkeletonDaySummary />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonKpiCard key={i} />
                ))}
            </div>
            
            <SkeletonTable rows={5} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonVaultCard key={i} />
                ))}
            </div>
        </div>
    );
}

export default Skeleton;
