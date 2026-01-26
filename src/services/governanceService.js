/**
 * Governance Service - Motor de Governança Cíclica
 * Responsável por: geração de ATA, recalibração do sistema, nova janela de governança
 */

// Categorias de observações
export const OBSERVATION_CATEGORIES = [
    { id: 'execution', label: 'Execução', icon: '⚡', color: 'blue' },
    { id: 'production', label: 'Produção', icon: '🎨', color: 'purple' },
    { id: 'strategy', label: 'Estratégia', icon: '🎯', color: 'green' },
    { id: 'blocker', label: 'Bloqueio', icon: '🚧', color: 'red' },
    { id: 'insight', label: 'Insight', icon: '💡', color: 'yellow' },
    { id: 'general', label: 'Assuntos Gerais', icon: '📝', color: 'gray' },
];

// Status de items do roadmap
export const ROADMAP_STATUS = {
    done: { label: 'Concluído', color: 'green', icon: '✅' },
    delayed: { label: 'Atrasado', color: 'red', icon: '⚠️' },
    cancelled: { label: 'Cancelado', color: 'gray', icon: '❌' },
    pending: { label: 'Pendente', color: 'yellow', icon: '⏳' },
    in_production: { label: 'Em Produção', color: 'blue', icon: '🔄' },
};

/**
 * Gera ATA estruturada da governança
 */
export function generateATA(governanceData) {
    const {
        period,
        periodStartDate,
        periodEndDate,
        closedAt,
        timezone,
        responsible,
        type,
        kpiSnapshot,
        roadmapReview,
        productionAnalysis,
        executionAnalysis,
        blockNotes,
        observations,
        decisions,
        learnings,
        priorities,
    } = governanceData;

    const ata = {
        id: `ATA-${Date.now()}`,
        version: 1,
        immutable: true,
        
        // Assinatura Temporal
        signature: {
            period: period || `${new Date().toLocaleDateString('pt-BR')}`,
            periodStartDate: periodStartDate || '',
            periodEndDate: periodEndDate || '',
            closedAt: closedAt || new Date().toISOString(),
            timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            responsible: responsible || 'Sistema',
            type: type || 'weekly', // daily | weekly | monthly
        },

        // KPIs Finais
        kpis: {
            revenue: {
                value: kpiSnapshot?.revenue?.value || 0,
                goal: kpiSnapshot?.revenue?.goal || 0,
                gap: (kpiSnapshot?.revenue?.goal || 0) - (kpiSnapshot?.revenue?.value || 0),
                achievement: kpiSnapshot?.revenue?.goal > 0 
                    ? ((kpiSnapshot?.revenue?.value / kpiSnapshot?.revenue?.goal) * 100).toFixed(1) 
                    : 0,
            },
            traffic: {
                value: kpiSnapshot?.traffic?.value || 0,
                goal: kpiSnapshot?.traffic?.goal || 0,
            },
            sales: {
                value: kpiSnapshot?.sales?.value || 0,
                goal: kpiSnapshot?.sales?.goal || 0,
            },
        },

        // Resumo do Roadmap
        roadmapSummary: {
            total: roadmapReview?.total || 0,
            done: roadmapReview?.done || 0,
            delayed: roadmapReview?.delayed || 0,
            cancelled: roadmapReview?.cancelled || 0,
            pending: roadmapReview?.pending || 0,
            executionRate: roadmapReview?.total > 0 
                ? ((roadmapReview?.done / roadmapReview?.total) * 100).toFixed(1) 
                : 0,
        },

        // Análise de Produção
        production: {
            generated: productionAnalysis?.generated || 0,
            approved: productionAnalysis?.approved || 0,
            published: productionAnalysis?.published || 0,
            notExecuted: productionAnalysis?.notExecuted || 0,
        },

        // Análise de Execução
        execution: {
            trafficImpact: executionAnalysis?.trafficImpact || 'neutral',
            salesImpact: executionAnalysis?.salesImpact || 'neutral',
            topPerformers: executionAnalysis?.topPerformers || [],
            lowPerformers: executionAnalysis?.lowPerformers || [],
        },

        // Principais Decisões
        decisions: decisions || [],

        // O que funcionou
        whatWorked: learnings?.worked || [],

        // O que falhou
        whatFailed: learnings?.failed || [],

        // O que será feito diferente
        changesToMake: learnings?.changes || [],

        // Riscos identificados
        risks: learnings?.risks || [],

        // Observações categorizadas
        observations: observations || [],

        // Notas por bloco (contexto / comentários)
        blockNotes: blockNotes || {},

        // Prioridades do próximo ciclo
        nextPriorities: priorities || [],

        // Metadados
        metadata: {
            createdAt: new Date().toISOString(),
            format: 'structured',
            linkable: true,
            auditable: true,
        },
    };

    return ata;
}

/**
 * Recalibra o sistema baseado na ATA e dados
 */
export function recalibrateSystem(ata, vaults, currentRoadmap) {
    const recalibration = {
        timestamp: new Date().toISOString(),
        
        // Novos KPIs sugeridos (baseados no gap)
        suggestedKpis: {
            revenue: {
                newGoal: calculateNewGoal(ata.kpis.revenue),
                adjustment: ata.kpis.revenue.gap > 0 ? 'increase_focus' : 'maintain',
            },
            traffic: {
                newGoal: calculateNewGoal(ata.kpis.traffic),
            },
            sales: {
                newGoal: calculateNewGoal(ata.kpis.sales),
            },
        },

        // Novo foco de execução
        executionFocus: determineExecutionFocus(ata),

        // Alertas gerados
        alerts: generateAlerts(ata),

        // Ordens do dia sugeridas
        dailyOrders: generateDailyOrders(ata, vaults),

        // Peso atualizado dos vaults
        vaultWeights: calculateVaultWeights(ata, vaults),

        // Roadmap repriorizado
        roadmapPriorities: reprioritizeRoadmap(ata, currentRoadmap),
    };

    return recalibration;
}

/**
 * Gera nova janela de governança
 */
export function generateNextGovernanceWindow(ata, frequency = 'weekly', calendarRule) {
    const toDateStr = (d) => d.toISOString().split('T')[0];
    const baseEndRaw = ata?.signature?.periodEndDate;
    const now = new Date();

    const baseEnd = (() => {
        if (baseEndRaw) {
            const d = new Date(baseEndRaw);
            if (!Number.isNaN(d.getTime())) {
                d.setHours(0, 0, 0, 0);
                return d;
            }
        }
        const d = new Date(now);
        d.setHours(0, 0, 0, 0);
        return d;
    })();

    let nextDate = new Date(baseEnd);
    nextDate.setDate(nextDate.getDate() + 1);
    let windowEnd = new Date(nextDate);
    let scheduledGovernanceDate = new Date(nextDate);

    if (frequency === 'daily') {
        windowEnd = new Date(nextDate);
        windowEnd.setHours(23, 59, 59);
        scheduledGovernanceDate = new Date(nextDate);
    } else if (frequency === 'weekly') {
        const weekStartDay = Number.isFinite(calendarRule?.weekStartDay) ? calendarRule.weekStartDay : 1;
        const meetingWeekday = Number.isFinite(calendarRule?.meetingWeekday) ? calendarRule.meetingWeekday : 1;

        const dow = nextDate.getDay();
        const daysToStart = (weekStartDay - dow + 7) % 7;
        nextDate.setDate(nextDate.getDate() + daysToStart);

        windowEnd = new Date(nextDate);
        windowEnd.setDate(windowEnd.getDate() + 6);
        windowEnd.setHours(23, 59, 59);

        const meetingOffset = (meetingWeekday - nextDate.getDay() + 7) % 7;
        scheduledGovernanceDate = new Date(nextDate);
        scheduledGovernanceDate.setDate(scheduledGovernanceDate.getDate() + meetingOffset);
    } else if (frequency === 'monthly') {
        const meetingDay = Number.isFinite(calendarRule?.monthlyMeetingDay) ? calendarRule.monthlyMeetingDay : 1;

        const start = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
        const end = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0);
        nextDate = start;
        windowEnd = end;
        windowEnd.setHours(23, 59, 59);

        const lastDay = end.getDate();
        const day = Math.max(1, Math.min(meetingDay, lastDay));
        scheduledGovernanceDate = new Date(start);
        scheduledGovernanceDate.setDate(day);
    } else {
        windowEnd = new Date(nextDate);
        windowEnd.setDate(windowEnd.getDate() + 6);
        windowEnd.setHours(23, 59, 59);
        scheduledGovernanceDate = new Date(nextDate);
    }

    return {
        id: `GOV-WINDOW-${Date.now()}`,
        frequency,
        startDate: toDateStr(nextDate),
        endDate: toDateStr(windowEnd),
        scheduledGovernance: scheduledGovernanceDate.toISOString(),
        
        // Metas do período (baseadas na recalibração)
        periodGoals: {
            focus: ata.nextPriorities?.[0] || 'Execução geral',
            kpiTargets: {
                revenue: ata.kpis.revenue.goal,
                traffic: ata.kpis.traffic.goal,
                sales: ata.kpis.sales.goal,
            },
        },

        // Riscos previstos
        anticipatedRisks: ata.risks || [],

        // Ordens iniciais
        initialOrders: ata.nextPriorities?.slice(0, 3) || [],

        // Status
        status: 'scheduled',
    };
}

// Helper functions
function calculateNewGoal(kpiData) {
    if (!kpiData.goal) return 0;
    const achievement = kpiData.value / kpiData.goal;
    
    if (achievement >= 1.2) {
        // Superou em 20%+, aumentar meta em 10%
        return Math.round(kpiData.goal * 1.1);
    } else if (achievement >= 0.9) {
        // Atingiu ~90%+, manter meta
        return kpiData.goal;
    } else {
        // Não atingiu, manter meta (não reduzir)
        return kpiData.goal;
    }
}

function determineExecutionFocus(ata) {
    const focuses = [];
    
    if (ata.roadmapSummary.executionRate < 70) {
        focuses.push({ type: 'execution', priority: 'high', message: 'Taxa de execução baixa - priorizar entregas' });
    }
    
    if (ata.production.notExecuted > ata.production.published) {
        focuses.push({ type: 'production', priority: 'medium', message: 'Muitas artes não publicadas - revisar fluxo' });
    }
    
    if (parseFloat(ata.kpis.revenue.achievement) < 80) {
        focuses.push({ type: 'revenue', priority: 'high', message: 'Revenue abaixo da meta - intensificar vendas' });
    }

    return focuses;
}

function generateAlerts(ata) {
    const alerts = [];

    if (ata.roadmapSummary.delayed > 0) {
        alerts.push({
            type: 'warning',
            title: `${ata.roadmapSummary.delayed} item(s) atrasado(s)`,
            action: 'Revisar prazos',
        });
    }

    if (ata.risks?.length > 0) {
        alerts.push({
            type: 'risk',
            title: `${ata.risks.length} risco(s) identificado(s)`,
            action: 'Mitigar riscos',
        });
    }

    return alerts;
}

function generateDailyOrders(ata, _vaults) {
    const orders = [];

    // Baseado nas prioridades da governança
    ata.nextPriorities?.slice(0, 3).forEach((priority, idx) => {
        orders.push({
            id: `ORDER-${Date.now()}-${idx}`,
            priority: idx + 1,
            title: priority,
            source: 'governance',
        });
    });

    return orders;
}

function calculateVaultWeights(ata, _vaults) {
    // Peso baseado no gap de execução
    return {
        V1: 1.0, // Brand sempre base
        V2: ata.kpis.revenue.gap > 0 ? 1.5 : 1.0, // Commerce mais peso se revenue baixo
        V3: ata.production.notExecuted > 0 ? 1.3 : 1.0, // Funnel mais peso se produção travada
        V4: ata.roadmapSummary.delayed > 0 ? 1.4 : 1.0, // Ops mais peso se atrasos
        V5: 0.8, // Ideas peso menor (auxiliar)
    };
}

function reprioritizeRoadmap(ata, currentRoadmap) {
    if (!currentRoadmap || currentRoadmap.length === 0) return [];

    // Priorizar items pendentes baseado no foco
    return currentRoadmap
        .filter(item => item.status === 'draft' || item.status === 'pending')
        .sort((a, b) => {
            // Items com data mais próxima primeiro
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
        })
        .slice(0, 10)
        .map((item, idx) => ({
            ...item,
            governancePriority: idx + 1,
        }));
}

/**
 * Formata ATA para exibição
 */
export function formatATAForDisplay(ata) {
    return {
        title: `ATA de Governança - ${ata.signature.period}`,
        subtitle: `${ata.signature.type === 'weekly' ? 'Semanal' : ata.signature.type === 'daily' ? 'Diária' : 'Mensal'} | ${new Date(ata.signature.closedAt).toLocaleString('pt-BR')}`,
        sections: [
            {
                title: 'KPIs do Período',
                items: [
                    `Receita: R$ ${ata.kpis.revenue.value.toLocaleString()} / Meta: R$ ${ata.kpis.revenue.goal.toLocaleString()} (${ata.kpis.revenue.achievement}%)`,
                    `Vendas: ${ata.kpis.sales.value} / Meta: ${ata.kpis.sales.goal}`,
                    `Tráfego: R$ ${ata.kpis.traffic.value} investido`,
                ],
            },
            {
                title: 'Execução',
                items: [
                    `Taxa de Execução: ${ata.roadmapSummary.executionRate}%`,
                    `Concluídos: ${ata.roadmapSummary.done} | Atrasados: ${ata.roadmapSummary.delayed} | Cancelados: ${ata.roadmapSummary.cancelled}`,
                ],
            },
            {
                title: 'Produção',
                items: [
                    `Artes Geradas: ${ata.production.generated}`,
                    `Aprovadas: ${ata.production.approved} | Publicadas: ${ata.production.published}`,
                ],
            },
            {
                title: 'Decisões',
                items: ata.decisions.length > 0 ? ata.decisions : ['Nenhuma decisão registrada'],
            },
            {
                title: 'Próximas Prioridades',
                items: ata.nextPriorities.length > 0 ? ata.nextPriorities : ['Nenhuma prioridade definida'],
            },
        ],
        signature: `Fechado por: ${ata.signature.responsible} | ${ata.signature.timezone}`,
    };
}
