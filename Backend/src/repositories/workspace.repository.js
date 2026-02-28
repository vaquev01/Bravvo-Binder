/**
 * Workspace Repository - Acesso ao Prisma para ClientWorkspace
 * Nunca use SQL puro, apenas métodos do Prisma Client.
 */
import prisma from '../prisma.js';

export const workspaceRepository = {
    async findByClientId(clientId) {
        return prisma.clientWorkspace.findUnique({
            where: { clientId }
        });
    },

    async findById(id) {
        return prisma.clientWorkspace.findUnique({
            where: { id }
        });
    },

    async upsert(clientId, data, agencyId = null) {
        return prisma.clientWorkspace.upsert({
            where: { clientId },
            update: {
                data,
                updatedAt: new Date()
            },
            create: {
                clientId,
                agencyId,
                data
            }
        });
    },

    async findAll() {
        return prisma.clientWorkspace.findMany();
    },

    async list(agencyId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const where = agencyId ? { agencyId } : {};

        const [items, total] = await Promise.all([
            prisma.clientWorkspace.findMany({
                where,
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' }
            }),
            prisma.clientWorkspace.count({ where })
        ]);

        return {
            items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
};
