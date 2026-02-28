/**
 * Schemas para Governança e Ciclos
 */

// Schema de Decisão
export const DecisionSchema = {
    decision_id: { type: 'string', format: 'uuid' },
    timestamp: { type: 'string', format: 'date-time' },
    tipo: { type: 'string', enum: ['strategic', 'tactical', 'operational'] },
    descricao: { type: 'string', required: true },
    decidido_por: { type: 'string' },
    contexto: { type: 'string' },
    impacto: {
        type: 'object',
        properties: {
            kpis_afetados: { type: 'array', items: { type: 'string' } },
            roadmap_afetado: { type: 'boolean' },
            magnitude: { type: 'string', enum: ['alto', 'medio', 'baixo'] }
        }
    }
};

// Schema de Ação Executada
export const ActionSchema = {
    action_id: { type: 'string', format: 'uuid' },
    descricao: { type: 'string', required: true },
    status: { type: 'string', enum: ['completed', 'partial', 'failed', 'cancelled'] },
    resultado: { type: 'string' },
    metricas: { type: 'object' },
    data_execucao: { type: 'string', format: 'date-time' }
};

// Schema de Ciclo de Governança
export const GovernanceCycleSchema = {
    cycle_id: { type: 'string', format: 'uuid' },
    cycle_number: { type: 'number' },
    periodo: {
        type: 'object',
        properties: {
            inicio: { type: 'string', format: 'date-time' },
            fim: { type: 'string', format: 'date-time' }
        }
    },
    decisions: { type: 'array', items: DecisionSchema },
    actions_executed: { type: 'array', items: ActionSchema },
    performance_data: {
        type: 'object',
        properties: {
            kpis_measured: { type: 'array' },
            results: { type: 'object' }
        }
    },
    status: { type: 'string', enum: ['in_progress', 'completed', 'archived'] }
};

// Schema de Resumo de Governança (output do agent)
export const GovernanceSummarySchema = {
    summary_id: { type: 'string', format: 'uuid' },
    cycle_id: { type: 'string' },
    timestamp: { type: 'string', format: 'date-time' },
    version: { type: 'string' },
    executive_summary: {
        type: 'object',
        properties: {
            principais_realizacoes: { type: 'array', items: { type: 'string' } },
            principais_desafios: { type: 'array', items: { type: 'string' } },
            desvios_significativos: { type: 'array', items: { type: 'string' } },
            aprendizados: { type: 'array', items: { type: 'string' } }
        }
    },
    performance_analysis: {
        type: 'object',
        properties: {
            kpis_on_track: { type: 'array' },
            kpis_off_track: { type: 'array' },
            tendencias_identificadas: { type: 'array' }
        }
    },
    decision_patterns: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                padrao: { type: 'string' },
                frequencia: { type: 'number' },
                impacto: { type: 'string' },
                recomendacao: { type: 'string' }
            }
        }
    },
    insights: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                insight: { type: 'string' },
                evidencia: { type: 'array' },
                confidence: { type: 'number', minimum: 0, maximum: 100 },
                actionable: { type: 'boolean' },
                sugestao: { type: 'string' }
            }
        }
    },
    next_cycle_recommendations: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                recomendacao: { type: 'string' },
                prioridade: { type: 'string', enum: ['alta', 'media', 'baixa'] },
                justificativa: { type: 'string' }
            }
        }
    },
    source_mapping: { type: 'object' }
};

/**
 * Valida ciclo de governança
 */
export function validateGovernanceCycle(cycle) {
    const errors = [];

    if (!cycle.cycle_id) {
        errors.push({ field: 'cycle_id', message: 'cycle_id é obrigatório' });
    }

    if (!cycle.periodo?.inicio || !cycle.periodo?.fim) {
        errors.push({ field: 'periodo', message: 'período é obrigatório' });
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Valida resumo de governança
 */
export function validateGovernanceSummary(summary) {
    const errors = [];

    if (!summary.summary_id) {
        errors.push({ field: 'summary_id', message: 'summary_id é obrigatório' });
    }

    if (!summary.source_mapping) {
        errors.push({ field: 'source_mapping', message: 'source_mapping é obrigatório' });
    }

    // Valida que insights têm evidências
    (summary.insights || []).forEach((insight, i) => {
        if (!insight.evidencia || insight.evidencia.length === 0) {
            errors.push({ field: `insights[${i}].evidencia`, message: 'Insight sem evidência (anti-alucinação)' });
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Template de ciclo vazio
 */
export function createEmptyGovernanceCycle(cycleNumber) {
    return {
        cycle_id: null,
        cycle_number: cycleNumber,
        periodo: {
            inicio: null,
            fim: null
        },
        decisions: [],
        actions_executed: [],
        performance_data: {
            kpis_measured: [],
            results: {}
        },
        status: 'in_progress'
    };
}
