export const CREATIVE_FORMATS = {
    story_9_16: {
        id: 'story_9_16',
        label: 'Story 9:16',
        width: 1080,
        height: 1920,
        aspectRatio: '9:16'
    },
    feed_4_5: {
        id: 'feed_4_5',
        label: 'Feed 4:5',
        width: 1080,
        height: 1350,
        aspectRatio: '4:5'
    },
    feed_1_1: {
        id: 'feed_1_1',
        label: 'Feed 1:1',
        width: 1080,
        height: 1080,
        aspectRatio: '1:1'
    }
};

export function getCreativeFormat(id) {
    return CREATIVE_FORMATS[id] || CREATIVE_FORMATS.story_9_16;
}

export function listCreativeFormats() {
    return Object.values(CREATIVE_FORMATS);
}
