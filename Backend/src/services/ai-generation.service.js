/**
 * AI Generation Service - Encapsula chamadas à OpenAI
 * Controller → Service → Repository
 */

let _openai = null;

async function getOpenAI() {
    if (!_openai) {
        const OpenAI = (await import('openai')).default;
        _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return _openai;
}

function getModel() {
    return process.env.AI_MODEL || 'gpt-4o';
}

export const aiGenerationService = {
    /**
     * Gera plano/roadmap
     */
    async generatePlan(vaults, kpis = [], weights = null) {
        const vaultContext = Object.entries(vaults).map(([key, value]) => {
            const data = value?.raw_data || value?.fields || value;
            return `${key}: ${JSON.stringify(data)}`;
        }).join('\n');

        const openai = await getOpenAI();
        const completion = await openai.chat.completions.create({
            model: getModel(),
            temperature: 0.7,
            messages: [
                {
                    role: 'system',
                    content: `Você é um estrategista de marketing digital. Gere um plano tático de 7 dias baseado nos dados do cliente.\n\nRetorne APENAS um JSON válido com esta estrutura:\n{\n    "tasks": [\n        {\n            "title": "Título da tarefa",\n            "description": "Descrição curta",\n            "channel": "instagram|youtube|email|whatsapp|blog",\n            "responsible": "Time",\n            "priority": "high|medium|low"\n        }\n    ],\n    "recommendation": "Uma recomendação estratégica geral"\n}`
                },
                {
                    role: 'user',
                    content: `Dados do cliente:\n${vaultContext}\n\nGere um plano de 5-7 tarefas para a próxima semana.`
                }
            ]
        });

        const responseText = completion.choices[0]?.message?.content || '';
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : { tasks: [], recommendation: '' };
        } catch {
            return { tasks: [], recommendation: responseText };
        }
    },

    /**
     * Gera brief criativo
     */
    async generateCreativeBrief(item, vaults) {
        const vaultContext = Object.entries(vaults).map(([key, value]) => {
            const data = value?.raw_data || value?.fields || value;
            return `${key}: ${JSON.stringify(data)}`;
        }).join('\n');

        const openai = await getOpenAI();
        const completion = await openai.chat.completions.create({
            model: getModel(),
            temperature: 0.8,
            messages: [
                {
                    role: 'system',
                    content: `Você é um copywriter criativo. Gere um brief para criação de conteúdo.\n\nRetorne APENAS um JSON válido:\n{\n    "aiPrompt": "Prompt detalhado para a IA gerar o conteúdo",\n    "humanGuide": "Guia para o humano criar/revisar",\n    "hooks": ["Hook 1", "Hook 2", "Hook 3"],\n    "cta": "Call to action sugerido"\n}`
                },
                {
                    role: 'user',
                    content: `Item: ${JSON.stringify(item)}\n\nContexto do cliente:\n${vaultContext}`
                }
            ]
        });

        const responseText = completion.choices[0]?.message?.content || '';
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
        } catch {
            return { aiPrompt: responseText, humanGuide: '', hooks: [], cta: '' };
        }
    },

    /**
     * Inspira/preenche campos de um Vault
     */
    async inspireVault(vaultId, currentData = {}, mode = 'all') {
        const SCHEMAS = {
            s1: { fields: ['clientName', 'niche', 'tagline', 'scope', 'location', 'promise', 'enemy', 'brandValues', 'audienceAge', 'audienceClass', 'audiencePain', 'archetype', 'tone', 'mood', 'bio'], context: "Identidade da Marca, Nicho e Público" },
            s2: { fields: ['products', 'heroProduct', 'heroPrice', 'currentTicket', 'targetTicket', 'currentRevenue', 'competitor1', 'competitor2', 'competitor3'], context: "Oferta, Produtos e Financeiro" },
            s3: { fields: ['businessType', 'channels', 'trafficSource', 'trafficVolume', 'conversionRate', 'cpl', 'ctas'], context: "Funil de Vendas e Tráfego" },
            s4: { fields: ['postingFrequency', 'bestDays', 'bestTimes', 'cycleDuration', 'stakeholders', 'teamMembers'], context: "Operação, Time e Rotina" },
            s5: { fields: ['ideas', 'notepad', 'inspirations'], context: "Banco de Ideias e Anotações" }
        };

        const vaultName = vaultId.toLowerCase();
        const schema = SCHEMAS[vaultName];
        if (!schema) throw new Error(`Vault ${vaultId} desconhecido`);

        let fieldsToFill = schema.fields;
        if (mode === 'empty') {
            fieldsToFill = schema.fields.filter(f => {
                const val = currentData?.[f];
                return val === null || val === undefined || val === '' || (Array.isArray(val) && val.length === 0);
            });
            if (fieldsToFill.length === 0) return {};
        }

        const openai = await getOpenAI();
        const completion = await openai.chat.completions.create({
            model: getModel(),
            temperature: 0.7,
            response_format: { type: "json_object" },
            messages: [
                { role: 'system', content: 'Você é um especialista em Branding e Negócios. Gere conteúdo criativo e profissional em português brasileiro.' },
                {
                    role: 'user',
                    content: `Preencha os campos do formulário "${schema.context}" (Vault ${vaultId.toUpperCase()}).\n\nMODO: ${mode === 'all' ? 'CRIATIVO (Sugerir conceito completo)' : 'COMPLETAR (Preencher lacunas mantendo coerência)'}\n\nDADOS ATUAIS:\n${JSON.stringify(currentData || {}, null, 2)}\n\nCAMPOS A PREENCHER:\n${fieldsToFill.join(', ')}\n\nDIRETRIZES:\n1. Mantenha coerência total com os dados já existentes\n2. Se 'clientName' estiver vazio, invente um nome criativo de negócio\n3. Para campos de lista (arrays), retorne um array JSON\n4. Seja criativo mas realista\n\nResponda APENAS com um JSON válido contendo os campos solicitados.`
                }
            ]
        });

        const responseText = completion.choices[0]?.message?.content || '{}';
        try { return JSON.parse(responseText); } catch { return {}; }
    },

    /**
     * Gera tema visual da marca
     */
    async generateBrandTheme(vaults) {
        const s1 = vaults.S1 || vaults.s1 || {};
        const brandData = s1.fields || s1.raw_data || s1;
        const locationContext = brandData.scope?.toLowerCase() !== 'global' && brandData.location
            ? `\nContexto Local:\nEsta é uma marca ${brandData.scope} em ${brandData.location}. Considere a estética local se relevante.`
            : '';

        const openai = await getOpenAI();
        const completion = await openai.chat.completions.create({
            model: getModel(),
            temperature: 0.7,
            response_format: { type: "json_object" },
            messages: [
                { role: 'system', content: 'Você é um Diretor de Arte Sênior e Especialista em Branding.' },
                {
                    role: 'user',
                    content: `Analise o DNA desta marca e crie uma identidade visual digital coesa para o sistema operacional da empresa.\n\n## DNA da Marca\n- Nome: ${brandData.clientName || brandData.name || 'Empresa desconhecida'}\n- Nicho: ${brandData.niche || 'Geral'}\n- Tom de Voz: ${Array.isArray(brandData.tone) ? brandData.tone.join(', ') : brandData.tone || 'Neutro'}\n- Arquétipo: ${brandData.archetype || 'Profissional'}\n- Valores: ${Array.isArray(brandData.brandValues) ? brandData.brandValues.join(', ') : 'Qualidade'}\n${locationContext}\n\n## Sua Tarefa\nGere um JSON com as cores e tipografia ideais para o Dashboard dessa marca.\nAs opções de fonte são: 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Playfair Display', 'Courier Prime'.\n\nResponda APENAS com este JSON exato:\n{\n  "primaryColor": "#HEXCODE",\n  "accentColor": "#HEXCODE",\n  "fontFamily": "Nome Da Fonte",\n  "reasoning": "Uma frase curta explicando a escolha estética."\n}`
                }
            ]
        });

        const responseText = completion.choices[0]?.message?.content || '{}';
        try {
            const theme = JSON.parse(responseText);
            const validFonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Playfair Display', 'Courier Prime'];
            if (!validFonts.includes(theme.fontFamily)) theme.fontFamily = 'Inter';
            return theme;
        } catch {
            return { primaryColor: '#1a1a2e', accentColor: '#6366f1', fontFamily: 'Inter', reasoning: 'Tema padrão aplicado' };
        }
    },

    /**
     * Gera conclusão de governança
     */
    async generateGovernanceConclusion(ata) {
        const openai = await getOpenAI();
        const completion = await openai.chat.completions.create({
            model: getModel(),
            temperature: 0.5,
            messages: [
                {
                    role: 'system',
                    content: `Você é um consultor executivo analisando uma ata de governança.\n\nRetorne APENAS JSON:\n{\n    "conclusion_summary": "Conclusão em 2-3 frases",\n    "next_steps": ["Passo 1", "Passo 2", "Passo 3"]\n}`
                },
                { role: 'user', content: `Ata da reunião:\n${JSON.stringify(ata)}` }
            ]
        });

        const responseText = completion.choices[0]?.message?.content || '';
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
        } catch {
            return { conclusion_summary: responseText, next_steps: [] };
        }
    }
};
