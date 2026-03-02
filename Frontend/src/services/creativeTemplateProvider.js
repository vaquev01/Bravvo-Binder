import { getCreativeFormat } from './creativeFormatCatalog';

function clampText(text, max) {
    const t = typeof text === 'string' ? text : '';
    if (t.length <= max) return t;
    return `${t.slice(0, Math.max(0, max - 1))}…`;
}

function normalizeText(value) {
    if (typeof value !== 'string') return '';
    return value.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

function escapeXml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function sanitizeColor(value, fallback) {
    if (typeof value !== 'string') return fallback;
    if (!value.trim()) return fallback;
    return value;
}

function svgDataUrl(svg) {
    const encoded = encodeURIComponent(svg)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22');
    return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

function makeSvg({ format, palette, headline, subheadline, cta, accentVariant }) {
    const w = format.width;
    const h = format.height;

    const primary = sanitizeColor(palette?.primary, '#F97316');
    const secondary = sanitizeColor(palette?.secondary, '#1E293B');
    const accent = sanitizeColor(palette?.accent, '#10B981');

    const accentA = accentVariant === 2 ? primary : accent;
    const accentB = accentVariant === 1 ? accent : primary;

    const safeHeadline = escapeXml(clampText(normalizeText(headline), 60));
    const safeSub = escapeXml(clampText(normalizeText(subheadline), 120));
    const safeCta = escapeXml(clampText(normalizeText(cta), 28));

    const pad = Math.round(w * 0.08);
    const titleY = Math.round(h * 0.22);
    const subY = Math.round(h * 0.32);
    const ctaY = Math.round(h * 0.78);

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${secondary}"/>
      <stop offset="1" stop-color="#000000"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${accentA}"/>
      <stop offset="1" stop-color="${accentB}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <rect width="${w}" height="${h}" fill="url(#bg)"/>

  <circle cx="${Math.round(w * 0.15)}" cy="${Math.round(h * 0.12)}" r="${Math.round(w * 0.20)}" fill="${primary}" opacity="0.14"/>
  <circle cx="${Math.round(w * 0.90)}" cy="${Math.round(h * 0.25)}" r="${Math.round(w * 0.28)}" fill="${accent}" opacity="0.10"/>

  <rect x="${pad}" y="${Math.round(h * 0.12)}" width="${w - pad * 2}" height="${Math.round(h * 0.58)}" rx="${Math.round(w * 0.04)}" fill="#0A0A0A" opacity="0.65" filter="url(#shadow)"/>

  <text x="${pad * 1.5}" y="${titleY}" fill="#FFFFFF" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto" font-size="${Math.round(w * 0.06)}" font-weight="800">
    ${safeHeadline}
  </text>

  <text x="${pad * 1.5}" y="${subY}" fill="#CBD5E1" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto" font-size="${Math.round(w * 0.032)}" font-weight="500">
    ${safeSub}
  </text>

  <rect x="${pad * 1.5}" y="${ctaY}" width="${Math.round(w * 0.50)}" height="${Math.round(h * 0.08)}" rx="${Math.round(h * 0.04)}" fill="url(#accent)"/>
  <text x="${pad * 1.5 + Math.round(w * 0.03)}" y="${ctaY + Math.round(h * 0.053)}" fill="#0A0A0A" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto" font-size="${Math.round(w * 0.03)}" font-weight="800">
    ${safeCta}
  </text>

  <text x="${pad * 1.5}" y="${Math.round(h * 0.93)}" fill="#94A3B8" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas" font-size="${Math.round(w * 0.02)}" font-weight="700" opacity="0.9">
    BRAVVO CREATIVE STUDIO v1
  </text>
</svg>`;
}

export async function generateTemplateVariants({
    item,
    vaults,
    formatId,
    variants = 3,
    overrides = null
}) {
    const format = getCreativeFormat(formatId);
    const palette = vaults?.S5?.palette || {};

    const baseHeadline = overrides?.headline || item?.initiative || 'Nova Iniciativa';
    const subheadline = overrides?.subheadline || item?.caption || vaults?.S1?.fields?.promise || 'Plano tático do Bravvo OS';
    const cta = overrides?.cta || 'Saiba mais';

    const out = [];
    for (let i = 0; i < Math.max(1, variants); i += 1) {
        const svg = makeSvg({
            format,
            palette,
            headline: baseHeadline,
            subheadline,
            cta,
            accentVariant: i % 3
        });

        out.push({
            id: `ASSET-${Date.now()}-${i}`,
            provider: 'template',
            formatId: format.id,
            width: format.width,
            height: format.height,
            svg,
            previewUrl: svgDataUrl(svg)
        });
    }

    return out;
}
