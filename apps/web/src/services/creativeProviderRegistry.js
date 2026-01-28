import { generateTemplateVariants } from './creativeTemplateProvider';

export const PROVIDER_STATUS = {
    ACTIVE: 'active',
    COMING_SOON: 'coming_soon',
    DISABLED: 'disabled'
};

export const CREATIVE_PROVIDERS = {
    template: {
        id: 'template',
        label: 'Template',
        description: 'Geração baseada em templates SVG com paleta de marca',
        status: PROVIDER_STATUS.ACTIVE,
        capabilities: ['svg', 'instant', 'brand_colors'],
        requiresApiKey: false,
        icon: 'Layout'
    },
    openai_dalle: {
        id: 'openai_dalle',
        label: 'OpenAI DALL-E',
        description: 'Geração de imagens com DALL-E 3',
        status: PROVIDER_STATUS.COMING_SOON,
        capabilities: ['ai_generation', 'photorealistic', 'creative'],
        requiresApiKey: true,
        apiKeyEnvVar: 'VITE_OPENAI_API_KEY',
        icon: 'Sparkles'
    },
    midjourney: {
        id: 'midjourney',
        label: 'Midjourney',
        description: 'Arte estilizada com Midjourney',
        status: PROVIDER_STATUS.COMING_SOON,
        capabilities: ['ai_generation', 'artistic', 'stylized'],
        requiresApiKey: true,
        apiKeyEnvVar: 'VITE_MIDJOURNEY_API_KEY',
        icon: 'Palette'
    },
    stability: {
        id: 'stability',
        label: 'Stability AI',
        description: 'Geração com Stable Diffusion',
        status: PROVIDER_STATUS.COMING_SOON,
        capabilities: ['ai_generation', 'fast', 'customizable'],
        requiresApiKey: true,
        apiKeyEnvVar: 'VITE_STABILITY_API_KEY',
        icon: 'Zap'
    },
    canva: {
        id: 'canva',
        label: 'Canva',
        description: 'Templates profissionais do Canva',
        status: PROVIDER_STATUS.COMING_SOON,
        capabilities: ['templates', 'professional', 'drag_drop'],
        requiresApiKey: true,
        apiKeyEnvVar: 'VITE_CANVA_API_KEY',
        icon: 'PenTool'
    }
};

export function listProviders() {
    return Object.values(CREATIVE_PROVIDERS);
}

export function listActiveProviders() {
    return Object.values(CREATIVE_PROVIDERS).filter(p => p.status === PROVIDER_STATUS.ACTIVE);
}

export function getProvider(providerId) {
    return CREATIVE_PROVIDERS[providerId] || null;
}

export function isProviderAvailable(providerId) {
    const provider = getProvider(providerId);
    if (!provider) return false;
    if (provider.status !== PROVIDER_STATUS.ACTIVE) return false;
    if (provider.requiresApiKey) {
        const apiKey = import.meta.env?.[provider.apiKeyEnvVar];
        return Boolean(apiKey);
    }
    return true;
}

export async function generateCreativeAssets({ providerId, item, vaults, formatId, variants, overrides }) {
    const provider = getProvider(providerId);
    
    if (!provider) {
        throw new Error(`Unknown provider: ${providerId}`);
    }

    if (provider.status === PROVIDER_STATUS.COMING_SOON) {
        throw new Error(`Provider "${provider.label}" coming soon. Use Template for now.`);
    }

    if (provider.status === PROVIDER_STATUS.DISABLED) {
        throw new Error(`Provider "${provider.label}" is currently disabled.`);
    }

    if (provider.requiresApiKey) {
        const apiKey = import.meta.env?.[provider.apiKeyEnvVar];
        if (!apiKey) {
            throw new Error(`API key not configured for ${provider.label}. Set ${provider.apiKeyEnvVar} in your .env file.`);
        }
    }

    // Route to provider-specific generators
    switch (providerId) {
        case 'template':
            return generateTemplateVariants({ item, vaults, formatId, variants, overrides });
        
        case 'openai_dalle':
            return generateWithOpenAI({ item, vaults, formatId, variants, overrides });
        
        case 'midjourney':
            return generateWithMidjourney({ item, vaults, formatId, variants, overrides });
        
        case 'stability':
            return generateWithStability({ item, vaults, formatId, variants, overrides });
        
        case 'canva':
            return generateWithCanva({ item, vaults, formatId, variants, overrides });
        
        default:
            throw new Error(`No generator implemented for provider: ${providerId}`);
    }
}

// Stub generators for future AI integrations
async function generateWithOpenAI({ _item, _vaults, _formatId, _variants, _overrides }) {
    // TODO: Implement OpenAI DALL-E integration
    // const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    // const prompt = buildPromptFromItem(item, vaults, overrides);
    // const response = await fetch('https://api.openai.com/v1/images/generations', { ... });
    throw new Error('OpenAI DALL-E integration not yet implemented.');
}

async function generateWithMidjourney({ _item, _vaults, _formatId, _variants, _overrides }) {
    // TODO: Implement Midjourney integration (via Discord API or third-party)
    throw new Error('Midjourney integration not yet implemented.');
}

async function generateWithStability({ _item, _vaults, _formatId, _variants, _overrides }) {
    // TODO: Implement Stability AI integration
    // const apiKey = import.meta.env.VITE_STABILITY_API_KEY;
    // const response = await fetch('https://api.stability.ai/v1/generation/...', { ... });
    throw new Error('Stability AI integration not yet implemented.');
}

async function generateWithCanva({ _item, _vaults, _formatId, _variants, _overrides }) {
    // TODO: Implement Canva API integration
    throw new Error('Canva integration not yet implemented.');
}

// Utility for building AI prompts from item data
export function buildCreativePrompt(item, vaults, overrides = {}) {
    const brand = vaults?.S1?.fields || {};
    const palette = vaults?.S5?.palette || {};
    
    const headline = overrides?.headline || item?.initiative || 'Marketing Creative';
    const description = overrides?.subheadline || item?.caption || brand?.promise || '';
    const cta = overrides?.cta || 'Learn More';
    
    const colorHint = palette?.primary ? `Brand colors: ${palette.primary}, ${palette.secondary || '#1E293B'}` : '';
    
    return {
        prompt: `Professional marketing creative for: ${headline}. ${description}. CTA: ${cta}. ${colorHint}. Clean, modern design.`,
        negativePrompt: 'blurry, low quality, distorted text, amateur, cluttered',
        style: 'professional marketing',
        brandContext: {
            name: brand?.name || '',
            promise: brand?.promise || '',
            palette
        }
    };
}
