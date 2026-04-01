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

    const session = event.data.object as Stripe.Checkout.Session;
    const { userId: clerkId, type, tier } = subMetadata;
    const clientRefId = session.client_reference_id;
    const finalClerkId = clerkId || clientRefId;
    
    const finalType = tier || type; // Support both naming conventions
    console.log('Processing event for user:', finalClerkId, 'type:', finalType);

    if (!finalClerkId) {
      console.error('User ID missing in metadata and client_reference_id for event:', event.id);
      return new NextResponse('User ID missing', { status: 400 });
    }

    // Find the internal user record to get the UUID (id)
    const user = await prisma.user.findUnique({
      where: { clerkId: finalClerkId },
      select: { id: true, email: true }
    });

    if (!user) {
      console.error('User not found in DB for clerkId:', clerkId);
      return new NextResponse('User not found', { status: 404 });
    }

    // Save transaction using the internal UUID
    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: Math.floor(parseInt(amount) / 100), // Stripe gives amount in cents
        type: finalType || 'unknown',
        status: 'completed',
        stripeSessionId: sessionId,
      }
    });

    // Update user credits or subscription
    if (finalType === 'credit_purchase') {
       const creditsToAdd = Math.floor(parseInt(amount) / 100);
       await prisma.user.update({
         where: { clerkId: finalClerkId },
         data: { credits: { increment: creditsToAdd } }
       });
    } else {
      // Handles 'daily', 'weekly', 'monthly', 'premium_weekly', 'premium_monthly'
      const isPremium = finalType.includes('premium');
      const isWeekly = finalType.includes('weekly');
      const isMonthly = finalType.includes('monthly');
      const isDaily = finalType === 'daily';
      
      const isPremiumTier = isPremium || isWeekly || isMonthly;
      
      const endDate = new Date();
      if (isDaily) {
        endDate.setHours(endDate.getHours() + 24);
      } else if (isMonthly) {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (isWeekly) {
        endDate.setDate(endDate.getDate() + 7);
      } else {
        // Default to a week if unknown but subscription-like
        endDate.setDate(endDate.getDate() + 7);
      }

      await prisma.user.update({
        where: { clerkId: finalClerkId },
        data: {
          subscriptionStatus: 'active',
          subscriptionTier: finalType,
          role: isPremiumTier ? 'premium' : 'personal',
          [isDaily ? 'pdfPremiumEnd' : 'subscriptionEnd']: endDate
        }
      });
      console.log('User subscription updated successfully:', finalClerkId, 'tier:', finalType, 'role:', isPremiumTier ? 'premium' : 'personal');
    }
  }

  return new NextResponse(null, { status: 200 });
}
