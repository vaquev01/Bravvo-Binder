import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../Database/prisma/generated/client/index.js';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('⚠️  DATABASE_URL não configurada! O Prisma não vai funcionar.');
    console.error('   Configure a variável DATABASE_URL no painel do Railway ou no .env local.');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
