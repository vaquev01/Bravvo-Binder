/**
 * Workspace Routes - /api/workspaces
 * Controller → Service → Repository
 */
import { Router } from 'express';
import { workspaceController } from '../controllers/workspace.controller.js';

const router = Router();

router.get('/:clientId/load', workspaceController.load);
router.post('/:clientId/save', workspaceController.save);

export default router;
