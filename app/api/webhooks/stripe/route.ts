import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-expect-error - Ignore the strict apiVersion literal check
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    if (!webhookSecret) {
        console.warn('⚠️ Stripe Webhook Secret is not set. Verification skipped (not recommended for production).');
        event = JSON.parse(body);
    } else {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }
  } catch (err: any) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'invoice.paid':
        const invoice = event.data.object as any; // Cast as any to bypass direct property check on complex Stripe object
        const subscriptionId = typeof invoice.subscription === 'string' 
          ? invoice.subscription 
          : invoice.subscription?.id;
        
        if (!subscriptionId) {
          console.error('No subscriptionId found in invoice');
          break;
        }

        // Retrieve full subscription to get metadata
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const metadata = subscription.metadata as { userId?: string; tier?: string };
        const { userId, tier } = metadata;

        if (!userId) {
          console.error('No userId found in subscription metadata');
          break;
        }

        const now = new Date();
        const periodEnd = new Date(invoice.lines.data[0].period.end * 1000);

        if (tier === 'daily') {
          // Add 24 hours of premium PDF access
          const pdfEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          await prisma.user.update({
            where: { clerkId: userId },
            data: {
              pdfPremiumEnd: pdfEnd,
            }
          });
          console.log(`✅ Daily PDF access granted to user ${userId}`);
        } else if (tier === 'weekly' || tier === 'monthly') {
          // Cyber Pro access
          await prisma.user.update({
            where: { clerkId: userId },
            data: {
              role: 'cyber',
              subscriptionStatus: 'active',
              subscriptionEnd: periodEnd,
            }
          });
          console.log(`✅ Cyber Pro (${tier}) access granted to user ${userId}`);
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSub = event.data.object as Stripe.Subscription;
        const subUserId = deletedSub.metadata.userId;
        
        if (subUserId) {
          await prisma.user.update({
            where: { clerkId: subUserId },
            data: {
              subscriptionStatus: 'expired'
            }
          });
          console.log(`ℹ️ Subscription expired for user ${subUserId}`);
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
