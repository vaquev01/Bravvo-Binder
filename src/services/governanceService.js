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
        goalChanges,
        meetingTimer,
        kpiNotes,
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

        goalChanges: Array.isArray(goalChanges) ? goalChanges : [],

        meetingTimer: meetingTimer || null,
        kpiNotes: kpiNotes || {},

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
        executionFocus: determineExecutionFocus(ata, vaults),

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

function determineExecutionFocus(ata, vaults) {
    const focuses = [];

    // 1. Check Execution Rate
    if (ata.roadmapSummary.executionRate < 70) {
        focuses.push({ type: 'execution', priority: 'high', message: 'Taxa de execução baixa - priorizar entregas' });
    }

    // 2. Check Production
    if (ata.production.notExecuted > ata.production.published) {
        focuses.push({ type: 'production', priority: 'medium', message: 'Muitas artes não publicadas - revisar fluxo' });
    }

    // 3. Check Revenue
    if (parseFloat(ata.kpis.revenue.achievement) < 80) {
        focuses.push({ type: 'revenue', priority: 'high', message: 'Revenue abaixo da meta - intensificar vendas' });
    }

    // 4. Vault 3 (Funnel) Intelligence
    if (vaults?.S3) {
        const s3 = vaults.S3;
        // If traffic type is Paid and Traffic KPI is low (assuming logic, here simplified)
        if (s3.trafficType === 'Pago' && ata.kpis.traffic.value < ata.kpis.traffic.goal) {
            focuses.push({ type: 'growth', priority: 'high', message: 'Tráfego Pago abaixo da meta - revisar campanhas' });
        }

        // Suggest optimization based on CTA
        if (s3.primaryCTA) {
            focuses.push({ type: 'conversion', priority: 'medium', message: `Otimizar conversão para ${s3.primaryCTA}` });
        }
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

function generateDailyOrders(ata, vaults) {
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

    // Vault 3 Injection: If we have specific channels focused
    if (vaults?.S3?.channels && vaults.S3.channels.length > 0) {
        if (orders.length < 5) {
            orders.push({
                id: `ORDER-V3-${Date.now()}`,
                priority: orders.length + 1,
                title: `Verificar métricas de ${vaults.S3.channels[0]}`,
                source: 'strategy'
            });
        }
    }

    return orders;
}

function calculateVaultWeights(ata, vaults) {
    // Start with base weights
    const weights = {
        V1: 1.0,
        V2: 1.0,
        V3: 1.0,
        V4: 1.0,
        V5: 0.8
    };

    // V2 (Commerce) gets higher weight if Revenue is suffering
    if (ata.kpis.revenue.gap > 0) weights.V2 += 0.5;

    // V3 (Funnel) gets higher weight if Traffic is low OR if it matches Vault 3 config
    if (vaults?.S3?.trafficType === 'Orgânico' && ata.production.published < 3) {
        // If Organic and low production, we need more content/funnel focus
        weights.V3 += 0.3;
    }

    // V4 (Ops) gets higher weight if there are delays
    if (ata.roadmapSummary.delayed > 0) weights.V4 += 0.4;

    return weights;
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
    const goalChanges = Array.isArray(ata?.goalChanges) ? ata.goalChanges : [];
    const kpiNotes = ata?.kpiNotes && typeof ata.kpiNotes === 'object' ? ata.kpiNotes : {};
    const meetingTimer = ata?.meetingTimer && typeof ata.meetingTimer === 'object' ? ata.meetingTimer : null;

    const formatDuration = (seconds) => {
        const s = Number(seconds) || 0;
        const mm = String(Math.floor(s / 60)).padStart(2, '0');
        const ss = String(Math.floor(s % 60)).padStart(2, '0');
        return `${mm}:${ss}`;
    };

    const kpiNotesItems = [
        kpiNotes?.revenue ? `Receita: ${kpiNotes.revenue}` : null,
        kpiNotes?.traffic ? `Tráfego: ${kpiNotes.traffic}` : null,
        kpiNotes?.sales ? `Vendas: ${kpiNotes.sales}` : null,
    ].filter(Boolean);
    return {
        title: `ATA de Governança - ${ata.signature.period}`,
        subtitle: `${ata.signature.type === 'weekly' ? 'Semanal' : ata.signature.type === 'daily' ? 'Diária' : 'Mensal'} | ${new Date(ata.signature.closedAt).toLocaleString('pt-BR')}${meetingTimer?.durationSeconds ? ` | Duração: ${formatDuration(meetingTimer.durationSeconds)}` : ''}`,
        sections: [
            {
                title: 'KPIs do Período',
                items: [
                    `Receita: R$ ${ata.kpis.revenue.value.toLocaleString()} / Meta: R$ ${ata.kpis.revenue.goal.toLocaleString()} (${ata.kpis.revenue.achievement}%)`,
                    `Vendas: ${ata.kpis.sales.value} / Meta: ${ata.kpis.sales.goal}`,
                    `Tráfego: R$ ${ata.kpis.traffic.value} investido`,
                ],
            },
            ...(kpiNotesItems.length > 0 ? [{
                title: 'Notas por KPI',
                items: kpiNotesItems
            }] : []),
            ...(goalChanges.length > 0 ? [{
                title: 'Metas Alteradas',
                items: goalChanges.map(ch => {
                    const label = ch.id === 'revenue' ? 'Receita' : ch.id === 'traffic' ? 'Tráfego' : ch.id === 'sales' ? 'Vendas' : String(ch.id);
                    const when = ch.changedAt ? new Date(ch.changedAt).toLocaleString('pt-BR') : '';
                    return `${label}: ${ch.fromGoal} → ${ch.toGoal}${when ? ` (${when})` : ''}`;
                })
            }] : []),
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
