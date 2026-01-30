/**
 * AI Routes - Endpoints para orquestração de IA
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
    eventBus,
    EventTypes,
    eventStore,
    getOrchestrator,
    getWeightsManager,
    WEIGHT_PRESETS
} from '../ai/index.js';

const router = Router();

// Middleware para adicionar metadata
const addMetadata = (req, res, next) => {
    req.correlationId = req.headers['x-correlation-id'] || uuidv4();
    req.userId = req.headers['x-user-id'] || 'anonymous';
    next();
};

router.use(addMetadata);

// ============================================
// VAULT ENDPOINTS
// ============================================

/**
 * POST /ai/vaults/:vaultId/complete
 * Marca vault como completo e dispara análise
 */
router.post('/vaults/:vaultId/complete', async (req, res) => {
    try {
        const { vaultId } = req.params;
        const { content } = req.body;

        if (!['V1', 'V2', 'V3', 'V4', 'V5'].includes(vaultId)) {
            return res.status(400).json({ error: 'vaultId inválido. Use V1-V5.' });
        }

        if (!content) {
            return res.status(400).json({ error: 'content é obrigatório' });
        }

        // Emite evento
        const event = await eventBus.emit(EventTypes.VAULT_COMPLETED, {
            vault_id: vaultId,
            content,
            user_id: req.userId
        }, {
            correlation_id: req.correlationId,
            user_id: req.userId
        });

        // Processa via orchestrator
        const orchestrator = getOrchestrator();
        const result = await orchestrator.handleVaultCompleted(event);

        res.json({
            success: result.success,
            event_id: event.event_id,
            analysis: result.success ? {
                analysis_id: result.output.analysis_id,
                completeness_score: result.output.summary?.completeness_score,
                confidence_score: result.output.summary?.confidence_score,
                gaps_count: result.output.gaps?.length || 0,
                questions_count: result.output.validation_questions?.length || 0
            } : null,
            warnings: result.warnings || [],
            error: result.error || null
        });

    } catch (error) {
        console.error('Error in vault complete:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /ai/vaults/:vaultId/analysis
 * Retorna análise do vault
 */
router.get('/vaults/:vaultId/analysis', async (req, res) => {
    try {
        const { vaultId } = req.params;
        const orchestrator = getOrchestrator();
        const state = orchestrator.getFullState();

        const analysis = state.vault_analyses[vaultId];
        if (!analysis) {
            return res.status(404).json({ error: `Análise do ${vaultId} não encontrada` });
        }

        res.json(analysis);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// COMMAND CENTER ENDPOINTS
// ============================================

/**
 * POST /ai/command-center/generate
 * Gera Centro de Comando
 */
router.post('/command-center/generate', async (req, res) => {
    try {
        const { weights, mode = 'initial', vaults } = req.body;

        const orchestrator = getOrchestrator();

        // Se vaults foram enviados, processa apenas V1, V2, V3 (essenciais)
        if (vaults && Object.keys(vaults).length > 0) {
            const essentialVaults = ['V1', 'V2', 'V3'];
            const vaultsToProcess = essentialVaults.filter(v => vaults[v]);
            console.log('📦 Processing essential vaults:', vaultsToProcess);

            for (const vaultId of vaultsToProcess) {
                const content = vaults[vaultId];
                if (content && Object.keys(content).length > 0) {
                    try {
                        console.log(`⏳ Analyzing ${vaultId}...`);
                        const vaultEvent = {
                            event_id: `inline-${vaultId}-${Date.now()}`,
                            event_type: 'vault_completed',
                            payload: { vault_id: vaultId, content, user_id: req.userId },
                            metadata: { correlation_id: req.correlationId, user_id: req.userId }
                        };
                        await orchestrator.handleVaultCompleted(vaultEvent);
                        console.log(`✅ ${vaultId} analyzed`);
                    } catch (vaultError) {
                        console.error(`❌ Error processing ${vaultId}:`, vaultError.message);
                    }
                }
            }
            console.log('📦 Vault processing complete, generating Command Center...');
        }

        const event = await eventBus.emit(EventTypes.GENERATE_COMMAND_CENTER, {
            user_id: req.userId,
            weights,
            mode
        }, {
            correlation_id: req.correlationId,
            user_id: req.userId
        });

        const result = await orchestrator.handleGenerateCommandCenter(event);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                gaps: result.gaps,
                questions: result.questions
            });
        }

        res.json({
            success: true,
            event_id: event.event_id,
            command_center: {
                id: result.output.command_center_id,
                version: result.output.version,
                status: result.output.status,
                kpis_count: result.output.kpis?.length || 0,
                roadmap_phases: result.output.roadmap?.length || 0,
                calendar_events: result.output.calendario?.length || 0
            },
            validation_checklist: result.output.validation_checklist,
            warnings: result.warnings || []
        });

    } catch (error) {
        console.error('Error generating command center:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /ai/command-center
 * Retorna Centro de Comando atual
 */
router.get('/command-center', async (req, res) => {
    try {
        const orchestrator = getOrchestrator();
        const state = orchestrator.getFullState();

        if (!state.command_center) {
            return res.status(404).json({ error: 'Command Center não gerado' });
        }

        res.json(state.command_center);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /ai/command-center/approve
 * Aprova Centro de Comando
 */
router.post('/command-center/approve', async (req, res) => {
    try {
        const orchestrator = getOrchestrator();
        const result = await orchestrator.approveCommandCenter(req.userId);

        res.json({
            success: true,
            command_center_id: result.command_center_id,
            version: result.version,
            status: result.status,
            approved_at: result.approved_at
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// GOVERNANCE ENDPOINTS
// ============================================

/**
 * POST /ai/governance/complete
 * Marca ciclo de governança como completo
 */
router.post('/governance/complete', async (req, res) => {
    try {
        const { cycle_id, cycle_data } = req.body;

        if (!cycle_id || !cycle_data) {
            return res.status(400).json({ error: 'cycle_id e cycle_data são obrigatórios' });
        }

        const event = await eventBus.emit(EventTypes.GOVERNANCE_COMPLETED, {
            cycle_id,
            cycle_data,
            user_id: req.userId
        }, {
            correlation_id: req.correlationId,
            user_id: req.userId
        });

        const orchestrator = getOrchestrator();
        const result = await orchestrator.handleGovernanceCompleted(event);

        res.json({
            success: result.success,
            event_id: event.event_id,
            summary: result.success ? {
                summary_id: result.output.summary_id,
                insights_count: result.output.insights?.length || 0,
                recommendations_count: result.output.next_cycle_recommendations?.length || 0
            } : null,
            error: result.error || null
        });

    } catch (error) {
        console.error('Error completing governance:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /ai/governance/:cycleId/summary
 * Retorna resumo de governança
 */
router.get('/governance/:cycleId/summary', async (req, res) => {
    try {
        const { cycleId } = req.params;
        const orchestrator = getOrchestrator();
        const state = orchestrator.getFullState();

        const summary = state.governance_summaries[cycleId];
        if (!summary) {
            return res.status(404).json({ error: `Resumo do ciclo ${cycleId} não encontrado` });
        }

        res.json(summary);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// RECALIBRATION ENDPOINTS
// ============================================

/**
 * POST /ai/recalibrate
 * Recalibra Centro de Comando
 */
router.post('/recalibrate', async (req, res) => {
    try {
        const { cycle_id, config } = req.body;

        const event = await eventBus.emit(EventTypes.RECALIBRATE_COMMAND_CENTER, {
            cycle_id,
            triggered_by: 'manual',
            recalibration_config: config || { aggressiveness: 'moderate' },
            user_id: req.userId
        }, {
            correlation_id: req.correlationId,
            user_id: req.userId
        });

        const orchestrator = getOrchestrator();
        const result = await orchestrator.handleRecalibrateCommandCenter(event);

        res.json({
            success: result.success,
            event_id: event.event_id,
            recalibration: result.success ? {
                new_version: result.output.recalibrated_command_center?.version,
                total_changes: result.output.recalibration_summary?.total_changes || 0,
                major_shifts: result.output.recalibration_summary?.major_shifts?.length || 0
            } : null,
            changelog: result.output?.changelog,
            validation_required: result.output?.validation_required,
            error: result.error || null
        });

    } catch (error) {
        console.error('Error recalibrating:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /ai/recalibrate/apply
 * Aplica recalibração aprovada
 */
router.post('/recalibrate/apply', async (req, res) => {
    try {
        const { recalibration_result } = req.body;

        if (!recalibration_result) {
            return res.status(400).json({ error: 'recalibration_result é obrigatório' });
        }

        const orchestrator = getOrchestrator();
        const result = await orchestrator.applyRecalibration(recalibration_result, req.userId);

        res.json({
            success: true,
            command_center_id: result.command_center_id,
            version: result.version,
            status: result.status
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// WEIGHTS ENDPOINTS
// ============================================

/**
 * GET /ai/weights
 * Retorna pesos atuais
 */
router.get('/weights', (req, res) => {
    const weightsManager = getWeightsManager();
    res.json({
        weights: weightsManager.getWeights(),
        history: weightsManager.getHistory(),
        presets: WEIGHT_PRESETS
    });
});

/**
 * PUT /ai/weights
 * Atualiza pesos
 */
router.put('/weights', (req, res) => {
    try {
        const { weights, reason } = req.body;

        if (!weights) {
            return res.status(400).json({ error: 'weights é obrigatório' });
        }

        const weightsManager = getWeightsManager();
        const updated = weightsManager.update(weights, reason || 'Manual update');

        res.json({
            success: true,
            weights: updated
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * POST /ai/weights/preset
 * Aplica preset de pesos
 */
router.post('/weights/preset', (req, res) => {
    try {
        const { preset_name } = req.body;

        if (!preset_name) {
            return res.status(400).json({ error: 'preset_name é obrigatório' });
        }

        const weightsManager = getWeightsManager();
        const updated = weightsManager.applyPreset(preset_name);

        res.json({
            success: true,
            weights: updated,
            preset_applied: preset_name
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// GAPS ENDPOINTS
// ============================================

/**
 * GET /ai/gaps/detect
 * Executa detecção de gaps
 */
router.get('/gaps/detect', async (req, res) => {
    try {
        const orchestrator = getOrchestrator();
        const result = await orchestrator.runGapDetection(req.correlationId, req.userId);

        res.json({
            success: result.success,
            detection: result.success ? {
                detection_id: result.output.detection_id,
                gaps_count: result.output.gaps?.length || 0,
                critical_gaps: result.output.gaps?.filter(g => g.severidade === 'critical').length || 0,
                questions_count: result.output.questions_for_humans?.length || 0,
                health_score: result.output.health_score
            } : null,
            gaps: result.output?.gaps,
            questions: result.output?.questions_for_humans,
            error: result.error || null
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// STATE & EVENTS ENDPOINTS
// ============================================

/**
 * GET /ai/state
 * Retorna estado do sistema
 */
router.get('/state', (req, res) => {
    const orchestrator = getOrchestrator();
    res.json(orchestrator.getState());
});

/**
 * GET /ai/events
 * Retorna histórico de eventos
 */
router.get('/events', async (req, res) => {
    try {
        const { type, limit = 50 } = req.query;

        let events;
        if (type) {
            events = await eventStore.findByType(type, { limit: parseInt(limit) });
        } else {
            events = await eventStore.getAll();
            events = events.slice(-parseInt(limit));
        }

        res.json({
            count: events.length,
            events
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /ai/events/stats
 * Estatísticas de eventos
 */
router.get('/events/stats', async (req, res) => {
    try {
        const stats = await eventStore.getStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// CONTEXT ENDPOINT
// ============================================

/**
 * GET /ai/context
 * Retorna contexto de calendário
 */
router.get('/context', (req, res) => {
    const orchestrator = getOrchestrator();
    const state = orchestrator.getFullState();

    if (!state.calendar_context) {
        return res.status(404).json({ error: 'Contexto não sintetizado. Complete o Vault 1 primeiro.' });
    }

    res.json(state.calendar_context);
});

export default router;
