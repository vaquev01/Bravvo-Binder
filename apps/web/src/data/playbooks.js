export const PLAYBOOKS = {
    retail_growth: {
        id: 'retail_growth',
        name: 'Crescimento Varejo (Agressivo)',
        description: 'Foco em tráfego pago para ofertas Hero e conversão rápida.',
        objectiveType: 'OBJ_GROWTH',
        channels: ['Instagram Feed', 'Instagram Story', 'WhatsApp'],
        tasks: [
            { dayOffset: 0, type: 'setup', title: 'Definir Oferta da Semana', role: 'Estrategista' },
            { dayOffset: 1, type: 'creative', title: 'Criar 3 Variações de Arte (Promo)', role: 'Designer' },
            { dayOffset: 2, type: 'traffic', title: "Subir Campanha 'Oferta Relâmpago'", role: 'Gestor Tráfego' },
            { dayOffset: 3, type: 'content', title: 'Stories de Prova Social', role: 'Conteúdo' },
            { dayOffset: 5, type: 'sales', title: 'Disparo Lista VIP WhatsApp', role: 'Comercial' }
        ],
        rules: {
            minDiscount: 15,
            frequency: 'daily'
        }
    },
    brand_awareness: {
        id: 'brand_awareness',
        name: 'Construção de Marca (Institucional)',
        description: 'Foco em alcance, narrativa e posicionamento.',
        objectiveType: 'OBJ_AWARENESS',
        channels: ['Instagram Reels', 'TikTok', 'Blog'],
        tasks: [
            { dayOffset: 0, type: 'creative', title: 'Roteirizar Vídeo Manifesto', role: 'Copywriter' },
            { dayOffset: 2, type: 'production', title: 'Gravação de Bastidores', role: 'Videomaker' },
            { dayOffset: 4, type: 'content', title: "Post Carrossel 'Nossa História'", role: 'Conteúdo' }
        ],
        rules: {
            visualStyle: 'cinematic',
            frequency: '3x_week'
        }
    }
};
