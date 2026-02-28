/**
 * AI Controller - Camada HTTP para endpoints de geração de IA
 * Os endpoints de orchestração (vault/complete, command-center, governance, etc.)
 * permanecem no ai.routes.js por serem fortemente acoplados ao orchestrator.
 * Aqui ficam apenas os endpoints de geração direta com OpenAI.
 */
import { aiGenerationService } from '../services/ai-generation.service.js';

export const aiController = {
    async generatePlan(req, res) {
        try {
            const { vaults, kpis, weights } = req.body;

            if (!vaults || Object.keys(vaults).length === 0) {
                return res.status(400).json({ error: 'Vaults são obrigatórios' });
            }

            console.log('🗓️ Generating plan/roadmap with AI...');
            const result = await aiGenerationService.generatePlan(vaults, kpis, weights);
            console.log(`✅ Generated ${result.tasks?.length || 0} tasks`);

            res.json({
                success: true,
                tasks: result.tasks || [],
                recommendation: result.recommendation || '',
                generated_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error generating plan:', error);
            res.status(500).json({ error: error.message });
        }
    },

    async generateCreativeBrief(req, res) {
        try {
            const { item, vaults } = req.body;

            if (!item || !vaults) {
                return res.status(400).json({ error: 'item e vaults são obrigatórios' });
            }

            console.log('✨ Generating creative brief...');
            const result = await aiGenerationService.generateCreativeBrief(item, vaults);

            res.json({ success: true, data: result });
        } catch (error) {
            console.error('❌ Error generating creative brief:', error);
            res.status(500).json({ error: error.message });
        }
    },

    async inspireVault(req, res) {
        try {
            const { vaultId, currentData, mode = 'all' } = req.body;

            if (!vaultId) {
                return res.status(400).json({ error: 'vaultId é obrigatório' });
            }

            console.log(`✨ Inspiring vault ${vaultId} (mode: ${mode})...`);
            const suggestions = await aiGenerationService.inspireVault(vaultId, currentData, mode);
            console.log(`✅ Generated ${Object.keys(suggestions).length} suggestions for ${vaultId}`);

            res.json({ success: true, suggestions });
        } catch (error) {
            if (error.message?.includes('desconhecido')) {
                return res.status(400).json({ error: error.message });
            }
            console.error('❌ Error inspiring vault:', error);
            res.status(500).json({ error: error.message });
        }
    },

    async generateBrandTheme(req, res) {
        try {
            const { vaults } = req.body;

            if (!vaults) {
                return res.status(400).json({ error: 'vaults é obrigatório' });
            }

            console.log('🎨 Generating brand theme...');
            const theme = await aiGenerationService.generateBrandTheme(vaults);
            console.log(`✅ Generated brand theme: ${theme.fontFamily}, ${theme.primaryColor}`);

            res.json({ success: true, theme });
        } catch (error) {
            console.error('❌ Error generating brand theme:', error);
            res.status(500).json({ error: error.message });
        }
    },

    async generateGovernanceConclusion(req, res) {
        try {
            const { ata } = req.body;

            if (!ata) {
                return res.status(400).json({ error: 'ata é obrigatória' });
            }

            console.log('📊 Generating governance conclusion...');
            const result = await aiGenerationService.generateGovernanceConclusion(ata);

            res.json({ success: true, ...result });
        } catch (error) {
            console.error('❌ Error generating governance conclusion:', error);
            res.status(500).json({ error: error.message });
        }
    }
};
