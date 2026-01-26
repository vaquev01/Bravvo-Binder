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
                allowedCreativeFormats: ['display_300_250', 'display_728_90', 'display_160_600', 'display_320_50']
            },
            youtube_ads: {
                id: 'youtube_ads',
                label: 'YouTube Ads',
                legacyLabel: 'Google YouTube Ads',
                defaultContentType: 'video_ad',
                allowedCreativeFormats: ['landscape_16_9', 'youtube_thumbnail']
            }
        }
    },
    youtube: {
        id: 'youtube',
        label: 'YouTube',
        subchannels: {
            video: {
                id: 'video',
                label: 'Video',
                legacyLabel: 'YouTube Video',
                defaultContentType: 'video',
                allowedCreativeFormats: ['landscape_16_9', 'youtube_thumbnail']
            },
            shorts: {
                id: 'shorts',
                label: 'Shorts',
                legacyLabel: 'YouTube Shorts',
                defaultContentType: 'short',
                allowedCreativeFormats: ['story_9_16']
            },
            community: {
                id: 'community',
                label: 'Community',
                legacyLabel: 'YouTube Community',
                defaultContentType: 'post',
                allowedCreativeFormats: ['feed_1_1', 'landscape_16_9']
            }
        }
    },
    linkedin: {
        id: 'linkedin',
        label: 'LinkedIn',
        subchannels: {
            post: {
                id: 'post',
                label: 'Post',
                legacyLabel: 'LinkedIn Post',
                defaultContentType: 'post',
                allowedCreativeFormats: ['linkedin_post', 'feed_1_1']
            },
            article: {
                id: 'article',
                label: 'Article',
                legacyLabel: 'LinkedIn Article',
                defaultContentType: 'article',
                allowedCreativeFormats: ['linkedin_post']
            },
            ads: {
                id: 'ads',
                label: 'Ads',
                legacyLabel: 'LinkedIn Ads',
                defaultContentType: 'ad',
                allowedCreativeFormats: ['linkedin_post', 'feed_1_1']
            }
        }
    },
    facebook: {
        id: 'facebook',
        label: 'Facebook',
        subchannels: {
            feed: {
                id: 'feed',
                label: 'Feed',
                legacyLabel: 'Facebook Feed',
                defaultContentType: 'post',
                allowedCreativeFormats: ['feed_4_5', 'feed_1_1', 'landscape_16_9']
            },
            stories: {
                id: 'stories',
                label: 'Stories',
                legacyLabel: 'Facebook Stories',
                defaultContentType: 'story',
                allowedCreativeFormats: ['story_9_16']
            },
            reels: {
                id: 'reels',
                label: 'Reels',
                legacyLabel: 'Facebook Reels',
                defaultContentType: 'reel',
                allowedCreativeFormats: ['story_9_16']
            },
            ads: {
                id: 'ads',
                label: 'Ads',
                legacyLabel: 'Facebook Ads',
                defaultContentType: 'ad',
                allowedCreativeFormats: ['feed_4_5', 'feed_1_1', 'story_9_16']
            }
        }
    },
    twitter: {
        id: 'twitter',
        label: 'X (Twitter)',
        subchannels: {
            tweet: {
                id: 'tweet',
                label: 'Tweet',
                legacyLabel: 'Twitter Tweet',
                defaultContentType: 'post',
                allowedCreativeFormats: ['feed_1_1', 'landscape_16_9']
            },
            ads: {
                id: 'ads',
                label: 'Ads',
                legacyLabel: 'Twitter Ads',
                defaultContentType: 'ad',
                allowedCreativeFormats: ['feed_1_1', 'landscape_16_9']
            }
        }
    },
    email: {
        id: 'email',
        label: 'Email',
        subchannels: {
            newsletter: {
                id: 'newsletter',
                label: 'Newsletter',
                legacyLabel: 'Email Newsletter',
                defaultContentType: 'email',
                allowedCreativeFormats: ['email_600']
            },
            promotional: {
                id: 'promotional',
                label: 'Promotional',
                legacyLabel: 'Email Promocional',
                defaultContentType: 'email',
                allowedCreativeFormats: ['email_600']
            }
        }
    },
    blog: {
        id: 'blog',
        label: 'Blog',
        subchannels: {
            article: {
                id: 'article',
                label: 'Article',
                legacyLabel: 'Blog Article',
                defaultContentType: 'article',
                allowedCreativeFormats: ['landscape_16_9', 'linkedin_post']
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
