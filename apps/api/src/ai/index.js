/**
 * AI Module Index - Exporta todos os módulos de IA
 */

// Events
export { eventBus, EventTypes } from './events/event-bus.js';
export { eventStore } from './events/event-store.js';

// Agents
export * from './agents/index.js';

// Orchestrator
export { getOrchestrator, WorkflowOrchestrator } from './orchestrator/workflow.js';
export {
    getWeightsManager,
    resetWeightsManager,
    WeightsManager,
    DEFAULT_WEIGHTS,
    WEIGHT_PRESETS
} from './orchestrator/weights.js';

// Schemas
export * from './schemas/vault.schema.js';
export * from './schemas/command-center.schema.js';
export * from './schemas/governance.schema.js';
