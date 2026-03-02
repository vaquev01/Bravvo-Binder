/**
 * Schemas para Vaults e análises
 * Define contratos de dados para validação
 */

// Schema de Vault Input (preenchido por humanos)
export const VaultInputSchema = {
    vault_id: { type: 'string', required: true, enum: ['V1', 'V2', 'V3', 'V4', 'V5'] },
    content: {
        type: 'object',
        required: true,
        properties: {
            raw_data: { type: 'object' },
            fields: { type: 'array' },
            metadata: {
                type: 'object',
                properties: {
                    filled_by: { type: 'string' },
                    filled_at: { type: 'string', format: 'date-time' },
                    version: { type: 'string' }
                }
            }
        }
    },
    previous_analysis: { type: 'object', required: false }
};

// Schema de Vault Analysis Output
export const VaultAnalysisSchema = {
    analysis_id: { type: 'string', format: 'uuid' },
    vault_id: { type: 'string' },
    timestamp: { type: 'string', format: 'date-time' },
    version: { type: 'string' },
    summary: {
        type: 'object',
        properties: {
            key_points: { type: 'array', items: { type: 'string' } },
            entities_extracted: {
                type: 'object',
                properties: {
                    nicho: { type: 'string' },
                    regiao: { type: 'string' },
                    abrangencia: { type: 'string' },
                    outros: { type: 'object' }
                }
            },
            completeness_score: { type: 'number', minimum: 0, maximum: 100 },
            confidence_score: { type: 'number', minimum: 0, maximum: 100 }
        }
    },
    gaps: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                field: { type: 'string' },
                severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                question: { type: 'string' },
                suggestion: { type: 'string' }
            }
        }
    },
    validation_questions: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                question: { type: 'string' },
                context: { type: 'string' },
                required_for: { type: 'array', items: { type: 'string' } }
            }
        }
    },
    source_mapping: { type: 'object' }
};

// Vault definitions por tipo
export const VaultDefinitions = {
    V1: {
        name: 'Identidade do Negócio',
        description: 'Nicho, região, abrangência, proposta de valor',
        required_fields: ['nicho', 'regiao', 'abrangencia', 'proposta_valor'],
        derives: ['calendar_context', 'target_audience']
    },
    V2: {
        name: 'Objetivos e Metas',
        description: 'Objetivos de curto/médio/longo prazo, metas quantitativas',
        required_fields: ['objetivos', 'metas', 'prazo'],
        derives: ['kpis', 'roadmap_phases']
    },
    V3: {
        name: 'Recursos e Capacidades',
        description: 'Equipe, orçamento, ferramentas, limitações',
        required_fields: ['equipe', 'orcamento', 'ferramentas'],
        derives: ['constraints', 'feasibility']
    },
    V4: {
        name: 'Mercado e Concorrência',
        description: 'Análise de mercado, concorrentes, diferenciais',
        required_fields: ['mercado', 'concorrentes', 'diferenciais'],
        derives: ['positioning', 'opportunities']
    },
    V5: {
        name: 'Histórico e Aprendizados',
        description: 'Ações passadas, resultados, lições aprendidas',
        required_fields: ['historico', 'resultados', 'aprendizados'],
        derives: ['patterns', 'risks']
    }
};

/**
 * Valida input de Vault
 */
export function validateVaultInput(input) {
    const errors = [];

    if (!input.vault_id || !['V1', 'V2', 'V3', 'V4', 'V5'].includes(input.vault_id)) {
        errors.push({ field: 'vault_id', message: 'vault_id inválido' });
    }

    if (!input.content || typeof input.content !== 'object') {
        errors.push({ field: 'content', message: 'content é obrigatório' });
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Valida output de análise
 */
export function validateVaultAnalysis(analysis) {
    const errors = [];

    if (!analysis.analysis_id) {
        errors.push({ field: 'analysis_id', message: 'analysis_id é obrigatório' });
    }

    if (!analysis.summary) {
        errors.push({ field: 'summary', message: 'summary é obrigatório' });
    }

    if (!analysis.source_mapping) {
        errors.push({ field: 'source_mapping', message: 'source_mapping é obrigatório para rastreabilidade' });
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
