import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    // 1. Validate signature
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY as string)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // 2. Parse Event
    const event = JSON.parse(rawBody);

    // 3. Handle charge.success
    if (event.event === 'charge.success') {
      const { reference, status, metadata } = event.data;

      // Find transaction in DB
      const transaction = await prisma.transaction.findFirst({
        where: { id: metadata.transactionId },
        include: { user: true },
      });

      if (!transaction) {
        console.warn('Paystack Webhook: Transaction not found for request ID:', metadata.transactionId);
        return NextResponse.json({ success: true }); // Return 200 so Paystack stops trying
      }

      // If already processed via callback return early
      if (transaction.status === 'completed') {
        return NextResponse.json({ success: true });
      }

      if (status === 'success') {
        // Update transaction status
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'completed',
            stripeSessionId: reference
          },
        });

        // Grant subscription based on tier
        const tier = transaction.tier;
        const now = new Date();
        
        const updateData: any = {};
        
        if (tier === 'hourly') {
          updateData.pdfPremiumEnd = new Date(now.getTime() + 1 * 60 * 60 * 1000);
        } else if (tier === 'three_hour') {
          updateData.pdfPremiumEnd = new Date(now.getTime() + 3 * 60 * 60 * 1000);
        } else if (tier === 'daily') {
          updateData.pdfPremiumEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
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
          console.log(`✅ ${tier} access granted to user ${transaction.userId} via Paystack Webhook`);
        }
      } else {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { 
            status: 'failed',
            failureReason: `Paystack webhook event: ${event.event}`
          },
        });
      }
    }

    // Must return 200 OK so Paystack doesn't retry
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Paystack Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
