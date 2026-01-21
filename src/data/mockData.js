export const CARACA_BAR_DATA = {
    clientName: "Caraca Bar",
    vaults: {
        S1: {
            name: "Brand Vault",
            description: "Identidade Verbal e Estratégica",
            fields: {
                promise: "O melhor lugar para começar ou terminar sua noite com energia.",
                enemy: "O tédio e a mesmice das baladas genéricas.",
                tension: "Quero sair mas tenho medo de ser ruim/caro/chato.",
                tone: ["Energético", "Descolado", "Acolhedor"],
                archetype: "O Rebelde Criativo",
                icp: "Jovens adultos 25-35 que querem diversão sem perrengue",
                personas: [
                    { name: "Lucas", age: 28, job: "Dev", needs: "Happy hour com cerveja artesanal" },
                    { name: "Marina", age: 32, job: "Mkt", needs: "Drinks para Instagram e música para dançar" }
                ],
                policies: [
                    "Nunca usar gírias de 'tiozão'",
                    "Sempre responder críticas com bom humor",
                    "Proibido postar foto de bebida quente"
                ]
            }
        },
        S2: {
            name: "Commerce Vault",
            description: "Lógica Comercial e Produtos",
            items: [
                { id: "P1", name: "Gin Tônica Clássica", type: "Bebida", price: 29.90, cost: 8.00, margin: "High", role: "Conversion", visual: "premium", description: "O clássico infalível." },
                { id: "P2", name: "Combo Smash Burger", type: "Comida", price: 45.00, cost: 25.00, margin: "Medium", role: "Attraction", visual: "appetizing", description: "Matador de fome." },
                { id: "P3", name: "Balde Cerveja Artesanal", type: "Bebida", price: 80.00, cost: 50.00, margin: "Low", role: "Retention", visual: "celebration", description: "Para dividir com a galera." },
                { id: "P4", name: "Entrada VIP Antecipada", type: "Serviço", price: 15.00, cost: 0.00, margin: "Super High", role: "Liquidity", visual: "exclusive", description: "Fura fila e garante lugar." }
            ],
            discounts: [
                { name: "Happy Hour 50%", rules: "18h às 20h, Terça a Quinta" },
                { name: "Aniversariante", rules: "Ganha Gin se trouxer 5 amigos" }
            ]
        },
        S3: {
            name: "Funnel Vault",
            description: "Jornada e Conversão",
            steps: [
                { id: "T1", name: "Descoberta (Topo)", event: "page_view", kpi: "Alcance", goal: "10k/mês" },
                { id: "T2", name: "Decisão (Meio)", event: "button_click", kpi: "CTR", goal: "2%" },
                { id: "T3", name: "Conversão (Fundo)", event: "form_submit", kpi: "Taxa Reserva", goal: "15%" }
            ],
            ctas: [
                { id: "CTA1", text: "Reservar Mesa Agora", type: "Conversion", link: "wa.me/caraca?text=reserva" },
                { id: "CTA2", text: "Ver Cardápio Completo", type: "Decision", link: "/cardapio" },
                { id: "CTA3", text: "Entrar na Lista VIP", type: "Retention", link: "/lista-vip" }
            ]
        },
        S4: {
            name: "Ops Vault",
            description: "Matriz de Responsabilidades",
            team: [
                { role: "Social Media", name: "Ana", responsibilities: ["Criar Posts", "Responder DM", "Agendar"], approver: "Pedro" },
                { role: "Traffic Manager", name: "Lucas", responsibilities: ["Otimizar Ads", "Relatórios"], approver: "Pedro" },
                { role: "Designer", name: "Julia", responsibilities: ["Criar Peças", "Editar Vídeos"], approver: "Ana" },
                { role: "Owner", name: "Pedro", responsibilities: ["Aprovar Orçamento", "Definir Oferta"], approver: "-" }
            ],
            slas: [
                { task: "Resposta DM", time: "2 horas úteis", owner: "Ana" },
                { task: "Criação de Arte", time: "24 horas", owner: "Julia" },
                { task: "Relatório Semanal", time: "Segunda 10h", owner: "Lucas" }
            ],
            capacity: {
                postsPerWeek: 6,
                videosPerWeek: 2,
                storiesPerDay: 5
            }
        },
        S5: {
            name: "Design Vault",
            description: "Identidade Visual e Regras",
            palette: {
                primary: "#FF4500", // Orange Red
                secondary: "#1E1E1E", // Dark Grey
                background: "#000000", // Black
                accent: "#00FF7F", // Spring Green (Digital feeling)
                text: "#FFFFFF"
            },
            typography: {
                h1: { font: "Montserrat Black", style: "Uppercase", usage: "Manchetes e Ofertas" },
                h2: { font: "Montserrat Bold", style: "Normal", usage: "Subtítulos" },
                p: { font: "Roboto", style: "Regular", usage: "Textos longos" }
            },
            rules: {
                mood: "Urban Industrial Nightlife",
                weight: "Bold & Dense",
                lighting: "Neon & Shadows",
                forbidden: [
                    "Cor Azul (vibe corporativa)",
                    "Fotos de banco de imagem com sorrisos falsos",
                    "Mockups 3D irrealistas",
                    "Fundo branco chapado"
                ],
                mandatory: [
                    "Granulação suave nas fotos",
                    "Logo sempre no canto superior direito",
                    "Alto contraste em textos"
                ]
            },
            formats: {
                story: { ratio: "9:16", safeZone: "15%", overlay: "Gradient Bottom" },
                feed: { ratio: "4:5", safeZone: "10%", overlay: "None" },
                reel: { ratio: "9:16", pacing: "Fast Cuts", style: "Glitch Effect" }
            }
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
            { id: 1, date: "2024-02-06", initiative: "Terça em Dobro", channel: "Instagram Story", format: "story", offerId: "P1", ctaId: "CTA1", responsible: "Ana", status: "scheduled", visual_output: "Story_Terca_V1.png" },
            { id: 2, date: "2024-02-08", initiative: "Quinta Sem Perrengue", channel: "Instagram Feed", format: "feed", offerId: "P2", ctaId: "CTA2", responsible: "Ana", status: "scheduled", visual_output: "Feed_Quinta_V1.png" },
            { id: 3, date: "2024-02-09", initiative: "Sexta Fire", channel: "Instagram Reel", format: "reel", offerId: "P3", ctaId: "CTA1", responsible: "Julia", status: "in_production", visual_output: "Pending" },
            { id: 4, date: "2024-02-10", initiative: "Sábado VIP", channel: "WhatsApp Lista", format: "text", offerId: "P4", ctaId: "CTA3", responsible: "Lucas", status: "draft", visual_output: "Pending" }
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
