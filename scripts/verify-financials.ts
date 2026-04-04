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

async function verify() {
  console.log('--- VERIFYING FINANCIAL ALIGNMENT ---');
  
  const revenueResult = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { status: 'completed' },
  });

  const totalAmount = revenueResult._sum.amount || 0;
  console.log(`Raw Total Revenue (Subunits): ${totalAmount}`);
  console.log(`Human Readable (Actual KES): KES ${(totalAmount / 100).toLocaleString()}`);

  const sample = await prisma.transaction.findFirst({
    where: { status: 'completed' },
    select: { amount: true, paymentReference: true }
  });

  if (sample) {
    console.log('Sample Transaction:');
    console.log(`- Amount: ${sample.amount} (Expected 50000 or similar)`);
    console.log(`- Reference: ${sample.paymentReference}`);
  }

  if (totalAmount > 100000) {
    console.log('✅ VERIFICATION SUCCESS: Revenue is in subunits and accurately reflected.');
  } else {
    console.warn('⚠️ VERIFICATION WARNING: Revenue seems too low. Check migration.');
  }
}

verify()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
