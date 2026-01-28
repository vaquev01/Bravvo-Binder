import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

const ASSET_TYPES = {
    logos: { label: 'Logos', icon: '🎨', color: 'purple' },
    textures: { label: 'Texturas', icon: '🖼️', color: 'blue' },
    icons: { label: 'Ícones', icon: '✨', color: 'yellow' },
    postTemplates: { label: 'Templates', icon: '📸', color: 'green' }
};

export function AssetUploader({ assets = [], onUpdate, assetType = 'logos', maxFiles = 10 }) {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showTagInput, setShowTagInput] = useState(null);
    const [newTag, setNewTag] = useState('');

    const typeConfig = ASSET_TYPES[assetType] || ASSET_TYPES.logos;

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        processFiles(files);
    };

    const processFiles = (files) => {
        const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif'];
        const validFiles = files.filter(f => validTypes.includes(f.type));

        if (assets.length + validFiles.length > maxFiles) {
            alert(`Máximo de ${maxFiles} arquivos permitidos`);
            return;
        }

        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newAsset = {
                    id: `ASSET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: file.name,
                    data: e.target.result,
                    type: file.type,
                    size: file.size,
                    tags: [],
                    createdAt: new Date().toISOString()
                };
                onUpdate([...assets, newAsset]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeAsset = (id) => {
        onUpdate(assets.filter(a => a.id !== id));
    };

    const addTagToAsset = (assetId) => {
        if (!newTag.trim()) return;
        onUpdate(assets.map(a =>
            a.id === assetId
                ? { ...a, tags: [...(a.tags || []), newTag.trim()] }
                : a
        ));
        setNewTag('');
        setShowTagInput(null);
    };

    const removeTagFromAsset = (assetId, tag) => {
        onUpdate(assets.map(a =>
            a.id === assetId
                ? { ...a, tags: (a.tags || []).filter(t => t !== tag) }
                : a
        ));
    };

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                    ${isDragging
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-[var(--border-subtle)] hover:border-[var(--border-active)] bg-[var(--bg-panel)]'
                    }
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <Upload size={32} className={`mx-auto mb-2 ${isDragging ? 'text-purple-400' : 'text-gray-500'}`} />
                <p className="text-sm text-gray-400">
                    <span className="text-white font-medium">Clique para enviar</span> ou arraste arquivos aqui
                </p>
                <p className="text-xs text-gray-600 mt-1">PNG, JPG, WEBP, SVG (máx. {maxFiles} arquivos)</p>
            </div>

            {/* Assets Grid */}
            {assets.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {assets.map((asset) => (
                        <div
                            key={asset.id}
                            className="group relative bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg overflow-hidden hover:border-purple-500/50 transition-colors"
                        >
                            {/* Image Preview */}
                            <div className="aspect-square relative">
                                <img
                                    src={asset.data}
                                    alt={asset.name}
                                    className="w-full h-full object-cover"
                                />
                                {/* Delete Button */}
                                <button
                                    type="button"
                                    onClick={() => removeAsset(asset.id)}
                                    className="absolute top-1 right-1 p-1.5 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} className="text-white" />
                                </button>
                            </div>

                            {/* Info */}
                            <div className="p-2">
                                <p className="text-xs text-white truncate" title={asset.name}>
                                    {asset.name}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {(asset.tags || []).map(tag => (
                                        <span
                                            key={tag}
                                            onClick={() => removeTagFromAsset(asset.id, tag)}
                                            className="text-[9px] bg-purple-500/30 text-purple-300 px-1 rounded cursor-pointer hover:bg-red-500/30 hover:text-red-300"
                                            title="Clique para remover"
                                        >
                                            {tag}
                                        </span>
                                    ))}

                                    {showTagInput === asset.id ? (
                                        <input
                                            type="text"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addTagToAsset(asset.id)}
                                            onBlur={() => { addTagToAsset(asset.id); setShowTagInput(null); }}
                                            placeholder="Tag..."
                                            autoFocus
                                            className="text-[9px] bg-[var(--bg-deep)] border border-[var(--border-subtle)] text-white px-1 rounded w-12 outline-none"
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setShowTagInput(asset.id)}
                                            className="text-[9px] text-gray-500 hover:text-white"
                                        >
                                            + tag
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Counter */}
            <p className="text-xs text-gray-500 text-right">
                {assets.length}/{maxFiles} {typeConfig.label.toLowerCase()}
            </p>
        </div>
    );
}
