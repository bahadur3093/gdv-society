import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

// Create Neon adapter with connection configuration
const adapter = new PrismaNeon({ connectionString });

// Initialize Prisma Client with adapter
export const prisma = new PrismaClient({ adapter });
