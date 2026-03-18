import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import ws from 'ws'

neonConfig.webSocketConstructor = ws
neonConfig.pipelineConnect = false

// Clean connection string for Neon serverless adapter
// Adding pgbouncer=true is critical when using Neon's connection pooler with Prisma
const rawUrl = process.env.DATABASE_URL || ''
const baseUrl = rawUrl.split('?')[0]
const connectionString = `${baseUrl}?sslmode=require&pgbouncer=true`

const adapter = new PrismaNeon({ connectionString })

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
