import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Circle, AlertTriangle, Target, Lightbulb, ArrowUpRight } from 'lucide-react';

const defaultChecklist = [
    { id: 'kpis_reviewed', label: 'KPIs revisados e atualizados', checked: false },
    { id: 'roadmap_reviewed', label: 'Roadmap da semana validado', checked: false },
    { id: 'blockers_identified', label: 'Bloqueios identificados', checked: false },
    { id: 'priorities_aligned', label: 'Prioridades alinhadas com time', checked: false },
    { id: 'vaults_updated', label: 'Vaults atualizados (se necessário)', checked: false },
];

export function GovernanceModal({ open, onClose, onSave, governanceData, kpis }) {
    const [checklist, setChecklist] = useState(defaultChecklist);
    const [decisions, setDecisions] = useState('');
    const [learnings, setLearnings] = useState('');
    const [goalAdjustments, setGoalAdjustments] = useState({
        revenue: '',
        traffic: '',
        sales: '',
    });
    const [priorities, setPriorities] = useState(['', '', '']);

    useEffect(() => {
        if (governanceData) {
            setChecklist(governanceData.checklist || defaultChecklist);
            setDecisions(governanceData.decisions || '');
            setLearnings(governanceData.learnings || '');
            setGoalAdjustments(governanceData.goalAdjustments || { revenue: '', traffic: '', sales: '' });
            setPriorities(governanceData.priorities || ['', '', '']);
        }
    }, [governanceData]);

    const handleCheckItem = (id) => {
        setChecklist(prev => prev.map(item => 
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
    };

    const handleSave = () => {
        const data = {
            checklist,
            decisions,
            learnings,
            goalAdjustments,
            priorities: priorities.filter(p => p.trim() !== ''),
            completedAt: new Date().toISOString(),
            checklistProgress: checklist.filter(c => c.checked).length / checklist.length
        };
        onSave(data);
        onClose();
    };

    const completedCount = checklist.filter(c => c.checked).length;
    const progress = (completedCount / checklist.length) * 100;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-fadeIn">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-lg font-bold text-white">Governança</h2>
                        <p className="text-xs text-gray-500 mt-1">Checklist de revisão e decisões do ciclo</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={18} className="text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Progress Bar */}
                    <div className="bg-[#111] rounded-lg p-4 border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Progresso do Checklist</span>
                            <span className="text-sm font-mono text-white">{completedCount}/{checklist.length}</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : progress >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Checklist */}
                    <div>
                        <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                            <CheckCircle2 size={16} className="text-green-500" />
                            Checklist de Revisão
                        </h3>
                        <div className="space-y-2">
                            {checklist.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleCheckItem(item.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                        item.checked 
                                            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                                            : 'bg-[#111] border-white/5 text-gray-400 hover:border-white/20'
                                    }`}
                                >
                                    {item.checked ? (
                                        <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                                    ) : (
                                        <Circle size={18} className="text-gray-600 shrink-0" />
                                    )}
                                    <span className="text-sm text-left">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Decisions */}
                    <div>
                        <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                            <Target size={16} className="text-blue-500" />
                            Decisões Tomadas
                        </h3>
                        <textarea
                            value={decisions}
                            onChange={(e) => setDecisions(e.target.value)}
                            placeholder="O que foi decidido neste ciclo? Ex: pausar campanha X, aumentar budget em Y..."
                            className="w-full h-24 bg-[#111] border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 resize-none"
                        />
                    </div>

                    {/* Learnings */}
                    <div>
                        <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                            <Lightbulb size={16} className="text-yellow-500" />
                            Aprendizados
                        </h3>
                        <textarea
                            value={learnings}
                            onChange={(e) => setLearnings(e.target.value)}
                            placeholder="O que aprendemos? Ex: melhor horário de postagem, tipo de conteúdo que performou..."
                            className="w-full h-24 bg-[#111] border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 resize-none"
                        />
                    </div>

                    {/* Goal Adjustments */}
                    <div>
                        <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                            <AlertTriangle size={16} className="text-orange-500" />
                            Ajustes de Meta (opcional)
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            {Object.entries(goalAdjustments).map(([key, value]) => (
                                <div key={key} className="bg-[#111] border border-white/5 rounded-lg p-3">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                                        {key === 'revenue' ? 'Receita' : key === 'traffic' ? 'Tráfego' : 'Vendas'}
                                    </label>
                                    <div className="flex items-center gap-1">
                                        <span className="text-gray-500 text-xs">Meta atual: {kpis?.[key]?.goal || 0}</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={value}
                                        onChange={(e) => setGoalAdjustments(prev => ({ ...prev, [key]: e.target.value }))}
                                        placeholder="Nova meta"
                                        className="w-full mt-2 bg-black/50 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-orange-500/50"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Priority Redefinition */}
                    <div>
                        <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                            <ArrowUpRight size={16} className="text-purple-500" />
                            Top 3 Prioridades (próximo ciclo)
                        </h3>
                        <div className="space-y-2">
                            {priorities.map((priority, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <span className="w-6 h-6 flex items-center justify-center bg-purple-500/20 text-purple-400 rounded text-xs font-bold">
                                        {idx + 1}
                                    </span>
                                    <input
                                        type="text"
                                        value={priority}
                                        onChange={(e) => {
                                            const newPriorities = [...priorities];
                                            newPriorities[idx] = e.target.value;
                                            setPriorities(newPriorities);
                                        }}
                                        placeholder={`Prioridade ${idx + 1}`}
                                        className="flex-1 bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-white/10 bg-[#080808]">
                    <div className="text-xs text-gray-500">
                        {progress < 100 && (
                            <span className="text-yellow-500">⚠️ Complete o checklist antes de salvar</span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                                progress === 100 
                                    ? 'bg-green-600 text-white hover:bg-green-500' 
                                    : 'bg-purple-600 text-white hover:bg-purple-500'
                            }`}
                        >
                            {progress === 100 ? 'Fechar Ciclo' : 'Salvar Rascunho'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
