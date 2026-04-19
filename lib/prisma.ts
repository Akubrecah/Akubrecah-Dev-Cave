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
  
  // 2. Log configuration status for debugging (masking sensitive parts)
  if (process.env.NODE_ENV !== 'production') {
    if (!connectionString) {
      console.warn('[PRISMA] ⚠️ DATABASE_URL is missing or empty in process.env');
    } else {
      const sanitized = connectionString.substring(0, 15) + '...';
      console.log(`[PRISMA] 🛠️ Initializing with connection string starting with: ${sanitized}`);
    }
  }

  // 3. Fallback strategy: If no connection string is provided, return a standard client.
  // This is critical for build-time safety in Next.js.
  if (!connectionString || connectionString === 'undefined') {
    return new PrismaClient();
  }

  try {
    // 4. Initialize with Neon adapter for serverless environments
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool as any);
    return new PrismaClient({ adapter });
  } catch (error) {
    console.error('[PRISMA] ❌ Failed to initialize Pool with connection string:', error);
    // Final fallback to standard prisma engine
    return new PrismaClient();
  }
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

