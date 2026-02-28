/**
 * BRAVVO AI SERVICE
 * 
 * Centraliza toda a inteligência do sistema.
 * Suporta: OpenAI (GPT-4o), Anthropic (Claude), Google (Gemini) e templates locais.
 */

import { generatePrompt as generateIDFPrompt } from '../utils/promptGenerator';

const MOCK_DELAY = 800; // Simula latência de rede para sensação de "pensando"

// Configuração padrão
const DEFAULT_CONFIG = {
    provider: 'openai', // 'openai' | 'anthropic' | 'gemini'
    model: {
        openai: 'gpt-4o',
        anthropic: 'claude-3-5-sonnet-20241022',
        gemini: 'gemini-2.0-flash' // Modelo rápido e eficiente
    },
    maxTokens: 2000,
    temperature: 0.7
};

// Key removida para segurança no deploy
// O usuário deve configurar via UI
const DEMO_KEY = '';

// Endpoints das APIs
const API_ENDPOINTS = {
    openai: 'https://api.openai.com/v1/chat/completions',
    anthropic: 'https://api.anthropic.com/v1/messages',
    gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
};

class AIService {
    constructor() {
        this.provider = 'local_rule_engine'; // 'openai' | 'anthropic' | 'gemini' | 'local_rule_engine'
    }

    // ========== CONFIGURAÇÃO DE IA ==========

    /**
     * Detects provider from API key prefix
     */
    detectProviderFromKey(key) {
        if (!key) return null;
        if (key.startsWith('AIzaSy')) return 'gemini';
        if (key.startsWith('sk-ant-')) return 'anthropic';
        if (key.startsWith('sk-')) return 'openai';
        return null;
    }

    /**
     * Obtém a configuração de IA do localStorage ou usa padrão
     * Includes auto-detection of provider from API key prefix as fallback
     */
    getAIConfig() {
        const stored = localStorage.getItem('bravvo_ai_config');
        if (stored) {
            try {
                const config = JSON.parse(stored);

                // Auto-correct provider if key prefix doesn't match stored provider
                const detectedProvider = this.detectProviderFromKey(config.apiKey);
                if (detectedProvider && detectedProvider !== config.provider) {
                    console.warn(`Provider mismatch: stored=${config.provider}, detected=${detectedProvider}. Using detected.`);
                    config.provider = detectedProvider;
                    // Auto-fix in localStorage for future calls
                    this.saveAIConfig(config);
                }

                return config;
            } catch {
                console.warn('Configuração de IA inválida, usando padrão.');
            }
        }

        // Fallback para garantir funcionamento imediato
        return {
            provider: 'gemini', // Changed default to Gemini (free tier focus)
            apiKey: DEMO_KEY,
            model: DEFAULT_CONFIG.model.gemini
        };
    }

    /**
     * Salva a configuração de IA no localStorage
     */
    saveAIConfig(config) {
        localStorage.setItem('bravvo_ai_config', JSON.stringify(config));
    }

    /**
     * Verifica se a API Key está configurada
     */
    isAIConfigured() {
        const config = this.getAIConfig();
        return config && config.apiKey && config.apiKey.length > 10;
    }

    // ========== CHAMADAS DE API ==========

    /**
     * Faz a chamada para a API da OpenAI
     */
    async callOpenAI(prompt, apiKey) {
        const response = await fetch(API_ENDPOINTS.openai, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: DEFAULT_CONFIG.model.openai,
                messages: [
                    {
                        role: 'system',
                        content: 'Você é um assistente de marketing estratégico. Sempre responda em JSON válido.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: DEFAULT_CONFIG.maxTokens,
                temperature: DEFAULT_CONFIG.temperature
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `OpenAI API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content;
    }

    /**
     * Faz a chamada para a API da Anthropic
     */
    async callAnthropic(prompt, apiKey) {
        const response = await fetch(API_ENDPOINTS.anthropic, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: DEFAULT_CONFIG.model.anthropic,
                max_tokens: DEFAULT_CONFIG.maxTokens,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `Anthropic API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.content[0]?.text;
    }

    /**
     * Faz a chamada para a API do Google Gemini
     */
    async callGemini(prompt, apiKey) {
        const url = `${API_ENDPOINTS.gemini}?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${prompt}\n\nIMPORTANTE: Responda APENAS com JSON válido. Não use blocos de código markdown.`
                    }]
                }]
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `Gemini API Error: ${response.status} - ${error.error?.status || ''}`);
        }

        const data = await response.json();
        return data.candidates[0]?.content?.parts[0]?.text;
    }

    /**
     * Testa a conexão com a API de IA
     */
    async testAIConnection(provider, apiKey) {
        try {
            const testPrompt = 'Responda apenas com: {"status": "ok"}';
            let response;

            if (provider === 'openai') {
                response = await this.callOpenAI(testPrompt, apiKey);
            } else if (provider === 'anthropic') {
                response = await this.callAnthropic(testPrompt, apiKey);
            } else if (provider === 'gemini') {
                response = await this.callGemini(testPrompt, apiKey);
            } else {
                throw new Error('Provedor de IA não suportado');
            }

            return { success: true, message: 'Conexão estabelecida com sucesso!' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // ========== GERAÇÃO DE PLANO COM IA ==========

    /**
     * Gera conteúdo para preencher um Vault específico
     * @param {string} vaultId - 's1' | 's2' | 's3' | 's4' | 's5'
     * @param {object} currentData - Dados atuais do formulário
     * @param {string} mode - 'all' (Sugerir tudo do zero) | 'empty' (Preencher apenas vazios)
     */
    async generateVaultContent(vaultId, currentData = {}, mode = 'all') {
        const config = this.getAIConfig();
        const vaultName = vaultId.toLowerCase();

        // Schema de campos por Vault (para guiar a IA)
        const SCHEMAS = {
            s1: {
                fields: ['clientName', 'niche', 'tagline', 'scope', 'location', 'promise', 'enemy', 'brandValues', 'audienceAge', 'audienceClass', 'audiencePain', 'archetype', 'tone', 'mood', 'bio'],
                context: "Identidade da Marca, Nicho e Público"
            },
            s2: {
                fields: ['products', 'currentTicket', 'targetTicket', 'currentRevenue'],
                context: "Oferta, Produtos e Financeiro"
            },
            s3: {
                fields: ['trafficSource', 'trafficVolume', 'conversionRate', 'ctas'],
                context: "Funil de Vendas e Tráfego"
            },
            s4: {
                fields: ['postingFrequency', 'bestDays', 'bestTimes', 'cycleDuration', 'stakeholders'],
                context: "Operação e Rotina"
            },
            s5: {
                fields: ['ideas', 'notepad'],
                context: "Banco de Ideias e Anotações"
            }
        };

        const schema = SCHEMAS[vaultName];
        if (!schema) throw new Error(`Vault ${vaultId} desconhecido`);

        // Determinar quais campos preencher
        let fieldsToFill = schema.fields;
        if (mode === 'empty') {
            fieldsToFill = schema.fields.filter(f => {
                const val = currentData[f];
                return val === null || val === undefined || val === '' || (Array.isArray(val) && val.length === 0);
            });
            if (fieldsToFill.length === 0) return {}; // Nada a preencher
        }

        const prompt = `
Você é um especialista em Branding e Negócios.
Sua tarefa é preencher os campos do formulário "${schema.context}" (Vault ${vaultId.toUpperCase()}).

MODO: ${mode === 'all' ? 'CRIATIVO (Sugerir conceito completo)' : 'COMPLETAR (Preencher lacunas mantendo coerência)'}

DADOS ATUAIS (Contexto):
${JSON.stringify(currentData, null, 2)}

CAMPOS A PREENCHER (Gere conteúdo para estes campos):
${fieldsToFill.join(', ')}

DIRETRIZES:
1. Mantenha coerência total com os dados já existentes (ex: se Nicho é 'Pizzaria', não sugira 'Vender Sapatos').
2. Se o campo for 'clientName' e estiver vazio, invente um nome criativo.
3. Se 'scope' for vazio, assuma 'local' se não houver dicas contrárias.
4. Para campos de lista (arrays), retorne um array JSON.

Responda APENAS com um JSON contendo os campos solicitados:
{
    "${fieldsToFill[0]}": "..."
}
`;

        try {
            let responseText = '';

            if (config.provider === 'openai') {
                const response = await fetch(API_ENDPOINTS.openai, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
                    body: JSON.stringify({
                        model: config.model || 'gpt-4o',
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.7,
                        response_format: { type: "json_object" }
                    })
                });
                const data = await response.json();
                if (data.error) throw new Error(data.error.message);
                responseText = data.choices[0].message.content;

            } else if (config.provider === 'gemini') {
                responseText = await this.callGemini(prompt, config.apiKey);
            } else if (config.provider === 'anthropic') {
                // Implementar se necessário, usando fallback por enquanto ou erro
                throw new Error('Anthropic não implementado para Inspire Me ainda.');
            }

            return JSON.parse(responseText);

        } catch (error) {
            console.error('Erro no Inspire Me:', error);
            // Fallback silencioso ou rethrow? Rethrow para UI tratar.
            throw error;
        }
    }

    /**
     * Extrai dados relevantes dos Vaults para enviar à IA
     */
    extractVaultsData(vaults, activeKpis = [], lastGovernance = null, governanceHistory = []) {
        return {
            currentKpis: activeKpis, // [ {id, label, value}, ... ]
            brand: {
                name: vaults?.s1?.brandName || vaults?.s1?.name || vaults?.S1?.fields?.brandName,
                voiceTone: vaults?.s1?.voiceTone || vaults?.S1?.fields?.tone?.join(', '),
                personality: vaults?.s1?.personality || vaults?.S1?.fields?.personality?.join(', '),
                differentials: vaults?.s1?.differentials || vaults?.S1?.fields?.differentials,
                colors: [vaults?.s1?.primaryColor, vaults?.s1?.accentColor].filter(Boolean),
                // NEW: Geo-Aware Fields
                niche: vaults?.s1?.niche || vaults?.S1?.fields?.niche || 'Geral',
                scope: vaults?.s1?.scope || vaults?.S1?.fields?.scope || 'Local',
                location: vaults?.s1?.location || vaults?.S1?.fields?.location || 'Não informado'
            },
            offer: {
                products: vaults?.s2?.products || vaults?.S2?.fields?.products || [],
                currentTicket: vaults?.s2?.currentTicket || vaults?.S2?.fields?.avgTicket,
                targetTicket: vaults?.s2?.targetTicket || vaults?.S2?.fields?.targetTicket,
                currentRevenue: vaults?.s2?.currentRevenue || vaults?.S2?.fields?.monthlyRevenue
            },
            funnel: {
                trafficSource: vaults?.s3?.trafficSource || vaults?.S3?.fields?.trafficSource,
                trafficVolume: vaults?.s3?.trafficVolume || vaults?.S3?.fields?.monthlyTraffic,
                ctas: vaults?.s3?.ctas || vaults?.S3?.fields?.ctas || [],
                conversionRate: vaults?.s3?.conversionRate || vaults?.S3?.fields?.conversionRate,
                businessType: vaults?.s3?.businessType || vaults?.S3?.fields?.businessType || 'Digital',
                customMetrics: vaults?.s3?.customMetrics || vaults?.S3?.fields?.customMetrics || []
            },
            ops: {
                postingFrequency: vaults?.s4?.postingFrequency || vaults?.S4?.fields?.postingFrequency,
                bestDays: vaults?.s4?.bestDays || vaults?.S4?.fields?.bestDays || [],
                bestTimes: vaults?.s4?.bestTimes || vaults?.S4?.fields?.bestTimes || [],
                cycleDuration: vaults?.s4?.cycleDuration || vaults?.S4?.fields?.cycleDuration,
                stakeholders: vaults?.s4?.stakeholders || vaults?.S4?.fields?.stakeholders || []
            },
            ideas: {
                ideas: vaults?.s5?.ideas || vaults?.S5?.ideas || [],
                notepad: vaults?.s5?.notepad || vaults?.S5?.notepad
            },
            governance: lastGovernance ? {
                date: lastGovernance.date || lastGovernance.ts,
                kpis: lastGovernance.kpis || {}, // Legacy KPIs support
                currentKpis: activeKpis, // New 4-KPIs Array
                decisions: lastGovernance.decisions || [],
                score: lastGovernance.score
            } : null,
            history: governanceHistory // Pass full history for weighted analysis
        };
    }

    /**
     * Monta o prompt estruturado com os dados dos Vaults e PESOS ESTRATÉGICOS
     */
    buildPlanPrompt(vaultsData, weights = { strategy: 50, lastGov: 30, history: 20 }) {
        const { brand, offer, funnel, ops, ideas, governance, history } = vaultsData;

        // 1. Contexto Estratégico (Vaults) - Base Forte (50%)
        // Já está nos dados detalhados abaixo.

        // 2. Contexto da Última Governança (30%)
        let governanceContext = '';
        if (governance) {
            governanceContext = `
### ÚLTIMA GOVERNANÇA (Peso ${weights.lastGov}% - Alta Relevância Recente):
Data: ${governance.date ? new Date(governance.date).toLocaleDateString() : 'Recente'}
- Score Anterior: ${governance.score || 'N/A'}/100
- Decisões Recentes: ${Array.isArray(governance.decisions) ? governance.decisions.map(d => d.text || d).join('; ') : 'Nenhuma'}
- Performance Imediata: ${JSON.stringify(governance.kpis)}

IMPORTANTE: Dê um peso de ${weights.lastGov}% para corrigir ou continuar o que foi decidido aqui.
`;
        }

        // 3. Contexto Histórico (20%) - Padrões Recorrentes
        let historyContext = '';
        if (history && history.length > 0) {
            // Pega os últimos 3 ciclos anteriores ao atual
            const relevantHistory = history.slice(0, 3);
            const patterns = relevantHistory.map(h => `- Ciclo de ${new Date(h.date).toLocaleDateString()}: Score ${h.score}`).join('\n');

            historyContext = `
### HISTÓRICO ANTERIOR (Peso ${weights.history}% - Padrões de Longo Prazo):
${patterns}
IMPORTANTE: Dê um peso de ${weights.history}% para identificar e reforçar padrões que vêm funcionando (ou falhando) repetidamente nas semanas anteriores.
`;
        }


        // NEW: Location Context (Geo-Awareness)
        let locationContext = '';
        if (brand.scope && brand.scope.toLowerCase() !== 'global') {
            locationContext = `
### Contexto Geográfico:
- Abrangência: ${brand.scope}
- Localização Base: ${brand.location}
IMPORTANTE: Como o negócio é ${brand.scope}, considere feriados, eventos e logística específicos da região de ${brand.location}.
`;
        }

        return `Você é um Strategist AI (Bravvo OS). Sua missão é gerar um plano tático com a seguinte PONDERAÇÃO RÍGIDA de fontes de informação:
1. ${weights.strategy}% ESTRATÉGIA ATUAL (Vaults): O DNA da marca, oferta e recursos atuais.
2. ${weights.lastGov}% ÚLTIMA GOVERNANÇA: Correções imediatas e momentum da semana passada.
3. ${weights.history}% HISTÓRICO: Tendências de médio prazo.

Analise os dados abaixo e gere:
1. Um plano de ação tático com 5-10 tarefas específicas para o próximo ciclo (semanal).
2. Os 3-5 KPIs mais importantes para esse negócio monitorar.
3. Uma recomendação estratégica geral baseada na ponderação acima.

## 0. PLACAR ATUAL (Relevância Crítica - Situação Real)
${(vaultsData.currentKpis || []).map(k => `- ${k.label}: ${k.value}`).join('\n')}

## 1. ESTRATÉGIA ATUAL (Vaults - Peso ${weights.strategy}%)

### S1 - Marca:
- Nome: ${brand?.name || 'Não informado'}
- Nicho: ${brand?.niche || 'Geral'}
- Tom de Voz: ${brand?.voiceTone || 'Não informado'}
- Personalidade: ${brand?.personality || 'Não informado'}
- Diferenciais: ${brand?.differentials || 'Não informado'}
- Cores: ${brand?.colors?.join(', ') || 'Não informado'}
${locationContext}

### S2 - Oferta:
- Produtos/Serviços: ${JSON.stringify(offer?.products || [])}
- Ticket Médio Atual: R$ ${offer?.currentTicket || 'Não informado'}
- Ticket Objetivo: R$ ${offer?.targetTicket || 'Não informado'}
- Faturamento Atual: R$ ${offer?.currentRevenue || 'Não informado'}

### S3 - Funil de Vendas:
- Canal Principal de Tráfego: ${funnel?.trafficSource || 'Não informado'}
- Volume Estimado de Visitas: ${funnel?.trafficVolume || 'Não informado'}
- CTAs Principais: ${Array.isArray(funnel?.ctas) ? funnel.ctas.join(', ') : (funnel?.ctas || 'Não informado')}
- Taxa de Conversão: ${funnel?.conversionRate || 'Não informado'}%
- Modelo de Negócio: ${funnel?.businessType || 'Digital'}
- KPIs do Funil: ${JSON.stringify(funnel?.customMetrics || [])}

### S4 - Operação:
- Frequência de Postagem: ${ops?.postingFrequency || 'Não informado'}
- Melhores Dias: ${Array.isArray(ops?.bestDays) ? ops.bestDays.join(', ') : (ops?.bestDays || 'Não informado')}
- Melhores Horários: ${Array.isArray(ops?.bestTimes) ? ops.bestTimes.join(', ') : (ops?.bestTimes || 'Não informado')}
- Duração do Ciclo: ${ops?.cycleDuration || 7} dias
- Equipe/Stakeholders: ${JSON.stringify(ops?.stakeholders || [])}

### S5 - Banco de Ideias:
- Ideias Registradas: ${ideas?.ideas?.map(i => i.title || i.text || i).join(', ') || 'Nenhuma'}

${governanceContext}

${historyContext}

## Instruções de Saída:
Responda APENAS com o seguinte JSON (sem markdown):
- Notas Estratégicas: ${ideas?.notepad || 'Nenhuma'}

---

IMPORTANTE: Responda APENAS com um JSON válido, sem markdown, sem explicações adicionais. Use este formato exato:

{
  "tasks": [
    {
      "title": "Título da tarefa",
      "description": "Descrição detalhada do que fazer",
      "priority": "high",
      "category": "Conteúdo",
      "estimatedHours": 2
    }
  ],
  "kpis": [
    {
      "name": "Nome do KPI",
      "target": "Meta específica (ex: 1000 seguidores)",
      "frequency": "weekly",
      "rationale": "Por que esse KPI é importante"
    }
  ],
  "recommendation": "Recomendação estratégica geral em 2-3 frases."
}`;
    }

    /**
     * Parseia a resposta da IA em formato estruturado
     */
    parseAIResponse(responseText) {
        // Remove possíveis marcadores de código markdown
        let cleaned = responseText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        try {
            const parsed = JSON.parse(cleaned);

            // Valida estrutura básica
            if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
                parsed.tasks = [];
            }
            if (!parsed.kpis || !Array.isArray(parsed.kpis)) {
                parsed.kpis = [];
            }
            if (!parsed.recommendation) {
                parsed.recommendation = '';
            }

            return parsed;
        } catch (e) {
            console.error('Erro ao parsear resposta da IA:', e);
            console.log('Resposta bruta recebida:', responseText);
            throw new Error('A resposta da IA não está em formato JSON válido.');
        }
    }

    /**
     * Gera plano de ação e KPIs usando IA
     * @param {Object} vaults - Dados dos Vaults (s1, s2, s3, s4, s5 ou S1, S2, etc)
     // @param {Array} kpis - Array of current KPI objects {id, label, value}
     * @returns {Promise<{tasks: Array, kpis: Array, recommendation: string}>}
     */
    async generatePlanWithAI(vaults, kpis = [], lastGovernance = null, governanceHistory = [], weights = null) {
        if (!this.isAIConfigured()) {
            throw new Error("AI not configured");
        }

        // Extrai dados relevantes dos vaults
        const vaultsData = this.extractVaultsData(vaults, kpis, lastGovernance, governanceHistory);

        // Monta o prompt
        const prompt = this.buildPlanPrompt(vaultsData, weights || this.getWeights());

        console.log("Generating plan with AI...", this.provider);

        // Faz a chamada para a API
        let responseText;
        if (config.provider === 'openai') {
            responseText = await this.callOpenAI(prompt, config.apiKey);
        } else if (config.provider === 'anthropic') {
            responseText = await this.callAnthropic(prompt, config.apiKey);
        } else if (config.provider === 'gemini') {
            responseText = await this.callGemini(prompt, config.apiKey);
        } else {
            throw new Error('Provedor de IA não suportado');
        }

        // Parseia a resposta
        const result = this.parseAIResponse(responseText);

        return result;
    }

    /**
     * Gera um prompt estruturado baseado no Vault do cliente
     * @param {Object} item - O item do plano (post, reel, etc)
     * @param {Object} vaults - O contexto completo dos Vaults (S1..S5)
     * @returns {Promise<{aiPrompt: string, humanGuide: string}>}
     */
    async generateCreativeBrief(item, vaults) {
        // Simula uma chamada assíncrona (como seria com uma API real)
        await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

        try {
            // Hoje usamos o gerador baseado em regras (IDF Prompt Engine)
            // Futuro: const response = await fetch('https://api.openai.com/v1/chat/completions', ...)

            const result = generateIDFPrompt(item, vaults);

            return {
                success: true,
                data: result,
                metadata: {
                    engine: "Bravvo IDF v1.0",
                    tokens: 0, // Placeholder
                    latency: MOCK_DELAY
                }
            };
        } catch (error) {
            console.error("Erro na geração de IA:", error);
            return {
                success: false,
                error: "Falha ao gerar inteligência. Tente novamente."
            };
        }
    }

    /**
     * Gera uma conclusão executiva pós-reunião de governança
     * @param {Object} ata - Dados da Ata (metas, decisões, score)
     * @returns {Promise<{conclusion_summary: string, next_steps: Array<string>}>}
     */
    async generateGovernanceConclusion(ata) {
        const config = this.getAIConfig();
        if (!config || !config.apiKey) return null;

        const prompt = `
Contexto: Você é um consultor executivo analisando a ata de uma reunião de governança semanal.
Dados da Reunião:
- Data: ${new Date().toLocaleDateString()}
- Score de Execução: ${ata.score}/100
- KPIs Batidos: ${JSON.stringify(ata.kpis)}
- Decisões Tomadas: ${JSON.stringify(ata.decisions)}

Instrução:
1. Analise o desempenho.
2. Gere uma "Conclusão Executiva" (max 3 frases) em tom profissional e direto.
3. Liste 3 "Próximos Passos" críticos para a equipe focar na próxima semana.

Responda APENAS com este JSON:
{
    "conclusion_summary": "Texto da conclusão...",
    "next_steps": ["Passo 1", "Passo 2", "Passo 3"]
}
        `;

        let responseText;
        if (config.provider === 'openai') {
            responseText = await this.callOpenAI(prompt, config.apiKey);
        } else if (config.provider === 'anthropic') {
            responseText = await this.callAnthropic(prompt, config.apiKey);
        } else if (config.provider === 'gemini') {
            responseText = await this.callGemini(prompt, config.apiKey);
        } else {
            return null;
        }

        try {
            return JSON.parse(responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
        } catch (e) {
            console.error('Erro ao parsear conclusão:', e);
            return {
                conclusion_summary: "Análise automática indisponível.",
                next_steps: []
            };
        }
    }

    /**
     * (Futuro) Chat com o Vault
     * Permite perguntar coisas como "Qual seria o tom de voz para uma reclamação?"
     */
    async askVault(question, vaults) {
        await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

        // Mock implementation
        const tone = vaults?.S1?.fields?.tone || ['Neutro'];
        const response = `Baseado no seu tom de voz ${tone.join('/')}, eu responderia: ...`;

        return {
            role: 'assistant',
            content: response
        };
    }

    /**
     * Gera um tema visual baseado no DNA da marca (S1)
     */
    async generateBrandTheme(vaults) {
        const config = this.getAIConfig();
        if (!config || !config.apiKey) {
            throw new Error('API Key de IA não configurada.');
        }

        const brandData = this.extractVaultsData(vaults).brand;

        // NEW: Location Context
        let locationContext = '';
        if (brandData.scope && brandData.scope.toLowerCase() !== 'global') {
            locationContext = `
Contexto Local:
Esta é uma marca ${brandData.scope} em ${brandData.location}. Considere a estética local se relevante.
`;
        }

        const prompt = `Você é um Diretor de Arte Sênior e Especialista em Branding.
Analise o DNA desta marca e crie uma identidade visual digital coesa para o sistema operacional da empresa.

## DNA da Marca
- Nome: ${brandData.name || 'Empresa desconhecida'}
- Nicho: ${brandData.niche || 'Geral'}
- Tom de Voz: ${brandData.voiceTone || 'Neutro'}
- Personalidade: ${brandData.personality || 'Profissional'}
- Diferenciais: ${brandData.differentials || 'Qualidade'}
- Cores Existentes: ${brandData.colors?.join(', ') || 'Nenhuma'}
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
}`;

        let responseText;
        if (config.provider === 'openai') {
            responseText = await this.callOpenAI(prompt, config.apiKey);
        } else if (config.provider === 'anthropic') {
            responseText = await this.callAnthropic(prompt, config.apiKey);
        } else if (config.provider === 'gemini') {
            responseText = await this.callGemini(prompt, config.apiKey);
        } else {
            // Fallback default
            responseText = JSON.stringify({ primaryColor: '#000000', accentColor: '#FF0000', fontFamily: 'Inter', reasoning: 'Fallback' });
        }

        try {
            const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const result = JSON.parse(cleaned);

            // Validate Font
            const validFonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Playfair Display', 'Courier Prime'];
            if (!validFonts.includes(result.fontFamily)) {
                result.fontFamily = 'Inter'; // Fallback
            }

            return result;
        } catch (e) {
            console.error('Erro ao parsear tema:', e);
            throw new Error('Falha ao gerar tema. Tente novamente.');
        }
    }
}

export const aiService = new AIService();
