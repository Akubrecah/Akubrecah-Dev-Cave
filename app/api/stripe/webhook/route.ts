import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  });
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }
    return new NextResponse('Webhook Error', { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'checkout.session.completed') {
    const { userId, type, amount } = session.metadata || {};

    if (!userId) {
      return new NextResponse('User ID missing in metadata', { status: 400 });
    }

    // Save transaction
    await prisma.transaction.create({
      data: {
        userId,
        amount: parseInt(amount || '0'),
        type: type || 'unknown',
        status: 'completed',
        stripeSessionId: session.id,
      }
    });

    // Update user credits or subscription
    if (type === 'credit_purchase') {
       const creditsToAdd = Math.floor(parseInt(amount || '0') / 100);
       await prisma.user.update({
         where: { clerkId: userId },
         data: { credits: { increment: creditsToAdd } }
       });
    } else if (type === 'subscription_monthly') {
       const endDate = new Date();
       endDate.setDate(endDate.getDate() + 30);
       await prisma.user.update({
         where: { clerkId: userId },
         data: { 
           subscriptionStatus: 'active',
           subscriptionEnd: endDate
         }
       });
    } else if (type === 'subscription_weekly') {
       const endDate = new Date();
       endDate.setDate(endDate.getDate() + 7);
       await prisma.user.update({
         where: { clerkId: userId },
         data: { 
           subscriptionStatus: 'active',
           subscriptionEnd: endDate
         }
       });
    }
  }

  return new NextResponse(null, { status: 200 });
}
