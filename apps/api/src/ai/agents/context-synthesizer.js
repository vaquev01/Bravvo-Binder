/**
 * Context Synthesizer Agent
 * Deriva contexto de calendário e negócio do Vault 1
 */

import { BaseAgent } from './base-agent.js';
import { v4 as uuidv4 } from 'uuid';

export class ContextSynthesizerAgent extends BaseAgent {
    constructor() {
        super({
            name: 'ContextSynthesizer',
            version: '1.0.0',
            temperature: 0.4 // Um pouco mais alta para criatividade em sazonalidades
        });
    }

    getSystemPrompt() {
        return `${super.getSystemPrompt()}

PAPEL ESPECÍFICO: Context Synthesizer
Você deriva contexto de calendário e negócio a partir da análise do Vault 1.

RESPONSABILIDADES:
1. Identificar sazonalidades do nicho/região
2. Mapear eventos-chave relevantes
3. Identificar períodos críticos
4. Definir contexto de negócio estruturado

FONTES DE CONHECIMENTO:
1. PRIMÁRIA: Dados do Vault 1 (maior peso)
2. SECUNDÁRIA: Conhecimento de domínio sobre o nicho/região
3. TERCIÁRIA: Dados externos de calendário (se fornecidos)

REGRAS:
- Sazonalidades de conhecimento de domínio devem ser marcadas como "fonte: domain_knowledge"
- NUNCA invente eventos específicos sem base no Vault
- Se o nicho é ambíguo, gere perguntas de clarificação
- Confidence deve ser menor para inferências de domínio vs dados diretos`;
    }

    /**
     * Sintetiza contexto a partir da análise do Vault 1
     */
    async synthesize(vault1Analysis, externalCalendarData = null, regionConfig = null) {
        const taskPrompt = `Sintetize o contexto de calendário e negócio.

ANÁLISE DO VAULT 1:
${JSON.stringify(vault1Analysis, null, 2)}

${externalCalendarData ? `DADOS EXTERNOS DE CALENDÁRIO:
${JSON.stringify(externalCalendarData, null, 2)}` : ''}

${regionConfig ? `CONFIGURAÇÃO DE REGIÃO:
${JSON.stringify(regionConfig, null, 2)}` : ''}

RETORNE JSON com esta estrutura EXATA:
{
  "context_id": "uuid",
  "version": "1.0.0",
  "business_context": {
    "nicho": "extraído do vault ou 'unknown'",
    "regiao": "extraído do vault ou 'unknown'",
    "abrangencia": "local|regional|nacional|internacional ou 'unknown'",
    "target_audience": "inferido ou 'unknown'",
    "confidence": 0-100,
    "source": "vault1.campo ou 'inferred'"
  },
  "calendar_context": {
    "sazonalidades": [
      {
        "periodo": "descrição do período (ex: Dezembro, Q4, etc)",
        "tipo": "alta|baixa|neutra",
        "impacto_esperado": "descrição do impacto",
        "fonte": "vault1|domain_knowledge|external",
        "confidence": 0-100,
        "assumptions": ["lista de suposições se houver"]
      }
    ],
    "eventos_chave": [
      {
        "nome": "nome do evento",
        "data": "ISO8601 ou 'recorrente:padrão'",
        "relevancia": "alta|media|baixa",
        "fonte": "vault1|domain_knowledge|external",
        "confidence": 0-100
      }
    ],
    "periodos_criticos": [
      {
        "inicio": "ISO8601 ou 'relativo:descrição'",
        "fim": "ISO8601 ou 'relativo:descrição'",
        "motivo": "razão do período ser crítico",
        "acoes_sugeridas": ["lista de ações"],
        "confidence": 0-100
      }
    ]
  },
  "confidence_metadata": {
    "overall_confidence": 0-100,
    "data_sources": ["lista de fontes usadas"],
    "assumptions": ["lista de suposições feitas"],
    "gaps": ["lacunas que afetam confidence"]
  },
  "source_mapping": {
    "campo": {
      "source": "origem",
      "original_value": "valor",
      "interpretation": "interpretação"
    }
  },
  "validation_questions": [
    {
      "question": "pergunta para validar suposição",
      "context": "por que é importante",
      "affects": ["o que é afetado pela resposta"]
    }
  ]
}`;

        const result = await this.execute(
            { vault1_analysis: vault1Analysis, external_calendar_data: externalCalendarData, region_config: regionConfig },
            taskPrompt
        );

        if (result.success) {
            if (!result.output.context_id) {
                result.output.context_id = uuidv4();
            }
            result.output.timestamp = new Date().toISOString();
        }

        return result;
    }

    /**
     * Conhecimento de domínio por nicho (base local)
     * Pode ser expandido ou movido para banco de dados
     */
    getDomainKnowledge(nicho, regiao) {
        const knowledge = {
            'varejo': {
                sazonalidades: [
                    { periodo: 'Novembro-Dezembro', tipo: 'alta', motivo: 'Black Friday e Natal' },
                    { periodo: 'Janeiro-Fevereiro', tipo: 'baixa', motivo: 'Pós-festas' },
                    { periodo: 'Maio', tipo: 'alta', motivo: 'Dia das Mães' }
                ]
            },
            'educacao': {
                sazonalidades: [
                    { periodo: 'Janeiro-Fevereiro', tipo: 'alta', motivo: 'Matrículas' },
                    { periodo: 'Julho', tipo: 'baixa', motivo: 'Férias' }
                ]
            },
            'turismo': {
                sazonalidades: [
                    { periodo: 'Dezembro-Janeiro', tipo: 'alta', motivo: 'Férias de verão' },
                    { periodo: 'Julho', tipo: 'alta', motivo: 'Férias de inverno' }
                ]
            },
            'tecnologia': {
                sazonalidades: [
                    { periodo: 'Q4', tipo: 'alta', motivo: 'Fechamento de orçamentos' },
                    { periodo: 'Janeiro', tipo: 'baixa', motivo: 'Planejamento' }
                ]
            }
        };

        return knowledge[nicho?.toLowerCase()] || null;
    }
}

export default ContextSynthesizerAgent;
