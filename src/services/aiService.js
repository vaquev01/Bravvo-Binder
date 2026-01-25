/**
 * BRAVVO AI SERVICE
 * 
 * Centraliza toda a inteligência do sistema.
 * Atualmente usa templates estruturados (Regras de Ouro),
 * mas está preparado para ser substituído por chamadas reais à OpenAI/Claude.
 */

import { generatePrompt as generateIDFPrompt } from '../utils/promptGenerator';

const MOCK_DELAY = 800; // Simula latência de rede para sensação de "pensando"

class AIService {
    constructor() {
        this.provider = 'local_rule_engine'; // 'openai' | 'anthropic' | 'local_rule_engine'
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
