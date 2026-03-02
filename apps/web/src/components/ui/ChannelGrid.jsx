import React from 'react';
import { Instagram, Music2, Search, MessageCircle, Globe, Store, Youtube, Linkedin, Facebook, Mail } from 'lucide-react';

/**
 * ChannelGrid - Grid de checkboxes visuais para canais de marketing
 * @param {Array} value - Array de canais selecionados
 * @param {function} onChange - Callback com novo array
 */
export function ChannelGrid({ value = [], onChange }) {
    const channels = [
        { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-500' },
        { id: 'tiktok', label: 'TikTok', icon: Music2, color: 'from-cyan-400 to-pink-500' },
        { id: 'google', label: 'Google Ads', icon: Search, color: 'from-blue-500 to-green-500' },
        { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'from-green-500 to-green-600' },
        { id: 'website', label: 'Site Próprio', icon: Globe, color: 'from-gray-400 to-gray-600' },
        { id: 'store', label: 'Loja Física', icon: Store, color: 'from-amber-500 to-orange-500' },
        { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'from-red-500 to-red-600' },
        { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'from-blue-600 to-blue-700' },
        { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'from-blue-500 to-blue-600' },
        { id: 'email', label: 'E-mail Mkt', icon: Mail, color: 'from-yellow-500 to-orange-500' },
    ];

    const toggleChannel = (channelId) => {
        if (value.includes(channelId)) {
            onChange(value.filter(id => id !== channelId));
        } else {
            onChange([...value, channelId]);
        }
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {channels.map((channel) => {
                const isSelected = value.includes(channel.id);
                const IconComponent = channel.icon;

                return (
                    <button
                        key={channel.id}
                        type="button"
                        onClick={() => toggleChannel(channel.id)}
                        className={`
                            relative p-4 rounded-xl border text-center transition-all duration-200 group
                            ${isSelected
                                ? 'bg-white/10 border-white/30'
                                : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                            }
                        `}
                    >
                        {/* Gradient Background on Select */}
                        {isSelected && (
                            <div className={`absolute inset-0 bg-gradient-to-br ${channel.color} opacity-10 rounded-xl`} />
                        )}

                        {/* Checkbox Indicator */}
                        <div className={`
                            absolute top-2 right-2 w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                            ${isSelected
                                ? 'bg-white border-white'
                                : 'border-gray-600 group-hover:border-gray-400'
                            }
                        `}>
                            {isSelected && (
                                <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                </svg>
                            )}
                        </div>

                        {/* Icon */}
                        <div className={`
                            relative z-10 mx-auto mb-2 w-10 h-10 rounded-lg flex items-center justify-center transition-all
                            ${isSelected
                                ? `bg-gradient-to-br ${channel.color} text-white`
                                : 'bg-white/10 text-gray-400 group-hover:text-gray-300'
                            }
                        `}>
                            <IconComponent size={20} />
                        </div>

                        {/* Label */}
                        <span className={`relative z-10 text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                            {channel.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
