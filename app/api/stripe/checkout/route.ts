import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      // @ts-expect-error - Ignore the strict apiVersion literal check
      apiVersion: '2023-10-16',
    });
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier } = await req.json();

    let priceId = '';

    if (tier === 'daily') {
      priceId = process.env.STRIPE_DAILY_PRICE_ID!;
    } else if (tier === 'weekly') {
      priceId = process.env.STRIPE_WEEKLY_PRICE_ID!;
    } else if (tier === 'monthly') {
      priceId = process.env.STRIPE_MONTHLY_PRICE_ID!;
    } else if (tier === 'premium_weekly') {
      priceId = process.env.STRIPE_PREMIUM_WEEKLY_PRICE_ID!;
    } else if (tier === 'premium_monthly') {
      priceId = process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!;
    } else {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    if (!priceId) {
      console.error(`Price ID not configured for tier: ${tier}`);
      return NextResponse.json({ error: `The ${tier} plan is not currently available for checkout. Please contact support.` }, { status: 500 });
    }

    // 1. We need a Stripe Customer ID for subscriptions.
    const customer = await stripe.customers.create({
      metadata: { userId },
    });

    // 2. Create the subscription with payment_behavior='default_incomplete'
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId,
        tier
      }
    });

    // 3. Extract the client secret
    const invoice = subscription.latest_invoice as Stripe.Invoice;
    // @ts-expect-error - Expanded payment_intent
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent | null;

    if (!paymentIntent?.client_secret) {
        console.error('Subscription created but no client secret found in payment intent', subscription.id);
        return NextResponse.json({ error: 'System busy. Unable to generate secure payment token. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      subscriptionId: subscription.id 
    });

  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}
