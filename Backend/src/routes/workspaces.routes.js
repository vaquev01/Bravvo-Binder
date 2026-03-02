/**
 * Workspace Routes - /api/workspaces (autenticado)
 */
import { Router } from 'express';
import { workspaceController } from '../controllers/workspace.controller.js';
import { requireAuth } from '../middleware/index.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Workspaces
 *   description: Gerenciamento de dados de workspace por cliente
 */

/**
 * @swagger
 * /api/workspaces:
 *   get:
 *     summary: Lista todos os workspaces com paginação
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista paginada de workspaces
 *       401:
 *         description: Token inválido ou ausente
 */
router.get('/', requireAuth, workspaceController.list);

/**
 * @swagger
 * /api/workspaces/{clientId}/load:
 *   get:
 *     summary: Carrega dados de um workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único do cliente/workspace
 *     responses:
 *       200:
 *         description: Dados do workspace carregados
 *       403:
 *         description: Acesso negado (outro usuário)
 *       404:
 *         description: Workspace não encontrado
 */
router.get('/:clientId/load', requireAuth, workspaceController.load);

/**
 * @swagger
 * /api/workspaces/{clientId}/save:
 *   post:
 *     summary: Salva/atualiza dados de um workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Workspace salvo com sucesso
 *       403:
 *         description: Acesso negado
 */
router.post('/:clientId/save', requireAuth, workspaceController.save);

export default router;

