/**
 * AI Routes - Endpoints para orquestração de IA
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
    eventBus,
    EventTypes,
    eventStore,
    getOrchestrator,
    getWeightsManager,
    WEIGHT_PRESETS
} from '../ai/index.js';

const router = Router();

// Middleware para adicionar metadata
const addMetadata = (req, res, next) => {
    req.correlationId = req.headers['x-correlation-id'] || uuidv4();
    req.userId = req.headers['x-user-id'] || 'anonymous';
    next();
};

router.use(addMetadata);

// ============================================
// VAULT ENDPOINTS
// ============================================

/**
 * POST /ai/vaults/:vaultId/complete
 * Marca vault como completo e dispara análise
 */
router.post('/vaults/:vaultId/complete', async (req, res) => {
    try {
        const { vaultId } = req.params;
        const { content } = req.body;

        if (!['V1', 'V2', 'V3', 'V4', 'V5'].includes(vaultId)) {
            return res.status(400).json({ error: 'vaultId inválido. Use V1-V5.' });
        }

        if (!content) {
            return res.status(400).json({ error: 'content é obrigatório' });
        }

        // Emite evento
        const event = await eventBus.emit(EventTypes.VAULT_COMPLETED, {
            vault_id: vaultId,
            content,
            user_id: req.userId
        }, {
            correlation_id: req.correlationId,
            user_id: req.userId
        });

        // Processa via orchestrator
        const orchestrator = getOrchestrator();
        const result = await orchestrator.handleVaultCompleted(event);

        res.json({
            success: result.success,
            event_id: event.event_id,
            analysis: result.success ? {
                analysis_id: result.output.analysis_id,
                completeness_score: result.output.summary?.completeness_score,
                confidence_score: result.output.summary?.confidence_score,
                gaps_count: result.output.gaps?.length || 0,
                questions_count: result.output.validation_questions?.length || 0
            } : null,
            warnings: result.warnings || [],
            error: result.error || null
        });

    } catch (error) {
        console.error('Error in vault complete:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /ai/vaults/:vaultId/analysis
 * Retorna análise do vault
 */
router.get('/vaults/:vaultId/analysis', async (req, res) => {
    try {
        const { vaultId } = req.params;
        const orchestrator = getOrchestrator();
        const state = orchestrator.getFullState();

        const analysis = state.vault_analyses[vaultId];
        if (!analysis) {
            return res.status(404).json({ error: `Análise do ${vaultId} não encontrada` });
        }

        res.json(analysis);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// COMMAND CENTER ENDPOINTS
// ============================================

/**
 * POST /ai/command-center/generate
 * Gera Centro de Comando
 */
router.post('/command-center/generate', async (req, res) => {
    try {
        const { weights, mode = 'initial', vaults } = req.body;

        const orchestrator = getOrchestrator();

        // Se vaults foram enviados, processa apenas V1, V2, V3 (essenciais)
        if (vaults && Object.keys(vaults).length > 0) {
            const essentialVaults = ['V1', 'V2', 'V3'];
            const vaultsToProcess = essentialVaults.filter(v => vaults[v]);
            console.log('📦 Processing essential vaults:', vaultsToProcess);

            for (const vaultId of vaultsToProcess) {
                const content = vaults[vaultId];
                if (content && Object.keys(content).length > 0) {
                    try {
                        console.log(`⏳ Analyzing ${vaultId}...`);
                        const vaultEvent = {
                            event_id: `inline-${vaultId}-${Date.now()}`,
                            event_type: 'vault_completed',
                            payload: { vault_id: vaultId, content, user_id: req.userId },
                            metadata: { correlation_id: req.correlationId, user_id: req.userId }
                        };
                        await orchestrator.handleVaultCompleted(vaultEvent);
                        console.log(`✅ ${vaultId} analyzed`);
                    } catch (vaultError) {
                        console.error(`❌ Error processing ${vaultId}:`, vaultError.message);
                    }
                }
            }
            console.log('📦 Vault processing complete, generating Command Center...');
        }

        const event = await eventBus.emit(EventTypes.GENERATE_COMMAND_CENTER, {
            user_id: req.userId,
            weights,
            mode
        }, {
            correlation_id: req.correlationId,
            user_id: req.userId
        });

        const result = await orchestrator.handleGenerateCommandCenter(event);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                gaps: result.gaps,
                questions: result.questions
            });
        }

        res.json({
            success: true,
            event_id: event.event_id,
            command_center: {
                id: result.output.command_center_id,
                version: result.output.version,
                status: result.output.status,
                kpis_count: result.output.kpis?.length || 0,
                roadmap_phases: result.output.roadmap?.length || 0,
                calendar_events: result.output.calendario?.length || 0
            },
            validation_checklist: result.output.validation_checklist,
            warnings: result.warnings || []
        });

    } catch (error) {
        console.error('Error generating command center:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /ai/command-center
 * Retorna Centro de Comando atual
 */
router.get('/command-center', async (req, res) => {
    try {
        const orchestrator = getOrchestrator();
        const state = orchestrator.getFullState();

        if (!state.command_center) {
            return res.status(404).json({ error: 'Command Center não gerado' });
        }

        res.json(state.command_center);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /ai/command-center/approve
 * Aprova Centro de Comando
 */
router.post('/command-center/approve', async (req, res) => {
    try {
        const orchestrator = getOrchestrator();
        const result = await orchestrator.approveCommandCenter(req.userId);

        res.json({
            success: true,
            command_center_id: result.command_center_id,
            version: result.version,
            status: result.status,
            approved_at: result.approved_at
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// GOVERNANCE ENDPOINTS
// ============================================

/**
 * POST /ai/governance/complete
 * Marca ciclo de governança como completo
 */
router.post('/governance/complete', async (req, res) => {
    try {
        const { cycle_id, cycle_data } = req.body;

        if (!cycle_id || !cycle_data) {
            return res.status(400).json({ error: 'cycle_id e cycle_data são obrigatórios' });
        }

        const event = await eventBus.emit(EventTypes.GOVERNANCE_COMPLETED, {
            cycle_id,
            cycle_data,
            user_id: req.userId
        }, {
            correlation_id: req.correlationId,
            user_id: req.userId
        });

        const orchestrator = getOrchestrator();
        const result = await orchestrator.handleGovernanceCompleted(event);

        res.json({
            success: result.success,
            event_id: event.event_id,
            summary: result.success ? {
                summary_id: result.output.summary_id,
                insights_count: result.output.insights?.length || 0,
                recommendations_count: result.output.next_cycle_recommendations?.length || 0
            } : null,
            error: result.error || null
        });

    } catch (error) {
        console.error('Error completing governance:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /ai/governance/:cycleId/summary
 * Retorna resumo de governança
 */
router.get('/governance/:cycleId/summary', async (req, res) => {
    try {
        const { cycleId } = req.params;
        const orchestrator = getOrchestrator();
        const state = orchestrator.getFullState();

        const summary = state.governance_summaries[cycleId];
        if (!summary) {
            return res.status(404).json({ error: `Resumo do ciclo ${cycleId} não encontrado` });
        }

        res.json(summary);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// RECALIBRATION ENDPOINTS
// ============================================

/**
 * POST /ai/recalibrate
 * Recalibra Centro de Comando
 */
router.post('/recalibrate', async (req, res) => {
    try {
        const { cycle_id, config } = req.body;

        const event = await eventBus.emit(EventTypes.RECALIBRATE_COMMAND_CENTER, {
            cycle_id,
            triggered_by: 'manual',
            recalibration_config: config || { aggressiveness: 'moderate' },
            user_id: req.userId
        }, {
            correlation_id: req.correlationId,
            user_id: req.userId
        });

        const orchestrator = getOrchestrator();
        const result = await orchestrator.handleRecalibrateCommandCenter(event);

        res.json({
            success: result.success,
            event_id: event.event_id,
            recalibration: result.success ? {
                new_version: result.output.recalibrated_command_center?.version,
                total_changes: result.output.recalibration_summary?.total_changes || 0,
                major_shifts: result.output.recalibration_summary?.major_shifts?.length || 0
            } : null,
            changelog: result.output?.changelog,
            validation_required: result.output?.validation_required,
            error: result.error || null
        });

    } catch (error) {
        console.error('Error recalibrating:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /ai/recalibrate/apply
 * Aplica recalibração aprovada
 */
router.post('/recalibrate/apply', async (req, res) => {
    try {
        const { recalibration_result } = req.body;

        if (!recalibration_result) {
            return res.status(400).json({ error: 'recalibration_result é obrigatório' });
        }

        const orchestrator = getOrchestrator();
        const result = await orchestrator.applyRecalibration(recalibration_result, req.userId);

        res.json({
            success: true,
            command_center_id: result.command_center_id,
            version: result.version,
            status: result.status
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// WEIGHTS ENDPOINTS
// ============================================

/**
 * GET /ai/weights
 * Retorna pesos atuais
 */
router.get('/weights', (req, res) => {
    const weightsManager = getWeightsManager();
    res.json({
        weights: weightsManager.getWeights(),
        history: weightsManager.getHistory(),
        presets: WEIGHT_PRESETS
    });
});

/**
 * PUT /ai/weights
 * Atualiza pesos
 */
router.put('/weights', (req, res) => {
    try {
        const { weights, reason } = req.body;

        if (!weights) {
            return res.status(400).json({ error: 'weights é obrigatório' });
        }

        const weightsManager = getWeightsManager();
        const updated = weightsManager.update(weights, reason || 'Manual update');

        res.json({
            success: true,
            weights: updated
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * POST /ai/weights/preset
 * Aplica preset de pesos
 */
router.post('/weights/preset', (req, res) => {
    try {
        const { preset_name } = req.body;

        if (!preset_name) {
            return res.status(400).json({ error: 'preset_name é obrigatório' });
        }

        const weightsManager = getWeightsManager();
        const updated = weightsManager.applyPreset(preset_name);

        res.json({
            success: true,
            weights: updated,
            preset_applied: preset_name
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// GAPS ENDPOINTS
// ============================================

/**
 * GET /ai/gaps/detect
 * Executa detecção de gaps
 */
router.get('/gaps/detect', async (req, res) => {
    try {
        const orchestrator = getOrchestrator();
        const result = await orchestrator.runGapDetection(req.correlationId, req.userId);

        res.json({
            success: result.success,
            detection: result.success ? {
                detection_id: result.output.detection_id,
                gaps_count: result.output.gaps?.length || 0,
                critical_gaps: result.output.gaps?.filter(g => g.severidade === 'critical').length || 0,
                questions_count: result.output.questions_for_humans?.length || 0,
                health_score: result.output.health_score
            } : null,
            gaps: result.output?.gaps,
            questions: result.output?.questions_for_humans,
            error: result.error || null
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// STATE & EVENTS ENDPOINTS
// ============================================

/**
 * GET /ai/state
 * Retorna estado do sistema
 */
router.get('/state', (req, res) => {
    const orchestrator = getOrchestrator();
    res.json(orchestrator.getState());
});

/**
 * GET /ai/events
 * Retorna histórico de eventos
 */
router.get('/events', async (req, res) => {
    try {
        const { type, limit = 50 } = req.query;

        let events;
        if (type) {
            events = await eventStore.findByType(type, { limit: parseInt(limit) });
        } else {
            events = await eventStore.getAll();
            events = events.slice(-parseInt(limit));
        }

        res.json({
            count: events.length,
            events
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /ai/events/stats
 * Estatísticas de eventos
 */
router.get('/events/stats', async (req, res) => {
    try {
        const stats = await eventStore.getStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// CONTEXT ENDPOINT
// ============================================

/**
 * GET /ai/context
 * Retorna contexto de calendário
 */
router.get('/context', (req, res) => {
    const orchestrator = getOrchestrator();
    const state = orchestrator.getFullState();

    if (!state.calendar_context) {
        return res.status(404).json({ error: 'Contexto não sintetizado. Complete o Vault 1 primeiro.' });
    }

    res.json(state.calendar_context);
});

// ============================================
// PLAN/ROADMAP GENERATION ENDPOINT
// ============================================

/**
 * POST /ai/generate-plan
 * Gera plano/roadmap com IA baseado nos vaults
 */
router.post('/generate-plan', async (req, res) => {
    try {
        const { vaults, kpis, weights } = req.body;

        if (!vaults || Object.keys(vaults).length === 0) {
            return res.status(400).json({ error: 'Vaults são obrigatórios' });
        }

        console.log('🗓️ Generating plan/roadmap with AI...');

        const orchestrator = getOrchestrator();

        // Build context from vaults
        const vaultContext = Object.entries(vaults).map(([key, value]) => {
            const data = value?.raw_data || value?.fields || value;
            return `${key}: ${JSON.stringify(data)}`;
        }).join('\n');

        // Use OpenAI directly for plan generation
        const OpenAI = (await import('openai')).default;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
            model: process.env.AI_MODEL || 'gpt-4o',
            temperature: 0.7,
            messages: [
                {
                    role: 'system',
                    content: `Você é um estrategista de marketing digital. Gere um plano tático de 7 dias baseado nos dados do cliente.
                    
Retorne APENAS um JSON válido com esta estrutura:
{
    "tasks": [
        {
            "title": "Título da tarefa",
            "description": "Descrição curta",
            "channel": "instagram|youtube|email|whatsapp|blog",
            "responsible": "Time",
            "priority": "high|medium|low"
        }
    ],
    "recommendation": "Uma recomendação estratégica geral"
}`
                },
                {
                    role: 'user',
                    content: `Dados do cliente:\n${vaultContext}\n\nGere um plano de 5-7 tarefas para a próxima semana.`
                }
            ]
        });

        const responseText = completion.choices[0]?.message?.content || '';

        // Parse JSON from response
        let result;
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            result = jsonMatch ? JSON.parse(jsonMatch[0]) : { tasks: [], recommendation: '' };
        } catch (parseError) {
            console.error('Error parsing AI response:', parseError);
            result = { tasks: [], recommendation: responseText };
        }

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
});

/**
 * POST /ai/generate-creative-brief
 * Gera brief criativo para um item do roadmap
 */
router.post('/generate-creative-brief', async (req, res) => {
    try {
        const { item, vaults } = req.body;

        if (!item || !vaults) {
            return res.status(400).json({ error: 'item e vaults são obrigatórios' });
        }

        console.log('✨ Generating creative brief...');

        const OpenAI = (await import('openai')).default;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const vaultContext = Object.entries(vaults).map(([key, value]) => {
            const data = value?.raw_data || value?.fields || value;
            return `${key}: ${JSON.stringify(data)}`;
        }).join('\n');

        const completion = await openai.chat.completions.create({
            model: process.env.AI_MODEL || 'gpt-4o',
            temperature: 0.8,
            messages: [
                {
                    role: 'system',
                    content: `Você é um copywriter criativo. Gere um brief para criação de conteúdo.
                    
Retorne APENAS um JSON válido:
{
    "aiPrompt": "Prompt detalhado para a IA gerar o conteúdo",
    "humanGuide": "Guia para o humano criar/revisar",
    "hooks": ["Hook 1", "Hook 2", "Hook 3"],
    "cta": "Call to action sugerido"
}`
                },
                {
                    role: 'user',
                    content: `Item: ${JSON.stringify(item)}\n\nContexto do cliente:\n${vaultContext}`
                }
            ]
        });

        const responseText = completion.choices[0]?.message?.content || '';

        let result;
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
        } catch {
            result = { aiPrompt: responseText, humanGuide: '', hooks: [], cta: '' };
        }

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('❌ Error generating creative brief:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /ai/inspire-vault
 * Gera conteúdo inspirado para preencher campos de um Vault
 */
router.post('/inspire-vault', async (req, res) => {
    try {
        const { vaultId, currentData, mode = 'all' } = req.body;

        if (!vaultId) {
            return res.status(400).json({ error: 'vaultId é obrigatório' });
        }

        console.log(`✨ Inspiring vault ${vaultId} (mode: ${mode})...`);

        // Schema de campos por Vault
        const SCHEMAS = {
            s1: {
                fields: ['clientName', 'niche', 'tagline', 'scope', 'location', 'promise', 'enemy', 'brandValues', 'audienceAge', 'audienceClass', 'audiencePain', 'archetype', 'tone', 'mood', 'bio'],
                context: "Identidade da Marca, Nicho e Público"
            },
            s2: {
                fields: ['products', 'heroProduct', 'heroPrice', 'currentTicket', 'targetTicket', 'currentRevenue', 'competitor1', 'competitor2', 'competitor3'],
                context: "Oferta, Produtos e Financeiro"
            },
            s3: {
                fields: ['businessType', 'channels', 'trafficSource', 'trafficVolume', 'conversionRate', 'cpl', 'ctas'],
                context: "Funil de Vendas e Tráfego"
            },
            s4: {
                fields: ['postingFrequency', 'bestDays', 'bestTimes', 'cycleDuration', 'stakeholders', 'teamMembers'],
                context: "Operação, Time e Rotina"
            },
            s5: {
                fields: ['ideas', 'notepad', 'inspirations'],
                context: "Banco de Ideias e Anotações"
            }
        };

        const vaultName = vaultId.toLowerCase();
        const schema = SCHEMAS[vaultName];
        if (!schema) {
            return res.status(400).json({ error: `Vault ${vaultId} desconhecido` });
        }

        // Determinar campos a preencher
        let fieldsToFill = schema.fields;
        if (mode === 'empty') {
            fieldsToFill = schema.fields.filter(f => {
                const val = currentData?.[f];
                return val === null || val === undefined || val === '' || (Array.isArray(val) && val.length === 0);
            });
            if (fieldsToFill.length === 0) {
                return res.json({ success: true, suggestions: {} });
            }
        }

        const OpenAI = (await import('openai')).default;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
            model: process.env.AI_MODEL || 'gpt-4o',
            temperature: 0.7,
            response_format: { type: "json_object" },
            messages: [
                {
                    role: 'system',
                    content: `Você é um especialista em Branding e Negócios. Gere conteúdo criativo e profissional em português brasileiro.`
                },
                {
                    role: 'user',
                    content: `Preencha os campos do formulário "${schema.context}" (Vault ${vaultId.toUpperCase()}).

MODO: ${mode === 'all' ? 'CRIATIVO (Sugerir conceito completo)' : 'COMPLETAR (Preencher lacunas mantendo coerência)'}

DADOS ATUAIS:
${JSON.stringify(currentData || {}, null, 2)}

CAMPOS A PREENCHER:
${fieldsToFill.join(', ')}

DIRETRIZES:
1. Mantenha coerência total com os dados já existentes
2. Se 'clientName' estiver vazio, invente um nome criativo de negócio
3. Para campos de lista (arrays), retorne um array JSON
4. Seja criativo mas realista

Responda APENAS com um JSON válido contendo os campos solicitados.`
                }
            ]
        });

        const responseText = completion.choices[0]?.message?.content || '{}';

        let suggestions;
        try {
            suggestions = JSON.parse(responseText);
        } catch {
            suggestions = {};
        }

        console.log(`✅ Generated ${Object.keys(suggestions).length} suggestions for ${vaultId}`);

        res.json({
            success: true,
            suggestions
        });

    } catch (error) {
        console.error('❌ Error inspiring vault:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /ai/generate-brand-theme
 * Gera tema visual baseado no DNA da marca
 */
router.post('/generate-brand-theme', async (req, res) => {
    try {
        const { vaults } = req.body;

        if (!vaults) {
            return res.status(400).json({ error: 'vaults é obrigatório' });
        }

        console.log('🎨 Generating brand theme...');

        // Extract brand data
        const s1 = vaults.S1 || vaults.s1 || {};
        const brandData = s1.fields || s1.raw_data || s1;

        const locationContext = brandData.scope?.toLowerCase() !== 'global' && brandData.location
            ? `\nContexto Local:\nEsta é uma marca ${brandData.scope} em ${brandData.location}. Considere a estética local se relevante.`
            : '';

        const OpenAI = (await import('openai')).default;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
            model: process.env.AI_MODEL || 'gpt-4o',
            temperature: 0.7,
            response_format: { type: "json_object" },
            messages: [
                {
                    role: 'system',
                    content: 'Você é um Diretor de Arte Sênior e Especialista em Branding.'
                },
                {
                    role: 'user',
                    content: `Analise o DNA desta marca e crie uma identidade visual digital coesa para o sistema operacional da empresa.

## DNA da Marca
- Nome: ${brandData.clientName || brandData.name || 'Empresa desconhecida'}
- Nicho: ${brandData.niche || 'Geral'}
- Tom de Voz: ${Array.isArray(brandData.tone) ? brandData.tone.join(', ') : brandData.tone || 'Neutro'}
- Arquétipo: ${brandData.archetype || 'Profissional'}
- Valores: ${Array.isArray(brandData.brandValues) ? brandData.brandValues.join(', ') : 'Qualidade'}
${locationContext}

## Sua Tarefa
Gere um JSON com as cores e tipografia ideais para o Dashboard dessa marca.
As opções de fonte são ESTRITAMENTE: 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Playfair Display', 'Courier Prime'.

Responda APENAS com este JSON exato:
{
  "primaryColor": "#HEXCODE (Cor principal para textos, fundos escuros e headers)",
  "accentColor": "#HEXCODE (Cor vibrante para botões, destaques e call-to-actions)",
  "fontFamily": "Nome Da Fonte (escolha da lista acima)",
  "reasoning": "Uma frase curta explicando a escolha estética."
}`
                }
            ]
        });

        const responseText = completion.choices[0]?.message?.content || '{}';

        let theme;
        try {
            theme = JSON.parse(responseText);

            // Validate font
            const validFonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Playfair Display', 'Courier Prime'];
            if (!validFonts.includes(theme.fontFamily)) {
                theme.fontFamily = 'Inter';
            }
        } catch {
            theme = {
                primaryColor: '#1a1a2e',
                accentColor: '#6366f1',
                fontFamily: 'Inter',
                reasoning: 'Tema padrão aplicado'
            };
        }

        console.log(`✅ Generated brand theme: ${theme.fontFamily}, ${theme.primaryColor}`);

        res.json({
            success: true,
            theme
        });

    } catch (error) {
        console.error('❌ Error generating brand theme:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /ai/generate-governance-conclusion
 * Gera conclusão executiva pós-governança
 */
router.post('/generate-governance-conclusion', async (req, res) => {
    try {
        const { ata } = req.body;

        if (!ata) {
            return res.status(400).json({ error: 'ata é obrigatória' });
        }

        console.log('📊 Generating governance conclusion...');

        const OpenAI = (await import('openai')).default;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
            model: process.env.AI_MODEL || 'gpt-4o',
            temperature: 0.5,
            messages: [
                {
                    role: 'system',
                    content: `Você é um consultor executivo analisando uma ata de governança.
                    
Retorne APENAS JSON:
{
    "conclusion_summary": "Conclusão em 2-3 frases",
    "next_steps": ["Passo 1", "Passo 2", "Passo 3"]
}`
                },
                {
                    role: 'user',
                    content: `Ata da reunião:\n${JSON.stringify(ata)}`
                }
            ]
        });

        const responseText = completion.choices[0]?.message?.content || '';

        let result;
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
        } catch {
            result = { conclusion_summary: responseText, next_steps: [] };
        }

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('❌ Error generating governance conclusion:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
