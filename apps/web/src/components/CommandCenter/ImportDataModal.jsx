import React, { useState } from 'react';
import { Upload, FileText, Check, AlertCircle, X, Save } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function ImportDataModal({ open, onClose, contract, onImport }) {
    const { t } = useLanguage();
    const [mode, setMode] = useState('manual'); // 'manual' | 'csv'
    const [manualValues, setManualValues] = useState({});
    const [csvFile, setCsvFile] = useState(null);
    const [previewData, setPreviewData] = useState(null);

    if (!open || !contract) return null;

    // Filter KPIs that allow manual or csv input
    const eligibleKpis = contract.kpis.filter(k => k.source !== 'api');

    const handleManualChange = (id, value) => {
        setManualValues(prev => ({ ...prev, [id]: value }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCsvFile(file);
            // Mock parsing for visual feedback
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                // Simple preview: just showing first few lines or success message
                setPreviewData({ name: file.name, size: file.size, rows: text.split('\n').length });
            };
            reader.readAsText(file);
        }
    };

    const handleSubmit = () => {
        const importData = {
            mode,
            timestamp: new Date().toISOString(),
            values: mode === 'manual' ? manualValues : { file: csvFile?.name, status: 'processed_mock' }
        };
        onImport(importData);
        onClose();
        // Reset state
        setManualValues({});
        setCsvFile(null);
        setPreviewData(null);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#0A0A0A]">
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                            <Upload size={20} className="text-purple-500" />
                            {t('os.import.title') || 'Importar Dados'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Ciclo Ativo: <span className="text-white font-mono">{contract.cycle.label}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5 bg-[#050505]">
                    <button
                        onClick={() => setMode('manual')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${mode === 'manual' ? 'bg-[#111] text-white border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Entrada Manual
                    </button>
                    <button
                        onClick={() => setMode('csv')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${mode === 'csv' ? 'bg-[#111] text-white border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Upload CSV / Planilha
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#0A0A0A]">
                    
                    {mode === 'manual' && (
                        <div className="space-y-6">
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle size={16} className="text-blue-400 mt-0.5" />
                                <div className="text-sm text-blue-200">
                                    Preencha os valores atuais para os KPIs definidos no contrato deste ciclo.
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {eligibleKpis.map(kpi => (
                                    <div key={kpi.id} className="bg-[#111] p-4 rounded-lg border border-white/5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                                            {kpi.label}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white font-mono focus:border-purple-500 focus:outline-none transition-colors"
                                                placeholder="0.00"
                                                value={manualValues[kpi.id] || ''}
                                                onChange={(e) => handleManualChange(kpi.id, e.target.value)}
                                            />
                                            <span className="text-xs text-gray-500 font-mono">{kpi.format === 'currency' ? 'BRL' : ''}</span>
                                        </div>
                                        {kpi.target && (
                                            <div className="mt-2 text-[10px] text-gray-600 flex justify-between">
                                                <span>Meta: {kpi.target}</span>
                                                <span className={manualValues[kpi.id] >= kpi.target ? "text-green-500" : "text-red-500"}>
                                                    {manualValues[kpi.id] ? (manualValues[kpi.id] / kpi.target * 100).toFixed(0) + '%' : '0%'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {mode === 'csv' && (
                        <div className="space-y-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                            <div 
                                className={`w-full max-w-md border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer ${csvFile ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-purple-500/50 hover:bg-white/5'}`}
                            >
                                <input 
                                    type="file" 
                                    accept=".csv,.xlsx" 
                                    className="hidden" 
                                    id="csv-upload"
                                    onChange={handleFileUpload}
                                />
                                <label htmlFor="csv-upload" className="flex flex-col items-center cursor-pointer w-full h-full">
                                    {csvFile ? (
                                        <>
                                            <FileText size={48} className="text-green-500 mb-4" />
                                            <p className="text-white font-bold">{csvFile.name}</p>
                                            <p className="text-sm text-gray-500 mt-1">{(csvFile.size / 1024).toFixed(2)} KB</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={48} className="text-gray-500 mb-4" />
                                            <p className="text-gray-300 font-medium">Arraste sua planilha ou clique aqui</p>
                                            <p className="text-xs text-gray-600 mt-2">Suporta CSV e Excel</p>
                                        </>
                                    )}
                                </label>
                            </div>

                            {previewData && (
                                <div className="w-full max-w-md bg-[#111] rounded-lg p-4 border border-white/10 text-xs text-gray-400 font-mono">
                                    <p className="mb-1 text-green-400 flex items-center gap-2"><Check size={12}/> Arquivo pronto para processamento</p>
                                    <p>Linhas detectadas: {previewData.rows}</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-[#0A0A0A] flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded text-xs font-bold text-gray-400 hover:text-white transition-colors">
                        CANCELAR
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={mode === 'csv' && !csvFile}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={14} />
                        Processar Importação
                    </button>
                </div>
            </div>
        </div>
    );
}
