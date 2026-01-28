import React, { useEffect, useMemo, useState } from 'react';
import { Download, Settings, X, Palette } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { storageService } from '../../services/storageService';

export function WorkspaceToolsModal({ open, onClose, clientId, appData, setAppData, currentUser, initialTab = 'brand' }) {
    const { addToast } = useToast();
    const [tab, setTab] = useState(initialTab);
    const [importFile, setImportFile] = useState(null);
    const [importText, setImportText] = useState('');
    const [importError, setImportError] = useState('');
    const [snapshots, setSnapshots] = useState([]);

    useEffect(() => {
        if (!open) return;
        setTab(initialTab);
        setImportFile(null);
        setImportText('');
        setImportError('');
    }, [open, initialTab]);

    const autoInspire = Boolean(appData?.workspacePrefs?.autoInspire);
    const themePrefs = appData?.workspacePrefs?.theme || { enabled: false, primaryColor: '#FF5733', accentColor: '#FF5733', fontFamily: 'Inter' };

    const auditLog = useMemo(() => {
        return Array.isArray(appData?.measurementContract?.auditLog) ? appData.measurementContract.auditLog : [];
    }, [appData?.measurementContract?.auditLog]);

    useEffect(() => {
        if (!open || !clientId) {
            setSnapshots([]);
            return;
        }

        const refreshId = window.setTimeout(() => {
            setSnapshots(storageService.getSnapshots(clientId));
        }, 0);

        return () => window.clearTimeout(refreshId);
    }, [open, clientId, auditLog.length]);

    // AUTO-SYNC REMOVED: User prefers manual control via button

    const actorLabel = useMemo(() => {
        return currentUser?.role ? `${currentUser.role} (${currentUser.client?.name || 'System'})` : 'System';
    }, [currentUser]);

    const appendAuditLog = (entry) => {
        setAppData(prev => ({
            ...prev,
            measurementContract: {
                ...(prev?.measurementContract || {}),
                auditLog: [entry, ...((prev?.measurementContract?.auditLog) || [])]
            }
        }));
    };

    const handleThemeChange = (key, value) => {
        setAppData(prev => {
            const currentTheme = prev?.workspacePrefs?.theme || { enabled: false, primaryColor: '#FF5733', accentColor: '#FF5733', fontFamily: 'Inter' };
            const newTheme = { ...currentTheme, [key]: value };

            // Auto-enable if changing properties
            if (key !== 'enabled' && !newTheme.enabled) {
                newTheme.enabled = true;
            }

            return {
                ...prev,
                workspacePrefs: {
                    ...(prev?.workspacePrefs || {}),
                    theme: newTheme
                }
            };
        });
    };

    const handleToggleAutoInspire = () => {
        setAppData(prev => {
            const nextValue = !prev?.workspacePrefs?.autoInspire;
            const entry = {
                id: Date.now() + Math.random(),
                ts: new Date().toISOString(),
                actor: actorLabel,
                action: 'TOGGLE_AUTO_INSPIRE',
                target: 'workspacePrefs.autoInspire',
                oldValue: Boolean(prev?.workspacePrefs?.autoInspire),
                newValue: nextValue
            };

            return {
                ...prev,
                workspacePrefs: {
                    ...(prev?.workspacePrefs || {}),
                    autoInspire: nextValue
                },
                measurementContract: {
                    ...(prev?.measurementContract || {}),
                    auditLog: [entry, ...((prev?.measurementContract?.auditLog) || [])]
                }
            };
        });

        addToast({
            title: 'Auto-Inspirar atualizado',
            description: autoInspire ? 'Auto-Inspirar desativado.' : 'Auto-Inspirar ativado (somente em campos vazios/padrão).',
            type: 'success'
        });
    };

    const handleExport = () => {
        if (!clientId) {
            addToast({ title: 'Export indisponível', description: 'Nenhum cliente ativo.', type: 'error' });
            return;
        }
        const content = storageService.createWorkspaceExport(clientId);
        const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
        a.href = url;
        a.download = `bravvo-workspace-${clientId}-${stamp}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        appendAuditLog({
            id: Date.now() + Math.random(),
            ts: new Date().toISOString(),
            actor: actorLabel,
            action: 'EXPORT_WORKSPACE',
            target: clientId
        });

        addToast({ title: 'Export gerado', description: 'Arquivo baixado com sucesso.', type: 'success' });
    };

    const handleImportFile = (e) => {
        const file = e.target.files?.[0] || null;
        setImportFile(file);
        setImportError('');
        setImportText('');
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = String(event.target?.result || '');
            setImportText(text);
        };
        reader.onerror = () => {
            setImportError('Falha ao ler o arquivo.');
        };
        reader.readAsText(file);
    };

    const handleApplyImport = () => {
        if (!clientId) {
            addToast({ title: 'Import indisponível', description: 'Nenhum cliente ativo.', type: 'error' });
            return;
        }
        if (!importText.trim()) {
            setImportError('Selecione um arquivo para importar.');
            return;
        }

        const ok = window.confirm('Isso vai substituir os dados do workspace atual por este arquivo. Deseja continuar?');
        if (!ok) return;

        try {
            const normalized = storageService.importWorkspaceExport(clientId, importText, {
                clientName: currentUser?.client?.name || appData?.clientName || ''
            });
            setAppData(normalized);

            appendAuditLog({
                id: Date.now() + Math.random(),
                ts: new Date().toISOString(),
                actor: actorLabel,
                action: 'IMPORT_WORKSPACE',
                target: clientId,
                details: importFile?.name || ''
            });

            addToast({ title: 'Import concluído', description: 'Workspace restaurado com sucesso.', type: 'success' });
            onClose();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Falha ao importar.';
            setImportError(msg);
            addToast({ title: 'Falha no import', description: msg, type: 'error' });
        }
    };

    const handleRestoreSnapshot = (ts) => {
        if (!clientId) return;
        const ok = window.confirm('Restaurar snapshot? Isso vai substituir o workspace atual.');
        if (!ok) return;

        const restored = storageService.restoreSnapshot(clientId, ts);
        if (!restored) {
            addToast({ title: 'Snapshot inválido', description: 'Não foi possível restaurar este snapshot.', type: 'error' });
            return;
        }

        setAppData(restored);

        appendAuditLog({
            id: Date.now() + Math.random(),
            ts: new Date().toISOString(),
            actor: actorLabel,
            action: 'RESTORE_SNAPSHOT',
            target: clientId,
            details: ts
        });

        addToast({ title: 'Snapshot restaurado', description: 'Workspace restaurado com sucesso.', type: 'success' });
        onClose();
    };

    const handleDownloadAudit = () => {
        if (!clientId) {
            addToast({ title: 'Audit indisponível', description: 'Nenhum cliente ativo.', type: 'error' });
            return;
        }
        const blob = new Blob([JSON.stringify(auditLog, null, 2)], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
        a.href = url;
        a.download = `bravvo-audit-${clientId}-${stamp}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" data-testid="workspace-tools-modal">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#0A0A0A]">
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                            <Settings size={20} className="text-purple-400" />
                            Workspace Tools
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Cliente: <span className="text-white font-mono">{clientId || 'N/A'}</span></p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex border-b border-white/5 bg-[#050505]">
                    <button
                        onClick={() => setTab('brand')}
                        data-testid="workspace-tab-brand"
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${tab === 'brand' ? 'bg-[#111] text-white border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Marca
                    </button>
                    <button
                        onClick={() => setTab('tools')}
                        data-testid="workspace-tab-tools"
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${tab === 'tools' ? 'bg-[#111] text-white border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Preferências
                    </button>
                    <button
                        onClick={() => setTab('backup')}
                        data-testid="workspace-tab-backup"
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${tab === 'backup' ? 'bg-[#111] text-white border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Backup
                    </button>
                    <button
                        onClick={() => setTab('audit')}
                        data-testid="workspace-tab-audit"
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${tab === 'audit' ? 'bg-[#111] text-white border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Auditoria
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-[#0A0A0A]">
                    {tab === 'brand' && (
                        <div className="space-y-6">
                            <div className="bg-[#111] p-4 rounded-lg border border-white/10">
                                <div className="flex items-center justify-between gap-4 mb-4">
                                    <div>
                                        <div className="text-sm font-bold text-white flex items-center gap-2">
                                            <Palette size={16} className="text-purple-400" />
                                            Personalização da Marca
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">Defina as cores e tipografia do sistema para alinhar com sua identidade visual.</div>
                                    </div>
                                    <label className="flex items-center gap-2 select-none">
                                        <input
                                            type="checkbox"
                                            checked={themePrefs.enabled}
                                            onChange={(e) => handleThemeChange('enabled', e.target.checked)}
                                            className="h-4 w-4"
                                        />
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-300">{themePrefs.enabled ? 'Ativo' : 'Inativo'}</span>
                                    </label>
                                </div>

                                {/* Auto-Sync Status Indicator */}
                                {themePrefs.enabled && (
                                    <div className="mb-4 text-[10px] text-green-400 flex items-center gap-2 animate-fadeIn bg-green-500/10 px-3 py-2 rounded border border-green-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                                        Sincronizado automaticamente com Vault 1 (Marca)
                                    </div>
                                )}

                                <div className={`space-y-4 transition-opacity ${themePrefs.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Cor Primária (Textos/Métricas)</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="color"
                                                    value={themePrefs.primaryColor}
                                                    onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                                                    className="w-10 h-10 rounded border border-white/10 bg-black cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={themePrefs.primaryColor}
                                                    onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                                                    className="bg-black border border-white/10 rounded px-3 py-2 text-xs text-white font-mono w-24 focus:border-purple-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Cor de Destaque (Botões/Links)</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="color"
                                                    value={themePrefs.accentColor}
                                                    onChange={(e) => handleThemeChange('accentColor', e.target.value)}
                                                    className="w-10 h-10 rounded border border-white/10 bg-black cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={themePrefs.accentColor}
                                                    onChange={(e) => handleThemeChange('accentColor', e.target.value)}
                                                    className="bg-black border border-white/10 rounded px-3 py-2 text-xs text-white font-mono w-24 focus:border-purple-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Tipografia Principal</label>
                                        <select
                                            value={themePrefs.fontFamily}
                                            onChange={(e) => handleThemeChange('fontFamily', e.target.value)}
                                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                                        >
                                            <option value="Inter">Inter (Padrão - Moderno)</option>
                                            <option value="Roboto">Roboto (Google - Neutro)</option>
                                            <option value="Open Sans">Open Sans (Legível)</option>
                                            <option value="Lato">Lato (Elegante)</option>
                                            <option value="Montserrat">Montserrat (Geométrico)</option>
                                            <option value="Playfair Display">Playfair Display (Serif - Clássico)</option>
                                            <option value="Courier Prime">Courier Prime (Monospace - Técnico)</option>
                                        </select>
                                    </div>

                                    <div className="pt-2 border-t border-white/5">
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>Visualização em tempo real</span>
                                            <button
                                                onClick={() => setAppData(prev => ({
                                                    ...prev,
                                                    workspacePrefs: {
                                                        ...(prev?.workspacePrefs || {}),
                                                        theme: { enabled: false, primaryColor: '#FF5733', accentColor: '#FF5733', fontFamily: 'Inter' }
                                                    }
                                                }))}
                                                className="text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                Resetar Padrões
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'tools' && (
                        <div className="space-y-6">
                            <div className="bg-[#111] p-4 rounded-lg border border-white/10">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <div className="text-sm font-bold text-white">Auto-Inspirar</div>
                                        <div className="text-xs text-gray-500 mt-1">Quando ligado, o sistema pode aplicar templates automaticamente (somente em campos vazios/padrão).</div>
                                    </div>
                                    <label className="flex items-center gap-2 select-none" data-testid="workspace-auto-inspire">
                                        <input
                                            type="checkbox"
                                            checked={autoInspire}
                                            onChange={handleToggleAutoInspire}
                                            className="h-4 w-4"
                                        />
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-300">{autoInspire ? 'ON' : 'OFF'}</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'backup' && (
                        <div className="space-y-6">
                            <div className="bg-[#111] p-4 rounded-lg border border-white/10 flex items-center justify-between gap-4">
                                <div>
                                    <div className="text-sm font-bold text-white">Exportar Workspace</div>
                                    <div className="text-xs text-gray-500 mt-1">Gera um JSON versionado com checksum (para restore confiável).</div>
                                </div>
                                <button onClick={handleExport} className="btn-ghost !h-8 !px-3" data-testid="workspace-export">
                                    <Download size={14} /> Exportar
                                </button>
                            </div>

                            <div className="bg-[#111] p-4 rounded-lg border border-white/10">
                                <div>
                                    <div className="text-sm font-bold text-white">Importar Workspace</div>
                                    <div className="text-xs text-gray-500 mt-1">Substitui o workspace atual por um export válido.</div>
                                </div>

                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <input
                                            type="file"
                                            accept="application/json,.json"
                                            onChange={handleImportFile}
                                            className="block w-full text-xs text-gray-400"
                                            data-testid="workspace-import-file"
                                        />
                                        {importError && <div className="mt-2 text-xs text-red-400">{importError}</div>}
                                        <button
                                            onClick={handleApplyImport}
                                            className="btn-primary !h-8 !px-3 mt-3"
                                            data-testid="workspace-import-apply"
                                            disabled={!importText.trim()}
                                        >
                                            Aplicar Import
                                        </button>
                                    </div>
                                    <div>
                                        <textarea
                                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white font-mono text-[11px] focus:border-purple-500 focus:outline-none transition-colors min-h-[140px]"
                                            placeholder="Preview do arquivo..."
                                            value={importText}
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#111] p-4 rounded-lg border border-white/10">
                                <div className="text-sm font-bold text-white">Snapshots (últimos {snapshots.length})</div>
                                <div className="text-xs text-gray-500 mt-1">Restaurar um snapshot substitui o workspace atual.</div>
                                <div className="mt-3 space-y-2" data-testid="workspace-snapshots">
                                    {snapshots.length === 0 ? (
                                        <div className="text-xs text-gray-500">Nenhum snapshot disponível.</div>
                                    ) : (
                                        snapshots.map(s => (
                                            <div key={s.ts} className="flex items-center justify-between gap-3 border border-white/5 rounded px-3 py-2 bg-black/20">
                                                <div className="text-xs text-gray-300 font-mono">{s.ts}</div>
                                                <button
                                                    onClick={() => handleRestoreSnapshot(s.ts)}
                                                    className="btn-ghost !h-7 !px-3"
                                                    data-testid={`workspace-restore-${s.ts}`}
                                                >
                                                    Restaurar
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'audit' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-bold text-white">Audit Log</div>
                                    <div className="text-xs text-gray-500 mt-1">Registro local por cliente (ações críticas do workspace).</div>
                                </div>
                                <button onClick={handleDownloadAudit} className="btn-ghost !h-8 !px-3" data-testid="workspace-audit-download">
                                    <Download size={14} /> Baixar
                                </button>
                            </div>

                            <div className="border border-white/10 rounded-lg overflow-hidden">
                                <div className="max-h-[340px] overflow-y-auto">
                                    {auditLog.length === 0 ? (
                                        <div className="p-4 text-xs text-gray-500">Nenhum evento registrado.</div>
                                    ) : (
                                        auditLog.slice(0, 50).map((e) => (
                                            <div key={String(e?.id)} className="px-4 py-3 border-b border-white/5 bg-black/10">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="text-xs text-white font-mono">{e?.action}</div>
                                                    <div className="text-[10px] text-gray-500 font-mono">{e?.ts}</div>
                                                </div>
                                                <div className="mt-1 text-[11px] text-gray-400">{e?.actor}</div>
                                                {(e?.target || e?.details) && (
                                                    <div className="mt-1 text-[11px] text-gray-500 font-mono">{String(e?.target || '')}{e?.details ? ` • ${String(e.details)}` : ''}</div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/10 bg-[#0A0A0A] flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded text-xs font-bold text-gray-400 hover:text-white transition-colors">
                        FECHAR
                    </button>
                </div>
            </div>
        </div>
    );
}
