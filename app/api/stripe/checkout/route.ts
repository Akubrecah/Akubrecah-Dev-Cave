import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';


export async function POST(req: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-02-25.clover',
    });
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { type, amount } = await req.json();

    let priceId = '';
    let mode: 'payment' | 'subscription' = 'payment';

    // In a real app, map 'type' to Stripe Price IDs configured in your dashboard
    if (type === 'credit_purchase') {
      priceId = process.env.STRIPE_CREDIT_PRICE_ID || 'price_placeholder_credit';
    } else if (type === 'subscription_monthly') {
      priceId = process.env.STRIPE_MONTHLY_PRICE_ID || 'price_placeholder_monthly';
      mode = 'subscription';
    } else if (type === 'subscription_weekly') {
      priceId = process.env.STRIPE_WEEKLY_PRICE_ID || 'price_placeholder_weekly';
      mode = 'subscription';
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled`,
      metadata: {
        userId,
        type,
        amount
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}
