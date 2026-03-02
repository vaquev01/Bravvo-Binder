/**
 * Sistema de Pesos Configuráveis
 * Influencia recalibração sem engessar criatividade
 */

// Pesos padrão
export const DEFAULT_WEIGHTS = {
    peso_vaults: 0.4,
    peso_governanca: 0.3,
    peso_performance: 0.2,
    peso_calendario: 0.1
};

// Ranges válidos para cada peso
export const WEIGHT_RANGES = {
    peso_vaults: { min: 0.2, max: 0.6 },
    peso_governanca: { min: 0.1, max: 0.5 },
    peso_performance: { min: 0.1, max: 0.4 },
    peso_calendario: { min: 0.0, max: 0.3 }
};

// Presets de configuração
export const WEIGHT_PRESETS = {
    balanced: {
        name: 'Balanced',
        description: 'Equilíbrio entre todas as fontes',
        weights: { peso_vaults: 0.4, peso_governanca: 0.3, peso_performance: 0.2, peso_calendario: 0.1 }
    },
    vault_focused: {
        name: 'Vault Focused',
        description: 'Prioriza dados estratégicos dos Vaults',
        weights: { peso_vaults: 0.6, peso_governanca: 0.2, peso_performance: 0.15, peso_calendario: 0.05 }
    },
    performance_driven: {
        name: 'Performance Driven',
        description: 'Prioriza resultados reais medidos',
        weights: { peso_vaults: 0.25, peso_governanca: 0.25, peso_performance: 0.4, peso_calendario: 0.1 }
    },
    governance_heavy: {
        name: 'Governance Heavy',
        description: 'Prioriza padrões de decisão estabelecidos',
        weights: { peso_vaults: 0.3, peso_governanca: 0.5, peso_performance: 0.15, peso_calendario: 0.05 }
    },
    seasonal_aware: {
        name: 'Seasonal Aware',
        description: 'Alta influência de sazonalidade',
        weights: { peso_vaults: 0.35, peso_governanca: 0.25, peso_performance: 0.15, peso_calendario: 0.25 }
    }
};

/**
 * Classe para gerenciar pesos
 */
export class WeightsManager {
    constructor(initialWeights = null) {
        this.weights = initialWeights || { ...DEFAULT_WEIGHTS };
        this.history = [];
        this.validate();
    }

    /**
     * Valida que pesos somam 1.0
     */
    validate() {
        const sum = Object.values(this.weights).reduce((a, b) => a + b, 0);
        const tolerance = 0.01;

        if (Math.abs(sum - 1.0) > tolerance) {
            throw new Error(`Pesos devem somar 1.0, atual: ${sum.toFixed(3)}`);
        }

        // Valida ranges
        for (const [key, value] of Object.entries(this.weights)) {
            const range = WEIGHT_RANGES[key];
            if (range && (value < range.min || value > range.max)) {
                console.warn(`⚠️ Peso ${key}=${value} fora do range recomendado [${range.min}, ${range.max}]`);
            }
        }

        return true;
    }

    /**
     * Atualiza pesos com histórico
     */
    update(newWeights, reason) {
        const previousWeights = { ...this.weights };

        this.weights = { ...this.weights, ...newWeights };
        this.validate();

        this.history.push({
            timestamp: new Date().toISOString(),
            previous: previousWeights,
            current: { ...this.weights },
            reason
        });

        return this.weights;
    }

    /**
     * Aplica preset
     */
    applyPreset(presetName) {
        const preset = WEIGHT_PRESETS[presetName];
        if (!preset) {
            throw new Error(`Preset não encontrado: ${presetName}`);
        }

        return this.update(preset.weights, `Aplicado preset: ${preset.name}`);
    }

    /**
     * Retorna pesos atuais
     */
    getWeights() {
        return { ...this.weights };
    }

    /**
     * Retorna histórico de alterações
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * Calcula influência ponderada de sinais
     */
    calculateInfluence(signals) {
        const result = {
            vault_influence: 0,
            governance_influence: 0,
            performance_influence: 0,
            calendar_influence: 0,
            total_influence: 0,
            dominant_source: null,
            signals_breakdown: []
        };

        for (const signal of signals) {
            const weightKey = `peso_${signal.source}`;
            const weight = this.weights[weightKey] || 0;
            const influence = signal.strength * weight;

            result[`${signal.source}_influence`] += influence;
            result.total_influence += influence;

            result.signals_breakdown.push({
                source: signal.source,
                signal: signal.description,
                strength: signal.strength,
                weight_applied: weight,
                weighted_influence: influence
            });
        }

        // Identifica fonte dominante
        const influences = {
            vaults: result.vault_influence,
            governanca: result.governance_influence,
            performance: result.performance_influence,
            calendario: result.calendar_influence
        };

        result.dominant_source = Object.entries(influences)
            .sort(([, a], [, b]) => b - a)[0][0];

        return result;
    }

    /**
     * Gera recomendação de ação baseada em sinais e pesos
     */
    generateRecommendation(signals, threshold = 0.5) {
        const influence = this.calculateInfluence(signals);

        // Agrupa sinais por direção
        const directions = {
            increase: [],
            decrease: [],
            maintain: []
        };

        for (const signal of signals) {
            const dir = signal.direction || 'maintain';
            directions[dir].push(signal);
        }

        // Calcula força de cada direção
        const directionStrengths = {};
        for (const [dir, sigs] of Object.entries(directions)) {
            directionStrengths[dir] = sigs.reduce((sum, s) => {
                const weight = this.weights[`peso_${s.source}`] || 0;
                return sum + (s.strength * weight);
            }, 0);
        }

        // Determina recomendação
        const maxDir = Object.entries(directionStrengths)
            .sort(([, a], [, b]) => b - a)[0];

        const recommendation = {
            action: maxDir[0],
            confidence: Math.min(100, Math.round(maxDir[1] * 100)),
            threshold_met: maxDir[1] >= threshold,
            influence_breakdown: influence,
            direction_strengths: directionStrengths,
            requires_human_decision: false
        };

        // Se sinais divergem muito, requer decisão humana
        const values = Object.values(directionStrengths);
        const maxVal = Math.max(...values);
        const secondMax = values.sort((a, b) => b - a)[1] || 0;

        if (maxVal > 0 && secondMax > 0 && (secondMax / maxVal) > 0.7) {
            recommendation.requires_human_decision = true;
            recommendation.reason = 'Sinais divergentes - decisão humana recomendada';
        }

        return recommendation;
    }

    /**
     * Serializa para persistência
     */
    toJSON() {
        return {
            weights: this.weights,
            history: this.history,
            last_updated: new Date().toISOString()
        };
    }

    /**
     * Restaura de JSON
     */
    static fromJSON(json) {
        const manager = new WeightsManager(json.weights);
        manager.history = json.history || [];
        return manager;
    }
}

// Singleton para uso global
let globalWeightsManager = null;

export function getWeightsManager() {
    if (!globalWeightsManager) {
        globalWeightsManager = new WeightsManager();
    }
    return globalWeightsManager;
}

export function resetWeightsManager(weights = null) {
    globalWeightsManager = new WeightsManager(weights);
    return globalWeightsManager;
}
