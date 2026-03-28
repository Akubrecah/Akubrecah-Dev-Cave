import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log('M-Pesa Callback Data:', JSON.stringify(data, null, 2));

    const { Body } = data;
    if (!Body || !Body.stkCallback) {
      return NextResponse.json({ error: 'Invalid callback format' }, { status: 400 });
    }

    const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = Body.stkCallback;

    // 1. Find transaction by CheckoutRequestID (stored in mpesaCode)
    const transaction = await prisma.transaction.findFirst({
      where: { mpesaCode: CheckoutRequestID },
      include: { user: true },
    });

    if (!transaction) {
      console.warn('M-Pesa Callback: Transaction not found for request ID:', CheckoutRequestID);
      // Return 200 to Safaricom anyway to acknowledge receipt
      return NextResponse.json({ success: true });
    }

    // Safaricom ResultCode can be string or number. 0 is success.
    if (Number(ResultCode) === 0) {
      // SUCCESS
      if (!CallbackMetadata || !CallbackMetadata.Item) {
        throw new Error('Missing CallbackMetadata for successful transaction');
      }

      const metadata = CallbackMetadata.Item;
      const receiptNumber = metadata.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
      
      // Update transaction status
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'completed',
          mpesaCode: receiptNumber, // Store the real receipt number now
        },
      });

      // Grant subscription based on tier
      const tier = transaction.tier;
      const now = new Date();
      
      let updateData: any = {};
      
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
        console.log(`✅ ${tier} access granted to user ${transaction.userId} via M-Pesa`);
      }

    } else {
      // FAILED or CANCELLED (e.g. 1032 = Request cancelled by user)
      console.warn(`❌ M-Pesa Callback: ${ResultDesc} (Code: ${ResultCode})`);
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { 
          status: 'failed',
          failureReason: ResultDesc || 'Transaction failed'
        },
      });
    }

    // Safaricom expects a standard JSON response
    return NextResponse.json({ 
      ResponseCode: "00000000",
      ResponseDesc: "Success"
    });

  } catch (error) {
    console.error('M-Pesa Callback processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
