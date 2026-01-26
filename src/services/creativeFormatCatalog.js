export const CREATIVE_FORMATS = {
    // Vertical formats
    story_9_16: {
        id: 'story_9_16',
        label: 'Story 9:16',
        width: 1080,
        height: 1920,
        aspectRatio: '9:16',
        category: 'vertical'
    },
    // Square/Feed formats
    feed_4_5: {
        id: 'feed_4_5',
        label: 'Feed 4:5',
        width: 1080,
        height: 1350,
        aspectRatio: '4:5',
        category: 'feed'
    },
    feed_1_1: {
        id: 'feed_1_1',
        label: 'Feed 1:1',
        width: 1080,
        height: 1080,
        aspectRatio: '1:1',
        category: 'feed'
    },
    // Horizontal formats
    landscape_16_9: {
        id: 'landscape_16_9',
        label: 'Landscape 16:9',
        width: 1920,
        height: 1080,
        aspectRatio: '16:9',
        category: 'horizontal'
    },
    youtube_thumbnail: {
        id: 'youtube_thumbnail',
        label: 'YouTube Thumbnail',
        width: 1280,
        height: 720,
        aspectRatio: '16:9',
        category: 'horizontal'
    },
    linkedin_post: {
        id: 'linkedin_post',
        label: 'LinkedIn Post',
        width: 1200,
        height: 627,
        aspectRatio: '1.91:1',
        category: 'horizontal'
    },
    // Display Ad formats
    display_300_250: {
        id: 'display_300_250',
        label: 'Display 300×250',
        width: 300,
        height: 250,
        aspectRatio: '6:5',
        category: 'display'
    },
    display_728_90: {
        id: 'display_728_90',
        label: 'Leaderboard 728×90',
        width: 728,
        height: 90,
        aspectRatio: '8:1',
        category: 'display'
    },
    display_160_600: {
        id: 'display_160_600',
        label: 'Skyscraper 160×600',
        width: 160,
        height: 600,
        aspectRatio: '4:15',
        category: 'display'
    },
    display_320_50: {
        id: 'display_320_50',
        label: 'Mobile Banner 320×50',
        width: 320,
        height: 50,
        aspectRatio: '32:5',
        category: 'display'
    },
    // Email formats
    email_600: {
        id: 'email_600',
        label: 'Email Header 600px',
        width: 600,
        height: 200,
        aspectRatio: '3:1',
        category: 'email'
    }
};

export function getCreativeFormat(id) {
    return CREATIVE_FORMATS[id] || CREATIVE_FORMATS.story_9_16;
}

export function listCreativeFormats() {
    return Object.values(CREATIVE_FORMATS);
}
