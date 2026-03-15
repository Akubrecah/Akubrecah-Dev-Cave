import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        role: true,
        subscriptionStatus: true,
        subscriptionTier: true,
        subscriptionEnd: true,
        pdfPremiumEnd: true,
      }
    });

    if (!user) {
        // User hasn't been synced to DB yet, returning default free tier
        return NextResponse.json({ 
            isCyberPro: false, 
            hasPdfPremium: false 
        });
    }

    const now = new Date();
    
    // Check Cyber Pro/Premium subscription
    // Any tier starting with 'premium' OR 'weekly'/'monthly' OR explicit role 'cyber'
    const isCyberPro = (
      user.role === 'cyber' || 
      user.subscriptionTier?.startsWith('premium') || 
      user.subscriptionTier === 'weekly' || 
      user.subscriptionTier === 'monthly'
    ) && 
    user.subscriptionStatus === 'active' && 
    user.subscriptionEnd && 
    new Date(user.subscriptionEnd) > now;

    // Check Daily PDF Premium - Cyber Pro/Premium also have PDF access
    // We check both pdfPremiumEnd (for daily/one-off) and isCyberPro
    const hasPdfPremium = isCyberPro || 
                          (user.pdfPremiumEnd && new Date(user.pdfPremiumEnd) > now) === true;

    return NextResponse.json({ 
        isCyberPro,
        hasPdfPremium,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionEnd: user.subscriptionEnd,
        pdfPremiumEnd: user.pdfPremiumEnd,
        role: user.role
    });

  } catch (error) {
    console.error('Error fetching user status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
