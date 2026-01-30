/**
 * Governance Summarizer Agent
 * Resume ciclos de governança completados
 */

import { BaseAgent } from './base-agent.js';
import { v4 as uuidv4 } from 'uuid';

export class GovernanceSummarizerAgent extends BaseAgent {
    constructor() {
        super({
            name: 'GovernanceSummarizer',
            version: '1.0.0',
            temperature: 0.3 // Baixa para análise factual
        });
    }

    getSystemPrompt() {
        return `${super.getSystemPrompt()}

PAPEL ESPECÍFICO: Governance Summarizer
Você resume ciclos de governança para alimentar recalibrações.

RESPONSABILIDADES:
1. Resumir realizações e desafios do ciclo
2. Analisar performance vs metas
3. Identificar padrões de decisão
4. Gerar insights acionáveis
5. Recomendar ajustes para próximo ciclo

REGRAS:
- Base-se APENAS em dados reais do ciclo
- Insights devem ter EVIDÊNCIAS citadas
- Padrões devem ter FREQUÊNCIA documentada
- Recomendações devem ter JUSTIFICATIVA clara
- Confidence baixo se dados insuficientes`;
    }

    /**
     * Resume um ciclo de governança
     */
    async summarize(cycleData) {
        const {
            cycle_id,
            cycle_period,
            decisions,
            actions_executed,
            performance_data
        } = cycleData;

        const taskPrompt = `Resuma o ciclo de governança.

CICLO: ${cycle_id}
PERÍODO: ${cycle_period.inicio} até ${cycle_period.fim}

DECISÕES TOMADAS:
${JSON.stringify(decisions, null, 2)}

AÇÕES EXECUTADAS:
${JSON.stringify(actions_executed, null, 2)}

DADOS DE PERFORMANCE:
${JSON.stringify(performance_data, null, 2)}

RETORNE JSON com esta estrutura:
{
  "summary_id": "uuid",
  "cycle_id": "${cycle_id}",
  "version": "1.0.0",
  "executive_summary": {
    "principais_realizacoes": [
      "realização 1 - com métrica se disponível",
      "realização 2"
    ],
    "principais_desafios": [
      "desafio 1 - com contexto",
      "desafio 2"
    ],
    "desvios_significativos": [
      {
        "area": "kpi|roadmap|outro",
        "esperado": "valor/status esperado",
        "realizado": "valor/status real",
        "desvio_percentual": numero ou null,
        "causa_provavel": "análise"
      }
    ],
    "aprendizados": [
      {
        "aprendizado": "lição aprendida",
        "evidencia": "dados que suportam",
        "aplicabilidade": "como usar no futuro"
      }
    ]
  },
  "performance_analysis": {
    "kpis_on_track": [
      {
        "kpi_id": "id",
        "nome": "nome",
        "meta": valor,
        "realizado": valor,
        "status": "on_track|ahead"
      }
    ],
    "kpis_off_track": [
      {
        "kpi_id": "id",
        "nome": "nome",
        "meta": valor,
        "realizado": valor,
        "gap_percentual": numero,
        "causa_identificada": "análise ou 'investigar'",
        "acao_corretiva_sugerida": "sugestão"
      }
    ],
    "tendencias_identificadas": [
      {
        "tendencia": "descrição",
        "direcao": "positiva|negativa|neutra",
        "evidencia": ["dados de suporte"],
        "projecao": "se continuar, o que acontece"
      }
    ]
  },
  "decision_patterns": [
    {
      "padrao": "descrição do padrão observado",
      "frequencia": numero,
      "contexto": "quando ocorre",
      "impacto": "resultado típico",
      "recomendacao": "manter|ajustar|evitar"
    }
  ],
  "insights": [
    {
      "insight": "descoberta ou conclusão",
      "evidencia": ["dado1", "dado2"],
      "confidence": 0-100,
      "actionable": true|false,
      "sugestao": "ação recomendada ou null"
    }
  ],
  "next_cycle_recommendations": [
    {
      "recomendacao": "ação específica",
      "prioridade": "alta|media|baixa",
      "justificativa": "baseado em X do ciclo atual",
      "impacto_esperado": "resultado esperado",
      "metricas_sucesso": ["como medir"]
    }
  ],
  "source_mapping": {
    "campo_resumido": {
      "source": "dados_ciclo.campo",
      "original_value": valor,
      "interpretation": "análise"
    }
  },
  "data_quality": {
    "completeness": 0-100,
    "gaps": ["dados faltantes"],
    "caveats": ["ressalvas sobre a análise"]
  }
}`;

        const result = await this.execute(cycleData, taskPrompt);

        if (result.success) {
            if (!result.output.summary_id) {
                result.output.summary_id = uuidv4();
            }
            result.output.timestamp = new Date().toISOString();
        }

        return result;
    }

    /**
     * Compara dois ciclos para identificar evolução
     */
    async compareCycles(currentSummary, previousSummary) {
        const taskPrompt = `Compare os dois ciclos e identifique evolução.

CICLO ATUAL:
${JSON.stringify(currentSummary, null, 2)}

CICLO ANTERIOR:
${JSON.stringify(previousSummary, null, 2)}

RETORNE JSON com:
{
  "comparison_id": "uuid",
  "evolucao": {
    "melhorias": ["lista de melhorias"],
    "regressoes": ["lista de pioras"],
    "estabilidades": ["o que se manteve"]
  },
  "efetividade_recomendacoes": [
    {
      "recomendacao_anterior": "texto",
      "foi_implementada": true|false,
      "resultado": "positivo|negativo|neutro|n/a"
    }
  ],
  "tendencia_geral": "positiva|negativa|estavel",
  "confidence": 0-100,
  "source_mapping": {}
}`;

        return this.execute({ current: currentSummary, previous: previousSummary }, taskPrompt);
    }
}

export default GovernanceSummarizerAgent;
