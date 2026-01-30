/**
 * Base Agent - Classe base para todos os agentes de IA do BravvoOS
 * Implementa estratégias anti-alucinação e rastreabilidade
 */

import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

export class BaseAgent {
    constructor(config = {}) {
        this.name = config.name || 'BaseAgent';
        this.version = config.version || '1.0.0';
        this.model = config.model || 'gpt-4o';
        this.temperature = config.temperature || 0.3; // Baixa para reduzir alucinação

        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        // Anti-hallucination settings
        this.requireSourceMapping = config.requireSourceMapping !== false;
        this.maxConfidenceWithoutEvidence = 30; // Nunca > 30% sem evidência
    }

    /**
     * Prompt base anti-alucinação
     */
    getSystemPrompt() {
        return `Você é o ${this.name} do BravvoOS.

REGRAS ABSOLUTAS (NUNCA VIOLE):
1. NUNCA invente dados. Se não existe no input, marque como "missing" ou "unknown".
2. SEMPRE cite a fonte exata de cada dado no formato: vault_id.field_path ou source_type:reference
3. Separe FATOS (extraídos do input) de INFERÊNCIAS (suas análises).
4. Para TODA inferência, forneça:
   - confidence: número de 0-100
   - assumptions: lista de suposições feitas
   - alternatives: outras interpretações possíveis
5. Quando em dúvida, gere uma PERGUNTA para o humano em vez de inventar.
6. Outputs criativos DEVEM ser marcados como "draft" com justificativa completa.
7. Se um campo obrigatório está faltando, NÃO preencha com valor inventado.

ESTRUTURA DE RESPOSTA:
- Sempre retorne JSON válido
- Sempre inclua source_mapping para rastreabilidade
- Sempre inclua confidence_score (0-100)
- Sempre liste assumptions se houver inferências

FORMATO DE FONTE:
- Dados de Vault: "V1.campo.subcampo"
- Conhecimento de domínio: "domain:categoria"
- Cálculo: "calculated:formula_usada"
- Inferência: "inferred:baseado_em"`;
    }

    /**
     * Executa o agente com validação anti-alucinação
     */
    async execute(input, taskPrompt) {
        const startTime = Date.now();
        const executionId = uuidv4();

        try {
            // Valida input
            this.validateInput(input);

            // Prepara mensagens
            const messages = [
                { role: 'system', content: this.getSystemPrompt() },
                { role: 'user', content: this.buildUserPrompt(input, taskPrompt) }
            ];

            // Chama OpenAI
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages,
                temperature: this.temperature,
                response_format: { type: 'json_object' }
            });

            const rawOutput = response.choices[0].message.content;
            let parsedOutput;

            try {
                parsedOutput = JSON.parse(rawOutput);
            } catch (e) {
                throw new Error(`Agent ${this.name} retornou JSON inválido: ${e.message}`);
            }

            // Valida output anti-alucinação
            const validatedOutput = this.validateOutput(parsedOutput);

            // Adiciona metadata de execução
            const finalOutput = {
                ...validatedOutput,
                _metadata: {
                    agent: this.name,
                    agent_version: this.version,
                    execution_id: executionId,
                    timestamp: new Date().toISOString(),
                    execution_time_ms: Date.now() - startTime,
                    model_used: this.model,
                    tokens_used: response.usage?.total_tokens || 0,
                    input_hash: this.hashInput(input)
                }
            };

            return {
                success: true,
                output: finalOutput,
                warnings: validatedOutput._warnings || []
            };

        } catch (error) {
            console.error(`❌ Agent ${this.name} error:`, error);
            return {
                success: false,
                error: error.message,
                execution_id: executionId,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Constrói prompt do usuário com contexto estruturado
     */
    buildUserPrompt(input, taskPrompt) {
        return `TAREFA: ${taskPrompt}

INPUT ESTRUTURADO:
${JSON.stringify(input, null, 2)}

INSTRUÇÕES:
1. Analise o input acima
2. Execute a tarefa solicitada
3. Retorne JSON com source_mapping obrigatório
4. Marque lacunas como "missing" com perguntas
5. Forneça confidence para cada inferência`;
    }

    /**
     * Valida input antes de processar
     */
    validateInput(input) {
        if (!input || typeof input !== 'object') {
            throw new Error('Input inválido: deve ser um objeto');
        }
        return true;
    }

    /**
     * Valida output aplicando regras anti-alucinação
     */
    validateOutput(output) {
        const warnings = [];

        // Verifica source_mapping se requerido
        if (this.requireSourceMapping && !output.source_mapping) {
            warnings.push({
                type: 'missing_source_mapping',
                message: 'Output sem source_mapping - rastreabilidade comprometida',
                severity: 'high'
            });
        }

        // Verifica confidence scores altos sem evidência
        this.checkHighConfidenceWithoutEvidence(output, warnings);

        // Adiciona warnings ao output
        output._warnings = warnings;

        return output;
    }

    /**
     * Detecta confidence alto sem evidência (possível alucinação)
     */
    checkHighConfidenceWithoutEvidence(obj, warnings, path = '') {
        if (typeof obj !== 'object' || obj === null) return;

        for (const [key, value] of Object.entries(obj)) {
            const currentPath = path ? `${path}.${key}` : key;

            if (key === 'confidence' && typeof value === 'number') {
                // Verifica se há evidência/fonte próxima
                const hasEvidence = obj.fontes?.length > 0 ||
                    obj.source ||
                    obj.evidencia?.length > 0 ||
                    obj.baseado_em;

                if (value > this.maxConfidenceWithoutEvidence && !hasEvidence) {
                    warnings.push({
                        type: 'high_confidence_no_evidence',
                        path: currentPath,
                        value,
                        message: `Confidence ${value}% sem evidência em ${currentPath}`,
                        severity: 'medium'
                    });
                }
            }

            if (typeof value === 'object') {
                this.checkHighConfidenceWithoutEvidence(value, warnings, currentPath);
            }
        }
    }

    /**
     * Gera hash do input para detectar reprocessamento
     */
    hashInput(input) {
        const str = JSON.stringify(input);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * Helper para criar estrutura de gap/lacuna
     */
    createGap(field, severity, question, suggestion = null) {
        return {
            field,
            severity, // 'critical' | 'high' | 'medium' | 'low'
            question,
            suggestion,
            identified_by: this.name,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Helper para criar source mapping entry
     */
    createSourceEntry(field, sourceType, sourceRef, originalValue, interpretation = null) {
        return {
            field,
            source: `${sourceType}:${sourceRef}`,
            original_value: originalValue,
            interpretation,
            extracted_by: this.name
        };
    }
}

export default BaseAgent;
