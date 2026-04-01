import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { TIERS, isValidTier } from '@/lib/pricing';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier } = await req.json();

    if (!tier || !isValidTier(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const amount = TIERS[tier].price;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found in database. Please sync your account.' }, { status: 404 });
    }

    // Create pending transaction
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

    // Initiate Paystack Transaction
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: amount * 100, // Paystack requires subunits (fill in KES * 100 = kobo equivalent)
        currency: 'KES',
        reference: transaction.id,
        callback_url,
        metadata: {
          tier,
          transactionId: transaction.id,
          tierName: TIERS[tier].name,
          durationMs: TIERS[tier].durationMs,
          filings: TIERS[tier].filings,
        }
      }),
    });

    const paystackData = await paystackRes.json();

    if (paystackRes.ok && paystackData.status) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { stripeSessionId: paystackData.data.reference },
      });

      return NextResponse.json({ 
        success: true, 
        authorization_url: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
        transactionId: transaction.id,
        amount: amount * 100,
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
