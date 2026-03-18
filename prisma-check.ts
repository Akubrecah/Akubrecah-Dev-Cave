import { PrismaClient } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'
import dotenv from 'dotenv'

dotenv.config()

neonConfig.webSocketConstructor = ws

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL is not set in .env')
  process.exit(1)
}

console.log('--- Database Diagnostic ---')
console.log('Connection String:', connectionString.split('@')[1] || 'invalid')

const pool = new Pool({ connectionString })
const adapter = new PrismaNeon(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  try {
    console.log('Connecting to database...')
    await prisma.$connect()
    console.log('Connected successfully!')

    console.log('Checking User table columns...')
    // We can run a raw query to check columns
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User'
    `
    console.log('Columns in User table:')
    console.table(columns)

    console.log('Checking if any users exist...')
    const count = await prisma.user.count()
    console.log('Total users:', count)

    if (count > 0) {
        const firstUser = await prisma.user.findFirst()
        console.log('Found first user. ClerkId exists:', !!firstUser?.clerkId)
    }

  } catch (error) {
    console.error('Diagnostic failed:')
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
