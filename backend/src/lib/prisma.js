const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client')

const globalForPrisma = global

/**
 * In Prisma 7, the URL is no longer in the schema.
 * We must provide a driver adapter to the client.
 */
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined. Please check your .env file.");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });
};

const prisma =
  globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

module.exports = prisma