/**
 * TanStack Query Hooks para Server State
 * 
 * Gerencia todas as chamadas à API com cache, refetch, e retry automáticos.
 * Substitui chamadas manuais de fetch/orchestrationService por hooks declarativos.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orchestrationService } from '../services/orchestrationService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ============================================
// QUERY KEYS (centralizados para invalidação)
// ============================================
export const queryKeys = {
    health: ['health'],
    vaultAnalysis: (vaultId) => ['vault', 'analysis', vaultId],
    commandCenter: ['commandCenter'],
    governance: (cycleId) => ['governance', cycleId],
    weights: ['weights'],
    gaps: ['gaps'],
    state: ['aiState'],
    events: (params) => ['events', params],
};

// ============================================
// UTILITY FETCH
// ============================================
async function apiFetch(path, options = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('bravvo_api_token') : null;

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${path}`, {
        headers,
        ...options,
    });
    if (!res.ok) {
        let errorMsg = `API Error: ${res.status}`;
        try {
            const errorBody = await res.json();
            errorMsg = errorBody.error || errorMsg;
        } catch { }
        throw new Error(errorMsg);
    }
    return res.json();
}

// ============================================
// QUERIES (leitura)
// ============================================

/** Healthcheck da API */
export function useApiHealth() {
    return useQuery({
        queryKey: queryKeys.health,
        queryFn: () => apiFetch('/health'),
        refetchInterval: 30_000, // poll a cada 30s
        staleTime: 10_000,
    });
}

/** Análise de um Vault */
export function useVaultAnalysis(vaultId) {
    return useQuery({
        queryKey: queryKeys.vaultAnalysis(vaultId),
        queryFn: () => apiFetch(`/ai/vaults/${vaultId}/analysis`),
        enabled: !!vaultId,
        staleTime: 60_000,
    });
}

/** Command Center atual */
export function useCommandCenter() {
    return useQuery({
        queryKey: queryKeys.commandCenter,
        queryFn: () => apiFetch('/ai/command-center'),
        staleTime: 60_000,
    });
}

/** Pesos atuais */
export function useWeights() {
    return useQuery({
        queryKey: queryKeys.weights,
        queryFn: () => apiFetch('/ai/weights'),
        staleTime: 30_000,
    });
}

/** Detecção de gaps */
export function useGapDetection() {
    return useQuery({
        queryKey: queryKeys.gaps,
        queryFn: () => apiFetch('/ai/gaps/detect'),
        enabled: false, // manual trigger only
    });
}

/** Estado do orchestrator */
export function useAiState() {
    return useQuery({
        queryKey: queryKeys.state,
        queryFn: () => apiFetch('/ai/state'),
        staleTime: 10_000,
    });
}

// ============================================
// MUTATIONS (escrita)
// ============================================

/** Completa um Vault */
export function useCompleteVault() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ vaultId, content }) =>
            apiFetch(`/ai/vaults/${vaultId}/complete`, {
                method: 'POST',
                body: JSON.stringify({ content }),
            }),
        onSuccess: (data, { vaultId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.vaultAnalysis(vaultId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.state });
        },
    });
}

/** Gera Command Center */
export function useGenerateCommandCenter() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) =>
            apiFetch('/ai/command-center/generate', {
                method: 'POST',
                body: JSON.stringify(payload),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.commandCenter });
            queryClient.invalidateQueries({ queryKey: queryKeys.state });
        },
    });
}

/** Gera plano/roadmap */
export function useGeneratePlan() {
    return useMutation({
        mutationFn: (payload) =>
            apiFetch('/ai/generate-plan', {
                method: 'POST',
                body: JSON.stringify(payload),
            }),
    });
}

/** Gera brief criativo */
export function useGenerateCreativeBrief() {
    return useMutation({
        mutationFn: (payload) =>
            apiFetch('/ai/generate-creative-brief', {
                method: 'POST',
                body: JSON.stringify(payload),
            }),
    });
}

/** Inspira vault com IA */
export function useInspireVault() {
    return useMutation({
        mutationFn: (payload) =>
            apiFetch('/ai/inspire-vault', {
                method: 'POST',
                body: JSON.stringify(payload),
            }),
    });
}

/** Gera tema da marca */
export function useGenerateBrandTheme() {
    return useMutation({
        mutationFn: (payload) =>
            apiFetch('/ai/generate-brand-theme', {
                method: 'POST',
                body: JSON.stringify(payload),
            }),
    });
}

/** Atualiza pesos */
export function useUpdateWeights() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) =>
            apiFetch('/ai/weights', {
                method: 'PUT',
                body: JSON.stringify(payload),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.weights });
        },
    });
}

/** Login */
export function useLogin() {
    return useMutation({
        mutationFn: (credentials) =>
            apiFetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials),
            }),
    });
}

/** Carrega workspace */
export function useLoadWorkspace(clientId) {
    return useQuery({
        queryKey: ['workspace', clientId],
        queryFn: () => apiFetch(`/api/workspaces/${clientId}/load`),
        enabled: !!clientId,
        staleTime: 60_000,
    });
}

/** Salva workspace */
export function useSaveWorkspace() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ clientId, data }) =>
            apiFetch(`/api/workspaces/${clientId}/save`, {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        onSuccess: (_, { clientId }) => {
            queryClient.invalidateQueries({ queryKey: ['workspace', clientId] });
        },
    });
}
