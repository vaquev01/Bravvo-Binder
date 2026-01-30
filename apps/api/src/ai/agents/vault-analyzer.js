/**
 * Vault Analyzer Agent
 * Analisa e resume cada Vault sem modificar dados originais
 */

import { BaseAgent } from './base-agent.js';
import { v4 as uuidv4 } from 'uuid';
import { VaultDefinitions } from '../schemas/vault.schema.js';

export class VaultAnalyzerAgent extends BaseAgent {
    constructor() {
        super({
            name: 'VaultAnalyzer',
            version: '1.0.0',
            temperature: 0.2 // Muito baixa para análise factual
        });
    }

    getSystemPrompt() {
        return `${super.getSystemPrompt()}

PAPEL ESPECÍFICO: Vault Analyzer
Você analisa Vaults preenchidos por humanos para extrair:
1. Resumo estruturado (key_points)
2. Entidades extraídas (nicho, região, etc.)
3. Lacunas identificadas (campos faltantes ou ambíguos)
4. Perguntas de validação (para o humano confirmar interpretações)

REGRA CRÍTICA: 
- NUNCA modifique ou "melhore" os dados do Vault
- Apenas ANALISE e ESTRUTURE o que existe
- Se algo está faltando, documente como GAP com pergunta
- Completeness score deve refletir % de campos obrigatórios preenchidos

DEFINIÇÕES DOS VAULTS:
${JSON.stringify(VaultDefinitions, null, 2)}`;
    }

    /**
     * Analisa um Vault específico
     */
    async analyze(vaultInput) {
        const { vault_id, content, previous_analysis } = vaultInput;

        const vaultDef = VaultDefinitions[vault_id];
        if (!vaultDef) {
            throw new Error(`Vault ${vault_id} não reconhecido`);
        }

        const taskPrompt = `Analise o Vault ${vault_id} (${vaultDef.name}).

CAMPOS OBRIGATÓRIOS PARA ESTE VAULT: ${vaultDef.required_fields.join(', ')}
DERIVA PARA: ${vaultDef.derives.join(', ')}

${previous_analysis ? `ANÁLISE ANTERIOR (para comparação):
${JSON.stringify(previous_analysis, null, 2)}` : ''}

RETORNE JSON com esta estrutura EXATA:
{
  "analysis_id": "uuid gerado",
  "vault_id": "${vault_id}",
  "version": "1.0.0",
  "summary": {
    "key_points": ["lista de pontos principais EXTRAÍDOS do vault"],
    "entities_extracted": {
      "nicho": "string ou null se não encontrado",
      "regiao": "string ou null",
      "abrangencia": "string ou null",
      "outros": {}
    },
    "completeness_score": 0-100,
    "confidence_score": 0-100
  },
  "gaps": [
    {
      "field": "nome do campo",
      "severity": "critical|high|medium|low",
      "question": "pergunta para o humano",
      "suggestion": "sugestão ou null"
    }
  ],
  "validation_questions": [
    {
      "question": "pergunta de validação",
      "context": "por que precisa validar",
      "required_for": ["lista de processos que dependem"]
    }
  ],
  "source_mapping": {
    "campo_analisado": {
      "source": "vault_field_path",
      "original_value": "valor original",
      "interpretation": "sua interpretação ou null"
    }
  }
}`;

        const result = await this.execute({ vault_id, content, vaultDef }, taskPrompt);

        if (result.success) {
            // Adiciona analysis_id se não gerado
            if (!result.output.analysis_id) {
                result.output.analysis_id = uuidv4();
            }
            result.output.timestamp = new Date().toISOString();
        }

        return result;
    }

    /**
     * Calcula completeness score baseado em campos obrigatórios
     */
    calculateCompleteness(vaultId, content) {
        const vaultDef = VaultDefinitions[vaultId];
        if (!vaultDef) return 0;

        const requiredFields = vaultDef.required_fields;
        let filledCount = 0;

        for (const field of requiredFields) {
            if (this.hasValue(content, field)) {
                filledCount++;
            }
        }

        return Math.round((filledCount / requiredFields.length) * 100);
    }

    /**
     * Verifica se campo tem valor (não vazio)
     */
    hasValue(obj, field) {
        const value = obj?.raw_data?.[field] || obj?.[field];
        if (value === null || value === undefined) return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
    }
}

export default VaultAnalyzerAgent;
