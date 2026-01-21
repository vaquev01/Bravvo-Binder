import React from 'react';
import {
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Clock,
    MoreHorizontal
} from 'lucide-react';

export function DashboardTable({ id, data, onRowClick }) {

    // Status Badge Component
    const Badge = ({ children, type }) => {
        const styles = {
            // General
            Active: "bg-green-500/10 text-green-400 border-green-500/20",
            Planned: "bg-blue-500/10 text-blue-400 border-blue-500/20",

            // D2
            scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            in_production: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
            published: "bg-green-500/10 text-green-400 border-green-500/20",
            draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",

            // D1 Margin
            High: "bg-green-500/10 text-green-400 border-green-500/20",
            Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
            Low: "bg-red-500/10 text-red-400 border-red-500/20",
            Max: "bg-purple-500/10 text-purple-400 border-purple-500/20",

            // D5 Status
            Warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
            Good: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            Great: "bg-green-500/10 text-green-400 border-green-500/20",
            Critical: "bg-red-500/10 text-red-500 border-red-500/20",
        };

        const style = styles[children] || styles[type] || "bg-gray-500/10 text-gray-400 border-gray-500/20";

        return (
            <span className={`text-xs px-2 py-1 rounded border ${style} whitespace-nowrap`}>
                {children}
            </span>
        );
    };

    // Table Header Helper
    const Th = ({ children }) => (
        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left border-b border-gray-800">
            {children}
        </th>
    );

    // Table Row Helper
    const Tr = ({ children, onClick }) => (
        <tr
            onClick={onClick}
            className={`group border-b border-gray-800 hover:bg-white/5 transition-colors ${onClick ? 'cursor-pointer' : ''}`}
        >
            {children}
        </tr>
    );

    const Td = ({ children, className }) => (
        <td className={`p-4 text-sm ${className || 'text-gray-300'}`}>
            {children}
        </td>
    );

    // D1: Economy
    if (id === 'D1') {
        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            <Th>Produto</Th>
                            <Th>Tipo</Th>
                            <Th>Preço</Th>
                            <Th>Margem</Th>
                            <Th>Estratégia</Th>
                            <Th>Status</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(row => (
                            <Tr key={row.id}>
                                <Td className="font-bold text-white">{row.product}</Td>
                                <Td>{row.type}</Td>
                                <Td className="font-mono text-bravvo-primary">R$ {row.price.toFixed(2)}</Td>
                                <Td><Badge>{row.margin}</Badge></Td>
                                <Td>{row.offer_strategy}</Td>
                                <Td><Badge>{row.status}</Badge></Td>
                            </Tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    // D2: Communication
    if (id === 'D2') {
        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            <Th>Data</Th>
                            <Th>Iniciativa</Th>
                            <Th>Canal</Th>
                            <Th>Responsável</Th>
                            <Th>Status</Th>
                            <Th>Output Visual</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(row => (
                            <Tr key={row.id} onClick={() => onRowClick && onRowClick(row)}>
                                <Td className="font-mono text-bravvo-accent">{row.date}</Td>
                                <Td className="font-bold text-white group-hover:text-bravvo-primary transition-colors">
                                    {row.initiative}
                                </Td>
                                <Td>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs uppercase">{row.channel}</span>
                                        <span className="text-[10px] bg-white/10 px-1 rounded">{row.format}</span>
                                    </div>
                                </Td>
                                <Td>{row.responsible}</Td>
                                <Td><Badge>{row.status}</Badge></Td>
                                <Td>
                                    {row.visual_output === 'Pending' ? (
                                        <span className="text-gray-600 text-xs italic flex items-center gap-1">
                                            <Clock size={12} /> Pendente
                                        </span>
                                    ) : (
                                        <span className="text-bravvo-accent text-xs flex items-center gap-1">
                                            <CheckCircle2 size={12} /> {row.visual_output}
                                        </span>
                                    )}
                                </Td>
                            </Tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    // D3: Matrix
    if (id === 'D3') {
        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            <Th>Tarefa</Th>
                            <Th>Quem Faz (Owner)</Th>
                            <Th>Quem Aprova</Th>
                            <Th>SLA</Th>
                            <Th>Status</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(row => (
                            <Tr key={row.id}>
                                <Td className="font-bold text-white">{row.task}</Td>
                                <Td>{row.owner}</Td>
                                <Td>{row.approver}</Td>
                                <Td className="font-mono text-yellow-500">{row.sla}</Td>
                                <Td>{row.status}</Td>
                            </Tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    // D4: Blocks
    if (id === 'D4') {
        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            <Th>Bloco de Produção</Th>
                            <Th>Volume</Th>
                            <Th>Deadline</Th>
                            <Th>Status</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(row => (
                            <Tr key={row.id}>
                                <Td className="font-bold text-white">{row.batch_name}</Td>
                                <Td className="font-mono">{row.quantity} assets</Td>
                                <Td className="text-red-400">{row.deadline}</Td>
                                <Td><Badge>{row.status}</Badge></Td>
                            </Tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    // D5: KPIs
    if (id === 'D5') {
        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            <Th>Métrica</Th>
                            <Th>Real</Th>
                            <Th>Meta</Th>
                            <Th>Status</Th>
                            <Th>Decisão / Ação</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(row => (
                            <Tr key={row.id}>
                                <Td className="font-bold text-white">{row.metric}</Td>
                                <Td className="font-mono text-lg">{row.current}</Td>
                                <Td className="font-mono text-gray-500">{row.target}</Td>
                                <Td><Badge>{row.status}</Badge></Td>
                                <Td className="text-bravvo-primary font-bold uppercase text-xs">
                                    {row.action}
                                </Td>
                            </Tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return <div>Dashboard não encontrado</div>;
}
