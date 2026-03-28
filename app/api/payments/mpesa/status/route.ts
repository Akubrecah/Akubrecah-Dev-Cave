import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { safaricom } from '@/lib/safaricom';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    let transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // If still pending after a refresh, try to query Safaricom directly
    if (transaction.status === 'pending' && transaction.mpesaCode) {
      try {
        const queryRes = await safaricom.queryTransactionStatus(transaction.mpesaCode);
        
        // ResultCode 0 means Success
        if (queryRes.ResultCode === '0') {
          transaction = await prisma.transaction.update({
            where: { id },
            data: { status: 'completed' }
          });
        } 
        // Other codes involve failures (1032 = Cancelled, 1 = Insufficient, etc.)
        else if (queryRes.ResultCode && queryRes.ResultCode !== '0') {
          transaction = await prisma.transaction.update({
            where: { id },
            data: { 
              status: 'failed',
              failureReason: queryRes.ResultDesc || 'Transaction was not successful'
            }
          });
        }
      } catch (e) {
        console.error('Safaricom Status Query Failed:', e);
      }
    }

    return NextResponse.json({ 
      status: transaction.status,
      tier: transaction.tier,
      failureReason: transaction.failureReason
    });

  } catch (error) {
    console.error('M-Pesa Status check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
