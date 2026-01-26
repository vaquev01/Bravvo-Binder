import { CREATIVE_FORMATS } from './creativeFormatCatalog';

export const CHANNELS = {
    instagram: {
        id: 'instagram',
        label: 'Instagram',
        subchannels: {
            feed: {
                id: 'feed',
                label: 'Feed',
                legacyLabel: 'Instagram Feed',
                defaultContentType: 'post',
                allowedCreativeFormats: ['feed_4_5', 'feed_1_1']
            },
            stories: {
                id: 'stories',
                label: 'Stories',
                legacyLabel: 'Instagram Stories',
                defaultContentType: 'story',
                allowedCreativeFormats: ['story_9_16']
            },
            reels: {
                id: 'reels',
                label: 'Reels',
                legacyLabel: 'Instagram Reels',
                defaultContentType: 'reel',
                allowedCreativeFormats: ['story_9_16']
            },
            carousel: {
                id: 'carousel',
                label: 'Carousel',
                legacyLabel: 'Instagram Carousel',
                defaultContentType: 'carousel',
                allowedCreativeFormats: ['feed_4_5', 'feed_1_1']
            }
        }
    },
    tiktok: {
        id: 'tiktok',
        label: 'TikTok',
        subchannels: {
            main: {
                id: 'main',
                label: 'Video',
                legacyLabel: 'TikTok',
                defaultContentType: 'reel',
                allowedCreativeFormats: ['story_9_16']
            }
        }
    },
    whatsapp: {
        id: 'whatsapp',
        label: 'WhatsApp',
        subchannels: {
            status: {
                id: 'status',
                label: 'Status',
                legacyLabel: 'WhatsApp Status',
                defaultContentType: 'story',
                allowedCreativeFormats: ['story_9_16']
            },
            broadcast: {
                id: 'broadcast',
                label: 'Broadcast',
                legacyLabel: 'WhatsApp Lista',
                defaultContentType: 'text',
                allowedCreativeFormats: ['story_9_16']
            }
        }
    },
    google_ads: {
        id: 'google_ads',
        label: 'Google Ads',
        subchannels: {
            search: {
                id: 'search',
                label: 'Search',
                legacyLabel: 'Google Ads',
                defaultContentType: 'ad',
                allowedCreativeFormats: ['feed_1_1', 'feed_4_5']
            },
            display: {
                id: 'display',
                label: 'Display',
                legacyLabel: 'Google Ads Display',
                defaultContentType: 'ad',
                allowedCreativeFormats: ['feed_1_1', 'feed_4_5']
            }
        }
    }
};

export function listChannels() {
    return Object.values(CHANNELS).map(c => ({ id: c.id, label: c.label }));
}

export function listSubchannels(channelId) {
    const channel = CHANNELS[channelId];
    if (!channel) return [];
    return Object.values(channel.subchannels).map(sc => ({
        id: sc.id,
        label: sc.label,
        legacyLabel: sc.legacyLabel,
        defaultContentType: sc.defaultContentType,
        allowedCreativeFormats: sc.allowedCreativeFormats
    }));
}

export function getDefaultSubchannelId(channelId) {
    const channel = CHANNELS[channelId];
    const first = channel ? Object.keys(channel.subchannels)[0] : null;
    return first || null;
}

export function toLegacyChannelLabel(channelId, subchannelId) {
    const sc = CHANNELS?.[channelId]?.subchannels?.[subchannelId];
    return sc?.legacyLabel || 'Instagram Feed';
}

export function getAllowedCreativeFormats(channelId, subchannelId) {
    const sc = CHANNELS?.[channelId]?.subchannels?.[subchannelId];
    const ids = Array.isArray(sc?.allowedCreativeFormats) ? sc.allowedCreativeFormats : [];
    return ids.filter(id => Boolean(CREATIVE_FORMATS[id]));
}

export function getDefaultCreativeFormatId(channelId, subchannelId) {
    const allowed = getAllowedCreativeFormats(channelId, subchannelId);
    return allowed[0] || 'story_9_16';
}

export function getDefaultContentType(channelId, subchannelId) {
    const sc = CHANNELS?.[channelId]?.subchannels?.[subchannelId];
    return sc?.defaultContentType || 'post';
}

export function parseLegacyChannelLabel(label) {
    if (typeof label !== 'string') return { channelId: 'instagram', subchannelId: 'feed' };
    const entry = label.trim().toLowerCase();

    for (const channel of Object.values(CHANNELS)) {
        for (const sc of Object.values(channel.subchannels)) {
            if (sc.legacyLabel?.toLowerCase() === entry) {
                return { channelId: channel.id, subchannelId: sc.id };
            }
        }
    }

    // Best-effort fallbacks
    if (entry.includes('story')) return { channelId: 'instagram', subchannelId: 'stories' };
    if (entry.includes('reel')) return { channelId: 'instagram', subchannelId: 'reels' };
    if (entry.includes('tiktok')) return { channelId: 'tiktok', subchannelId: 'main' };
    if (entry.includes('whatsapp')) return { channelId: 'whatsapp', subchannelId: 'status' };
    if (entry.includes('google')) return { channelId: 'google_ads', subchannelId: 'search' };

    return { channelId: 'instagram', subchannelId: 'feed' };
}
