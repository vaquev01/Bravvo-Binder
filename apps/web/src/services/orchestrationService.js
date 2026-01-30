/**
 * ORCHESTRATION SERVICE
 * Conecta o frontend com a API de orquestração de IA do BravvoOS
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class OrchestrationService {
    constructor() {
        this.baseUrl = `${API_BASE}/ai`;
    }

    /**
     * Helper para fazer requests
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': this.getUserId(),
                'X-Correlation-Id': this.generateCorrelationId(),
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`Orchestration API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    getUserId() {
        return localStorage.getItem('bravvo_user_id') || 'anonymous';
    }

    generateCorrelationId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // ============================================
    // VAULT ENDPOINTS
    // ============================================

    /**
     * Marca vault como completo e dispara análise de IA
     * @param {string} vaultId - V1, V2, V3, V4 ou V5
     * @param {object} content - Conteúdo do vault
     */
    async completeVault(vaultId, content) {
        return this.request(`/vaults/${vaultId}/complete`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    }

    /**
     * Obtém análise de um vault
     */
    async getVaultAnalysis(vaultId) {
        return this.request(`/vaults/${vaultId}/analysis`);
    }

    // ============================================
    // COMMAND CENTER ENDPOINTS
    // ============================================

    /**
     * Gera Centro de Comando com IA
     * @param {object} options - { weights, mode, vaults }
     */
    async generateCommandCenter(options = {}) {
        return this.request('/command-center/generate', {
            method: 'POST',
            body: JSON.stringify({
                mode: options.mode || 'initial',
                weights: options.weights || null,
                vaults: options.vaults || null
            })
        });
    }

    /**
     * Obtém Centro de Comando atual
     */
    async getCommandCenter() {
        return this.request('/command-center');
    }

    /**
     * Aprova Centro de Comando (draft → approved)
     */
    async approveCommandCenter() {
        return this.request('/command-center/approve', {
            method: 'POST'
        });
    }

    // ============================================
    // GOVERNANCE ENDPOINTS
    // ============================================

    /**
     * Marca ciclo de governança como completo
     */
    async completeGovernance(cycleId, cycleData) {
        return this.request('/governance/complete', {
            method: 'POST',
            body: JSON.stringify({ cycle_id: cycleId, cycle_data: cycleData })
        });
    }

    /**
     * Obtém resumo de governança
     */
    async getGovernanceSummary(cycleId) {
        return this.request(`/governance/${cycleId}/summary`);
    }

    // ============================================
    // RECALIBRATION ENDPOINTS
    // ============================================

    /**
     * Recalibra Centro de Comando
     */
    async recalibrateCommandCenter(cycleId, config = {}) {
        return this.request('/recalibrate', {
            method: 'POST',
            body: JSON.stringify({
                cycle_id: cycleId,
                config: {
                    aggressiveness: config.aggressiveness || 'moderate',
                    ...config
                }
            })
        });
    }

    /**
     * Aplica recalibração aprovada
     */
    async applyRecalibration(recalibrationResult) {
        return this.request('/recalibrate/apply', {
            method: 'POST',
            body: JSON.stringify({ recalibration_result: recalibrationResult })
        });
    }

    // ============================================
    // WEIGHTS ENDPOINTS
    // ============================================

    /**
     * Obtém pesos atuais
     */
    async getWeights() {
        return this.request('/weights');
    }

    /**
     * Atualiza pesos
     */
    async updateWeights(weights, reason) {
        return this.request('/weights', {
            method: 'PUT',
            body: JSON.stringify({ weights, reason })
        });
    }

    /**
     * Aplica preset de pesos
     */
    async applyWeightPreset(presetName) {
        return this.request('/weights/preset', {
            method: 'POST',
            body: JSON.stringify({ preset_name: presetName })
        });
    }

    // ============================================
    // GAPS & STATE ENDPOINTS
    // ============================================

    /**
     * Detecta gaps e inconsistências
     */
    async detectGaps() {
        return this.request('/gaps/detect');
    }

    /**
     * Obtém estado do sistema
     */
    async getState() {
        return this.request('/state');
    }

    /**
     * Obtém contexto de calendário
     */
    async getContext() {
        return this.request('/context');
    }

    /**
     * Obtém histórico de eventos
     */
    async getEvents(options = {}) {
        const params = new URLSearchParams();
        if (options.type) params.append('type', options.type);
        if (options.limit) params.append('limit', options.limit);

        const query = params.toString();
        return this.request(`/events${query ? `?${query}` : ''}`);
    }

    /**
     * Obtém estatísticas de eventos
     */
    async getEventStats() {
        return this.request('/events/stats');
    }

    // ============================================
    // HELPERS
    // ============================================

    /**
     * Converte dados do VaultContext (S1-S5) para formato da API (V1-V5)
     */
    convertVaultData(appData, vaultId) {
        const mapping = {
            'V1': 'S1',
            'V2': 'S2',
            'V3': 'S3',
            'V4': 'S4',
            'V5': 'S5'
        };

        const internalId = mapping[vaultId];
        const vaultData = appData?.vaults?.[internalId];

        return {
            raw_data: vaultData?.fields || vaultData || {},
            metadata: {
                filled_by: this.getUserId(),
                filled_at: new Date().toISOString(),
                version: '1.0.0'
            }
        };
    }

    /**
     * Verifica se a API está disponível
     */
    async healthCheck() {
        try {
            const response = await fetch(`${API_BASE}/health`);
            return response.ok;
        } catch {
            return false;
        }
    }

    // ============================================
    // AI GENERATION ENDPOINTS (ALL BACKEND)
    // ============================================

    /**
     * Gera plano/roadmap com IA via backend
     */
    async generatePlan(vaults, kpis = [], weights = null) {
        return this.request('/generate-plan', {
            method: 'POST',
            body: JSON.stringify({ vaults, kpis, weights })
        });
    }

    /**
     * Gera brief criativo via backend
     */
    async generateCreativeBrief(item, vaults) {
        return this.request('/generate-creative-brief', {
            method: 'POST',
            body: JSON.stringify({ item, vaults })
        });
    }

    /**
     * Gera conclusão de governança via backend
     */
    async generateGovernanceConclusion(ata) {
        return this.request('/generate-governance-conclusion', {
            method: 'POST',
            body: JSON.stringify({ ata })
        });
    }

    /**
     * Inspira/gera conteúdo para um Vault via backend
     */
    async inspireVault(vaultId, currentData, mode = 'all') {
        return this.request('/inspire-vault', {
            method: 'POST',
            body: JSON.stringify({ vaultId, currentData, mode })
        });
    }
}

export const orchestrationService = new OrchestrationService();
