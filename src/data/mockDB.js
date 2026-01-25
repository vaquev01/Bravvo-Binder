import { CARACA_BAR_DATA, TADA_ASIAN_FOOD_DATA } from './mockData';

// Helper to deep clone so we don't mutate the seed data directly
const clone = (data) => JSON.parse(JSON.stringify(data));

// SEED DATA GENERATORS
const generateClient = (id, overrides = {}) => {
    const base = clone(CARACA_BAR_DATA);
    return {
        ...base,
        id,
        clientName: overrides.clientName || `Client ${id}`,
        // Override Vault 1 (Brand)
        vaults: {
            ...base.vaults,
            S1: {
                ...base.vaults.S1,
                fields: {
                    ...base.vaults.S1.fields,
                    ...overrides.brand
                }
            },
            // Override Vault 2 (Products) if provided
            S2: {
                ...base.vaults.S2,
                products: overrides.products || base.vaults.S2.products
            }
        },
        // Override Dashboard Stats if provided
        kpis: {
            ...base.dashboard.D5, // Assuming D5 holds KPIs in current structure, or we treat 'kpis' separate in this DB wrapper
            revenue: { value: overrides.revenue || 50000, goal: overrides.revenueGoal || 100000 },
            sales: { value: overrides.sales || 120, goal: overrides.salesGoal || 200 }
        }
    };
};

// THE MOCK DATABASE
export const MOCK_DB = {
    agencies: [
        {
            id: 'A1',
            name: 'Bravvo Agency',
            logo: '🚀',
            clients: ['C1', 'C2']
        },
        {
            id: 'A2',
            name: 'Creative Soul Studio',
            logo: '🎨',
            clients: ['C4', 'C5']
        }
    ],
    clients: {
        'C1': {
            ...clone(CARACA_BAR_DATA),
            id: 'C1',
            agency: 'A1',
            status: 'healthy',
            revenue: 85000,
            responsible: 'João (Dono)',
            kpis: {
                revenue: { value: 85000, goal: 100000 },
                traffic: { value: 12500, goal: 15000 },
                sales: { value: 450, goal: 500 }
            }
        },
        'C2': {
            ...clone(TADA_ASIAN_FOOD_DATA),
            id: 'C2',
            agency: 'A1',
            status: 'attention',
            revenue: 52000,
            responsible: 'Ricardo (Proprietário)',
            kpis: {
                revenue: { value: 52000, goal: 75000 },
                traffic: { value: 8200, goal: 12000 },
                sales: { value: 900, goal: 1200 }
            }
        },
        'C3': generateClient('C3', {
            clientName: 'TechStart SaaS',
            revenue: 150000,
            revenueGoal: 200000,
            brand: { archetype: 'Sábio', niche: 'Tecnologia' }
        }),
        'C4': generateClient('C4', {
            clientName: 'Dra. Luana Dermatologia',
            revenue: 45000,
            revenueGoal: 80000,
            brand: { archetype: 'Cuidador', niche: 'Saúde' }
        }),
        'C5': generateClient('C5', {
            clientName: 'EcoConstruct',
            revenue: 350000,
            revenueGoal: 500000,
            brand: { archetype: 'Criador', niche: 'Construção' }
        })
    }
};

// API MOCK FUNCTIONS
export const api = {
    getAgencies: () => MOCK_DB.agencies,
    getAgencyClients: (agencyId) => {
        const agency = MOCK_DB.agencies.find(a => a.id === agencyId);
        if (!agency) return [];
        return agency.clients.map(clientId => {
            const client = MOCK_DB.clients[clientId];
            return {
                id: clientId,
                ...client.vaults.S1.fields, // Basic info
                name: client.clientName,
                kpis: client.kpis,
                revenue: client.revenue,
                responsible: client.responsible,
                status: client.status
            };
        });
    },
    getAllClients: () => {
        return Object.values(MOCK_DB.clients).map(c => ({
            id: c.id,
            name: c.clientName,
            agency: MOCK_DB.agencies.find(a => a.clients.includes(c.id))?.name || 'Direto',
            revenue: c.kpis.revenue.value,
            status: c.kpis.revenue.value > c.kpis.revenue.goal * 0.8 ? 'on_track' : 'attention'
        }));
    },
    getClientData: (clientId) => {
        return MOCK_DB.clients[clientId];
    },
    // Simulate saving data back (in memory)
    updateClientData: (clientId, newData) => {
        if (MOCK_DB.clients[clientId]) {
            MOCK_DB.clients[clientId] = { ...MOCK_DB.clients[clientId], ...newData };
            return true;
        }
        return false;
    }
};
