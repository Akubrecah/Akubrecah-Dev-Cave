import { neonConfig, Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import ws from 'ws'

// Configure Neon to use the ws package for WebSockets
neonConfig.webSocketConstructor = ws

const prismaClientSingleton = () => {
  // 1. Get the connection string and normalize it (strip quotes/whitespace)
  const rawConnectionString = process.env.DATABASE_URL || '';
  const connectionString = rawConnectionString.trim().replace(/^["']|["']$/g, '');
  
  // Dummy URL for build-time safety
  const DUMMY_URL = "postgresql://dummy:dummy@localhost:5432/dummy";

  // 2. Fallback strategy: If no connection string is provided, return a client with a dummy URL.
  if (!connectionString || connectionString === 'undefined' || connectionString.length < 10) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[PRISMA] ⚠️ DATABASE_URL is missing. Falling back to dummy URL.');
    }
    // Set environment variable for Prisma to pick up
    process.env.DATABASE_URL = DUMMY_URL;
    return new PrismaClient();
  }

  try {
    // 3. Initialize with Neon adapter for serverless environments
    const pool = new Pool({ 
      connectionString,
      connectionTimeoutMillis: 5000,
    });
    const adapter = new PrismaNeon(pool as any);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[PRISMA] 🛠️ Initialized with adapter for: ${connectionString.substring(0, 15)}...`);
    }

    // IMPORTANT: When using an adapter, do NOT pass datasourceUrl or datasources.
    // The adapter already handles the connection pool.
    return new PrismaClient({ 
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } catch (error) {
    console.error('[PRISMA] ❌ Failed to initialize Pool/Adapter:', error);
    process.env.DATABASE_URL = DUMMY_URL;
    return new PrismaClient();
  }
}



declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

