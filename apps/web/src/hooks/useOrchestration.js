/**
 * useOrchestration Hook
 * Hook para gerenciar estado da orquestração de IA
 */

import { useState, useCallback, useEffect } from 'react';
import { orchestrationService } from '../services/orchestrationService';

export function useOrchestration() {
    // Estado
    const [state, setState] = useState({
        vaults: [],
        vault_analyses: [],
        has_calendar_context: false,
        command_center: null,
        governance_cycles_count: 0,
        weights: null
    });

    const [commandCenter, setCommandCenter] = useState(null);
    const [calendarContext, setCalendarContext] = useState(null);
    const [weights, setWeights] = useState(null);
    const [gaps, setGaps] = useState(null);

    const [loading, setLoading] = useState({
        state: false,
        vault: false,
        commandCenter: false,
        governance: false,
        recalibration: false,
        gaps: false
    });

    const [error, setError] = useState(null);
    const [isApiAvailable, setIsApiAvailable] = useState(false);

    // Verifica se API está disponível
    const checkApi = useCallback(async () => {
        const available = await orchestrationService.healthCheck();
        setIsApiAvailable(available);
        return available;
    }, []);

    // Carrega estado inicial
    const loadState = useCallback(async () => {
        setLoading(prev => ({ ...prev, state: true }));
        setError(null);

        try {
            const data = await orchestrationService.getState();
            setState(data);

            if (data.weights) {
                setWeights(data.weights);
            }

            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(prev => ({ ...prev, state: false }));
        }
    }, []);

    // Completa um Vault e dispara análise
    const completeVault = useCallback(async (vaultId, content) => {
        setLoading(prev => ({ ...prev, vault: true }));
        setError(null);

        try {
            const result = await orchestrationService.completeVault(vaultId, content);

            // Atualiza estado local
            await loadState();

            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(prev => ({ ...prev, vault: false }));
        }
    }, [loadState]);

    // Gera Command Center
    const generateCommandCenter = useCallback(async (options = {}) => {
        setLoading(prev => ({ ...prev, commandCenter: true }));
        setError(null);

        try {
            const result = await orchestrationService.generateCommandCenter(options);

            if (result.success) {
                // Carrega o CC completo
                const cc = await orchestrationService.getCommandCenter();
                setCommandCenter(cc);
            }

            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(prev => ({ ...prev, commandCenter: false }));
        }
    }, []);

    // Aprova Command Center
    const approveCommandCenter = useCallback(async () => {
        setLoading(prev => ({ ...prev, commandCenter: true }));
        setError(null);

        try {
            const result = await orchestrationService.approveCommandCenter();

            if (result.success) {
                setCommandCenter(prev => prev ? { ...prev, status: 'approved' } : null);
            }

            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(prev => ({ ...prev, commandCenter: false }));
        }
    }, []);

    // Completa ciclo de governança
    const completeGovernance = useCallback(async (cycleId, cycleData) => {
        setLoading(prev => ({ ...prev, governance: true }));
        setError(null);

        try {
            const result = await orchestrationService.completeGovernance(cycleId, cycleData);
            await loadState();
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(prev => ({ ...prev, governance: false }));
        }
    }, [loadState]);

    // Recalibra Command Center
    const recalibrateCommandCenter = useCallback(async (cycleId, config) => {
        setLoading(prev => ({ ...prev, recalibration: true }));
        setError(null);

        try {
            const result = await orchestrationService.recalibrateCommandCenter(cycleId, config);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(prev => ({ ...prev, recalibration: false }));
        }
    }, []);

    // Aplica recalibração
    const applyRecalibration = useCallback(async (recalibrationResult) => {
        setLoading(prev => ({ ...prev, recalibration: true }));
        setError(null);

        try {
            const result = await orchestrationService.applyRecalibration(recalibrationResult);

            if (result.success) {
                const cc = await orchestrationService.getCommandCenter();
                setCommandCenter(cc);
            }

            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(prev => ({ ...prev, recalibration: false }));
        }
    }, []);

    // Atualiza pesos
    const updateWeights = useCallback(async (newWeights, reason) => {
        setError(null);

        try {
            const result = await orchestrationService.updateWeights(newWeights, reason);

            if (result.success) {
                setWeights(result.weights);
            }

            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    // Aplica preset de pesos
    const applyWeightPreset = useCallback(async (presetName) => {
        setError(null);

        try {
            const result = await orchestrationService.applyWeightPreset(presetName);

            if (result.success) {
                setWeights(result.weights);
            }

            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    // Detecta gaps
    const detectGaps = useCallback(async () => {
        setLoading(prev => ({ ...prev, gaps: true }));
        setError(null);

        try {
            const result = await orchestrationService.detectGaps();

            if (result.success) {
                setGaps(result);
            }

            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(prev => ({ ...prev, gaps: false }));
        }
    }, []);

    // Carrega contexto de calendário
    const loadCalendarContext = useCallback(async () => {
        try {
            const context = await orchestrationService.getContext();
            setCalendarContext(context);
            return context;
        } catch (err) {
            // Não é erro crítico
            console.log('Calendar context not available yet');
            return null;
        }
    }, []);

    // Carrega pesos
    const loadWeights = useCallback(async () => {
        try {
            const data = await orchestrationService.getWeights();
            setWeights(data.weights);
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        }
    }, []);

    // Inicialização
    useEffect(() => {
        checkApi().then(available => {
            if (available) {
                loadState();
                loadWeights();
            }
        });
    }, [checkApi, loadState, loadWeights]);

    return {
        // Estado
        state,
        commandCenter,
        calendarContext,
        weights,
        gaps,
        loading,
        error,
        isApiAvailable,

        // Ações
        checkApi,
        loadState,
        completeVault,
        generateCommandCenter,
        approveCommandCenter,
        completeGovernance,
        recalibrateCommandCenter,
        applyRecalibration,
        updateWeights,
        applyWeightPreset,
        detectGaps,
        loadCalendarContext,
        loadWeights,

        // Helpers
        isLoading: Object.values(loading).some(Boolean),
        hasCommandCenter: !!commandCenter,
        commandCenterStatus: commandCenter?.status || 'none'
    };
}

export default useOrchestration;
