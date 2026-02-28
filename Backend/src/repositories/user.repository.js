/**
 * User Repository - Acesso ao Prisma para Users
 * Nunca use SQL puro, apenas métodos do Prisma Client.
 */
import prisma from '../prisma.js';

export const userRepository = {
    async findByUsername(username) {
        return prisma.user.findUnique({
            where: { username }
        });
    },

    async findById(id) {
        return prisma.user.findUnique({
            where: { id }
        });
    },

    async create(data) {
        return prisma.user.create({ data });
    },

    async update(id, data) {
        return prisma.user.update({
            where: { id },
            data
        });
    }
};
