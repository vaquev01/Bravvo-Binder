import { generateTemplateVariants } from './creativeTemplateProvider';

export const CREATIVE_PROVIDERS = {
    template: {
        id: 'template',
        label: 'Template'
    },
    ai: {
        id: 'ai',
        label: 'AI'
    }
};

export async function generateCreativeAssets({ providerId, item, vaults, formatId, variants, overrides }) {
    if (providerId === 'template') {
        return generateTemplateVariants({ item, vaults, formatId, variants, overrides });
    }

    if (providerId === 'ai') {
        throw new Error('AI provider not connected.');
    }

    throw new Error('Unknown provider.');
}
