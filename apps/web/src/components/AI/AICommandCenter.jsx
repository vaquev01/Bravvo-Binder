/**
 * AI Command Center Component
 * Interface para geração e gerenciamento do Centro de Comando com IA
 */

import React, { useState, useEffect } from 'react';
import { 
  Wand2, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Settings, 
  Target,
  Calendar,
  TrendingUp,
  FileText,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useOrchestration } from '../../hooks/useOrchestration';
import { useToast } from '../../contexts/ToastContext';
import { orchestrationService } from '../../services/orchestrationService';

export function AICommandCenter({ appData, onCommandCenterGenerated }) {
  const { addToast } = useToast();
  const {
    state,
    commandCenter,
    weights,
    gaps,
    loading,
    error,
    isApiAvailable,
    generateCommandCenter,
    approveCommandCenter,
    detectGaps,
    updateWeights,
    applyWeightPreset
  } = useOrchestration();

  const [showWeights, setShowWeights] = useState(false);
  const [showGaps, setShowGaps] = useState(false);
  const [localWeights, setLocalWeights] = useState(weights);
  const [generationMode, setGenerationMode] = useState('initial');

  useEffect(() => {
    if (weights) {
      setLocalWeights(weights);
    }
  }, [weights]);

  // Sync vaults to API before generating
  const syncVaultsToApi = async () => {
    if (!appData?.vaults) return { synced: 0, errors: [] };
    
    const vaultMapping = { S1: 'V1', S2: 'V2', S3: 'V3', S4: 'V4', S5: 'V5' };
    const errors = [];
    let synced = 0;

    for (const [storageKey, vaultId] of Object.entries(vaultMapping)) {
      const vaultData = appData.vaults[storageKey];
      if (vaultData && Object.keys(vaultData).length > 0) {
        try {
          await orchestrationService.completeVault(vaultId, {
            raw_data: vaultData.fields || vaultData,
            metadata: {
              filled_at: new Date().toISOString(),
              client_name: appData.clientName || 'Cliente'
            }
          });
          synced++;
        } catch (err) {
          console.error(`Error syncing ${vaultId}:`, err);
          errors.push({ vault: vaultId, error: err.message });
        }
      }
    }

    return { synced, errors };
  };

  // Handlers
  const handleGenerate = async () => {
    try {
      // First sync all vaults to API
      addToast({
        title: 'Sincronizando Vaults...',
        description: 'Enviando dados para a IA',
        type: 'info'
      });

      const syncResult = await syncVaultsToApi();
      
      if (syncResult.synced === 0) {
        addToast({
          title: 'Nenhum Vault preenchido',
          description: 'Preencha pelo menos V1, V2, V3 primeiro',
          type: 'error'
        });
        return;
      }

      if (syncResult.synced < 3) {
        addToast({
          title: 'Vaults insuficientes',
          description: `Apenas ${syncResult.synced} vault(s) sincronizado(s). Complete V1, V2, V3.`,
          type: 'warning'
        });
      }

      // Now generate command center
      const result = await generateCommandCenter({
        mode: generationMode,
        weights: localWeights
      });

      if (result.success) {
        addToast({
          title: 'Centro de Comando Gerado!',
          description: `${result.command_center.kpis_count} KPIs, ${result.command_center.roadmap_phases} fases no roadmap`,
          type: 'success'
        });

        if (onCommandCenterGenerated) {
          onCommandCenterGenerated(result);
        }
      } else {
        addToast({
          title: 'Erro na Geração',
          description: result.error || 'Verifique os gaps identificados',
          type: 'error'
        });
      }
    } catch (err) {
      addToast({
        title: 'Erro',
        description: err.message,
        type: 'error'
      });
    }
  };

  const handleApprove = async () => {
    try {
      await approveCommandCenter();
      addToast({
        title: 'Aprovado!',
        description: 'Centro de Comando ativo',
        type: 'success'
      });
    } catch (err) {
      addToast({
        title: 'Erro',
        description: err.message,
        type: 'error'
      });
    }
  };

  const handleDetectGaps = async () => {
    try {
      await detectGaps();
      setShowGaps(true);
    } catch (err) {
      addToast({
        title: 'Erro',
        description: err.message,
        type: 'error'
      });
    }
  };

  const handleWeightChange = (key, value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    setLocalWeights(prev => {
      const newWeights = { ...prev, [key]: numValue };
      // Normaliza para somar 1
      const sum = Object.values(newWeights).reduce((a, b) => a + b, 0);
      if (sum > 0) {
        Object.keys(newWeights).forEach(k => {
          newWeights[k] = newWeights[k] / sum;
        });
      }
      return newWeights;
    });
  };

  const handleSaveWeights = async () => {
    try {
      await updateWeights(localWeights, 'Ajuste manual pelo usuário');
      addToast({
        title: 'Pesos Salvos',
        type: 'success'
      });
    } catch (err) {
      addToast({
        title: 'Erro',
        description: err.message,
        type: 'error'
      });
    }
  };

  const handleApplyPreset = async (preset) => {
    try {
      await applyWeightPreset(preset);
      addToast({
        title: 'Preset Aplicado',
        description: preset,
        type: 'success'
      });
    } catch (err) {
      addToast({
        title: 'Erro',
        description: err.message,
        type: 'error'
      });
    }
  };

  // Render API not available
  if (!isApiAvailable) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-3 text-amber-400">
          <AlertCircle className="w-5 h-5" />
          <span>API de IA não disponível. Inicie o servidor backend.</span>
        </div>
        <code className="block mt-3 text-sm text-slate-400 bg-slate-900 p-2 rounded">
          npm run dev -w @bravvo/api
        </code>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Centro de Comando IA</h2>
              <p className="text-sm text-slate-400">
                Orquestração inteligente baseada nos seus Vaults
              </p>
            </div>
          </div>
          
          {commandCenter && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              commandCenter.status === 'approved' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-amber-500/20 text-amber-400'
            }`}>
              {commandCenter.status === 'approved' ? 'Ativo' : 'Rascunho'}
            </div>
          )}
        </div>

        {/* Status dos Vaults */}
        <div className="mt-4 flex gap-2">
          {['V1', 'V2', 'V3', 'V4', 'V5'].map(v => {
            const isAnalyzed = state.vault_analyses?.includes(v);
            return (
              <div 
                key={v}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  isAnalyzed 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {v} {isAnalyzed && '✓'}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading.commandCenter}
          className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl text-white font-medium transition-all disabled:opacity-50"
        >
          {loading.commandCenter ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Wand2 className="w-5 h-5" />
          )}
          <span>
            {commandCenter ? 'Regenerar' : 'Gerar'} Centro de Comando
          </span>
        </button>

        {/* Approve Button */}
        {commandCenter && commandCenter.status === 'draft' && (
          <button
            onClick={handleApprove}
            disabled={loading.commandCenter}
            className="flex items-center justify-center gap-3 p-4 bg-green-600 hover:bg-green-500 rounded-xl text-white font-medium transition-all disabled:opacity-50"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Aprovar e Ativar</span>
          </button>
        )}

        {/* Detect Gaps */}
        <button
          onClick={handleDetectGaps}
          disabled={loading.gaps}
          className="flex items-center justify-center gap-3 p-4 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-all disabled:opacity-50"
        >
          {loading.gaps ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span>Detectar Lacunas</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => setShowWeights(!showWeights)}
          className="flex items-center justify-center gap-3 p-4 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-all"
        >
          <Settings className="w-5 h-5" />
          <span>Configurar Pesos</span>
          {showWeights ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Weights Configuration */}
      {showWeights && localWeights && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Pesos de Recalibração
          </h3>
          
          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            {['balanced', 'vault_focused', 'performance_driven', 'governance_heavy', 'seasonal_aware'].map(preset => (
              <button
                key={preset}
                onClick={() => handleApplyPreset(preset)}
                className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded-full text-slate-300"
              >
                {preset.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {/* Sliders */}
          <div className="space-y-3">
            {[
              { key: 'peso_vaults', label: 'Vaults (Estratégia)', icon: FileText },
              { key: 'peso_governanca', label: 'Governança (Decisões)', icon: Target },
              { key: 'peso_performance', label: 'Performance (Resultados)', icon: TrendingUp },
              { key: 'peso_calendario', label: 'Calendário (Sazonalidade)', icon: Calendar }
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-300">
                    <Icon className="w-4 h-4" />
                    {label}
                  </span>
                  <span className="text-purple-400 font-mono">
                    {Math.round((localWeights[key] || 0) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round((localWeights[key] || 0) * 100)}
                  onChange={(e) => handleWeightChange(key, e.target.value / 100)}
                  className="w-full accent-purple-500"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveWeights}
            className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium"
          >
            Salvar Pesos
          </button>
        </div>
      )}

      {/* Gaps Display */}
      {showGaps && gaps && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Lacunas Detectadas
            </h3>
            <div className="text-sm">
              <span className="text-slate-400">Health Score: </span>
              <span className={`font-bold ${
                gaps.detection?.health_score?.overall >= 70 ? 'text-green-400' :
                gaps.detection?.health_score?.overall >= 40 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {gaps.detection?.health_score?.overall || 0}/100
              </span>
            </div>
          </div>

          {gaps.gaps?.length > 0 ? (
            <div className="space-y-2">
              {gaps.gaps.map((gap, i) => (
                <div 
                  key={i}
                  className={`p-3 rounded-lg border ${
                    gap.severidade === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                    gap.severidade === 'high' ? 'bg-amber-500/10 border-amber-500/30' :
                    'bg-slate-700/50 border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      gap.severidade === 'critical' ? 'bg-red-500/20 text-red-400' :
                      gap.severidade === 'high' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-600 text-slate-300'
                    }`}>
                      {gap.severidade}
                    </span>
                    <span className="text-sm text-slate-300">{gap.descricao}</span>
                  </div>
                  {gap.sugestao_resolucao && (
                    <p className="mt-2 text-xs text-slate-400 pl-4 border-l border-slate-600">
                      💡 {gap.sugestao_resolucao}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-400 text-sm">✓ Nenhuma lacuna crítica detectada</p>
          )}

          {gaps.questions?.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Perguntas para você:</h4>
              <div className="space-y-2">
                {gaps.questions.map((q, i) => (
                  <div key={i} className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-300">❓ {q.pergunta}</p>
                    <p className="text-xs text-slate-400 mt-1">{q.contexto}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Command Center Preview */}
      {commandCenter && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
          <h3 className="font-semibold text-white">
            Centro de Comando v{commandCenter.version}
          </h3>

          {/* KPIs */}
          {commandCenter.kpis?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                KPIs ({commandCenter.kpis.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {commandCenter.kpis.slice(0, 4).map((kpi, i) => (
                  <div key={i} className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="font-medium text-white text-sm">{kpi.nome}</div>
                    <div className="text-xs text-slate-400">Meta: {kpi.meta} {kpi.unidade}</div>
                    <div className="mt-1 text-xs text-purple-400">
                      Confiança: {kpi.confidence}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Roadmap */}
          {commandCenter.roadmap?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Roadmap ({commandCenter.roadmap.length} fases)
              </h4>
              <div className="space-y-2">
                {commandCenter.roadmap.slice(0, 3).map((fase, i) => (
                  <div key={i} className="p-3 bg-slate-700/50 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white text-sm">{fase.nome}</div>
                      <div className="text-xs text-slate-400">
                        {fase.objetivos?.length || 0} objetivos
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {fase.duracao_semanas}sem
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation Checklist */}
          {commandCenter.validation_checklist?.length > 0 && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <h4 className="text-sm font-medium text-amber-400 mb-2">
                ⚠️ Itens para Validação
              </h4>
              <ul className="space-y-1">
                {commandCenter.validation_checklist.slice(0, 3).map((item, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      item.priority === 'critical' ? 'bg-red-400' :
                      item.priority === 'high' ? 'bg-amber-400' : 'bg-slate-400'
                    }`} />
                    {item.item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

export default AICommandCenter;
