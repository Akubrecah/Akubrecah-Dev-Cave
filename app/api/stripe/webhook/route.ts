import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // @ts-expect-error - Use stable API version
    apiVersion: '2023-10-16',
  });
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  console.log('Webhook received:', signature ? 'Signature present' : 'No signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }
    return new NextResponse('Webhook Error', { status: 400 });
  }

  if (event.type === 'checkout.session.completed' || event.type === 'invoice.paid') {
    let subMetadata: Record<string, string> = {};
    let amount = '0';
    let sessionId = '';

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      subMetadata = (session.metadata as Record<string, string>) || {};
      amount = session.amount_total?.toString() || '0';
      sessionId = session.id;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invoice = event.data.object as any;
      amount = invoice.amount_paid.toString();
      sessionId = invoice.id;
      
      // For subscriptions, metadata is often on the subscription object
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        subMetadata = (subscription.metadata as Record<string, string>) || {};
      } else {
        subMetadata = (invoice.metadata as Record<string, string>) || {};
      }
    }

    const { userId, type, tier } = subMetadata;
    const finalType = tier || type; // Support both naming conventions
    console.log('Processing event for user:', userId, 'type:', finalType);

    if (!userId) {
      console.error('User ID missing in metadata for event:', event.id);
      return new NextResponse('User ID missing in metadata', { status: 400 });
    }

    // Save transaction
    await prisma.transaction.create({
      data: {
        userId,
        amount: Math.floor(parseInt(amount) / 100), // Store in major units if that's what the DB expects, check schema
        type: finalType || 'unknown',
        status: 'completed',
        stripeSessionId: sessionId,
      }
    });

    // Update user credits or subscription
    if (finalType === 'credit_purchase') {
       const creditsToAdd = Math.floor(parseInt(amount) / 100);
       await prisma.user.update({
         where: { clerkId: userId },
         data: { credits: { increment: creditsToAdd } }
       });
    } else {
      // Handles 'daily', 'weekly', 'monthly', 'premium_weekly', 'premium_monthly'
      const isPremium = finalType.includes('premium');
      const isPro = finalType.includes('pro') || finalType === 'weekly' || finalType === 'monthly';
      const isCyberTier = isPremium || isPro;
      
      const endDate = new Date();
      if (finalType === 'daily') {
        endDate.setHours(endDate.getHours() + 24);
      } else if (finalType.includes('monthly')) {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        // Weekly
        endDate.setDate(endDate.getDate() + 7);
      }

      await prisma.user.update({
        where: { clerkId: userId },
        data: {
          subscriptionStatus: 'active',
          subscriptionTier: finalType,
          role: isCyberTier ? 'cyber' : 'personal',
          [finalType === 'daily' ? 'pdfPremiumEnd' : 'subscriptionEnd']: endDate
        }
      });
      console.log('User subscription updated successfully:', userId, 'tier:', finalType, 'role:', isCyberTier ? 'cyber' : 'personal');
    }
  }

  return new NextResponse(null, { status: 200 });
}
