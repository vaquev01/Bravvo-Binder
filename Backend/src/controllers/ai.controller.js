/**
 * AI Controller - Camada HTTP para endpoints de geração de IA
 * Os endpoints de orchestração (vault/complete, command-center, governance, etc.)
 * permanecem no ai.routes.js por serem fortemente acoplados ao orchestrator.
 * Aqui ficam apenas os endpoints de geração direta com OpenAI.
 */
import { aiGenerationService } from '../services/ai-generation.service.js';
import NodeCache from 'node-cache';
import { redisCache } from '../config/redis.js';
import crypto from 'crypto';

// In-memory fallback cache (used when Redis is unavailable)
const localCache = new NodeCache({ stdTTL: 7200 });

const AI_CACHE_TTL = 7200; // 2 hours

// Unified cache interface: Redis first, NodeCache fallback
const cache = {
    async get(key) {
        const rVal = await redisCache.get(key);
        if (rVal !== null) return rVal;
        return localCache.get(key) ?? null;
    },
    async set(key, value) {
        const stored = await redisCache.set(key, value, AI_CACHE_TTL);
        if (!stored) localCache.set(key, value); // fallback
    }
};

// Helper para gerar cache key baseada no body
const generateCacheKey = (prefix, body) => {
    const hash = crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
    return `ai:${prefix}_${hash}`;
};


export const aiController = {
    async generatePlan(req, res) {
        try {
            const { vaults, kpis, weights } = req.body;

            if (!vaults || Object.keys(vaults).length === 0) {
                return res.status(400).json({ error: 'Vaults são obrigatórios' });
            }

            const cacheKey = generateCacheKey('plan', { vaults, kpis, weights });
            const cachedResponse = await cache.get(cacheKey);

            if (cachedResponse) {
                console.log('⚡ Returning cached AI plan');
                return res.json(cachedResponse);
            }

            console.log('🗓️ Generating plan/roadmap with AI...');
            const result = await aiGenerationService.generatePlan(vaults, kpis, weights);
            console.log(`✅ Generated ${result.tasks?.length || 0} tasks`);

            const responsePayload = {
                success: true,
                tasks: result.tasks || [],
                recommendation: result.recommendation || '',
                generated_at: new Date().toISOString(),
                cached: true
            };

            await cache.set(cacheKey, responsePayload);

            res.json({ ...responsePayload, cached: false });
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

            const cacheKey = generateCacheKey('brief', { item, vaults });
            const cachedResponse = await cache.get(cacheKey);
            if (cachedResponse) {
                console.log('⚡ Returning cached Creative Brief');
                return res.json({ success: true, data: cachedResponse, cached: true });
            }

            console.log('✨ Generating creative brief...');
            const result = await aiGenerationService.generateCreativeBrief(item, vaults);

            await cache.set(cacheKey, result);
            res.json({ success: true, data: result, cached: false });
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

            const cacheKey = generateCacheKey('inspire', { vaultId, currentData, mode });
            const cachedResponse = await cache.get(cacheKey);
            if (cachedResponse) {
                console.log(`⚡ Returning cached inspiration for ${vaultId}`);
                return res.json({ success: true, suggestions: cachedResponse, cached: true });
            }

            console.log(`✨ Inspiring vault ${vaultId} (mode: ${mode})...`);
            const suggestions = await aiGenerationService.inspireVault(vaultId, currentData, mode);
            console.log(`✅ Generated ${Object.keys(suggestions).length} suggestions for ${vaultId}`);

            await cache.set(cacheKey, suggestions);
            res.json({ success: true, suggestions, cached: false });
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

            const cacheKey = generateCacheKey('theme', { vaults });
            const cachedResponse = await cache.get(cacheKey);
            if (cachedResponse) {
                console.log('⚡ Returning cached Brand Theme');
                return res.json({ success: true, theme: cachedResponse, cached: true });
            }

            console.log('🎨 Generating brand theme...');
            const theme = await aiGenerationService.generateBrandTheme(vaults);
            console.log(`✅ Generated brand theme: ${theme.fontFamily}, ${theme.primaryColor}`);

            await cache.set(cacheKey, theme);
            res.json({ success: true, theme, cached: false });
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

            const cacheKey = generateCacheKey('gov_conclusion', { ata });
            const cachedResponse = await cache.get(cacheKey);
            if (cachedResponse) {
                console.log('⚡ Returning cached Governance Conclusion');
                return res.json({ success: true, ...cachedResponse, cached: true });
            }

            console.log('📊 Generating governance conclusion...');
            const result = await aiGenerationService.generateGovernanceConclusion(ata);

            await cache.set(cacheKey, result);
            res.json({ success: true, ...result, cached: false });
        } catch (error) {
            console.error('❌ Error generating governance conclusion:', error);
            res.status(500).json({ error: error.message });
        }
    }
};
