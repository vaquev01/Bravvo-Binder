/**
 * Recalibration Engine Agent
 * Recalibra o Centro de Comando para próximo ciclo
 */

import { BaseAgent } from './base-agent.js';
import { v4 as uuidv4 } from 'uuid';

export class RecalibrationEngineAgent extends BaseAgent {
    constructor() {
        super({
            name: 'RecalibrationEngine',
            version: '1.0.0',
            temperature: 0.4
        });
    }

    getSystemPrompt() {
        return `${super.getSystemPrompt()}

PAPEL ESPECÍFICO: Recalibration Engine
Você recalibra o Centro de Comando baseado em dados reais.

PRINCÍPIOS:
1. EVOLUTIVO mas CONSERVADOR - mudanças graduais
2. Prioriza DADOS REAIS sobre suposições
3. Changelog DETALHADO para toda mudança
4. Preserva elementos que funcionam
5. Aplica PESOS na influência de cada fonte

TIPOS DE MUDANÇA:
- added: novo elemento
- modified: alteração de existente
- removed: remoção (raro, requer justificativa forte)
- preserved: mantido sem alteração

NÍVEIS DE AGRESSIVIDADE:
- conservative: só muda com evidência forte (>70% confidence)
- moderate: muda com evidência razoável (>50% confidence)
- aggressive: mais experimental (>30% confidence)`;
    }

    /**
     * Recalibra o Centro de Comando
     */
    async recalibrate(input) {
        const {
            current_command_center,
            governance_summaries,
            updated_vaults,
            performance_trends,
            weights,
            recalibration_config
        } = input;

        const { aggressiveness = 'moderate', preserve_fields = [], focus_areas = [] } = recalibration_config || {};

        const taskPrompt = `Recalibre o Centro de Comando para o próximo ciclo.

COMMAND CENTER ATUAL:
${JSON.stringify(current_command_center, null, 2)}

RESUMOS DE GOVERNANÇA:
${JSON.stringify(governance_summaries, null, 2)}

VAULTS ATUALIZADOS:
${JSON.stringify(updated_vaults, null, 2)}

TENDÊNCIAS DE PERFORMANCE:
${JSON.stringify(performance_trends, null, 2)}

PESOS:
- peso_vaults: ${weights.peso_vaults} (${weights.peso_vaults * 100}% de influência dos Vaults)
- peso_governanca: ${weights.peso_governanca} (${weights.peso_governanca * 100}% de influência da Governança)
- peso_performance: ${weights.peso_performance} (${weights.peso_performance * 100}% de influência da Performance)
- peso_calendario: ${weights.peso_calendario} (${weights.peso_calendario * 100}% de influência do Calendário)

CONFIGURAÇÃO:
- Agressividade: ${aggressiveness}
- Campos a preservar: ${preserve_fields.join(', ') || 'nenhum'}
- Áreas de foco: ${focus_areas.join(', ') || 'todas'}

THRESHOLD DE CONFIDENCE POR AGRESSIVIDADE:
- conservative: só aplica mudanças com confidence > 70%
- moderate: aplica mudanças com confidence > 50%
- aggressive: aplica mudanças com confidence > 30%

RETORNE JSON com esta estrutura:
{
  "recalibrated_command_center": {
    "command_center_id": "${current_command_center.command_center_id}",
    "version": "nova_versão_incrementada",
    "status": "draft",
    "kpis": [/* KPIs recalibrados */],
    "roadmap": [/* Roadmap recalibrado */],
    "calendario": [/* Calendário recalibrado */],
    "generation_metadata": {/* metadata atualizada */},
    "validation_checklist": [/* itens para revisão */]
  },
  "changelog": [
    {
      "change_id": "uuid",
      "tipo": "kpi|roadmap|calendario",
      "acao": "added|modified|removed|preserved",
      "item_id": "id do item afetado",
      "campo": "campo específico ou 'item_inteiro'",
      "valor_anterior": "valor antes",
      "valor_novo": "valor depois",
      "justificativa": "POR QUE esta mudança - OBRIGATÓRIO",
      "fontes": [
        {
          "tipo": "vault|governanca|performance|calendario",
          "referencia": "identificador",
          "peso_aplicado": numero,
          "contribuicao": "como influenciou"
        }
      ],
      "confidence": 0-100,
      "reversivel": true|false
    }
  ],
  "recalibration_summary": {
    "total_changes": numero,
    "changes_by_type": {
      "kpi": { "added": 0, "modified": 0, "removed": 0, "preserved": 0 },
      "roadmap": { "added": 0, "modified": 0, "removed": 0, "preserved": 0 },
      "calendario": { "added": 0, "modified": 0, "removed": 0, "preserved": 0 }
    },
    "major_shifts": [
      {
        "area": "descrição da mudança significativa",
        "impacto": "alto|medio|baixo",
        "motivo": "justificativa resumida"
      }
    ],
    "preserved_elements": [
      {
        "tipo": "kpi|roadmap|calendario",
        "item_id": "id",
        "motivo_preservacao": "por que não mudou"
      }
    ],
    "new_risks_identified": [
      {
        "risco": "descrição",
        "origem": "de onde vem o risco",
        "mitigacao_sugerida": "como mitigar"
      }
    ]
  },
  "validation_required": [
    {
      "item": "descrição do que precisa validação",
      "motivo": "por que precisa aprovar",
      "impacto": "consequência se aprovado/rejeitado",
      "prioridade": "critical|high|medium|low"
    }
  ],
  "weights_influence_report": {
    "vault_signals": [
      {
        "signal": "o que os Vaults indicam",
        "strength": 0-1,
        "weighted_influence": numero
      }
    ],
    "governance_signals": [/* idem */],
    "performance_signals": [/* idem */],
    "calendar_signals": [/* idem */],
    "convergent_signals": ["sinais que apontam mesma direção"],
    "divergent_signals": ["sinais conflitantes"],
    "final_decision_rationale": "como os pesos influenciaram as decisões finais"
  },
  "source_mapping": {}
}`;

        const result = await this.execute(input, taskPrompt);

        if (result.success) {
            result.output.timestamp = new Date().toISOString();

            // Incrementa versão
            if (result.output.recalibrated_command_center) {
                result.output.recalibrated_command_center.version =
                    this.incrementVersion(current_command_center.version);
            }

            // Gera IDs para changelog
            (result.output.changelog || []).forEach(change => {
                if (!change.change_id) change.change_id = uuidv4();
                change.timestamp = new Date().toISOString();
            });
        }

        return result;
    }

    /**
     * Incrementa versão
     */
    incrementVersion(version) {
        if (!version) return '1.0.0';
        const parts = version.split('.').map(Number);
        parts[1]++; // Incrementa minor para recalibração
        parts[2] = 0;
        return parts.join('.');
    }

    /**
     * Calcula influência ponderada de sinais
     */
    calculateWeightedInfluence(signals, weights) {
        const influences = {
            from_vaults: 0,
            from_governance: 0,
            from_performance: 0,
            from_calendar: 0
        };

        signals.forEach(signal => {
            const weight = weights[`peso_${signal.source}`] || 0;
            influences[`from_${signal.source}`] += signal.strength * weight;
        });

        return influences;
    }
}

export default RecalibrationEngineAgent;
