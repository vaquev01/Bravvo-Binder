/**
 * BRAVVO AI SERVICE
 * 
 * Centraliza toda a inteligência do sistema.
 * Suporta: OpenAI (GPT-4o), Anthropic (Claude), e templates locais.
 */

import { generatePrompt as generateIDFPrompt } from '../utils/promptGenerator';

const MOCK_DELAY = 800; // Simula latência de rede para sensação de "pensando"

// Configuração padrão
const DEFAULT_CONFIG = {
    provider: 'openai', // 'openai' | 'anthropic'
    model: {
        openai: 'gpt-4o',
        anthropic: 'claude-3-5-sonnet-20241022'
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
    anthropic: 'https://api.anthropic.com/v1/messages'
};

class AIService {
    constructor() {
        this.provider = 'local_rule_engine'; // 'openai' | 'anthropic' | 'local_rule_engine'
    }

    // ========== CONFIGURAÇÃO DE IA ==========

    /**
     * Obtém a configuração de IA do localStorage ou usa padrão
     */
    getAIConfig() {
        const stored = localStorage.getItem('bravvo_ai_config');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                console.warn('Configuração de IA inválida, usando padrão.');
            }
        }

        // Fallback para garantir funcionamento imediato
        return {
            provider: 'openai',
            apiKey: DEMO_KEY,
            model: DEFAULT_CONFIG.model.openai
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
     * Extrai dados relevantes dos Vaults para enviar à IA
     */
    extractVaultsData(vaults) {
        return {
            brand: {
                name: vaults?.s1?.brandName || vaults?.s1?.name || vaults?.S1?.fields?.brandName,
                voiceTone: vaults?.s1?.voiceTone || vaults?.S1?.fields?.tone?.join(', '),
                personality: vaults?.s1?.personality || vaults?.S1?.fields?.personality?.join(', '),
                differentials: vaults?.s1?.differentials || vaults?.S1?.fields?.differentials,
                colors: [vaults?.s1?.primaryColor, vaults?.s1?.accentColor].filter(Boolean)
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
                conversionRate: vaults?.s3?.conversionRate || vaults?.S3?.fields?.conversionRate
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
            }
        };
    }

    /**
     * Monta o prompt estruturado com os dados dos Vaults
     */
    buildPlanPrompt(vaultsData) {
        const { brand, offer, funnel, ops, ideas } = vaultsData;

        return `Você é um consultor de marketing estratégico especializado em pequenas e médias empresas.
Analise os dados abaixo de um negócio e gere:
1. Um plano de ação tático com 5-10 tarefas específicas para o próximo ciclo (semanal).
2. Os 3-5 KPIs mais importantes para esse negócio monitorar.
3. Uma recomendação estratégica geral.

## Dados do Negócio:

### S1 - Marca:
- Nome: ${brand?.name || 'Não informado'}
- Tom de Voz: ${brand?.voiceTone || 'Não informado'}
- Personalidade: ${brand?.personality || 'Não informado'}
- Diferenciais: ${brand?.differentials || 'Não informado'}
- Cores: ${brand?.colors?.join(', ') || 'Não informado'}

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

### S4 - Operação:
- Frequência de Postagem: ${ops?.postingFrequency || 'Não informado'}
- Melhores Dias: ${Array.isArray(ops?.bestDays) ? ops.bestDays.join(', ') : (ops?.bestDays || 'Não informado')}
- Melhores Horários: ${Array.isArray(ops?.bestTimes) ? ops.bestTimes.join(', ') : (ops?.bestTimes || 'Não informado')}
- Duração do Ciclo: ${ops?.cycleDuration || 7} dias
- Equipe/Stakeholders: ${JSON.stringify(ops?.stakeholders || [])}

### S5 - Banco de Ideias:
- Ideias Registradas: ${ideas?.ideas?.map(i => i.title || i.text || i).join(', ') || 'Nenhuma'}
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
            throw new Error('A resposta da IA não está em formato JSON válido.');
        }
    }

    /**
     * Gera plano de ação e KPIs usando IA
     * @param {Object} vaults - Dados dos Vaults (s1, s2, s3, s4, s5 ou S1, S2, etc)
     * @returns {Promise<{tasks: Array, kpis: Array, recommendation: string}>}
     */
    async generatePlanWithAI(vaults) {
        const config = this.getAIConfig();

        if (!config || !config.apiKey) {
            throw new Error('API Key de IA não configurada. Vá em Configurações → IA para configurar.');
        }

        // Extrai dados relevantes dos vaults
        const vaultsData = this.extractVaultsData(vaults);

        // Monta o prompt
        const prompt = this.buildPlanPrompt(vaultsData);

        // Faz a chamada para a API
        let responseText;
        if (config.provider === 'openai') {
            responseText = await this.callOpenAI(prompt, config.apiKey);
        } else if (config.provider === 'anthropic') {
            responseText = await this.callAnthropic(prompt, config.apiKey);
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
}

export const aiService = new AIService();
