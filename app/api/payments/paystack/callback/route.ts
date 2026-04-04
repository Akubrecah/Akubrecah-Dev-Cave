import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TIERS, isValidTier } from '@/lib/pricing';

function buildSubscriptionUpdate(tier: string): Record<string, unknown> {
  if (!isValidTier(tier)) return {};

  const { durationMs } = TIERS[tier];
  const now = new Date();
  const subscriptionEnd = new Date(now.getTime() + durationMs);

  return {
    role: 'premium',
    subscriptionStatus: 'active',
    subscriptionTier: tier,
    subscriptionEnd,
    pdfPremiumEnd: null,
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.redirect(new URL('/checkout?error=MissingReference', req.url));
    }

    // Verify transaction with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData.status) {
      console.error('Paystack Verification Error:', verifyData);
      return NextResponse.redirect(new URL(`/checkout?error=VerificationFailed`, req.url));
    }

    const { status, metadata } = verifyData.data;

    const transaction = await prisma.transaction.findFirst({
      where: { id: metadata.transactionId },
      include: { user: true },
    });

    if (!transaction) {
      console.warn('Paystack Callback: Transaction not found:', metadata.transactionId);
      return NextResponse.redirect(new URL(`/checkout?error=TransactionNotFound`, req.url));
    }

    if (status === 'success') {
      if (transaction.status !== 'completed') {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: 'completed', paymentReference: reference },
        });

        const tier = transaction.tier;
        const updateData = buildSubscriptionUpdate(tier ?? '');

        if (Object.keys(updateData).length > 0) {
          await prisma.user.update({
            where: { id: transaction.userId },
            data: updateData,
          });
          const tierInfo = isValidTier(tier ?? '') ? TIERS[tier as keyof typeof TIERS] : null;
          console.log(`✅ ${tierInfo?.name ?? tier} access (${tierInfo?.label}) granted to user ${transaction.userId} via Paystack Callback`);
        }
      }

      return NextResponse.redirect(new URL('/dashboard', req.url));

    } else {
      console.warn(`❌ Paystack Callback: Failed status - ${status}`);
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'failed', failureReason: `Paystack status: ${status}` },
      });
      return NextResponse.redirect(new URL(`/checkout?error=PaymentFailed`, req.url));
    }

  } catch (error) {
    console.error('Paystack Callback processing error:', error);
    return NextResponse.redirect(new URL(`/checkout?error=InternalError`, req.url));
  }
}
