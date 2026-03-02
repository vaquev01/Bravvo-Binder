/**
 * Workspace Service - Lógica de workspaces
 * Controller → Service → Repository
 */
import { workspaceRepository } from '../repositories/workspace.repository.js';

export const workspaceService = {
    /**
     * Carrega dados de um workspace
     */
    async load(clientId) {
        const workspace = await workspaceRepository.findByClientId(clientId);
        if (!workspace) {
            return { success: false, error: 'Workspace not found' };
        }
        return { success: true, data: workspace.data };
    },

    /**
     * Salva dados de um workspace (upsert)
     */
    async save(clientId, payload) {
        await workspaceRepository.upsert(clientId, payload);
        return { success: true, message: 'Workspace saved successfully' };
    },

    /**
     * Lista workspaces (com paginação)
     */
    async list(agencyId, page = 1, limit = 10) {
        return await workspaceRepository.list(agencyId, page, limit);
    }
};
