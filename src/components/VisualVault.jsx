import React from 'react';
import {
    Target,
    Shield,
    Zap,
    Users,
    ShoppingBag,
    TrendingUp,
    Clock,
    AlertTriangle,
    CheckCircle,
    Palette
} from 'lucide-react';

export function VisualVault({ id, data }) {
    // S1: Brand Vault
    if (id === 'S1') {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card title="Promessa de Marca" icon={Target} color="text-bravvo-primary">
                        <p className="text-xl font-display font-bold leading-tight">"{data.fields.promise}"</p>
                    </Card>
                    <Card title="Inimigo Comum" icon={Shield} color="text-red-500">
                        <p className="text-lg text-gray-300">"{data.fields.enemy}"</p>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card title="Tensão Cultural" icon={Zap} color="text-yellow-400">
                        <p className="text-sm text-gray-400">{data.fields.tension}</p>
                    </Card>
                    <Card title="Tom de Voz" icon={Users} color="text-blue-400">
                        <div className="flex flex-wrap gap-2">
                            {data.fields.tone.map(t => (
                                <span key={t} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-300">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </Card>
                    <Card title="Arquétipo" icon={Users} color="text-purple-400">
                        <p className="text-lg font-bold text-purple-300">{data.fields.archetype}</p>
                    </Card>
                </div>

                <div className="glass-panel p-6 rounded-xl border border-bravvo-border">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Policies (Regras de Ouro)</h3>
                    <ul className="space-y-2">
                        {data.fields.policies.map((policy, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-300">
                                <span className="text-red-500 mt-1">✕</span>
                                {policy}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }

    // S2: Commerce Vault
    if (id === 'S2') {
        // Support both 'items' (legacy mockData) and 'products' (from Onboarding)
        const products = data?.products || data?.items || [];

        if (products.length === 0) {
            return (
                <div className="glass-panel p-12 rounded-xl text-center border border-dashed border-gray-800">
                    <ShoppingBag className="mx-auto text-gray-600 mb-4" size={48} />
                    <p className="text-gray-500">Nenhum produto cadastrado.</p>
                    <p className="text-sm text-gray-600 mt-2">Use o Wizard de Novo Cliente para adicionar produtos.</p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {products.map(item => (
                        <div key={item.id} className="glass-panel p-4 rounded-xl border border-bravvo-border hover:border-bravvo-primary/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-mono text-gray-500">{item.id}</span>
                                <span className={`text-xs px-2 py-0.5 rounded border ${item.margin === 'High' || item.margin === 'Super High' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    item.margin === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>{item.margin} Margin</span>
                            </div>
                            <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                            <p className="text-xs text-gray-400 mb-4">{item.description || item.role || 'Sem descrição'}</p>
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-xs text-gray-500">Preço</span>
                                    <p className="text-xl font-mono text-bravvo-primary">R$ {(item.price || 0).toFixed(2)}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-500">Papel</span>
                                    <p className="text-sm font-medium text-white">{item.role || '-'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // S3: Funnel Vault
    if (id === 'S3') {
        return (
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row gap-4 relative">
                    {/* Connection Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 -z-10 hidden md:block"></div>

                    {data.steps.map((step, i) => (
                        <div key={step.id} className="flex-1 glass-panel p-6 rounded-xl border border-bravvo-border relative group">
                            <div className="absolute -top-3 left-6 px-2 bg-bravvo-card text-xs text-gray-500 border border-bravvo-border rounded">
                                {step.id}
                            </div>
                            <h3 className="font-bold text-lg mb-2">{step.name}</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Evento:</span>
                                    <span className="font-mono text-blue-400">{step.event}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">KPI:</span>
                                    <span className="text-white">{step.kpi}</span>
                                </div>
                                <div className="flex justify-between border-t border-gray-800 pt-2 mt-2">
                                    <span className="text-gray-500">Meta:</span>
                                    <span className="text-green-400 font-bold">{step.goal}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="glass-panel p-6 rounded-xl border border-bravvo-border">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Biblioteca de CTAs (Calls to Action)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {data.ctas.map(cta => (
                            <div key={cta.id} className="p-4 bg-white/5 rounded-lg border border-white/5 flex flex-col items-center text-center">
                                <span className="text-xs text-gray-500 mb-2">{cta.type}</span>
                                <button className="bg-bravvo-primary text-black font-bold px-4 py-2 rounded-lg w-full hover:bg-orange-500 transition-colors">
                                    {cta.text}
                                </button>
                                <span className="text-[10px] font-mono text-gray-600 mt-2 truncate w-full">{cta.link}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // S4: Ops Vault
    if (id === 'S4') {
        return (
            <div className="space-y-6">
                <div className="glass-panel overflow-hidden rounded-xl border border-bravvo-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400">
                            <tr>
                                <th className="p-4 font-medium">Role</th>
                                <th className="p-4 font-medium">Responsável</th>
                                <th className="p-4 font-medium">Responsabilidades</th>
                                <th className="p-4 font-medium">Aprovador</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {data.team.map((member, i) => (
                                <tr key={i} className="hover:bg-white/5">
                                    <td className="p-4 font-bold text-white">{member.role}</td>
                                    <td className="p-4 text-bravvo-primary">{member.name}</td>
                                    <td className="p-4 text-gray-400">
                                        <div className="flex flex-wrap gap-1">
                                            {member.responsibilities.map(r => (
                                                <span key={r} className="px-2 py-0.5 bg-black/40 rounded text-xs">{r}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-400">{member.approver}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.slas.map((sla, i) => (
                        <div key={i} className="p-4 rounded-lg bg-black/40 border border-gray-800 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-white">{sla.task}</p>
                                <p className="text-xs text-gray-500">Owner: {sla.owner}</p>
                            </div>
                            <div className="flex items-center gap-2 text-yellow-500">
                                <Clock size={16} />
                                <span className="font-mono font-bold">{sla.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // S5: Design Vault (The Masterpiece)
    if (id === 'S5') {
        return (
            <div className="space-y-8">
                {/* Palette */}
                <section>
                    <h3 className="section-title mb-4 flex items-center gap-2">
                        <Palette size={16} /> Paleta de Cores
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        {Object.entries(data.palette).map(([name, hex]) => (
                            <div key={name} className="flex-1 min-w-[140px] group cursor-pointer">
                                <div
                                    className="h-32 rounded-xl shadow-lg mb-2 border border-white/10 group-hover:scale-105 transition-transform relative overflow-hidden"
                                    style={{ backgroundColor: hex }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                        <span className="text-white font-mono text-xs">Copiar HEX</span>
                                    </div>
                                </div>
                                <div className="px-1">
                                    <p className="text-sm font-bold capitalize text-white">{name}</p>
                                    <p className="text-xs font-mono text-gray-500 uppercase">{hex}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Typography & Mood */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="glass-panel p-6 rounded-xl border border-bravvo-border">
                        <h3 className="section-title mb-4">Tipografia</h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs text-bravvo-primary mb-1">Headline (H1)</p>
                                <p className="text-4xl font-black text-white leading-tight">
                                    THE QUICK BROWN FOX
                                </p>
                                <p className="text-xs text-gray-500 mt-1 font-mono">{data.typography.h1.font}</p>
                            </div>
                            <div>
                                <p className="text-xs text-bravvo-primary mb-1">Subhead (H2)</p>
                                <p className="text-xl font-bold text-gray-300">
                                    Jumps over the lazy dog
                                </p>
                                <p className="text-xs text-gray-500 mt-1 font-mono">{data.typography.h2.font}</p>
                            </div>
                        </div>
                    </section>

                    <section className="glass-panel p-6 rounded-xl border border-bravvo-border">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="section-title">Design Mood</h3>
                            <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white border border-white/10">
                                {data.rules.mood}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <h4 className="flex items-center gap-2 text-red-500 text-sm font-bold mb-3">
                                    <AlertTriangle size={16} /> PROIBIDO (Forbidden List)
                                </h4>
                                <ul className="space-y-2">
                                    {data.rules.forbidden.map(item => (
                                        <li key={item} className="flex items-start gap-2 text-red-200/80 text-sm">
                                            <span className="text-red-500/50">•</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <h4 className="flex items-center gap-2 text-green-500 text-sm font-bold mb-3">
                                    <CheckCircle size={16} /> OBRIGATÓRIO (Mandatory)
                                </h4>
                                <ul className="space-y-2">
                                    {data.rules.mandatory.map(item => (
                                        <li key={item} className="flex items-start gap-2 text-green-200/80 text-sm">
                                            <span className="text-green-500/50">•</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    return <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>;
}

function Card({ title, icon: Icon, color, children }) {
    return (
        <div className="glass-panel p-6 rounded-xl border border-bravvo-border hover:border-bravvo-primary/30 transition-colors">
            <div className={`flex items-center gap-2 mb-3 ${color}`}>
                <Icon size={18} />
                <h3 className="text-xs font-bold uppercase tracking-wider">{title}</h3>
            </div>
            <div>{children}</div>
        </div>
    );
}
