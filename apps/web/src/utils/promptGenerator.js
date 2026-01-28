/**
 * BRAVVO OS - IDF PROMPT ENGINE v1
 * 
 * "O prompt não é criativo. O prompt é instrucional e industrial."
 * Implements the strict 9-BLOCK ARCHITECTURE defined by the IDF.
 */

// --- CONSTANTS & MAPPINGS ---

const FORMAT_SPECS = {
    post: { channel: 'Instagram Feed', aspect: '4:5', res: '1080x1350', safe: 'standard margins' },
    reel: { channel: 'Instagram Reel', aspect: '9:16', res: '1080x1920', safe: 'vertical UI safe zones' },
    story: { channel: 'Instagram Story', aspect: '9:16', res: '1080x1920', safe: 'top 150px / bottom 200px' },
    carousel: { channel: 'Instagram Carousel', aspect: '4:5', res: '1080x1350', safe: 'seamless continuity' },
    ad: { channel: 'Paid Media (Generic)', aspect: '4:5', res: '1080x1350', safe: 'optimized for conversion' }
};

// --- CORE GENERATOR FUNCTIONS ---

/**
 * Main entry point. Returns an object with both AI Prompt and Human Guide.
 */
export function generatePrompt(item, vaults) {
    return {
        aiPrompt: generateIDFPrompt(item, vaults),
        humanGuide: generateHumanGuide(item, vaults)
    };
}

/**
 * Generates the Strict 9-Block AI Prompt
 */
function generateIDFPrompt(item, vaults) {
    const s1 = vaults?.S1?.fields || {};
    const s5 = vaults?.S5 || {};
    const brandIdentity = s5.brandIdentity || {}; // NEW: Access Brand Identity
    const products = vaults?.S2?.items || vaults?.S2?.products || [];
    const idMatch = products.find(p => String(p?.id) === String(item?.offerId));
    const heroMatch = products.find(p => p?.isHero) || products.find(p => String(p?.role || '').toLowerCase() === 'hero');
    const product = idMatch || (String(item?.offerId).toLowerCase() === 'hero' ? heroMatch : null) || heroMatch || products[0] || { name: 'Product Name' };

    // Default Fallbacks
    const primaryColor = s5.palette?.primary || '#FF5733';
    const accentColor = s5.palette?.accent || '#FFFFFF';
    const mood = s5.rules?.mood || 'Authentic';
    const archetype = s1.archetype || 'Regular Guy';
    const format = FORMAT_SPECS[item.format] || FORMAT_SPECS.post;
    const isVideo = item.format === 'reel' || item.format === 'video';

    // 1. CONTROL BLOCK (Fixed)
    const controlBlock = `[CONTROL]
Follow instructions strictly.
Do not improvise.
Do not change style, palette, framing or tone.
If conflict exists, obey this block.`;

    // 2. OUTPUT BLOCK
    const outputBlock = isVideo
        ? `[OUTPUT]
Generate:
- 1 main video asset (${item.duration || '6-8s'})
- 1 thumbnail frame
- High motion fidelity`
        : `[OUTPUT]
Generate:
- 1 main asset
- 1 variation (close-up)
- 1 backup version (wider shot)`;

    // 3. FORMAT BLOCK
    const formatBlock = `[FORMAT]
Channel: ${format.channel}
Aspect ratio: ${format.aspect}
Resolution: ${format.res}
Safe zones: ${format.safe}`;

    // 4. VISUAL DIRECTION BLOCK
    const visualBlock = `[VISUAL DIRECTION]
Subject: ${product.name} (${item.visual_style || 'Hero Shot'})
Camera: ${isVideo ? 'Smooth tracking / Dolly' : 'Documentary / Editorial'}
Lighting: ${mood} lighting, ${brandIdentity.photoStyle || 'soft shadows, no harsh studio glare'}
Composition: Geometric balance, rule of thirds
Background: Clean, ${s5.palette?.background || 'Dark/Neutral'}
Color accent: ${primaryColor} (Subtle usage)
Mood: ${mood}
Vibe: ${brandIdentity.visualVibes?.join(', ') || 'Modern'}
Archetype: ${archetype}
Key Elements: ${brandIdentity.keyElements?.join(', ') || 'N/A'}`;

    // 5. GRAPHIC LAYER BLOCK
    const graphicBlock = `[GRAPHIC LAYER]
Subtle graphic elements only
Use brand accent color (${accentColor})
Minimal lines or blocks
No heavy typography
Respect safe zones`;

    // 6. EDITING / MOTION BLOCK (Always present, N/A for static)
    const motionBlock = `[EDITING & MOTION]
${isVideo ? `Pace: Natural
Cuts: Max 1-2
Transitions: Invisible / Soft
Motion style: Documentary + Modern
No flashy effects` : 'N/A (Static Image)'}`;

    // 7. VOICE / SOUND BLOCK
    const soundBlock = `[VOICE & SOUND]
${isVideo ? `Voice: Casual, Natural
Tone: Friendly, non-advertising
Music: ${brandIdentity.musicalStyle || 'Low, warm groove'}
Ambient sound: Enabled` : 'N/A (Silent)'}`;

    // 8. COPY BLOCK
    const copyBlock = `[COPY]
Hook: "${item.headline || 'Short hook here'}"
CTA: "${item.cta || 'Learn More'}"
No long sentences
No marketing buzzwords`;

    // 9. RESTRICTIONS BLOCK (Fixed)
    const restrictionsBlock = `[RESTRICTIONS]
No AI-looking visuals
No luxury style (unless specified)
No stock feeling
No blur
No watermark
No exaggerated contrast
No heavy filters
DO NOT USE: ${brandIdentity.prohibitedElements?.join(', ') || 'N/A'}`;

    // COMPOSE FINAL PROMPT
    return `${controlBlock}

${outputBlock}

${formatBlock}

${visualBlock}

${graphicBlock}

${motionBlock}

${soundBlock}

${copyBlock}

${restrictionsBlock}`;
}

/**
 * Generates the Human Production Guide (Editor/Designer)
 */
function generateHumanGuide(item, vaults) {
    const s1 = vaults?.S1?.fields || {};
    const s5 = vaults?.S5 || {}; // Design Vault
    const products = vaults?.S2?.items || vaults?.S2?.products || [];
    const idMatch = products.find(p => String(p?.id) === String(item?.offerId));
    const heroMatch = products.find(p => p?.isHero) || products.find(p => String(p?.role || '').toLowerCase() === 'hero');
    const product = idMatch || (String(item?.offerId).toLowerCase() === 'hero' ? heroMatch : null) || heroMatch || products[0] || { name: 'Produto Principal' };

    const primaryColor = s5.palette?.primary || '#FF5733';
    const archetype = s1.archetype || 'O Cara Comum';
    const isVideo = item.format === 'reel' || item.format === 'video';

    return `# 📘 GUIA DE PRODUÇÃO — ${item.initiative?.toUpperCase() || 'NOVA INICIATIVA'}

## 1️⃣ ANTES DE ABRIR O SOFTWARE
- **Canal:** ${item.format?.toUpperCase()}
- **Ativo:** ${product.name}
- **Objetivo:** ${item.objective || 'Conversão / Vendas'}
- **Sentimento:** ${s5.rules?.mood || 'Autêntico'}

---

## 2️⃣ GUIA DE ESTILO VISUAL
### 📷 Imagem / Cena
- Estilo: **${archetype}** (Documental, Real, Próximo)
- Nada de estética publicitária ou banco de imagem.
- Parece conteúdo nativo, não anúncio.

### 🎨 Cores
- Fundo: ${s5.palette?.background || 'Neutro/Escuro'}
- Destaque: **${primaryColor}** (Usar com parcimônia)
- Texto: Contraste alto e legível.

### 🧩 Composição
1. **${product.name}** (Hero)
2. Ambiente/Clima
3. Detalhe gráfico (${primaryColor})
4. Texto: "${item.headline || 'Headline'}"

---

## ${isVideo ? '3️⃣ GUIA PARA VÍDEO (REEL/TIKTOK)' : '3️⃣ GUIA PARA DESIGNER (ESTÁTICO)'}

${isVideo ? `### 🎬 Roteiro Obrigatório
**CENA 1 (HOOK 1-2s):**
- Situação real ou close do produto. Sem logo/intro.
- Ação: ${item.visual_style || 'Movimento de impacto'}

**CENA 2 (CONTEXTO 2-3s):**
- Mostre o problema ou clima de uso.

**CENA 3 (SOLUÇÃO 2-3s):**
- ${product.name} resolve a situação.
- Close no benefício.

**CENA 4 (FECHAMENTO):**
- CTA Claro: "${item.cta || 'Saiba Mais'}"

### 🎞️ Ritmo & Áudio
- Música: Baixa, warm groove. Nada épico.
- Voz: Casual. "Conversa de bar", não locutor.
- Cortes: Máximo 3. Suaves.`
            :
            `### 🎨 Regras de Arte
- **Clean:** Nada de poluição visual.
- **Tipografia:** ${s5.typography?.h1?.font || 'Sans Serif'}. Sem sombras pesadas.
- **Gráficos:** Linhas simples e blocos retos.
- **Texto:** Curto. Máximo 6 palavras na headline.`}

---

## 4️⃣ ERROS QUE INVALIDAM A PEÇA ❌
- ( ) Visual de banco de imagem
- ( ) Cara de propaganda de TV
- ( ) Efeitos/Transições exagerados
- ( ) Texto longo demais
- ( ) Fugiu do tom **${archetype}**

---

## 5️⃣ CHECKLIST FINAL
- [ ] Isso parece real?
- [ ] Isso parece humano?
- [ ] Isso parece algo que eu veria no meu feed?

**Editor não cria. Editor executa.**`;
}
