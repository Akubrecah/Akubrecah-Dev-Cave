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
  
  // 2. Fallback strategy: If no connection string is provided, return a standard client.
  // This is critical for build-time safety in Next.js.
  if (!connectionString || connectionString === 'undefined' || connectionString.length < 10) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[PRISMA] ⚠️ DATABASE_URL is missing or critically short. Falling back to default engine.');
    }
    return new PrismaClient();
  }

  try {
    // 3. Initialize with Neon adapter for serverless environments
    const pool = new Pool({ 
      connectionString,
      connectionTimeoutMillis: 5000, // Fail fast if connection cannot be established
    });
    const adapter = new PrismaNeon(pool as any);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[PRISMA] 🛠️ Initialized with connection string: ${connectionString.substring(0, 15)}...`);
    }

    return new PrismaClient({ 
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } catch (error) {
    console.error('[PRISMA] ❌ Failed to initialize Pool/Adapter:', error);
    return new PrismaClient();
  }
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

