/**
 * Command Center Generator Agent
 * Gera KPIs, Roadmap e Calendário como RASCUNHO com justificativas
 */

import { BaseAgent } from './base-agent.js';
import { v4 as uuidv4 } from 'uuid';

export class CommandCenterGeneratorAgent extends BaseAgent {
    constructor() {
        super({
            name: 'CommandCenterGenerator',
            version: '1.0.0',
            temperature: 0.5 // Mais alta para criatividade controlada
        });
    }

    getSystemPrompt() {
        return `${super.getSystemPrompt()}

PAPEL ESPECÍFICO: Command Center Generator
Você gera o Centro de Comando (KPIs + Roadmap + Calendário) SEMPRE como RASCUNHO.

PRINCÍPIOS:
1. TODO output é DRAFT até aprovação humana
2. TODA sugestão precisa de JUSTIFICATIVA com fontes
3. Gere ALTERNATIVAS quando houver incerteza
4. Aplique PESOS configurados na priorização
5. Identifique RISCOS e GAPS

ESTRUTURA DE KPI:
- Nome claro e mensurável
- Fórmula de cálculo
- Meta com justificativa
- Fontes que embasam a meta
- Confidence score
- Flag requires_validation

ESTRUTURA DE ROADMAP:
- Fases com datas
- Objetivos e entregas
- Dependências
- Justificativa de sequência
- Riscos identificados

ESTRUTURA DE CALENDÁRIO:
- Eventos de milestone
- Reviews periódicas
- Ações planejadas
- Sazonalidades`;
    }

    /**
     * Gera Centro de Comando inicial
     */
    async generate(input) {
        const {
            vault_analyses,
            calendar_context,
            weights,
            previous_command_center,
            generation_mode = 'initial'
        } = input;

        const taskPrompt = `Gere o Centro de Comando (RASCUNHO).

MODO: ${generation_mode}
${previous_command_center ? 'RECALIBRAÇÃO - considere o Command Center anterior' : 'GERAÇÃO INICIAL'}

ANÁLISES DOS VAULTS:
${JSON.stringify(vault_analyses, null, 2)}

CONTEXTO DE CALENDÁRIO:
${JSON.stringify(calendar_context, null, 2)}

PESOS CONFIGURADOS:
${JSON.stringify(weights, null, 2)}

${previous_command_center ? `COMMAND CENTER ANTERIOR:
${JSON.stringify(previous_command_center, null, 2)}` : ''}

INSTRUÇÕES DE PESOS:
- peso_vaults (${weights.peso_vaults}): Quanto os Vaults influenciam
- peso_governanca (${weights.peso_governanca}): Quanto decisões passadas influenciam
- peso_performance (${weights.peso_performance}): Quanto resultados influenciam
- peso_calendario (${weights.peso_calendario}): Quanto sazonalidade influencia

RETORNE JSON com esta estrutura:
{
  "command_center_id": "uuid",
  "version": "${previous_command_center ? this.incrementVersion(previous_command_center.version) : '1.0.0'}",
  "status": "draft",
  "kpis": [
    {
      "kpi_id": "uuid",
      "nome": "Nome do KPI",
      "descricao": "Descrição clara",
      "formula": "Como calcular",
      "meta": numero,
      "unidade": "%, R$, unidades, etc",
      "frequencia_medicao": "diaria|semanal|mensal",
      "justificativa": "POR QUE este KPI e esta meta - OBRIGATÓRIO",
      "fontes": [
        {
          "tipo": "vault|calendario|governanca|performance",
          "referencia": "V1.objetivo_crescimento",
          "peso_aplicado": 0.4,
          "contribuicao": "como contribuiu para a decisão"
        }
      ],
      "confidence": 0-100,
      "requires_validation": true|false,
      "alternatives": [
        {
          "meta_alternativa": numero,
          "justificativa": "cenário mais/menos agressivo"
        }
      ]
    }
  ],
  "roadmap": [
    {
      "fase_id": "uuid",
      "nome": "Nome da Fase",
      "inicio": "ISO8601",
      "fim": "ISO8601",
      "duracao_semanas": numero,
      "objetivos": ["lista de objetivos"],
      "entregas": ["lista de entregas"],
      "dependencias": ["fase_ids que precisam terminar antes"],
      "justificativa": "POR QUE esta fase nesta ordem - OBRIGATÓRIO",
      "fontes": ["lista de fontes"],
      "confidence": 0-100,
      "risks": [
        {
          "risco": "descrição",
          "probabilidade": "alta|media|baixa",
          "mitigacao": "sugestão"
        }
      ]
    }
  ],
  "calendario": [
    {
      "evento_id": "uuid",
      "titulo": "Nome do Evento",
      "data": "ISO8601",
      "tipo": "milestone|review|action|sazonalidade",
      "descricao": "Descrição",
      "relacionado_a": {
        "kpis": ["kpi_ids relacionados"],
        "fases": ["fase_ids relacionadas"]
      },
      "fonte": "origem do evento",
      "confidence": 0-100,
      "recorrente": false,
      "recorrencia_pattern": null
    }
  ],
  "generation_metadata": {
    "weights_applied": ${JSON.stringify(weights)},
    "total_sources_used": numero,
    "gaps_identified": [
      {
        "tipo": "missing_data|ambiguity|conflict",
        "descricao": "descrição do gap",
        "impacto": "como afeta o command center",
        "sugestao": "como resolver"
      }
    ],
    "assumptions": [
      {
        "assumption": "suposição feita",
        "baseado_em": "fonte",
        "impacto_se_errado": "consequência"
      }
    ],
    "alternative_suggestions": [
      {
        "area": "kpis|roadmap|calendario",
        "sugestao": "alternativa considerada",
        "motivo_descartada": "por que não foi a principal"
      }
    ]
  },
  "validation_checklist": [
    {
      "item": "descrição do que precisa ser validado",
      "status": "pending_review",
      "priority": "critical|high|medium|low",
      "affects": ["componentes afetados"]
    }
  ],
  "source_mapping": {}
}`;

        const result = await this.execute(input, taskPrompt);

        if (result.success) {
            if (!result.output.command_center_id) {
                result.output.command_center_id = uuidv4();
            }
            result.output.timestamp = new Date().toISOString();

            // Gera UUIDs para itens sem ID
            this.ensureIds(result.output);
        }

        return result;
    }

    /**
     * Incrementa versão semântica
     */
    incrementVersion(version) {
        if (!version) return '1.0.0';
        const parts = version.split('.').map(Number);
        parts[2]++; // Incrementa patch
        return parts.join('.');
    }

    /**
     * Garante que todos os itens tenham IDs
     */
    ensureIds(output) {
        (output.kpis || []).forEach(kpi => {
            if (!kpi.kpi_id) kpi.kpi_id = uuidv4();
        });
        (output.roadmap || []).forEach(fase => {
            if (!fase.fase_id) fase.fase_id = uuidv4();
        });
        (output.calendario || []).forEach(evento => {
            if (!evento.evento_id) evento.evento_id = uuidv4();
        });
    }
}

export default CommandCenterGeneratorAgent;
