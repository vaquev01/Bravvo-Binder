# BravvoOS - AI Orchestration Architecture

## Overview

Sistema de orquestração de IA event-driven para o BravvoOS, seguindo princípios MCP (Model Context Protocol).

## Princípios Fundamentais

1. **Vaults são sagrados**: IA nunca modifica dados de Vaults sem validação humana
2. **Outputs como rascunho**: Toda geração criativa é DRAFT + justificativa
3. **Rastreabilidade total**: Cada dado tem `source_mapping` obrigatório
4. **Anti-alucinação**: Lacunas explícitas, inferências marcadas com confidence
5. **Pesos configuráveis**: Influenciam sem engessar criatividade

---

## Arquitetura de Agentes

### 1. Vault Analyzer
**Responsabilidade**: Processar e resumir cada Vault (V1-V5)
- Input: Conteúdo bruto do Vault
- Output: Resumo estruturado + gaps + perguntas de validação
- **NUNCA modifica dados originais**

### 2. Context Synthesizer
**Responsabilidade**: Derivar contexto de calendário do Vault 1
- Input: Análise do V1 (nicho, região, abrangência)
- Output: Sazonalidades, eventos-chave, períodos críticos

### 3. Command Center Generator
**Responsabilidade**: Gerar KPIs + Roadmap + Calendário
- Input: Todas análises + contexto + pesos
- Output: **RASCUNHO** com justificativas e alternativas

### 4. Governance Summarizer
**Responsabilidade**: Resumir ciclos de governança
- Input: Decisões, ações, performance do ciclo
- Output: Resumo executivo + insights + recomendações

### 5. Recalibration Engine
**Responsabilidade**: Recalibrar Centro de Comando
- Input: CC atual + resumos + performance + pesos
- Output: CC recalibrado + changelog detalhado

### 6. Gap Detector
**Responsabilidade**: Identificar lacunas e inconsistências
- Input: Análises + Command Center
- Output: Gaps + perguntas para humanos + health score

---

## Sistema de Eventos

### Eventos Disponíveis

| Evento | Trigger | Ação |
|--------|---------|------|
| `vault_completed` | Usuário completa vault | Analisa vault, sintetiza contexto (se V1) |
| `generate_command_center` | Usuário clica "Gerar" | Gera CC como draft |
| `governance_completed` | Ciclo finalizado | Resume ciclo, trigger recalibração |
| `recalibrate_command_center` | Pós-governança ou manual | Recalibra CC com changelog |

### Fluxo Principal

```
[V1 completo] → vault_completed → VaultAnalyzer → ContextSynthesizer
[V2-V5 completos] → vault_completed → VaultAnalyzer → GapDetector
[Gerar CC] → generate_command_center → CommandCenterGenerator → DRAFT
[Aprovar] → command_center_approved → Status: approved
[Ciclo completo] → governance_completed → GovernanceSummarizer → recalibrate
[Recalibrar] → RecalibrationEngine → DRAFT + changelog
```

---

## Sistema de Pesos

### Pesos Padrão
```javascript
{
  peso_vaults: 0.4,      // 40% - Dados estratégicos
  peso_governanca: 0.3,  // 30% - Padrões de decisão
  peso_performance: 0.2, // 20% - Resultados reais
  peso_calendario: 0.1   // 10% - Sazonalidade
}
```

### Presets Disponíveis
- **balanced**: Equilíbrio entre todas fontes
- **vault_focused**: Prioriza dados dos Vaults (60%)
- **performance_driven**: Prioriza resultados (40%)
- **governance_heavy**: Prioriza padrões (50%)
- **seasonal_aware**: Alta influência de sazonalidade (25%)

### Modos de Recalibração
- **conservative**: Só muda com confidence > 70%
- **moderate**: Muda com confidence > 50%
- **aggressive**: Muda com confidence > 30%

---

## API Endpoints

### Vaults
```
POST /ai/vaults/:vaultId/complete  - Marca vault como completo
GET  /ai/vaults/:vaultId/analysis  - Retorna análise do vault
```

### Command Center
```
POST /ai/command-center/generate   - Gera Centro de Comando
GET  /ai/command-center            - Retorna CC atual
POST /ai/command-center/approve    - Aprova CC (draft → approved)
```

### Governance
```
POST /ai/governance/complete       - Marca ciclo como completo
GET  /ai/governance/:cycleId/summary - Retorna resumo do ciclo
```

### Recalibration
```
POST /ai/recalibrate              - Recalibra CC
POST /ai/recalibrate/apply        - Aplica recalibração aprovada
```

### Weights
```
GET  /ai/weights                  - Retorna pesos atuais
PUT  /ai/weights                  - Atualiza pesos
POST /ai/weights/preset           - Aplica preset
```

### Gaps & State
```
GET  /ai/gaps/detect              - Executa detecção de gaps
GET  /ai/state                    - Estado do sistema
GET  /ai/context                  - Contexto de calendário
GET  /ai/events                   - Histórico de eventos
GET  /ai/events/stats             - Estatísticas de eventos
```

---

## Estratégias Anti-Alucinação

### 1. Separação Fatos vs Inferências
```javascript
{
  "facts": { "source": "V1.nicho", "value": "varejo" },
  "inferences": { 
    "based_on": ["V1.nicho"], 
    "confidence": 75,
    "assumptions": ["mercado brasileiro padrão"]
  }
}
```

### 2. Modo "Lacunas Primeiro"
- Identifica o que falta
- Pergunta ao humano
- Só infere se configurado
- Marca inferências claramente

### 3. Validação em Camadas
1. **Estrutural**: Campos obrigatórios presentes
2. **Semântica**: Valores fazem sentido
3. **Rastreabilidade**: Toda inferência tem fonte
4. **Cross-Component**: GapDetector verifica consistência

### 4. Confidence Score
- 0-30%: Requer dados adicionais
- 31-50%: Baixa confiança, validar com humano
- 51-70%: Confiança moderada
- 71-100%: Alta confiança

---

## Exemplo de Uso

### 1. Completar Vault V1
```bash
curl -X POST http://localhost:3001/ai/vaults/V1/complete \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "raw_data": {
        "nicho": "varejo",
        "regiao": "São Paulo",
        "abrangencia": "regional",
        "proposta_valor": "Melhor experiência de compra"
      }
    }
  }'
```

### 2. Gerar Command Center
```bash
curl -X POST http://localhost:3001/ai/command-center/generate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "initial",
    "weights": {
      "peso_vaults": 0.4,
      "peso_governanca": 0.3,
      "peso_performance": 0.2,
      "peso_calendario": 0.1
    }
  }'
```

### 3. Aprovar Command Center
```bash
curl -X POST http://localhost:3001/ai/command-center/approve \
  -H "X-User-Id: user123"
```

---

## Estrutura de Arquivos

```
apps/api/src/ai/
├── agents/
│   ├── base-agent.js              # Classe base anti-alucinação
│   ├── vault-analyzer.js
│   ├── context-synthesizer.js
│   ├── command-center-generator.js
│   ├── governance-summarizer.js
│   ├── recalibration-engine.js
│   ├── gap-detector.js
│   └── index.js
├── events/
│   ├── event-bus.js               # EventEmitter + persistência
│   └── event-store.js             # Armazenamento de eventos
├── orchestrator/
│   ├── workflow.js                # Orquestração principal
│   └── weights.js                 # Sistema de pesos
├── schemas/
│   ├── vault.schema.js
│   ├── command-center.schema.js
│   └── governance.schema.js
└── index.js                       # Exports
```

---

## Configuração

### Variáveis de Ambiente
```env
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
OPENAI_API_KEY=sk-your-key-here
AI_MODEL=gpt-4o
AI_TEMPERATURE=0.3
```

### Dependências
```json
{
  "openai": "^4.28.0",
  "uuid": "^9.0.0"
}
```

---

## Próximos Passos (Roadmap)

1. [ ] Persistência em banco de dados (PostgreSQL/MongoDB)
2. [ ] Redis para Event Store em produção
3. [ ] WebSockets para eventos real-time no frontend
4. [ ] Dashboard de monitoramento de agentes
5. [ ] Testes automatizados para agentes
6. [ ] Rate limiting e retry logic para OpenAI
7. [ ] Versionamento de prompts
