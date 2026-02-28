/**
 * Workspace Controller - Camada HTTP para workspaces
 * Inclui verificação de propriedade para multi-tenancy seguro.
 */
import { workspaceService } from '../services/workspace.service.js';

// Roles que podem acessar qualquer workspace (admin)
const PRIVILEGED_ROLES = ['master', 'admin'];

// Helper para verificar se o usuário autenticado tem acesso ao workspace
function canAccessWorkspace(req, clientId) {
    const user = req.user;
    if (!user) return false;
    // Admins and masters can access any workspace
    if (PRIVILEGED_ROLES.includes(user.role)) return true;
    // Agency users can access any client workspace (they manage them)
    if (user.role === 'agency') return true;
    // Client users can only access their own workspace
    return user.sub === clientId || user.username === clientId;
}

export const workspaceController = {
    async load(req, res) {
        try {
            const { clientId } = req.params;

            if (!canAccessWorkspace(req, clientId)) {
                return res.status(403).json({ error: 'Acesso negado a este workspace.' });
            }

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

            if (!canAccessWorkspace(req, clientId)) {
                return res.status(403).json({ error: 'Acesso negado a este workspace.' });
            }

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
