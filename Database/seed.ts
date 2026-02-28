/**
 * Database Seed Script
 * Popula o banco com dados fictícios para desenvolvimento e testes.
 * Execute com: npx tsx seed.ts
 */

import { PrismaClient } from './prisma/generated/client/index.js';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // --- Users ---
    const admin = await prisma.user.upsert({
        where: { username: 'admin@wardogs.com' },
        update: {},
        create: {
            username: 'admin@wardogs.com',
            password: '$2b$10$.UWfJrE0czj4E7JoAMbP2ebkRf7cphi4VTqu1FDVSjrtdvhS12Wj6', // wardogs
            role: 'admin',
        },
    });

    const agency = await prisma.user.upsert({
        where: { username: 'bravvo_agency' },
        update: {},
        create: {
            username: 'bravvo_agency',
            password: '$2b$10$UT8OmftD4HN5gIX22dLkjOftIBU1976qavK1bjEiYbqzaQHR1ET9i', // 1@Wardogs
            role: 'agency',
        },
    });

    const client = await prisma.user.upsert({
        where: { username: 'cliente_demo' },
        update: {},
        create: {
            username: 'cliente_demo',
            password: '$2b$10$fFisE2SF2gW3s.4mN.gyzuaivlwP4ScHGj2jthVN96E2/VldaBuLa', // demo
            role: 'client',
        },
    });

    console.log('✅ Users seeded:', { admin: admin.id, agency: agency.id, client: client.id });

    // --- Client Workspaces ---
    const workspace = await prisma.clientWorkspace.upsert({
        where: { clientId: 'demo-client-001' },
        update: {},
        create: {
            clientId: 'demo-client-001',
            agencyId: agency.id,
            data: {
                clientName: 'Restaurante Demo',
                vaults: {
                    S1: {
                        fields: {
                            niche: 'gastronomia',
                            tagline: 'Sabor que conecta pessoas',
                            promise: 'A melhor experiência gastronômica da cidade',
                            enemy: 'Fast food sem qualidade',
                            brandValues: ['Qualidade', 'Acolhimento', 'Tradição'],
                            audienceAge: '25-44',
                            audienceClass: 'ab',
                            audiencePain: 'Falta de opções de qualidade perto de casa',
                            archetype: 'O Cuidador',
                            tone: 'acolhedor',
                            bio: 'Há 15 anos servindo receitas de família com ingredientes selecionados.',
                            scope: 'local',
                            location: 'São Paulo, SP',
                        },
                    },
                    S2: {
                        products: [
                            { name: 'Menu Executivo', price: 'R$ 49,90', description: 'Prato + Bebida + Sobremesa' },
                            { name: 'Rodízio Premium', price: 'R$ 89,90', description: 'Rodízio completo para 2 pessoas' },
                        ],
                        metrics: {
                            currentTicket: '65',
                            targetTicket: '85',
                            currentRevenue: '120000',
                        },
                        competitor1: 'Restaurante Rival A',
                        competitor2: 'Restaurante Rival B',
                        competitor3: 'iFood Partners',
                    },
                    S3: {
                        businessType: 'local',
                        channels: ['instagram', 'whatsapp', 'google'],
                        cta: { primary: 'whatsapp', secondary: 'reserva', text: 'Reserve sua mesa' },
                        metrics: { monthlyGoal: '200', currentConversion: '3', targetConversion: '5', cpl: '12' },
                        traffic: { primarySource: 'Orgânico' },
                    },
                    S4: {
                        matrix: [
                            { role: 'Aprovador Final', who: 'Chef Roberto' },
                            { role: 'Estrategista', who: 'Bravvo Agent' },
                            { role: 'Time', who: 'Equipe Marketing' },
                        ],
                        schedule: { frequency: '5x', bestDays: ['ter', 'qui', 'sab'], bestTimes: ['12:00', '19:00'] },
                        slas: { approval: '12h' },
                    },
                    S5: {
                        ideas: ['Série "Da Horta ao Prato"', 'Reels de bastidores da cozinha'],
                        notepad: 'Explorar parcerias com micro-influenciadores locais.',
                        palette: { primary: '#D97706', secondary: '#1E293B', accent: '#059669' },
                        rules: { mood: 'acolhedor' },
                    },
                },
                kpis: [],
                dashboard: {},
            },
        },
    });

    console.log('✅ Workspace seeded:', workspace.id);
    console.log('🎉 Seed complete!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Seed error:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
