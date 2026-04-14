import { neonConfig, Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import ws from 'ws'

// Configure Neon to use the ws package for WebSockets
neonConfig.webSocketConstructor = ws

const prismaClientSingleton = () => {
  // Use the database URL exactly as provided in .env
  const connectionString = (process.env.DATABASE_URL || '').replace(/^["']|["']$/g, '');
  
  // If no connection string is provided (common during build time), 
  // return a standard client without the Neon adapter to avoid hangs.
  if (!connectionString) {
    return new PrismaClient();
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool as any);
  return new PrismaClient({ adapter });
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

