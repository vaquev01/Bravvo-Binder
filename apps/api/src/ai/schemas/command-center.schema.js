/**
 * Schemas para Command Center
 * KPIs, Roadmap, Calendário
 */

// Schema de KPI
export const KPISchema = {
    kpi_id: { type: 'string', format: 'uuid' },
    nome: { type: 'string', required: true },
    descricao: { type: 'string' },
    formula: { type: 'string' },
    meta: { type: 'number' },
    unidade: { type: 'string' },
    frequencia_medicao: { type: 'string', enum: ['diaria', 'semanal', 'mensal', 'trimestral'] },
    justificativa: { type: 'string', required: true },
    fontes: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                tipo: { type: 'string', enum: ['vault', 'calendario', 'governanca', 'performance'] },
                referencia: { type: 'string' },
                peso_aplicado: { type: 'number', minimum: 0, maximum: 1 }
            }
        }
    },
    confidence: { type: 'number', minimum: 0, maximum: 100 },
    requires_validation: { type: 'boolean' }
};

// Schema de Fase do Roadmap
export const RoadmapPhaseSchema = {
    fase_id: { type: 'string', format: 'uuid' },
    nome: { type: 'string', required: true },
    inicio: { type: 'string', format: 'date-time' },
    fim: { type: 'string', format: 'date-time' },
    objetivos: { type: 'array', items: { type: 'string' } },
    entregas: { type: 'array', items: { type: 'string' } },
    dependencias: { type: 'array', items: { type: 'string' } },
    justificativa: { type: 'string', required: true },
    fontes: { type: 'array' },
    confidence: { type: 'number', minimum: 0, maximum: 100 },
    risks: { type: 'array', items: { type: 'string' } }
};

// Schema de Evento de Calendário
export const CalendarEventSchema = {
    evento_id: { type: 'string', format: 'uuid' },
    titulo: { type: 'string', required: true },
    data: { type: 'string', format: 'date-time' },
    tipo: { type: 'string', enum: ['milestone', 'review', 'action', 'sazonalidade'] },
    descricao: { type: 'string' },
    relacionado_a: {
        type: 'object',
        properties: {
            kpis: { type: 'array', items: { type: 'string' } },
            fases: { type: 'array', items: { type: 'string' } }
        }
    },
    fonte: { type: 'string' },
    confidence: { type: 'number', minimum: 0, maximum: 100 }
};

// Schema completo do Command Center
export const CommandCenterSchema = {
    command_center_id: { type: 'string', format: 'uuid' },
    version: { type: 'string' },
    timestamp: { type: 'string', format: 'date-time' },
    status: { type: 'string', enum: ['draft', 'pending_review', 'approved', 'active'] },
    kpis: { type: 'array', items: KPISchema },
    roadmap: { type: 'array', items: RoadmapPhaseSchema },
    calendario: { type: 'array', items: CalendarEventSchema },
    generation_metadata: {
        type: 'object',
        properties: {
            weights_applied: { type: 'object' },
            total_sources_used: { type: 'number' },
            gaps_identified: { type: 'array' },
            assumptions: { type: 'array' },
            alternative_suggestions: { type: 'array' }
        }
    },
    validation_checklist: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                item: { type: 'string' },
                status: { type: 'string', enum: ['pending_review', 'approved', 'rejected'] },
                priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] }
            }
        }
    }
};

// Schema de Recalibração
export const RecalibrationChangeSchema = {
    change_id: { type: 'string', format: 'uuid' },
    timestamp: { type: 'string', format: 'date-time' },
    tipo: { type: 'string', enum: ['kpi', 'roadmap', 'calendario'] },
    acao: { type: 'string', enum: ['added', 'modified', 'removed', 'preserved'] },
    campo: { type: 'string' },
    valor_anterior: { type: 'any' },
    valor_novo: { type: 'any' },
    justificativa: { type: 'string', required: true },
    fontes: { type: 'array' },
    confidence: { type: 'number', minimum: 0, maximum: 100 }
};

/**
 * Valida Command Center
 */
export function validateCommandCenter(cc) {
    const errors = [];

    if (!cc.command_center_id) {
        errors.push({ field: 'command_center_id', message: 'ID é obrigatório' });
    }

    if (!cc.status) {
        errors.push({ field: 'status', message: 'status é obrigatório' });
    }

    // Valida que todos KPIs têm justificativa
    (cc.kpis || []).forEach((kpi, i) => {
        if (!kpi.justificativa) {
            errors.push({ field: `kpis[${i}].justificativa`, message: 'KPI sem justificativa (anti-alucinação)' });
        }
        if (!kpi.fontes || kpi.fontes.length === 0) {
            errors.push({ field: `kpis[${i}].fontes`, message: 'KPI sem fontes (rastreabilidade)' });
        }
    });

    // Valida roadmap
    (cc.roadmap || []).forEach((fase, i) => {
        if (!fase.justificativa) {
            errors.push({ field: `roadmap[${i}].justificativa`, message: 'Fase sem justificativa' });
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Template de Command Center vazio
 */
export function createEmptyCommandCenter() {
    return {
        command_center_id: null,
        version: '0.0.0',
        timestamp: new Date().toISOString(),
        status: 'draft',
        kpis: [],
        roadmap: [],
        calendario: [],
        generation_metadata: {
            weights_applied: {},
            total_sources_used: 0,
            gaps_identified: [],
            assumptions: [],
            alternative_suggestions: []
        },
        validation_checklist: []
    };
}
