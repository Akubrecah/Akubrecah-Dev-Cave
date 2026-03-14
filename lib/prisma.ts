import { Pool, neonConfig, neon } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from './generated/client/client'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const connectionString = `${process.env.DATABASE_URL}`
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
