/**
 * Workflow Orchestrator
 * Orquestra os agentes seguindo o fluxo de eventos
 */

import { v4 as uuidv4 } from 'uuid';
import { eventBus, EventTypes } from '../events/event-bus.js';
import { eventStore } from '../events/event-store.js';
import { getWeightsManager } from './weights.js';

// Agents
import { VaultAnalyzerAgent } from '../agents/vault-analyzer.js';
import { ContextSynthesizerAgent } from '../agents/context-synthesizer.js';
import { CommandCenterGeneratorAgent } from '../agents/command-center-generator.js';
import { GovernanceSummarizerAgent } from '../agents/governance-summarizer.js';
import { RecalibrationEngineAgent } from '../agents/recalibration-engine.js';
import { GapDetectorAgent } from '../agents/gap-detector.js';

/**
 * Estado do sistema (in-memory, trocar por DB em produção)
 */
const systemState = {
    vaults: {}, // vault_id -> content
    vault_analyses: {}, // vault_id -> analysis
    calendar_context: null,
    command_center: null,
    governance_cycles: [], // array de ciclos
    governance_summaries: {} // cycle_id -> summary
};

/**
 * Orchestrator principal
 */
export class WorkflowOrchestrator {
    constructor() {
        this.vaultAnalyzer = new VaultAnalyzerAgent();
        this.contextSynthesizer = new ContextSynthesizerAgent();
        this.commandCenterGenerator = new CommandCenterGeneratorAgent();
        this.governanceSummarizer = new GovernanceSummarizerAgent();
        this.recalibrationEngine = new RecalibrationEngineAgent();
        this.gapDetector = new GapDetectorAgent();

        this.weightsManager = getWeightsManager();

        // Registra handlers de eventos
        this.registerEventHandlers();
    }

    /**
     * Registra handlers para eventos do sistema
     */
    registerEventHandlers() {
        eventBus.subscribe(EventTypes.VAULT_COMPLETED, (event) => this.handleVaultCompleted(event));
        eventBus.subscribe(EventTypes.GENERATE_COMMAND_CENTER, (event) => this.handleGenerateCommandCenter(event));
        eventBus.subscribe(EventTypes.GOVERNANCE_COMPLETED, (event) => this.handleGovernanceCompleted(event));
        eventBus.subscribe(EventTypes.RECALIBRATE_COMMAND_CENTER, (event) => this.handleRecalibrateCommandCenter(event));

        // Logging de todos eventos
        eventBus.subscribe('*', (event) => {
            console.log(`📋 Event logged: ${event.event_type}`, { event_id: event.event_id });
        });
    }

    /**
     * Handler: Vault completado
     */
    async handleVaultCompleted(event) {
        const { vault_id, content, user_id } = event.payload;
        const correlationId = event.metadata.correlation_id;

        console.log(`🔍 Processing vault_completed: ${vault_id}`);

        try {
            // Salva vault
            systemState.vaults[vault_id] = content;

            // Analisa vault
            const analysis = await this.vaultAnalyzer.analyze({
                vault_id,
                content,
                previous_analysis: systemState.vault_analyses[vault_id]
            });

            if (analysis.success) {
                systemState.vault_analyses[vault_id] = analysis.output;

                // Se é V1, sintetiza contexto de calendário
                if (vault_id === 'V1') {
                    const contextResult = await this.contextSynthesizer.synthesize(analysis.output);
                    if (contextResult.success) {
                        systemState.calendar_context = contextResult.output;

                        await eventBus.emit(EventTypes.CONTEXT_SYNTHESIZED, {
                            context_id: contextResult.output.context_id,
                            vault_id: 'V1'
                        }, { correlation_id: correlationId, user_id });
                    }
                }

                // Emite evento de análise completa
                await eventBus.emit(EventTypes.VAULT_ANALYSIS_COMPLETED, {
                    vault_id,
                    analysis_id: analysis.output.analysis_id,
                    completeness_score: analysis.output.summary?.completeness_score,
                    gaps_count: analysis.output.gaps?.length || 0
                }, { correlation_id: correlationId, causation_id: event.event_id, user_id });

                // Detecta gaps se todos vaults foram analisados
                const analyzedVaults = Object.keys(systemState.vault_analyses);
                if (analyzedVaults.length >= 3) { // Pelo menos V1, V2, V3
                    await this.runGapDetection(correlationId, user_id);
                }
            }

            return analysis;

        } catch (error) {
            console.error(`❌ Error handling vault_completed:`, error);
            throw error;
        }
    }

    /**
     * Handler: Gerar Centro de Comando
     */
    async handleGenerateCommandCenter(event) {
        const { user_id, weights: customWeights, mode = 'initial' } = event.payload;
        const correlationId = event.metadata.correlation_id;

        console.log(`🎯 Generating Command Center (mode: ${mode})`);

        try {
            // Usa pesos custom ou padrão
            const weights = customWeights || this.weightsManager.getWeights();

            // Coleta análises dos vaults
            const vaultAnalyses = Object.values(systemState.vault_analyses);

            if (vaultAnalyses.length === 0) {
                throw new Error('Nenhum Vault analisado. Complete pelo menos V1, V2, V3 primeiro.');
            }

            // Verifica gaps críticos
            const gapResult = await this.gapDetector.detect({
                vault_analyses: vaultAnalyses,
                command_center: systemState.command_center
            });

            if (gapResult.success && this.gapDetector.hasCriticalGaps(gapResult)) {
                await eventBus.emit(EventTypes.GAPS_DETECTED, {
                    detection_id: gapResult.output.detection_id,
                    critical_gaps: gapResult.output.gaps.filter(g => g.severidade === 'critical').length,
                    requires_immediate_action: true
                }, { correlation_id: correlationId, user_id });

                return {
                    success: false,
                    error: 'Gaps críticos detectados. Resolva antes de gerar Command Center.',
                    gaps: gapResult.output.gaps.filter(g => g.severidade === 'critical'),
                    questions: gapResult.output.questions_for_humans
                };
            }

            // Gera Command Center
            const result = await this.commandCenterGenerator.generate({
                vault_analyses: vaultAnalyses,
                calendar_context: systemState.calendar_context,
                weights,
                previous_command_center: mode === 'regenerate' ? systemState.command_center : null,
                generation_mode: mode
            });

            if (result.success) {
                systemState.command_center = result.output;

                await eventBus.emit(EventTypes.COMMAND_CENTER_GENERATED, {
                    command_center_id: result.output.command_center_id,
                    version: result.output.version,
                    status: 'draft',
                    requires_validation: true,
                    kpis_count: result.output.kpis?.length || 0,
                    roadmap_phases: result.output.roadmap?.length || 0
                }, { correlation_id: correlationId, causation_id: event.event_id, user_id });

                // Emite validação requerida
                await eventBus.emit(EventTypes.VALIDATION_REQUIRED, {
                    component_id: result.output.command_center_id,
                    component_type: 'command_center',
                    validation_items: result.output.validation_checklist,
                    priority: 'high'
                }, { correlation_id: correlationId, user_id });
            }

            return result;

        } catch (error) {
            console.error(`❌ Error generating command center:`, error);
            throw error;
        }
    }

    /**
     * Handler: Governança completada
     */
    async handleGovernanceCompleted(event) {
        const { cycle_id, cycle_data, user_id } = event.payload;
        const correlationId = event.metadata.correlation_id;

        console.log(`📊 Processing governance_completed: ${cycle_id}`);

        try {
            // Resume ciclo
            const summary = await this.governanceSummarizer.summarize(cycle_data);

            if (summary.success) {
                systemState.governance_summaries[cycle_id] = summary.output;
                systemState.governance_cycles.push(cycle_data);

                await eventBus.emit(EventTypes.GOVERNANCE_SUMMARY_READY, {
                    summary_id: summary.output.summary_id,
                    cycle_id,
                    insights_count: summary.output.insights?.length || 0,
                    recommendations_count: summary.output.next_cycle_recommendations?.length || 0
                }, { correlation_id: correlationId, causation_id: event.event_id, user_id });

                // Trigger recalibração automática
                await eventBus.emit(EventTypes.RECALIBRATE_COMMAND_CENTER, {
                    cycle_id,
                    triggered_by: 'governance_completion',
                    recalibration_config: { aggressiveness: 'moderate' }
                }, { correlation_id: correlationId, user_id });
            }

            return summary;

        } catch (error) {
            console.error(`❌ Error handling governance_completed:`, error);
            throw error;
        }
    }

    /**
     * Handler: Recalibrar Centro de Comando
     */
    async handleRecalibrateCommandCenter(event) {
        const { cycle_id, triggered_by, recalibration_config, user_id } = event.payload;
        const correlationId = event.metadata.correlation_id;

        console.log(`🔄 Recalibrating Command Center (trigger: ${triggered_by})`);

        try {
            if (!systemState.command_center) {
                throw new Error('Nenhum Command Center para recalibrar');
            }

            const weights = this.weightsManager.getWeights();

            // Coleta dados para recalibração
            const governanceSummaries = Object.values(systemState.governance_summaries);
            const vaultAnalyses = Object.values(systemState.vault_analyses);

            // Calcula tendências de performance
            const performanceTrends = this.calculatePerformanceTrends(governanceSummaries);

            const result = await this.recalibrationEngine.recalibrate({
                current_command_center: systemState.command_center,
                governance_summaries: governanceSummaries,
                updated_vaults: vaultAnalyses,
                performance_trends: performanceTrends,
                weights,
                recalibration_config: recalibration_config || { aggressiveness: 'moderate' }
            });

            if (result.success) {
                // Não aplica automaticamente - requer aprovação
                await eventBus.emit(EventTypes.RECALIBRATION_COMPLETED, {
                    command_center_id: result.output.recalibrated_command_center?.command_center_id,
                    new_version: result.output.recalibrated_command_center?.version,
                    total_changes: result.output.recalibration_summary?.total_changes || 0,
                    requires_approval: true
                }, { correlation_id: correlationId, causation_id: event.event_id, user_id });

                // Emite validação requerida
                if (result.output.validation_required?.length > 0) {
                    await eventBus.emit(EventTypes.VALIDATION_REQUIRED, {
                        component_id: result.output.recalibrated_command_center?.command_center_id,
                        component_type: 'recalibration',
                        validation_items: result.output.validation_required,
                        priority: 'high'
                    }, { correlation_id: correlationId, user_id });
                }
            }

            return result;

        } catch (error) {
            console.error(`❌ Error recalibrating command center:`, error);
            throw error;
        }
    }

    /**
     * Executa detecção de gaps
     */
    async runGapDetection(correlationId, userId) {
        const vaultAnalyses = Object.values(systemState.vault_analyses);

        const result = await this.gapDetector.detect({
            vault_analyses: vaultAnalyses,
            command_center: systemState.command_center
        });

        if (result.success && (result.output.gaps?.length > 0 || result.output.questions_for_humans?.length > 0)) {
            await eventBus.emit(EventTypes.GAPS_DETECTED, {
                detection_id: result.output.detection_id,
                critical_gaps: result.output.gaps?.filter(g => g.severidade === 'critical').length || 0,
                total_gaps: result.output.gaps?.length || 0,
                questions_count: result.output.questions_for_humans?.length || 0,
                health_score: result.output.health_score?.overall || 0
            }, { correlation_id: correlationId, user_id: userId });
        }

        return result;
    }

    /**
     * Calcula tendências de performance baseado em histórico
     */
    calculatePerformanceTrends(summaries) {
        if (summaries.length === 0) {
            return { trends: [], data_points: 0 };
        }

        const trends = [];

        // Agrupa KPIs por ID através dos ciclos
        const kpiHistory = {};

        summaries.forEach((summary, index) => {
            const onTrack = summary.performance_analysis?.kpis_on_track || [];
            const offTrack = summary.performance_analysis?.kpis_off_track || [];

            [...onTrack, ...offTrack].forEach(kpi => {
                if (!kpiHistory[kpi.kpi_id]) {
                    kpiHistory[kpi.kpi_id] = [];
                }
                kpiHistory[kpi.kpi_id].push({
                    cycle_index: index,
                    value: kpi.realizado,
                    target: kpi.meta,
                    on_track: onTrack.some(k => k.kpi_id === kpi.kpi_id)
                });
            });
        });

        // Calcula tendência para cada KPI
        for (const [kpiId, history] of Object.entries(kpiHistory)) {
            if (history.length >= 2) {
                const values = history.map(h => h.value);
                const trend = this.calculateTrendDirection(values);

                trends.push({
                    kpi_id: kpiId,
                    direction: trend.direction,
                    strength: trend.strength,
                    data_points: history.length,
                    last_value: values[values.length - 1],
                    first_value: values[0]
                });
            }
        }

        return {
            trends,
            data_points: summaries.length,
            calculated_at: new Date().toISOString()
        };
    }

    /**
     * Calcula direção de tendência simples
     */
    calculateTrendDirection(values) {
        if (values.length < 2) {
            return { direction: 'stable', strength: 0 };
        }

        const changes = [];
        for (let i = 1; i < values.length; i++) {
            changes.push(values[i] - values[i - 1]);
        }

        const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
        const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
        const changePercent = avgValue !== 0 ? (avgChange / avgValue) * 100 : 0;

        let direction = 'stable';
        if (changePercent > 5) direction = 'increasing';
        else if (changePercent < -5) direction = 'decreasing';

        return {
            direction,
            strength: Math.min(1, Math.abs(changePercent) / 20)
        };
    }

    /**
     * Aprova Command Center (muda status de draft para approved)
     */
    async approveCommandCenter(userId) {
        if (!systemState.command_center) {
            throw new Error('Nenhum Command Center para aprovar');
        }

        systemState.command_center.status = 'approved';
        systemState.command_center.approved_at = new Date().toISOString();
        systemState.command_center.approved_by = userId;

        await eventBus.emit(EventTypes.COMMAND_CENTER_APPROVED, {
            command_center_id: systemState.command_center.command_center_id,
            version: systemState.command_center.version,
            approved_by: userId
        }, { user_id: userId });

        return systemState.command_center;
    }

    /**
     * Aplica recalibração aprovada
     */
    async applyRecalibration(recalibrationResult, userId) {
        if (!recalibrationResult?.recalibrated_command_center) {
            throw new Error('Resultado de recalibração inválido');
        }

        // Arquiva versão anterior
        const previousVersion = { ...systemState.command_center };

        // Aplica nova versão
        systemState.command_center = recalibrationResult.recalibrated_command_center;
        systemState.command_center.status = 'approved';
        systemState.command_center.applied_at = new Date().toISOString();
        systemState.command_center.applied_by = userId;

        await eventBus.emit(EventTypes.RECALIBRATION_APPROVED, {
            command_center_id: systemState.command_center.command_center_id,
            new_version: systemState.command_center.version,
            previous_version: previousVersion.version,
            approved_by: userId
        }, { user_id: userId });

        return systemState.command_center;
    }

    /**
     * Retorna estado atual do sistema
     */
    getState() {
        return {
            vaults: Object.keys(systemState.vaults),
            vault_analyses: Object.keys(systemState.vault_analyses),
            has_calendar_context: !!systemState.calendar_context,
            command_center: systemState.command_center ? {
                id: systemState.command_center.command_center_id,
                version: systemState.command_center.version,
                status: systemState.command_center.status
            } : null,
            governance_cycles_count: systemState.governance_cycles.length,
            weights: this.weightsManager.getWeights()
        };
    }

    /**
     * Retorna dados completos (para API)
     */
    getFullState() {
        return { ...systemState };
    }
}

// Singleton
let orchestratorInstance = null;

export function getOrchestrator() {
    if (!orchestratorInstance) {
        orchestratorInstance = new WorkflowOrchestrator();
    }
    return orchestratorInstance;
}

export { systemState };
