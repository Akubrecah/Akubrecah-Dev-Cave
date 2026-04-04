import prisma from './prisma';

interface PaystackTransaction {
  id: number;
  reference: string;
  amount: number;
  status: string;
  gateway_response: string;
  paid_at: string;
  metadata: {
    userId?: string;
    transactionId?: string;
    tier?: string;
  } | null;
  customer: {
    email: string;
  };
}

// In-memory cache to prevent spamming Paystack API
let lastSyncTime = 0;
const SYNC_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Synchronizes local transactions with Paystack's successful transactions.
 * "Pulls" real-time data to ensure database integrity.
 */
export async function syncPaystackTransactions() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    console.error('Paystack Sync: Missing PAYSTACK_SECRET_KEY');
    return { success: false, synced: 0 };
  }

  // 0. Caching logic: Only sync once every 5 minutes
  const now = Date.now();
  if (now - lastSyncTime < SYNC_COOLDOWN_MS) {
    return { success: true, synced: 0, cached: true };
  }

  try {
    // 1. Fetch last 50 successful transactions from Paystack
    const response = await fetch('https://api.paystack.co/transaction?status=success&perPage=50', {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    if (!response.ok || !data.status) {
      console.error('Paystack Sync Flow Error:', data);
      return { success: false, synced: 0 };
    }

    const paystackTxs: PaystackTransaction[] = data.data;
    let syncedCount = 0;

    // 2. Iterate and Upsert
    for (const pTx of paystackTxs) {
      const { reference, amount, status, metadata, paid_at } = pTx;
      
      // Use transactionId from metadata as primary lookup, or reference
      const localTxId = metadata?.transactionId || reference;
      let userId = metadata?.userId || null;
      const tier = metadata?.tier;

      // If userId is missing from metadata, try identifying by customer email
      if (!userId && pTx.customer?.email) {
        const foundUser = await prisma.user.findUnique({
          where: { email: pTx.customer.email },
          select: { id: true }
        });
        if (foundUser) userId = foundUser.id;
      }

      // Check if transaction exists
      const existingTx = await prisma.transaction.findFirst({
        where: {
          OR: [
            { id: localTxId },
            { paymentReference: reference }
          ]
        }
      });

      if (!existingTx) {
        // PULL: Create missing transaction (now allows userId: null)
        await prisma.transaction.create({
          data: {
            id: localTxId,
            userId, 
            amount, // Already in subunits from Paystack
            status: 'completed',
            paymentReference: reference,
            type: 'paystack',
            tier: tier || 'unknown',
            createdAt: new Date(paid_at),
          }
        });
        syncedCount++;
      } else if (existingTx.status !== 'completed' && status === 'success') {
        // PULL: Update pending/failed to completed
        await prisma.transaction.update({
          where: { id: existingTx.id },
          data: { 
            status: 'completed',
            paymentReference: reference,
            amount, 
            userId: userId || existingTx.userId // Update userId if found now
          }
        });
        syncedCount++;
      }
    }

    if (syncedCount > 0) {
      console.log(`📡 Paystack Sync: Successfully pulled ${syncedCount} missing/pending transactions.`);
    }

    lastSyncTime = now; // Mark sync as successful
    return { success: true, synced: syncedCount };
  } catch (error) {
    console.error('Paystack Sync Exception:', error);
    return { success: false, synced: 0 };
  }
}
