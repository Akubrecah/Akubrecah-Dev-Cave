import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.redirect(new URL('/checkout?error=MissingReference', req.url));
    }

    // 1. Verify the transaction with Paystack API
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

    // 2. Find transaction by reference in DB
    const transaction = await prisma.transaction.findFirst({
      where: { id: metadata.transactionId },
      include: { user: true },
    });

    if (!transaction) {
      console.warn('Paystack Callback: Transaction not found for request ID:', metadata.transactionId);
      return NextResponse.redirect(new URL(`/checkout?error=TransactionNotFound`, req.url));
    }

    if (status === 'success') {
      // 3. Update transaction status
      // Only grant if it hasn't already been completed (in case webhook hit first)
      if (transaction.status !== 'completed') {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'completed',
            stripeSessionId: reference
          },
        });

        // 4. Grant subscription based on tier
        const tier = transaction.tier;
        const now = new Date();
        
        const updateData: any = {};
        
        if (tier === 'hourly') {
          updateData.pdfPremiumEnd = new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour
        } else if (tier === 'three_hour') {
          updateData.pdfPremiumEnd = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours
        } else if (tier === 'daily') {
          updateData.pdfPremiumEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
        } else if (tier === 'weekly') {
          updateData.role = 'cyber';
          updateData.subscriptionStatus = 'active';
          updateData.subscriptionEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        } else if (tier === 'monthly') {
          updateData.role = 'cyber';
          updateData.subscriptionStatus = 'active';
          updateData.subscriptionEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.user.update({
            where: { id: transaction.userId },
            data: updateData,
          });
          console.log(`✅ ${tier} access granted to user ${transaction.userId} via Paystack`);
        }
      }

      // Redirect to Dashboard on success
      return NextResponse.redirect(new URL('/dashboard', req.url));

    } else {
      // Payment Failed or Pending
      console.warn(`❌ Paystack Callback: Failed or incomplete status - ${status}`);
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { 
          status: 'failed',
          failureReason: `Paystack status: ${status}`
        },
      });
      return NextResponse.redirect(new URL(`/checkout?error=PaymentFailed`, req.url));
    }

  } catch (error) {
    console.error('Paystack Callback processing error:', error);
    return NextResponse.redirect(new URL(`/checkout?error=InternalError`, req.url));
  }
}
