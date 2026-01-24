/**
 * BRAVVO OS - Advanced AI Prompt Generator
 * Generates detailed prompts for art/video production with AI model specifications
 */

// AI Model Specifications
const AI_MODELS = {
    image: {
        midjourney: {
            name: 'Midjourney v6',
            aspectRatios: { feed: '4:5', story: '9:16', reel: '9:16', carousel: '1:1' },
            styles: ['--v 6', '--style raw', '--stylize 100'],
            quality: '--q 2'
        },
        dalle: {
            name: 'DALL-E 3',
            aspectRatios: { feed: '1024x1280', story: '1024x1792', reel: '1024x1792', carousel: '1024x1024' },
            styles: ['vivid', 'natural'],
            quality: 'hd'
        },
        flux: {
            name: 'Flux Pro',
            aspectRatios: { feed: '4:5', story: '9:16', reel: '9:16', carousel: '1:1' },
            styles: ['photorealistic', 'cinematic'],
            quality: 'ultra'
        }
    },
    video: {
        runway: {
            name: 'Runway Gen-3',
            duration: '4-10s',
            motion: ['camera_pan', 'zoom_in', 'static', 'dolly'],
            styles: ['cinematic', 'commercial', 'documentary']
        },
        pika: {
            name: 'Pika Labs',
            duration: '3-5s',
            motion: ['motion_1', 'motion_2', 'motion_3'],
            styles: ['realistic', 'stylized']
        },
        kling: {
            name: 'Kling AI',
            duration: '5-10s',
            motion: ['smooth', 'dynamic', 'dramatic'],
            styles: ['cinematic', 'commercial']
        }
    }
};

// Mood to Visual Style Mapping
const MOOD_VISUAL_MAP = {
    minimalista: { lighting: 'soft natural light', colors: 'muted, neutral tones', composition: 'clean negative space' },
    moderno: { lighting: 'studio lighting with soft shadows', colors: 'bold contrasting', composition: 'geometric balance' },
    rustico: { lighting: 'warm golden hour', colors: 'earthy browns and oranges', composition: 'textured backgrounds' },
    colorido: { lighting: 'bright even lighting', colors: 'vibrant saturated', composition: 'dynamic angles' },
    elegante: { lighting: 'dramatic chiaroscuro', colors: 'rich darks with gold accents', composition: 'luxurious props' },
    organico: { lighting: 'natural diffused daylight', colors: 'greens and earth tones', composition: 'natural elements' }
};

// Archetype to Creative Direction Mapping
const ARCHETYPE_CREATIVE = {
    'O Criador': { visualStyle: 'artistic and innovative', cameraWork: 'creative angles, unique perspectives', editPace: 'rhythmic with creative transitions' },
    'O Herói': { visualStyle: 'powerful and aspirational', cameraWork: 'low angles, hero shots', editPace: 'building momentum, climactic' },
    'O Rebelde': { visualStyle: 'edgy and disruptive', cameraWork: 'handheld, raw footage', editPace: 'fast cuts, glitch effects' },
    'O Sábio': { visualStyle: 'clean and informative', cameraWork: 'stable, centered framing', editPace: 'measured, thoughtful' },
    'O Amante': { visualStyle: 'sensual and intimate', cameraWork: 'close-ups, shallow depth', editPace: 'slow, lingering moments' },
    'O Governante': { visualStyle: 'authoritative and premium', cameraWork: 'symmetrical, grand scale', editPace: 'controlled, majestic' },
    'O Explorador': { visualStyle: 'adventurous and dynamic', cameraWork: 'wide shots, movement', editPace: 'energetic, discovery-driven' },
    'O Inocente': { visualStyle: 'bright and optimistic', cameraWork: 'eye-level, friendly', editPace: 'gentle, flowing' },
    'O Mago': { visualStyle: 'transformative and magical', cameraWork: 'reveals, transitions', editPace: 'mystical, surprising' },
    'O Cara Comum': { visualStyle: 'authentic and relatable', cameraWork: 'documentary style', editPace: 'natural, conversational' },
    'O Bobo da Corte': { visualStyle: 'fun and playful', cameraWork: 'dynamic, unexpected', editPace: 'quick, comedic timing' },
    'O Prestativo': { visualStyle: 'warm and helpful', cameraWork: 'inviting, inclusive', editPace: 'supportive, clear' }
};

/**
 * Generates a complete AI production brief with image AND video prompts
 */
export function generatePrompt(item, vaults) {
    const s1 = vaults?.S1?.fields || {};
    const products = vaults?.S2?.items || vaults?.S2?.products || [];
    const s2 = products.find(p => p.id === item.offerId) || products[0] || { name: 'Produto Principal', price: 0 };
    const s3Steps = vaults?.S3?.steps || [];
    const conversionStep = s3Steps.find(s => s.step === 'Desejo') || s3Steps[2] || { goal: 'Saiba Mais' };
    const s5 = vaults?.S5 || {};

    const archetype = s1.archetype || 'O Cara Comum';
    const archetypeCreative = ARCHETYPE_CREATIVE[archetype] || ARCHETYPE_CREATIVE['O Cara Comum'];
    const mood = s5.rules?.mood || 'moderno';
    const moodVisual = MOOD_VISUAL_MAP[mood.toLowerCase()] || MOOD_VISUAL_MAP.moderno;

    const isVideo = item.format === 'reel' || item.format === 'video';
    const primaryColor = s5.palette?.primary || '#FF4500';
    const bgColor = s5.palette?.background || '#0A0A0A';

    return `
╔══════════════════════════════════════════════════════════════════════════════╗
║  🎬 BRAVVO OS - AI PRODUCTION BRIEF                                          ║
║  Generated: ${new Date().toLocaleString('pt-BR')}                           ║
╠══════════════════════════════════════════════════════════════════════════════╣

┌─────────────────────────────────────────────────────────────────────────────┐
│ 📋 RESUMO EXECUTIVO                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ Cliente: ${vaults?.clientName || 'Cliente'}
│ Iniciativa: "${item.initiative}"
│ Canal: ${item.channel} (${item.format?.toUpperCase()})
│ Data: ${item.date}
│ Responsável: ${item.responsible || 'Não definido'}
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 🎯 CONTEXTO ESTRATÉGICO                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ ARQUÉTIPO: ${archetype}
│ - Visual Style: ${archetypeCreative.visualStyle}
│ - Camera Work: ${archetypeCreative.cameraWork}
│ - Edit Pace: ${archetypeCreative.editPace}
│
│ PROMESSA DA MARCA: "${s1.promise || 'Não definida'}"
│ INIMIGO: "${s1.enemy || 'Não definido'}"
│ TOM DE VOZ: ${Array.isArray(s1.tone) ? s1.tone.join(', ') : s1.tone || 'Casual'}
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 🛍️ PRODUTO EM DESTAQUE                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ Nome: "${s2.name}"
│ Preço: R$ ${(s2.price || 0).toFixed(2)}
│ Categoria: ${s2.category || 'Geral'}
│ Função: ${s2.role || 'Produto principal'}
│
│ CTA PRINCIPAL: "${conversionStep.goal}"
│ LINK: ${vaults?.S3?.traffic?.primarySource || 'WhatsApp'}
└─────────────────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════════════════╗
║  🎨 PROMPTS DE GERAÇÃO DE IMAGEM                                             ║
╠══════════════════════════════════════════════════════════════════════════════╣

▓▓▓ MIDJOURNEY V6 ▓▓▓
${generateImagePrompt(item, s2, archetypeCreative, moodVisual, 'midjourney', primaryColor)}

▓▓▓ DALL-E 3 ▓▓▓
${generateImagePrompt(item, s2, archetypeCreative, moodVisual, 'dalle', primaryColor)}

▓▓▓ FLUX PRO ▓▓▓
${generateImagePrompt(item, s2, archetypeCreative, moodVisual, 'flux', primaryColor)}

${isVideo ? `
╔══════════════════════════════════════════════════════════════════════════════╗
║  🎬 STORYBOARD & VIDEO PROMPTS                                               ║
╠══════════════════════════════════════════════════════════════════════════════╣

▓▓▓ RUNWAY GEN-3 ALPHA ▓▓▓
${generateVideoPrompt(item, s2, archetypeCreative, moodVisual, 'runway')}

▓▓▓ KLING AI ▓▓▓
${generateVideoPrompt(item, s2, archetypeCreative, moodVisual, 'kling')}

▓▓▓ PIKA LABS ▓▓▓
${generateVideoPrompt(item, s2, archetypeCreative, moodVisual, 'pika')}

┌─────────────────────────────────────────────────────────────────────────────┐
│ 📽️ STORYBOARD SUGERIDO (${item.format === 'reel' ? '15-30s' : '30-60s'})   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 
│ CENA 1 (0-3s): HOOK
│ - Visual: Close-up do produto com movimento sutil
│ - Áudio: Som ambiente + beat drop
│ - Texto: Headline impactante
│ - Movimento: Zoom lento ou reveal
│
│ CENA 2 (3-8s): CONTEXTO
│ - Visual: Produto em uso / lifestyle
│ - Áudio: Música de fundo crescendo
│ - Texto: Benefício principal
│ - Movimento: Pan ou tracking shot
│
│ CENA 3 (8-12s): BENEFÍCIOS
│ - Visual: Features do produto
│ - Áudio: Música mantida
│ - Texto: 2-3 bullet points rápidos
│ - Movimento: Cortes dinâmicos
│
│ CENA 4 (12-15s): CTA
│ - Visual: Logo + CTA grande
│ - Áudio: Música resolve
│ - Texto: "${conversionStep.goal}"
│ - Movimento: Zoom out ou fade
└─────────────────────────────────────────────────────────────────────────────┘
` : ''}

╔══════════════════════════════════════════════════════════════════════════════╗
║  ✍️ COPYWRITING GUIDELINES                                                   ║
╠══════════════════════════════════════════════════════════════════════════════╣

HEADLINE OPTIONS:
1. Hook Direto: "[BENEFÍCIO] em [TEMPO/FACILIDADE]"
2. Provocação: "Você ainda [DOR DO CLIENTE]?"
3. Oferta: "[PRODUTO] por apenas R$ ${(s2.price || 0).toFixed(2)}"

CAPTION STRUCTURE:
━━━━━━━━━━━━━━━━━━━━
Hook (1 linha): Frase de impacto que para o scroll
Problema (1-2 linhas): Empatia com a dor do cliente
Solução (1-2 linhas): Como o produto resolve
Prova (1 linha): Social proof ou benefício tangível
CTA (1 linha): "${conversionStep.goal}" + emoji de ação
━━━━━━━━━━━━━━━━━━━━

TOM: ${archetype} - ${archetypeCreative.visualStyle}
HASHTAGS SUGERIDAS: #${(vaults?.clientName || 'marca').replace(/\s/g, '')} #${item.format} #promo

╔══════════════════════════════════════════════════════════════════════════════╗
║  🎨 DESIGN SPECS                                                             ║
╠══════════════════════════════════════════════════════════════════════════════╣

PALETA:
- Primary: ${primaryColor}
- Background: ${bgColor}
- Accent: ${s5.palette?.accent || '#10B981'}

TIPOGRAFIA:
- Headlines: ${s5.typography?.h1?.font || 'Bold Sans-Serif'}, ${s5.typography?.h1?.size || '24-32px'}
- Body: ${s5.typography?.p?.font || 'Regular Sans-Serif'}, ${s5.typography?.p?.size || '14-16px'}

ASPECT RATIO: ${item.format === 'story' || item.format === 'reel' ? '9:16 (1080x1920)' : '4:5 (1080x1350)'}

SAFE ZONES:
- Top: 150px (Stories UI)
- Bottom: 200px (Captions/CTA)
- Sides: 40px margin

╚══════════════════════════════════════════════════════════════════════════════╝
`.trim();
}

/**
 * Generate format-specific image prompt for AI tools
 */
function generateImagePrompt(item, product, archetype, mood, model, primaryColor) {
    const modelConfig = AI_MODELS.image[model];
    const aspectRatio = modelConfig.aspectRatios[item.format] || modelConfig.aspectRatios.feed;

    const basePrompt = `${product.name} product photography, ${mood.lighting}, ${mood.colors}, ${mood.composition}, ${archetype.visualStyle} aesthetic, commercial quality, premium brand feel`;

    if (model === 'midjourney') {
        return `
Prompt:
"${basePrompt}, professional advertising shot, 8k resolution, studio lighting with ${primaryColor} accent, clean background, no text, product hero shot"
--ar ${aspectRatio} --v 6 --style raw --stylize 100 --q 2

Negative: text, watermark, low quality, blurry, distorted
`;
    }

    if (model === 'dalle') {
        return `
Prompt:
"A stunning commercial photograph of ${product.name}. The image features ${mood.lighting} with ${mood.colors}. The composition uses ${mood.composition}. Style: ${archetype.visualStyle}. Shot on professional camera, 8K resolution, advertisement quality. Brand color accent: ${primaryColor}. Clean, modern, premium feel."

Size: ${aspectRatio}
Quality: HD
Style: Vivid
`;
    }

    if (model === 'flux') {
        return `
Prompt:
"${basePrompt}, shot on Hasselblad, 85mm lens, f/2.8, ${mood.lighting}, commercial advertising, ${primaryColor} brand color accent, ultra high definition, photorealistic"

Aspect Ratio: ${aspectRatio}
Quality: Ultra
Style: Photorealistic
`;
    }

    return basePrompt;
}

/**
 * Generate video prompt for AI video tools
 */
function generateVideoPrompt(item, product, archetype, mood, model) {
    const modelConfig = AI_MODELS.video[model];

    const basePrompt = `${product.name} commercial video, ${mood.lighting}, ${archetype.visualStyle} style, ${archetype.cameraWork}, smooth motion, professional quality`;

    if (model === 'runway') {
        return `
Prompt:
"${basePrompt}, cinematic 24fps, shallow depth of field, product in focus with subtle environment blur, ${archetype.editPace} pacing"

Duration: 4 seconds
Motion: camera_pan (slow)
Camera: dolly_zoom_out
Style: Commercial

Extension Prompt (for 10s):
"Continue the shot with smooth camera movement, revealing full product context, maintaining premium lighting and composition"
`;
    }

    if (model === 'kling') {
        return `
Prompt:
"Professional commercial of ${product.name}. ${mood.lighting}, ${mood.colors} color grade. Camera: ${archetype.cameraWork}. Movement: smooth and controlled. Style: ${archetype.visualStyle}."

Duration: 5 seconds
Motion Intensity: Medium
Style: Cinematic
`;
    }

    if (model === 'pika') {
        return `
Prompt:
"${basePrompt}, subtle movement, professional lighting, commercial quality"

Motion: 2 (subtle)
Guidance: 12
FPS: 24
`;
    }

    return basePrompt;
}

/**
 * Generates a simplified prompt for quick copying
 */
export function generateSimplePrompt(item, vaults) {
    const products = vaults?.S2?.items || vaults?.S2?.products || [];
    const s2 = products[0] || { name: 'Produto' };
    const s5 = vaults?.S5 || {};
    const s1 = vaults?.S1?.fields || {};

    return `
Create a ${item.format} for ${s1.archetype || 'modern'} brand.
Product: "${s2.name}"
Colors: Background ${s5.palette?.background || '#000'}, Primary ${s5.palette?.primary || '#FF4500'}
Style: ${s5.rules?.mood || 'premium'}, professional, commercial quality
Text: "${item.initiative}"
No stock photos, authentic feel.
    `.trim();
}

/**
 * Generate a detailed storyboard for video content
 */
export function generateStoryboard(item, vaults, duration = 15) {
    const s1 = vaults?.S1?.fields || {};
    const products = vaults?.S2?.items || vaults?.S2?.products || [];
    const s2 = products[0] || { name: 'Produto' };
    const archetype = s1.archetype || 'O Cara Comum';
    const archetypeCreative = ARCHETYPE_CREATIVE[archetype] || ARCHETYPE_CREATIVE['O Cara Comum'];

    const scenes = [];
    const sceneCount = Math.ceil(duration / 4);

    for (let i = 0; i < sceneCount; i++) {
        const startTime = i * 4;
        const endTime = Math.min(startTime + 4, duration);

        scenes.push({
            scene: i + 1,
            timing: `${startTime}s - ${endTime}s`,
            type: i === 0 ? 'HOOK' : i === sceneCount - 1 ? 'CTA' : 'CONTENT',
            visual: i === 0
                ? `Close-up reveal of ${s2.name}`
                : i === sceneCount - 1
                    ? `Logo + CTA overlay`
                    : `${s2.name} in use / lifestyle shot`,
            camera: archetypeCreative.cameraWork,
            audio: i === 0 ? 'Beat drop / Sound effect' : 'Background music',
            text: i === 0 ? item.initiative : i === sceneCount - 1 ? 'CTA Text' : 'Benefit statement'
        });
    }

    return scenes;
}
