/**
 * Event Store - Persistência de eventos para auditoria e replay
 * Versão in-memory para desenvolvimento, pode ser trocado por Redis/PostgreSQL
 */

import { v4 as uuidv4 } from 'uuid';

class EventStore {
    constructor() {
        // In-memory storage (substituir por Redis/PostgreSQL em produção)
        this.events = [];
        this.snapshots = new Map();
    }

    /**
     * Salva evento no store
     */
    async save(event) {
        const storedEvent = {
            ...event,
            stored_at: new Date().toISOString(),
            sequence_number: this.events.length + 1
        };
        this.events.push(storedEvent);
        return storedEvent;
    }

    /**
     * Busca eventos por tipo
     */
    async findByType(eventType, options = {}) {
        const { limit = 100, since = null } = options;

        let filtered = this.events.filter(e => e.event_type === eventType);

        if (since) {
            filtered = filtered.filter(e => new Date(e.timestamp) > new Date(since));
        }

        return filtered.slice(-limit);
    }

    /**
     * Busca eventos por correlation_id (agrupa eventos relacionados)
     */
    async findByCorrelation(correlationId) {
        return this.events.filter(e => e.metadata.correlation_id === correlationId);
    }

    /**
     * Busca eventos por entidade (vault_id, cycle_id, etc)
     */
    async findByEntity(entityType, entityId) {
        return this.events.filter(e => {
            const payload = e.payload || {};
            return payload[entityType] === entityId || payload[`${entityType}_id`] === entityId;
        });
    }

    /**
     * Busca todos eventos desde timestamp
     */
    async findSince(timestamp) {
        return this.events.filter(e => new Date(e.timestamp) > new Date(timestamp));
    }

    /**
     * Salva snapshot de estado para replay rápido
     */
    async saveSnapshot(aggregateId, state, version) {
        this.snapshots.set(aggregateId, {
            aggregate_id: aggregateId,
            state,
            version,
            created_at: new Date().toISOString()
        });
    }

    /**
     * Recupera último snapshot
     */
    async getSnapshot(aggregateId) {
        return this.snapshots.get(aggregateId) || null;
    }

    /**
     * Retorna todos eventos (para debug)
     */
    async getAll() {
        return [...this.events];
    }

    /**
     * Limpa store (apenas para testes)
     */
    async clear() {
        this.events = [];
        this.snapshots.clear();
    }

    /**
     * Estatísticas do store
     */
    async getStats() {
        const byType = {};
        this.events.forEach(e => {
            byType[e.event_type] = (byType[e.event_type] || 0) + 1;
        });

        return {
            total_events: this.events.length,
            total_snapshots: this.snapshots.size,
            events_by_type: byType,
            oldest_event: this.events[0]?.timestamp || null,
            newest_event: this.events[this.events.length - 1]?.timestamp || null
        };
    }
}

// Singleton
export const eventStore = new EventStore();
