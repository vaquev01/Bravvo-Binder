/**
 * Event Bus - Sistema de eventos do BravvoOS
 * Implementa padrão pub/sub para orquestração de agentes
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { eventStore } from './event-store.js';

class EventBus extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(50);
    }

    /**
     * Emite evento com metadata e persiste no store
     */
    async emit(eventType, payload, metadata = {}) {
        const event = {
            event_id: uuidv4(),
            event_type: eventType,
            timestamp: new Date().toISOString(),
            payload,
            metadata: {
                correlation_id: metadata.correlation_id || uuidv4(),
                causation_id: metadata.causation_id || null,
                user_id: metadata.user_id || 'system',
                session_id: metadata.session_id || null,
                ...metadata
            }
        };

        // Persiste evento
        await eventStore.save(event);

        // Emite para listeners
        super.emit(eventType, event);
        super.emit('*', event); // Wildcard para logging

        console.log(`📡 Event emitted: ${eventType}`, { event_id: event.event_id });
        return event;
    }

    /**
     * Registra handler para tipo de evento
     */
    subscribe(eventType, handler) {
        this.on(eventType, handler);
        console.log(`📥 Subscribed to: ${eventType}`);
        return () => this.off(eventType, handler);
    }

    /**
     * Registra handler que executa apenas uma vez
     */
    subscribeOnce(eventType, handler) {
        this.once(eventType, handler);
        return this;
    }
}

// Singleton
export const eventBus = new EventBus();

// Event Types - constantes para evitar typos
export const EventTypes = {
    // Vault events
    VAULT_COMPLETED: 'vault_completed',
    VAULT_UPDATED: 'vault_updated',
    VAULT_ANALYSIS_COMPLETED: 'vault_analysis_completed',

    // Command Center events
    GENERATE_COMMAND_CENTER: 'generate_command_center',
    COMMAND_CENTER_GENERATED: 'command_center_generated',
    COMMAND_CENTER_APPROVED: 'command_center_approved',

    // Governance events
    GOVERNANCE_COMPLETED: 'governance_completed',
    GOVERNANCE_SUMMARY_READY: 'governance_summary_ready',

    // Recalibration events
    RECALIBRATE_COMMAND_CENTER: 'recalibrate_command_center',
    RECALIBRATION_COMPLETED: 'recalibration_completed',
    RECALIBRATION_APPROVED: 'recalibration_approved',

    // Validation events
    VALIDATION_REQUIRED: 'validation_required',
    GAPS_DETECTED: 'gaps_detected',

    // Context events
    CONTEXT_SYNTHESIZED: 'context_synthesized'
};
