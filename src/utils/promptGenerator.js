/**
 * Generates an AI-ready prompt by combining data from all Vaults.
 * @param {object} item - The D2 dashboard item (initiative)
 * @param {object} vaults - All vaults (S1-S5)
 * @returns {string} The formatted prompt
 */
export function generatePrompt(item, vaults) {
    const s1 = vaults?.S1?.fields || {};

    // Support both 'items' (legacy) and 'products' (from Onboarding)
    const products = vaults?.S2?.items || vaults?.S2?.products || [];
    const s2 = products.find(p => p.id === item.offerId) || products[0] || { name: 'Produto', price: 0, visual: 'standard' };

    const ctas = vaults?.S3?.ctas || [];
    const s3 = ctas.find(c => c.id === item.ctaId) || { text: 'Saiba Mais', link: '#' };

    const s5 = vaults?.S5 || {};

    // Get format-specific rules
    const formatRules = s5.formats?.[item.format] || {};

    const formatSection = item.format === 'story'
        ? `FORMAT SPECS (Story):
- Ratio: ${formatRules.ratio || '9:16'}
- Text at: ${formatRules.textPosition || 'top'}
- CTA at: ${formatRules.ctaPosition || 'bottom'}
- Max duration: ${formatRules.maxDuration || '15s'}`
        : item.format === 'reel'
            ? `FORMAT SPECS (Reel):
- Ratio: ${formatRules.ratio || '9:16'}
- Pacing: ${formatRules.pacing || 'fast_cuts'}
- Overlay text: ${formatRules.overlayText ? 'Yes' : 'No'}`
            : `FORMAT SPECS (Feed):
- Ratio: ${formatRules.ratio || '4:5'}
- Style: ${formatRules.style || 'standard'}`;

    // Safe Typography Access
    const h1Font = s5.typography?.h1?.font || s5.typography?.h1 || 'Bold Sans-Serif';
    const pFont = s5.typography?.p?.font || s5.typography?.p || 'Regular Sans-Serif';

    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 BRAVVO OS - DESIGN PROMPT GENERATOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ROLE: Expert Social Media Designer for ${s5.rules?.mood || 'Premium'} Brand.

━━━ VISUAL IDENTITY (S5) ━━━
Colors:
• Primary: ${s5.palette?.primary || '#FF4500'}
• Background: ${s5.palette?.background || '#000000'}
• Accent (CTA): ${s5.palette?.accent || '#00FF7F'}

Typography:
• Headlines: ${h1Font}
• Body: ${pFont}

Mood: ${s5.rules?.mood || 'Premium'} | Weight: ${s5.rules?.weight || 'Dense'}

⛔ FORBIDDEN ELEMENTS:
${(s5.rules?.forbidden || ['Generic stock photos']).map(f => `  - ${f}`).join('\n')}

━━━ ${formatSection} ━━━

━━━ CONTENT ━━━
Subject: High-quality shot of "${s2.name}" (${s2.visual || 'appealing'} style)
Headline: "${item.initiative}"
Price: R$ ${(s2.price || 0).toFixed(2)}
CTA: "${s3.text}" → Button in ${s5.palette?.accent || '#00FF7F'}

━━━ BRAND TONE (S1) ━━━
Voice: ${(s1.tone || ['Profissional']).join(' • ')}
Core Message: "${s1.promise || 'Qualidade e excelência'}"
Tension Addressed: "${s1.tension || 'O problema do cliente'}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();
}

/**
 * Generates a simplified prompt for copying to external tools.
 */
export function generateSimplePrompt(item, vaults) {
    const products = vaults?.S2?.items || vaults?.S2?.products || [];
    const s2 = products.find(p => p.id === item.offerId) || products[0] || { name: 'Produto' };
    const s5 = vaults?.S5 || {};

    return `Create a ${item.format} for a ${s5.rules?.mood || 'premium'} brand. 
Background: ${s5.palette?.background || '#000'}. Primary: ${s5.palette?.primary || '#FF4500'}. Accent: ${s5.palette?.accent || '#0F0'}.
Show: "${s2.name}" with text "${item.initiative}" in ${s5.typography?.h1?.font || 'Bold Font'}.
Mood: Urban, energetic. No stock photos, no fake smiles.`;
}
