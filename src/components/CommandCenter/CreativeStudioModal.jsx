import React, { useEffect, useMemo, useState } from 'react';
import { X, Download, CheckCircle2, Wand2 } from 'lucide-react';
import { listCreativeFormats } from '../../services/creativeFormatCatalog';
import { generateCreativeAssets } from '../../services/creativeProviderRegistry';
import {
    listChannels,
    listSubchannels,
    getDefaultSubchannelId,
    toLegacyChannelLabel,
    getAllowedCreativeFormats,
    getDefaultCreativeFormatId,
    parseLegacyChannelLabel
} from '../../services/channelTaxonomy';

function downloadUrl(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

async function svgUrlToPngDataUrl(svgUrl, width, height) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = svgUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    return canvas.toDataURL('image/png');
}

export function CreativeStudioModal({ open, onClose, item, vaults, onSave, onGeneratePrompt }) {
    const allFormats = useMemo(() => listCreativeFormats(), []);
    const brandPromise = vaults?.S1?.fields?.promise || '';

    const [providerId, setProviderId] = useState('template');
    const [channelId, setChannelId] = useState('instagram');
    const [subchannelId, setSubchannelId] = useState('feed');
    const [formatId, setFormatId] = useState(allFormats[0]?.id || 'story_9_16');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [overrides, setOverrides] = useState({ headline: '', subheadline: '', cta: '' });
    const [loading, setLoading] = useState(false);
    const [assets, setAssets] = useState([]);
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        if (!open) {
            setAssets([]);
            setSelectedId(null);
            setShowAdvanced(false);
        }
    }, [open]);

    useEffect(() => {
        if (!open || !item) return;
        const parsed = parseLegacyChannelLabel(item.channel || 'Instagram Feed');
        const nextChannelId = item.channelId || parsed.channelId || 'instagram';
        const nextSubchannelId = item.subchannelId || parsed.subchannelId || getDefaultSubchannelId(nextChannelId) || 'feed';
        setChannelId(nextChannelId);
        setSubchannelId(nextSubchannelId);
        setFormatId(prev => {
            const allowed = getAllowedCreativeFormats(nextChannelId, nextSubchannelId);
            if (allowed.includes(prev)) return prev;
            return getDefaultCreativeFormatId(nextChannelId, nextSubchannelId);
        });

        setOverrides({
            headline: item.initiative || '',
            subheadline: item.caption || brandPromise,
            cta: 'Saiba mais'
        });
    }, [open, item, brandPromise]);

    if (!open || !item) return null;

    const allowedFormatIds = getAllowedCreativeFormats(channelId, subchannelId);
    const formats = allowedFormatIds.length > 0
        ? allFormats.filter(f => allowedFormatIds.includes(f.id))
        : allFormats;

    const safeFormatId = formats.some(f => f.id === formatId) ? formatId : (formats[0]?.id || 'story_9_16');

    const cleanOverrides = {
        headline: (overrides.headline || '').trim(),
        subheadline: (overrides.subheadline || '').trim(),
        cta: (overrides.cta || '').trim()
    };

    const overridesToSend = Object.values(cleanOverrides).some(v => Boolean(v))
        ? cleanOverrides
        : null;

    const selected = assets.find(a => a.id === selectedId) || assets[0] || null;

    const handleGeneratePrompt = async () => {
        if (typeof onGeneratePrompt !== 'function') return;
        const itemWithTaxonomy = {
            ...item,
            channelId,
            subchannelId,
            channel: toLegacyChannelLabel(channelId, subchannelId)
        };
        await onGeneratePrompt(itemWithTaxonomy);
        onClose();
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const itemWithTaxonomy = {
                ...item,
                channelId,
                subchannelId,
                channel: toLegacyChannelLabel(channelId, subchannelId)
            };
            const generated = await generateCreativeAssets({
                providerId,
                item: itemWithTaxonomy,
                vaults,
                formatId: safeFormatId,
                variants: 3,
                overrides: overridesToSend
            });
            setAssets(generated);
            setSelectedId(generated[0]?.id || null);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!selected) return;
        const fileBase = (item?.initiative || 'creative').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
        const filename = `${fileBase}-${selected.formatId}.png`;
        const png = await svgUrlToPngDataUrl(selected.previewUrl, selected.width, selected.height);
        downloadUrl(png, filename);
    };

    const handleSave = async () => {
        if (!selected) return;
        onSave({
            id: `${selected.id}`,
            itemId: item.id,
            provider: selected.provider,
            channelId,
            subchannelId,
            channel: toLegacyChannelLabel(channelId, subchannelId),
            formatId: selected.formatId,
            width: selected.width,
            height: selected.height,
            createdAt: new Date().toISOString(),
            previewUrl: selected.previewUrl,
            svg: selected.svg,
            overrides: overridesToSend
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-lg w-full max-w-5xl animate-fadeIn flex flex-col max-h-[92vh] shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-white/10 bg-[#0A0A0A]">
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Creative Studio</h3>
                        <p className="text-[10px] text-gray-500 font-mono">Item: {item.initiative || item.id}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white p-2" data-testid="creative-close">
                        <X size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[360px_1fr]">
                    <div className="border-r border-white/10 p-4 overflow-y-auto custom-scrollbar">
                        <div className="space-y-4">
                            <div>
                                <label className="text-label">Provider</label>
                                <select
                                    className="premium-input bg-[#111]"
                                    value={providerId}
                                    onChange={e => setProviderId(e.target.value)}
                                    data-testid="creative-provider"
                                >
                                    <option value="template">Template</option>
                                    <option value="ai">IDF Prompt</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-label">Formato</label>
                                <select
                                    className="premium-input bg-[#111]"
                                    value={safeFormatId}
                                    onChange={e => setFormatId(e.target.value)}
                                    data-testid="creative-format"
                                >
                                    {formats.map(f => (
                                        <option key={f.id} value={f.id}>{f.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-label">Canal</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        className="premium-input bg-[#111]"
                                        value={channelId}
                                        onChange={e => {
                                            const nextChannelId = e.target.value;
                                            const nextSub = getDefaultSubchannelId(nextChannelId) || '';
                                            setChannelId(nextChannelId);
                                            setSubchannelId(nextSub);
                                            setFormatId(getDefaultCreativeFormatId(nextChannelId, nextSub));
                                        }}
                                        data-testid="creative-channel"
                                    >
                                        {listChannels().map(c => (
                                            <option key={c.id} value={c.id}>{c.label}</option>
                                        ))}
                                    </select>
                                    <select
                                        className="premium-input bg-[#111]"
                                        value={subchannelId}
                                        onChange={e => {
                                            const nextSub = e.target.value;
                                            setSubchannelId(nextSub);
                                            setFormatId(getDefaultCreativeFormatId(channelId, nextSub));
                                        }}
                                        data-testid="creative-subchannel"
                                    >
                                        {listSubchannels(channelId).map(sc => (
                                            <option key={sc.id} value={sc.id}>{sc.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="bento-grid p-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAdvanced(v => !v)}
                                    className="w-full text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                                    data-testid="creative-advanced-toggle"
                                >
                                    {showAdvanced ? 'Editor Avançado: ON' : 'Editor Avançado: OFF'}
                                </button>

                                {showAdvanced && (
                                    <div className="mt-3 space-y-3">
                                        <div>
                                            <label className="text-label">Headline</label>
                                            <input
                                                className="premium-input bg-[#111]"
                                                value={overrides.headline}
                                                onChange={e => setOverrides(prev => ({ ...prev, headline: e.target.value }))}
                                                data-testid="creative-override-headline"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-label">Subheadline</label>
                                            <textarea
                                                className="premium-input bg-[#111] min-h-[90px]"
                                                value={overrides.subheadline}
                                                onChange={e => setOverrides(prev => ({ ...prev, subheadline: e.target.value }))}
                                                data-testid="creative-override-subheadline"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-label">CTA</label>
                                            <input
                                                className="premium-input bg-[#111]"
                                                value={overrides.cta}
                                                onChange={e => setOverrides(prev => ({ ...prev, cta: e.target.value }))}
                                                data-testid="creative-override-cta"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {providerId === 'ai' ? (
                                <button
                                    type="button"
                                    onClick={handleGeneratePrompt}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                    disabled={loading}
                                    data-testid="creative-generate-prompt"
                                >
                                    <Wand2 size={14} />
                                    {loading ? 'Gerando...' : 'Gerar Prompt (IDF)'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleGenerate}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                    disabled={loading}
                                    data-testid="creative-generate"
                                >
                                    <Wand2 size={14} />
                                    {loading ? 'Gerando...' : 'Gerar variações'}
                                </button>
                            )}

                            <div className="grid grid-cols-3 gap-2">
                                {assets.map(a => (
                                    <button
                                        key={a.id}
                                        onClick={() => setSelectedId(a.id)}
                                        className={`border rounded overflow-hidden transition-colors ${a.id === (selected?.id) ? 'border-purple-500/70' : 'border-white/10 hover:border-white/20'}`}
                                        title={a.id}
                                        type="button"
                                        data-testid={`creative-variant-${a.id}`}
                                    >
                                        <img src={a.previewUrl} alt="variant" className="w-full h-20 object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 overflow-y-auto custom-scrollbar">
                        {!selected ? (
                            <div className="h-full flex items-center justify-center text-gray-600">
                                Selecione um formato e gere variações.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bento-grid p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-gray-400 font-mono">{selected.formatId} • {selected.width}×{selected.height}</div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={handleDownload} className="btn-ghost !h-8 !px-3" data-testid="creative-download">
                                                <Download size={14} />
                                            </button>
                                            <button onClick={handleSave} className="btn-primary !h-8 !px-3" data-testid="creative-save">
                                                <CheckCircle2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center">
                                    <img
                                        src={selected.previewUrl}
                                        alt="preview"
                                        className="max-h-[70vh] rounded-lg border border-white/10"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
