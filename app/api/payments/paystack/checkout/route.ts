import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

const TIER_PRICES: Record<string, number> = {
  'hourly': 10,
  'three_hour': 20,
  'daily': 50,
  'weekly': 250,
  'monthly': 800,
};

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier } = await req.json();
    const amount = TIER_PRICES[tier];

    if (!amount) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // 1. Get user from DB to obtain their email
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
        type: 'paystack',
        status: 'pending',
        tier,
      },
    });

    const host = req.headers.get('origin') || `https://${req.headers.get('host')}`;
    const callback_url = `${host}/api/payments/paystack/callback`;

    // 3. Initiate Paystack Transaction
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: amount * 100, // Paystack requires amount in subunits (Cents/Kobos)
        currency: 'KES',
        reference: transaction.id,
        callback_url,
        metadata: {
          tier,
          transactionId: transaction.id
        }
      }),
    });

    const paystackData = await paystackRes.json();

    // 4. Handle Paystack Response
    if (paystackRes.ok && paystackData.status) {
      // Update transaction with the reference from Paystack
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { stripeSessionId: paystackData.data.reference }, // Reusing stripeSessionId column
      });

      return NextResponse.json({ 
        success: true, 
        authorization_url: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
        transactionId: transaction.id,
        amount: amount * 100 // Amount in subunits
      });
    } else {
      console.error('Paystack Checkout Error:', paystackData);
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'failed', failureReason: paystackData.message || 'Initialization failed' },
      });
      return NextResponse.json({ error: paystackData.message || 'Paystack initialization failed' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Paystack Checkout Error:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred during checkout',
      details: error.message
    }, { status: 500 });
  }
}
