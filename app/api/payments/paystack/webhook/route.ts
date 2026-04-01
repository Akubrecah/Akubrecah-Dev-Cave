import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { TIERS, isValidTier } from '@/lib/pricing';

/**
 * Computes subscriptionEnd = now + durationMs for the given tier.
 * Returns the full user updateData object for prisma.user.update.
 */
function buildSubscriptionUpdate(tier: string): Record<string, unknown> {
  if (!isValidTier(tier)) return {};

  const { durationMs, filings } = TIERS[tier];
  const now = new Date();
  const subscriptionEnd = new Date(now.getTime() + durationMs);

  return {
    role: 'premium',
    subscriptionStatus: 'active',
    subscriptionTier: tier,
    subscriptionEnd,
    // Clear legacy pdfPremiumEnd
    pdfPremiumEnd: null,
  };
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY as string)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'charge.success') {
      const { reference, status, metadata } = event.data;

      const transaction = await prisma.transaction.findFirst({
        where: { id: metadata.transactionId },
        include: { user: true },
      });

      if (!transaction) {
        console.warn('Paystack Webhook: Transaction not found:', metadata.transactionId);
        return NextResponse.json({ success: true });
      }

      if (transaction.status === 'completed') {
        return NextResponse.json({ success: true });
      }

      if (status === 'success') {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: 'completed', stripeSessionId: reference },
        });

        const tier = transaction.tier;
        const updateData = buildSubscriptionUpdate(tier ?? '');

        if (Object.keys(updateData).length > 0) {
          await prisma.user.update({
            where: { id: transaction.userId },
            data: updateData,
          });
          const tierInfo = isValidTier(tier ?? '') ? TIERS[tier as keyof typeof TIERS] : null;
          console.log(`✅ ${tierInfo?.name ?? tier} access (${tierInfo?.label}) granted to user ${transaction.userId} via Paystack Webhook`);
        }
      } else {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: 'failed', failureReason: `Paystack webhook event: ${event.event}` },
        });
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Paystack Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
