import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import { config as dotenvConfig } from 'dotenv';
import { join } from 'path';
import ws from 'ws';

// Load .env files if DATABASE_URL is not already provided by Next.js or the shell.
if (!process.env.DATABASE_URL) {
  dotenvConfig({ path: join(process.cwd(), '.env') });
}

if (!process.env.DATABASE_URL) {
  dotenvConfig({ path: join(process.cwd(), '.env.local') });
}

// Configure WebSocket for Neon in development
if (process.env.NODE_ENV !== 'production') {
  neonConfig.webSocketConstructor = ws;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // Production: Use Neon adapter with connection pooling
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set. Create a .env or .env.local file in the project root from .env.example.');
  }

  const adapter = new PrismaNeon({ connectionString });
  prisma = new PrismaClient({ adapter });
} else {
  // Development: Reuse client to prevent connection exhaustion
  if (!globalForPrisma.prisma) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set. Create a .env or .env.local file in the project root from .env.example.');
    }

    const adapter = new PrismaNeon({ connectionString });
    globalForPrisma.prisma = new PrismaClient({ 
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
export default prisma;
