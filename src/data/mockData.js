
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
                archetype: "O Cara Comum"
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
                seasonality: "Evergreen"
            }
        },
        S3: {
            id: 'S3', label: 'Funnel Vault', icon: 'GitBranch', source: 'V3',
            steps: [
                { step: "Atenção", kpi: "CPM", goal: "R$ 15,00" },
                { step: "Interesse", kpi: "CTR", goal: "1.5%" },
                { step: "Desejo", kpi: "Click Whatsapp", goal: "Link Bio" }
            ],
            traffic: {
                primarySource: "Misto"
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
    promptHistory: []
};
