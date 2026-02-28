import { PrismaClient } from '@prisma/client';

console.log("Instantiating PrismaClient");
try {
    const prisma = new PrismaClient();
    console.log("Prisma instantiated!");
    await prisma.$connect();
    console.log("Prisma connected!");
    process.exit(0);
} catch (e) {
    console.error("Prisma error:", e);
    process.exit(1);
}
