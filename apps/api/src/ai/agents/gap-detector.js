/**
 * Gap Detector Agent
 * Identifica lacunas e inconsistências cross-Vault
 */

import { BaseAgent } from './base-agent.js';
import { v4 as uuidv4 } from 'uuid';

export class GapDetectorAgent extends BaseAgent {
    constructor() {
        super({
            name: 'GapDetector',
            version: '1.0.0',
            temperature: 0.2 // Muito baixa para detecção precisa
        });
    }

    getSystemPrompt() {
        return `${super.getSystemPrompt()}

PAPEL ESPECÍFICO: Gap Detector
Você é o guardião da qualidade de dados do BravvoOS.

RESPONSABILIDADES:
1. Identificar dados faltantes (missing_data)
2. Detectar inconsistências entre componentes (inconsistency)
3. Encontrar ambiguidades (ambiguity)
4. Identificar conflitos de informação (conflict)
5. Gerar perguntas para humanos resolverem

SEVERIDADES:
- critical: Bloqueia geração/recalibração
- high: Afeta qualidade significativamente
- medium: Pode ser resolvido depois
- low: Melhoria opcional

REGRAS:
- Seja ESPECÍFICO sobre a localização do gap
- Sugira COMO resolver cada gap
- Identifique O QUE é afetado por cada gap
- Perguntas devem ser ACIONÁVEIS`;
    }

    /**
     * Detecta gaps em análises de Vaults e Command Center
     */
    async detect(input) {
        const {
            vault_analyses,
            command_center,
            cross_validation_rules = []
        } = input;

        const taskPrompt = `Detecte lacunas e inconsistências.

ANÁLISES DOS VAULTS:
${JSON.stringify(vault_analyses, null, 2)}

COMMAND CENTER:
${JSON.stringify(command_center, null, 2)}

REGRAS DE VALIDAÇÃO CRUZADA:
${JSON.stringify(cross_validation_rules, null, 2)}

VERIFICAÇÕES OBRIGATÓRIAS:
1. Todos os campos obrigatórios dos Vaults estão preenchidos?
2. KPIs têm fonte em algum Vault?
3. Roadmap é consistente com capacidades (V3)?
4. Metas são compatíveis com histórico (V5)?
5. Calendário considera sazonalidades identificadas?

RETORNE JSON com esta estrutura:
{
  "detection_id": "uuid",
  "gaps": [
    {
      "gap_id": "uuid",
      "tipo": "missing_data|inconsistency|ambiguity|conflict",
      "severidade": "critical|high|medium|low",
      "localizacao": {
        "componente": "vault|command_center|context",
        "path": "caminho.para.campo",
        "ids_afetados": ["lista de IDs"]
      },
      "descricao": "descrição clara do gap",
      "impacto": "como isso afeta o sistema",
      "sugestao_resolucao": "como o humano pode resolver",
      "bloqueia": ["lista de processos bloqueados"]
    }
  ],
  "inconsistencies": [
    {
      "inconsistency_id": "uuid",
      "entre": [
        {
          "componente": "V1|V2|command_center|etc",
          "campo": "caminho.campo",
          "valor": "valor encontrado"
        },
        {
          "componente": "outro",
          "campo": "caminho.campo",
          "valor": "valor conflitante"
        }
      ],
      "descricao": "natureza da inconsistência",
      "severidade": "critical|high|medium|low",
      "requer_decisao_humana": true|false,
      "opcoes_resolucao": [
        {
          "opcao": "descrição",
          "impacto": "consequência"
        }
      ]
    }
  ],
  "questions_for_humans": [
    {
      "question_id": "uuid",
      "pergunta": "pergunta clara e específica",
      "contexto": "por que estamos perguntando",
      "opcoes": ["opção 1", "opção 2"] ou null se aberta,
      "prioridade": "critical|high|medium|low",
      "bloqueia": ["processos bloqueados até resposta"],
      "valor_default": "valor assumido se não responder" ou null
    }
  ],
  "health_score": {
    "overall": 0-100,
    "por_vault": {
      "V1": 0-100,
      "V2": 0-100,
      "V3": 0-100,
      "V4": 0-100,
      "V5": 0-100
    },
    "por_componente": {
      "kpis": 0-100,
      "roadmap": 0-100,
      "calendario": 0-100
    },
    "fatores_reducao": [
      {
        "fator": "descrição do que reduz o score",
        "impacto": -5 (pontos reduzidos)
      }
    ]
  },
  "recommendations": [
    {
      "prioridade": 1,
      "acao": "o que fazer primeiro",
      "motivo": "por que é prioritário"
    }
  ],
  "source_mapping": {}
}`;

        const result = await this.execute(input, taskPrompt);

        if (result.success) {
            if (!result.output.detection_id) {
                result.output.detection_id = uuidv4();
            }
            result.output.timestamp = new Date().toISOString();

            // Gera IDs
            (result.output.gaps || []).forEach(gap => {
                if (!gap.gap_id) gap.gap_id = uuidv4();
            });
            (result.output.inconsistencies || []).forEach(inc => {
                if (!inc.inconsistency_id) inc.inconsistency_id = uuidv4();
            });
            (result.output.questions_for_humans || []).forEach(q => {
                if (!q.question_id) q.question_id = uuidv4();
            });
        }

        return result;
    }

    /**
     * Verifica se há gaps críticos que bloqueiam
     */
    hasCriticalGaps(detectionResult) {
        if (!detectionResult.success) return true;

        const gaps = detectionResult.output.gaps || [];
        return gaps.some(gap => gap.severidade === 'critical');
    }

    /**
     * Extrai perguntas que bloqueiam processos específicos
     */
    getBlockingQuestions(detectionResult, processName) {
        if (!detectionResult.success) return [];

        const questions = detectionResult.output.questions_for_humans || [];
        return questions.filter(q => (q.bloqueia || []).includes(processName));
    }

    /**
     * Calcula se sistema está healthy o suficiente para gerar Command Center
     */
    isReadyForCommandCenter(detectionResult) {
        if (!detectionResult.success) return false;

        const score = detectionResult.output.health_score?.overall || 0;
        const hasCritical = this.hasCriticalGaps(detectionResult);

        return score >= 60 && !hasCritical;
    }
}

export default GapDetectorAgent;
