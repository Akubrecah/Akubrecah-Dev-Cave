import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { safaricom } from '@/lib/safaricom';

const TIER_PRICES: Record<string, number> = {
  'basic': 50,
  'pro': 100,
};

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier, phoneNumber } = await req.json();
    const amount = TIER_PRICES[tier];

    if (!amount) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    if (!phoneNumber || !/^254\d{9}$/.test(phoneNumber)) {
      return NextResponse.json({ error: 'Invalid Safaricom phone number (Format: 2547XXXXXXXX)' }, { status: 400 });
    }

    // 1. Get user from DB
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found in database. Please sync your account.' }, { status: 404 });
    }

    // 2. Create pending transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        type: 'mpesa',
        status: 'pending',
        tier,
      },
    });

    // 3. Initiate STK Push
    const stkResponse = await safaricom.stkPush({
      phoneNumber,
      amount,
      accountReference: `ORDER-${transaction.id.substring(0, 8)}`,
      transactionDesc: `Subscription - ${tier}`,
    });

    // 4. Handle STK Response
    if (stkResponse.ResponseCode === '0') {
      // Update transaction with CheckoutRequestID for callback matching
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { mpesaCode: stkResponse.CheckoutRequestID }, // Using mpesaCode field for CheckoutRequestID temporarily to match it later
      });

      return NextResponse.json({ 
        success: true, 
        checkoutRequestId: stkResponse.CheckoutRequestID,
        transactionId: transaction.id 
      });
    } else {
      console.error('STK Push Error:', stkResponse);
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'failed' },
      });
      return NextResponse.json({ error: stkResponse.ResponseDescription || 'M-Pesa push failed' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('M-Pesa Checkout Error:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred during checkout',
      details: error.message
    }, { status: 500 });
  }
}
