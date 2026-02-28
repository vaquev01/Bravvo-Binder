/**
 * Workspace Controller - Camada HTTP para workspaces
 */
import { workspaceService } from '../services/workspace.service.js';

export const workspaceController = {
    async load(req, res) {
        try {
            const { clientId } = req.params;
            const result = await workspaceService.load(clientId);

            if (!result.success) {
                return res.status(404).json({ error: result.error });
            }

            res.json({ status: 'ok', data: result.data });
        } catch (error) {
            console.error('Load workspace error:', error);
            res.status(500).json({ error: 'Failed to load workspace data' });
        }
    },

    async save(req, res) {
        try {
            const { clientId } = req.params;
            const payload = req.body;

            const result = await workspaceService.save(clientId, payload);
            res.json({ status: 'ok', message: result.message });
        } catch (error) {
            console.error('Save workspace error:', error);
            res.status(500).json({ error: 'Failed to save workspace data' });
        }
    },

    async list(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const { agencyId } = req.query; // opcional para filtro

            const result = await workspaceService.list(agencyId, page, limit);
            res.json({ status: 'ok', ...result });
        } catch (error) {
            console.error('List workspaces error:', error);
            res.status(500).json({ error: 'Failed to list workspaces' });
        }
    }
};
