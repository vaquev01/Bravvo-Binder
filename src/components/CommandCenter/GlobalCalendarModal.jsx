import React, { useState, useMemo } from 'react';
import { X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, Briefcase, Zap, CheckCircle2 } from 'lucide-react';

// === GROWTH DATABASE ===
// Datas comerciais, nichadas e oportunidades de marketing.
const GROWTH_DATES = {
    '01': [
        { day: '07', title: 'Dia do Leitor', tags: ['educacao', 'livros'] },
        { day: '26', title: 'Dia da Gula', tags: ['gastronomia'] },
        { day: '30', title: 'Dia da Saudade', tags: ['geral'] }
    ],
    '02': [
        { day: '01', title: 'Dia do Publicitário', tags: ['b2b'] },
        { day: '14', title: 'Valentine\'s Day', tags: ['varejo', 'geral'] }, // Gringo mas forte
        { day: '19', title: 'Dia do Esportista', tags: ['saude', 'esportes'] }
    ],
    '03': [
        { day: '08', title: 'Dia da Mulher', tags: ['geral', 'varejo'] },
        { day: '15', title: 'Dia do Consumidor', tags: ['varejo', 'ecommerce'], importance: 'high' },
        { day: '31', title: 'Dia da Saúde', tags: ['saude'] }
    ],
    '04': [
        { day: '01', title: 'Dia da Mentira', tags: ['criativo'] },
        { day: '07', title: 'Dia Mundial da Saúde', tags: ['saude'] },
        { day: '28', title: 'Dia do Frete Grátis', tags: ['ecommerce', 'varejo'] }
    ],
    '05': [
        { day: '01', title: 'Dia do Trabalho', tags: ['geral'] },
        { day: '04', title: 'Star Wars Day', tags: ['geek', 'tech'] },
        { day: '25', title: 'Dia do Orgulho Geek', tags: ['geek', 'tech'] },
        { day: '28', title: 'Dia do Hambúrguer', tags: ['gastronomia'] }
    ],
    '06': [
        { day: '12', title: 'Dia dos Namorados', tags: ['varejo', 'gastronomia'], importance: 'high' },
        { day: '18', title: 'Dia da Gastronomia Sustentável', tags: ['gastronomia'] },
        { day: '28', title: 'Dia do Orgulho LGBTQIA+', tags: ['geral'] }
    ],
    '07': [
        { day: '10', title: 'Dia da Pizza', tags: ['gastronomia'], importance: 'high' },
        { day: '13', title: 'Dia Mundial do Rock', tags: ['cultura', 'bares'] },
        { day: '20', title: 'Dia do Amigo', tags: ['geral'] },
        { day: '26', title: 'Dia dos Avós', tags: ['familia'] }
    ],
    '08': [
        { day: '11', title: 'Dia do Estudante', tags: ['educacao'] },
        { day: '15', title: 'Dia dos Solteiros', tags: ['festas', 'bares'] },
        { day: '29', title: 'Dia do Gamer', tags: ['tech', 'geek'] }
        // Dia dos Pais é móvel, não hardcoded aqui (idealmente via função)
    ],
    '09': [
        { day: '05', title: 'Dia do Irmão', tags: ['familia'] },
        { day: '13', title: 'Dia do Programador', tags: ['tech'] },
        { day: '15', title: 'Dia do Cliente', tags: ['varejo', 'b2b'], importance: 'high' }
    ],
    '10': [
        { day: '01', title: 'Dia do Vendedor', tags: ['b2b'] },
        { day: '04', title: 'Dia dos Animais', tags: ['pet'] },
        { day: '12', title: 'Dia das Crianças', tags: ['familia', 'varejo'] },
        { day: '16', title: 'Dia da Alimentação', tags: ['gastronomia', 'saude'] },
        { day: '31', title: 'Halloween', tags: ['festas', 'geral'] }
    ],
    '11': [
        { day: '01', title: 'Dia do Sushi', tags: ['gastronomia'] },
        { day: '11', title: 'Singles Day', tags: ['ecommerce'] },
        { day: '19', title: 'Dia do Empreendedorismo Feminino', tags: ['b2b'] },
        { day: '24', title: 'Black Friday', tags: ['varejo', 'ecommerce'], importance: 'high' } // Aprox
    ],
    '12': [
        { day: '25', title: 'Natal', tags: ['geral'], importance: 'high' },
        { day: '31', title: 'Ano Novo', tags: ['geral'], importance: 'high' }
    ]
};

export function GlobalCalendarModal({ open, onClose, appData, roadmapItems = [] }) {
    if (!open) return null;

    const [currentDate, setCurrentDate] = useState(new Date());

    const s1 = appData?.vaults?.s1 || appData?.vaults?.S1?.fields || {};
    const niche = (s1.niche || 'geral').toLowerCase();
    const scope = s1.scope || 'local';
    const location = s1.location || 'Não definido';

    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const startDay = monthStart.getDay();

    // === MERGE EVENTS LOGIC ===
    const events = useMemo(() => {
        const currentMonthKey = String(currentDate.getMonth() + 1).padStart(2, '0');
        const year = currentDate.getFullYear();

        // 1. Growth Dates (Feriados e Oportunidades)
        const monthGrowthDates = GROWTH_DATES[currentMonthKey] || [];

        // Filtra por nicho (simplificado: mostra geral + tags do nicho)
        // Se nicho for 'gastronomia', mostra 'geral' + 'gastronomia'
        const filteredGrowth = monthGrowthDates.filter(d => {
            if (d.tags.includes('geral')) return true;
            if (niche !== 'geral' && d.tags.some(tag => niche.includes(tag) || tag.includes(niche))) return true;
            // Mostra datas 'high importance' sempre
            if (d.importance === 'high') return true;
            return false;
        }).map(d => ({
            date: `${d.day}-${currentMonthKey}`, // DD-MM format for comparison
            title: d.title,
            type: 'opportunity',
            importance: d.importance
        }));

        // 2. Roadmap Items (Ações Reais)
        const clientEvents = roadmapItems
            .filter(item => item.date && item.status !== 'cancelled')
            .map(item => {
                const dateObj = new Date(item.date);
                if (dateObj.getMonth() !== currentDate.getMonth() || dateObj.getFullYear() !== year) return null;

                return {
                    date: `${String(dateObj.getDate()).padStart(2, '0')}-${currentMonthKey}`,
                    title: item.initiative || item.title || 'Ação',
                    type: 'action',
                    status: item.status,
                    channel: item.channel
                };
            })
            .filter(Boolean);

        return [...filteredGrowth, ...clientEvents];
    }, [currentDate, niche, roadmapItems]);

    const getEventsForDay = (day) => {
        const dateStr = `${String(day).padStart(2, '0')}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        return events.filter(e => e.date === dateStr);
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
                            <CalendarIcon size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Calendário Estratégico</h2>
                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                <span className="flex items-center gap-1"><Briefcase size={10} /> {niche.toUpperCase()}</span>
                                <span className="w-px h-3 bg-white/10"></span>
                                <span className="flex items-center gap-1"><MapPin size={10} /> {location} ({scope})</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2 text-[10px] uppercase tracking-wider font-bold">
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500/50"></span> Oportunidade</div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Ação Agendada</div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-auto p-6 bg-[#0A0A0A]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white capitalize flex items-center gap-2">
                            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="flex gap-2">
                            <button onClick={handlePrevMonth} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={handleNextMonth} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-4">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                            <div key={day} className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider py-2">
                                {day}
                            </div>
                        ))}

                        {Array.from({ length: startDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="min-h-[100px] bg-transparent" />
                        ))}

                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dayEvents = getEventsForDay(day);
                            const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

                            // Sort: Actions first, then High Imp Opportunities, then others
                            dayEvents.sort((a, b) => {
                                if (a.type === 'action' && b.type !== 'action') return -1;
                                if (b.type === 'action' && a.type !== 'action') return 1;
                                return 0;
                            });

                            return (
                                <div
                                    key={day}
                                    className={`min-h-[120px] rounded-xl border p-3 transition-all relative group
                                        ${isToday ? 'bg-purple-500/5 border-purple-500/30 ring-1 ring-purple-500/20' : 'bg-[#121212] border-white/5 hover:border-white/10 hover:bg-[#151515]'}
                                    `}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`text-sm font-bold ${isToday ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-300'}`}>{day}</span>
                                        {dayEvents.some(e => e.type === 'action') && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        )}
                                    </div>

                                    <div className="mt-3 space-y-1.5 overflow-hidden">
                                        {dayEvents.slice(0, 4).map((evt, idx) => (
                                            <div
                                                key={idx}
                                                className={`text-[9px] px-2 py-1 rounded truncate flex items-center gap-1 font-medium
                                                    ${evt.type === 'action'
                                                        ? 'bg-green-500/20 text-green-300 border border-green-500/20'
                                                        : 'bg-pink-500/10 text-pink-300/70 border border-pink-500/10 hover:bg-pink-500/20 hover:text-pink-200'}
                                                `}
                                                title={evt.title}
                                            >
                                                {evt.type === 'action' && <CheckCircle2 size={8} />}
                                                {evt.type === 'opportunity' && <Zap size={8} />}
                                                {evt.title}
                                            </div>
                                        ))}
                                        {dayEvents.length > 4 && (
                                            <div className="text-[9px] text-gray-600 text-center py-0.5">
                                                +{dayEvents.length - 4} mais...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-[#111] text-xs text-gray-500 flex justify-between">
                    <span>*Datas comerciais baseadas no perfil <strong>{niche}</strong>.</span>
                </div>
            </div>
        </div>
    );
}
