import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

// Load Workspace
router.get('/:clientId/load', async (req, res) => {
    try {
        const { clientId } = req.params;
        const workspace = await prisma.clientWorkspace.findUnique({
            where: { clientId }
        });

        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        res.json({ status: 'ok', data: workspace.data });
    } catch (error) {
        console.error('Load workspace error:', error);
        res.status(500).json({ error: 'Failed to load workspace data' });
    }
});

// Save Workspace
router.post('/:clientId/save', async (req, res) => {
    try {
        const { clientId } = req.params;
        const payload = req.body; // Full workspace JSON

        const workspace = await prisma.clientWorkspace.upsert({
            where: { clientId },
            update: {
                data: payload,
                updatedAt: new Date()
            },
            create: {
                clientId,
                data: payload
            }
        });

        res.json({ status: 'ok', message: 'Workspace saved successfully' });
    } catch (error) {
        console.error('Save workspace error:', error);
        res.status(500).json({ error: 'Failed to save workspace data' });
    }
});

export default router;
