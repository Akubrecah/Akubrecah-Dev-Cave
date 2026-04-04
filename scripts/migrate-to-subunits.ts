import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = (process.env.DATABASE_URL || '').replace(/^["']|["']$/g, '')

const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('--- STARTING FINANCIAL DATA MIGRATION (BASE -> SUBUNITS) ---');
  
  const transactions = await prisma.transaction.findMany();
  console.log(`Auditing ${transactions.length} total transactions...`);

  let migratedCount = 0;

  for (const tx of transactions) {
    // 1. Copy reference if needed
    const newRef = tx.paymentReference;
    
    // 2. Decide if amount needs multiplication
    let newAmount = tx.amount;
    if (tx.amount < 10000) {
      newAmount = tx.amount * 100;
    }

    if (newAmount !== tx.amount || newRef !== tx.paymentReference) {
      await prisma.transaction.update({
        where: { id: tx.id },
        data: {
          amount: newAmount,
          paymentReference: newRef,
        }
      });
      migratedCount++;
    }
  }

  console.log(`--- MIGRATION COMPLETE: ${migratedCount} transactions updated ---`);
}

main()
  .catch(e => {
    console.error('Migration Failure:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
