import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { syncPaystackTransactions } from '../lib/paystack-sync'

dotenv.config()

async function testSync() {
  console.log('--- TESTING PAYSTACK REAL-TIME SYNC ---');
  
  try {
    const result = await syncPaystackTransactions();
    console.log('Sync Result:', result);
    
    if (result.success) {
      console.log('✅ SYNC TEST PASSED');
    } else {
      console.error('❌ SYNC TEST FAILED');
    }
  } catch (e) {
    console.error('Sync Test Exception:', e);
  }
}

testSync().then(() => process.exit(0));
