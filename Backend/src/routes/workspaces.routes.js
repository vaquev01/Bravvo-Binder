/**
 * Workspace Routes - /api/workspaces (autenticado)
 */
import { Router } from 'express';
import { workspaceController } from '../controllers/workspace.controller.js';
import { requireAuth } from '../middleware/index.js';

const router = Router();

router.get('/', requireAuth, workspaceController.list);
router.get('/:clientId/load', requireAuth, workspaceController.load);
router.post('/:clientId/save', requireAuth, workspaceController.save);

export default router;
