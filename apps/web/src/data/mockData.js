
// Helper for dynamic dates
const getRelativeDate = (offsetDays) => {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString().split('T')[0];
};

const TODAY = getRelativeDate(0);
const TOMORROW = getRelativeDate(1);
const DAY_AFTER = getRelativeDate(2);
const NEXT_WEEK = getRelativeDate(7);

export const CARACA_BAR_DATA = {
    clientName: "Caraca Bar",
    vaults: {
        S1: {
            id: 'S1', label: 'Brand Vault', icon: 'Target', source: 'V1',
            fields: {
                promise: "O melhor Happy Hour da cidade",
                enemy: "Tédio e Comida Ruim",
                tone: ["Divertido", "Jovem", "Direto"],
                archetype: "O Cara Comum",
                mission: "Criar momentos inesquecíveis de diversão e descontração",
                vision: "Ser o point de encontro preferido da galera jovem da região",
                values: ["Diversão", "Autenticidade", "Qualidade", "Comunidade"],
                niche: "gastronomia",
                audienceAge: "25-34",
                audienceGender: "todos",
                audienceClass: "bc",
                mood: "colorido",
                primaryColor: "#FF5733",
                secondaryColor: "#1A1A1A",
                accentColor: "#F39C12",
                bio: "O Caraca Bar nasceu da vontade de criar um espaço autêntico onde a galera se sente em casa. Com drinks autorais, burgers artesanais e uma vibe descontraída, somos o point perfeito para começar (ou terminar) a noite."
            }
        },
        S2: {
            id: 'S2', label: 'Commerce Vault', icon: 'ShoppingBag', source: 'V2',
            products: [
                { id: "P1", name: "Gin Tônica Clássica", role: "Hero", margin: "High", price: 29.90 },
                { id: "P2", name: "Burger Artesanal", role: "Upsell", margin: "Medium", price: 42.00 }
            ],
            strategy: {
                format: "Unitário",
                seasonality: "Evergreen",
                upsell: "combos"
            },
            metrics: {
                currentTicket: "35.00",
                targetTicket: "50.00",
                currentRevenue: "85000"
            },
            bait: {
                product: "Happy Hour - Gin em Dobro",
                price: "39.90"
            }
        },
        S3: {
            id: 'S3', label: 'Funnel Vault', icon: 'GitBranch', source: 'V3',
            steps: [
                { step: "Atenção", kpi: "CPM", goal: "R$ 15,00" },
                { step: "Interesse", kpi: "CTR", goal: "1.5%" },
                { step: "Desejo", kpi: "Click Whatsapp", goal: "https://wa.me/5511999999999" }
            ],
            traffic: {
                primarySource: "Misto"
            },
            channels: ["instagram", "whatsapp", "tiktok"],
            social: {
                instagram: "@caracabar",
                website: "https://caracabar.com.br"
            }
        },
        S4: {
            id: 'S4', label: 'Ops Vault', icon: 'Settings', source: 'V4',
            matrix: [
                { role: "Aprovador Final", who: "João (Dono)" },
                { role: "Estrategista", who: "Bravvo AI" },
                { role: "Time", who: "Enxuta" }
            ],
            slas: {
                approval: "24h",
                production: "48h"
            }
        },
        S5: {
            id: 'S5', label: 'Design Vault', icon: 'Palette', source: 'V1',
            palette: { primary: "#FF5733", secondary: "#1A1A1A", accent: "#F39C12" },
            rules: { mood: "Vibrante" },
            formats: {
                story: { ratio: "9:16", safeZone: "15%", overlay: "Gradient Bottom" },
                feed: { ratio: "4:5", safeZone: "10%", overlay: "None" },
                reel: { ratio: "9:16", pacing: "Fast Cuts", style: "Glitch Effect" }
            }
        },
        S6: {
            id: 'S6', label: 'Learning Vault', icon: 'Brain', source: 'Governança',
            learnings: [
                { id: 1, type: "Insight", content: "Público engaja mais com vídeos curtos de bastidores.", confidence: "High" },
                { id: 2, type: "Correction", content: "Evitar gírias muito regionais, não soa autêntico.", confidence: "Medium" }
            ]
        }
    },
    dashboard: {
        D1: [
            { id: 101, product: "Gin Tônica", type: "Bebida", price: 29.90, margin: "High", status: "Active", offer_strategy: "Traffic Driver" },
            { id: 102, product: "Combo Smash", type: "Comida", price: 45.00, margin: "Medium", status: "Active", offer_strategy: "Upsell" },
            { id: 103, product: "Balde Cerveja", type: "Bebida", price: 80.00, margin: "Low", status: "Active", offer_strategy: "Retention" },
            { id: 104, product: "Entrada VIP", type: "Serviço", price: 15.00, margin: "Max", status: "Planned", offer_strategy: "Cashflow" }
        ],
        D2: [
            { id: 1, date: TODAY, initiative: "Terça em Dobro", channel: "Instagram Story", format: "story", offerId: "P1", ctaId: "CTA1", responsible: "Ana", status: "scheduled", visual_output: "Story_Terca_V1.png" },
            { id: 2, date: TOMORROW, initiative: "Quinta Sem Perrengue", channel: "Instagram Feed", format: "feed", offerId: "P2", ctaId: "CTA2", responsible: "Ana", status: "scheduled", visual_output: "Feed_Quinta_V1.png" },
            { id: 3, date: DAY_AFTER, initiative: "Sexta Fire", channel: "Instagram Reel", format: "reel", offerId: "P3", ctaId: "CTA1", responsible: "Julia", status: "in_production", visual_output: "Pending" },
            { id: 4, date: NEXT_WEEK, initiative: "Sábado VIP", channel: "WhatsApp Lista", format: "text", offerId: "P4", ctaId: "CTA3", responsible: "Lucas", status: "draft", visual_output: "Pending" }
        ],
        D3: [
            { id: 201, task: "Criar Posts da Semana", owner: "Ana", approver: "Pedro", sla: "Quarta 18h", status: "On Track" },
            { id: 202, task: "Aprovar Artes", owner: "Pedro", approver: "-", sla: "Quinta 10h", status: "Pending" },
            { id: 203, task: "Configurar Anúncios", owner: "Lucas", approver: "Pedro", sla: "Sexta 14h", status: "Late" },
            { id: 204, task: "Responder DMs Fds", owner: "Ana", approver: "-", sla: "Diário", status: "On Track" }
        ],
        D4: [
            { id: 301, batch_name: "Stories Fevereiro S2", quantity: 15, status: "To Do", deadline: "2024-02-01" },
            { id: 302, batch_name: "Reels de Produtos", quantity: 4, status: "In Progress", deadline: "2024-02-05" },
            { id: 303, batch_name: "Fotos Cardápio Novo", quantity: 20, status: "Done", deadline: "2024-01-20" }
        ],
        D5: [
            { id: 401, metric: "Custo por Reserva", current: 12.50, target: 10.00, status: "Warning", action: "Review Targeting" },
            { id: 402, metric: "Engajamento Instagram", current: 4.5, target: 3.0, status: "Good", action: "Scale Winning Posts" },
            { id: 403, metric: "Vendas Gin Tônica", current: 150, target: 120, status: "Great", action: "Maintain" },
            { id: 404, metric: "Cadastros Lista VIP", current: 45, target: 100, status: "Critical", action: "Create New Offer" }
        ]
    },
    kpis: {
        revenue: { value: 32500, goal: 50000 },
        traffic: { value: 12, goal: 15 },
        sales: { value: 154, goal: 120 }
    },
    measurementContract: {
        lastUpdate: TODAY,
        cycle: { id: "CYC_2024_03", label: "Março 2024", status: "active" },
        objectives: [
            { id: "OBJ_GROWTH", label: "Crescimento Agressivo", priority: 1 },
            { id: "OBJ_RETENTION", label: "Retenção de Clientes", priority: 2 }
        ],
        dashboardLayout: {
            topKpis: ["revenue", "sales", "traffic"],
            secondaryKpis: []
        },
        kpis: [
            { id: "revenue", label: "Receita", format: "currency", source: "manual", target: 50000, active: true },
            { id: "traffic", label: "Tráfego (ROAS)", format: "decimal", source: "manual", target: 15, active: true },
            { id: "sales", label: "Vendas", format: "integer", source: "manual", target: 120, active: true }
        ],
        auditLog: []
    },
    promptHistory: []
};

// ============================================================================
// PLAYBOOKS (TEMPLATES TÁTICOS)
// ============================================================================
export const PLAYBOOKS = {
    "retail_growth": {
        id: "retail_growth",
        name: "Crescimento Varejo (Agressivo)",
        description: "Foco em tráfego pago para ofertas Hero e conversão rápida.",
        objectiveType: "OBJ_GROWTH",
        channels: ["Instagram Feed", "Instagram Story", "WhatsApp"],
        tasks: [
            { dayOffset: 0, type: "setup", title: "Definir Oferta da Semana", role: "Estrategista" },
            { dayOffset: 1, type: "creative", title: "Criar 3 Variações de Arte (Promo)", role: "Designer" },
            { dayOffset: 2, type: "traffic", title: "Subir Campanha 'Oferta Relâmpago'", role: "Gestor Tráfego" },
            { dayOffset: 3, type: "content", title: "Stories de Prova Social", role: "Conteúdo" },
            { dayOffset: 5, type: "sales", title: "Disparo Lista VIP WhatsApp", role: "Comercial" }
        ],
        rules: {
            minDiscount: 15,
            frequency: "daily"
        }
    },
    "brand_awareness": {
        id: "brand_awareness",
        name: "Construção de Marca (Institucional)",
        description: "Foco em alcance, narrativa e posicionamento.",
        objectiveType: "OBJ_AWARENESS",
        channels: ["Instagram Reels", "TikTok", "Blog"],
        tasks: [
            { dayOffset: 0, type: "creative", title: "Roteirizar Vídeo Manifesto", role: "Copywriter" },
            { dayOffset: 2, type: "production", title: "Gravação de Bastidores", role: "Videomaker" },
            { dayOffset: 4, type: "content", title: "Post Carrossel 'Nossa História'", role: "Conteúdo" }
        ],
        rules: {
            visualStyle: "cinematic",
            frequency: "3x_week"
        }
    }
};

// ============================================================================
// TADA ASIAN FOOD - Dados Completos
// ============================================================================
export const TADA_ASIAN_FOOD_DATA = {
    clientName: "Tada Asian Food",
    vaults: {
        S1: {
            id: 'S1', label: 'Brand Vault', icon: 'Target', source: 'V1',
            fields: {
                promise: "Comida asiática autêntica com delivery rápido",
                enemy: "Fast food sem qualidade e demora na entrega",
                tone: ["Moderno", "Clean", "Confiável"],
                archetype: "O Sábio",
                mission: "Trazer a verdadeira experiência da culinária asiática para sua casa",
                vision: "Ser a referência em comida asiática delivery no bairro",
                values: ["Qualidade", "Rapidez", "Autenticidade"],
                niche: "gastronomia",
                audienceAge: "25-44",
                audienceGender: "todos",
                audienceClass: "ab",
                mood: "minimalista",
                primaryColor: "#D32F2F",
                secondaryColor: "#FFF8E1",
                accentColor: "#FFB300",
                bio: "Tada Asian Food é especializado em culinária pan-asiática com foco em qualidade e velocidade. Nosso cardápio une o melhor da gastronomia japonesa, tailandesa e chinesa."
            }
        },
        S2: {
            id: 'S2', label: 'Commerce Vault', icon: 'ShoppingBag', source: 'V2',
            products: [
                { id: "P1", name: "Combo Sushi 30 peças", role: "Hero", margin: "High", price: 89.90, category: "combo" },
                { id: "P2", name: "Pad Thai de Frango", role: "Core", margin: "Medium", price: 42.00, category: "prato" },
                { id: "P3", name: "Yakisoba Premium", role: "Core", margin: "Medium", price: 38.00, category: "prato" },
                { id: "P4", name: "Temaki de Salmão", role: "Upsell", margin: "High", price: 24.90, category: "temaki" }
            ],
            strategy: {
                format: "Delivery + Balcão",
                seasonality: "Evergreen",
                upsell: "combos"
            },
            metrics: {
                currentTicket: "65.00",
                targetTicket: "85.00",
                currentRevenue: "52000"
            },
            bait: {
                product: "Combo Entrada + Prato Principal",
                price: "69.90"
            }
        },
        S3: {
            id: 'S3', label: 'Funnel Vault', icon: 'GitBranch', source: 'V3',
            steps: [
                { step: "Descoberta", kpi: "CPM Instagram", goal: "R$ 12,00" },
                { step: "Interesse", kpi: "CTR Story", goal: "2.5%" },
                { step: "Conversão", kpi: "Click iFood", goal: "Link Bio" }
            ],
            traffic: {
                primarySource: "Pago + Orgânico",
                channels: ["instagram", "ifood"],
                conversionLink: "https://ifood.com.br/tada-asian",
                trafficType: "Misto"
            }
        },
        S4: {
            id: 'S4', label: 'Ops Vault', icon: 'Settings', source: 'V4',
            matrix: [
                { role: "Aprovador Final", who: "Ricardo (Proprietário)" },
                { role: "Conteúdo", who: "Agência Bravvo" },
                { role: "Design", who: "Designer Freelancer" },
                { role: "Tráfego Pago", who: "Lucas (Gestor)" }
            ],
            slas: {
                approval: "48h",
                production: "72h"
            },
            teamStructure: "Completa"
        },
        S5: {
            id: 'S5', label: 'Design Vault', icon: 'Palette', source: 'V1',
            palette: { primary: "#D32F2F", secondary: "#FFF8E1", accent: "#FFB300" },
            rules: { mood: "Clean, Minimalista, Premium" },
            formats: {
                story: { ratio: "9:16", safeZone: "15%", overlay: "Nenhum" },
                feed: { ratio: "1:1", safeZone: "10%", overlay: "Logo Canto" },
                reel: { ratio: "9:16", pacing: "Médio", style: "Clean Editorial" }
            },
            musicalStyle: "Lo-fi, Música Asiática Instrumental"
        },
        S6: {
            id: 'S6', label: 'Learning Vault', icon: 'Brain', source: 'Governança',
            learnings: [
                { id: 1, type: "Insight", content: "Fotos macro dos pratos geram 40% mais engajamento", confidence: "High" },
                { id: 2, type: "Insight", content: "Posts sobre processo de preparo convertem melhor que pratos prontos", confidence: "Medium" },
                { id: 3, type: "Correction", content: "Evitar legendas muito longas - público prefere visual", confidence: "High" }
            ]
        }
    },
    dashboard: {
        D2: [
            { id: 1, date: TODAY, initiative: "Combo Sushi + Temaki", channel: "Instagram Feed", format: "feed", offerId: "P1", ctaId: "ifood", responsible: "Bravvo", status: "scheduled" },
            { id: 2, date: TOMORROW, initiative: "Yakisoba do Chef", channel: "Instagram Story", format: "story", offerId: "P3", ctaId: "whatsapp", responsible: "Bravvo", status: "in_production" },
            { id: 3, date: DAY_AFTER, initiative: "Pad Thai Autêntico", channel: "Instagram Reels", format: "reel", offerId: "P2", ctaId: "ifood", responsible: "Designer", status: "draft" },
            { id: 4, date: NEXT_WEEK, initiative: "Promo Sushi Especial", channel: "Instagram Feed", format: "feed", offerId: "P1", ctaId: "ifood", responsible: "Bravvo", status: "draft" }
        ],
        D5: [
            { id: 401, metric: "CPM Instagram", current: 11.80, target: 12.00, status: "Good", action: "Manter estratégia" },
            { id: 402, metric: "Taxa Conversão iFood", current: 3.2, target: 4.0, status: "Warning", action: "Testar novos criativos" },
            { id: 403, metric: "Ticket Médio", current: 65.00, target: 85.00, status: "Warning", action: "Implementar cross-sell" },
            { id: 404, metric: "Pedidos/Dia", current: 45, target: 60, status: "Warning", action: "Aumentar frequência posts" }
        ]
    },
    kpis: {
        cpm: { value: 11.80, goal: 12.00 },
        conversion: { value: 3.2, goal: 4.0 },
        ticket: { value: 65.00, goal: 85.00 }
    },
    measurementContract: {
        lastUpdate: TODAY,
        cycle: { id: "CYC_2024_03", label: "Março 2024", status: "active" },
        objectives: [
            { id: "OBJ_AWARENESS", label: "Reconhecimento de Marca", priority: 1 },
            { id: "OBJ_ORDERS", label: "Volume de Pedidos", priority: 2 }
        ],
        dashboardLayout: {
            topKpis: ["cpm", "conversion", "ticket"],
            secondaryKpis: []
        },
        kpis: [
            { id: "cpm", label: "CPM Instagram", format: "currency", source: "api", target: 12.00, value: 11.80, active: true },
            { id: "conversion", label: "Taxa Conversão", format: "percentage", source: "manual", target: 4.0, value: 3.2, active: true },
            { id: "ticket", label: "Ticket Médio", format: "currency", source: "csv", target: 85.00, value: 65.00, active: true },
            { id: "offline_visits", label: "Visitas Loja (Offline)", format: "integer", source: "manual", target: 150, value: 120, active: true }
        ],
        auditLog: []
    },
    promptHistory: []
};
