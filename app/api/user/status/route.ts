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
        id: true,
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
    // ALL SERVICES ARE FREE UNTIL JUNE 1, 2026
    const FREE_UNTIL_DATE = new Date('2026-06-01T00:00:00Z');
    const isFreePeriod = now < FREE_UNTIL_DATE;
    
    // Check Cyber Pro/Premium subscription
    const isCyberPro = isFreePeriod || (
      (user.role === 'cyber' || 
      user.subscriptionTier?.startsWith('premium') || 
      user.subscriptionTier === 'weekly' || 
      user.subscriptionTier === 'monthly') && 
      user.subscriptionStatus === 'active' && 
      user.subscriptionEnd && 
      new Date(user.subscriptionEnd) > now
    );

    // Check Daily PDF Premium - Cyber Pro/Premium also have PDF access
    const hasPdfPremium = isFreePeriod || 
                          isCyberPro || 
                          (user.pdfPremiumEnd && new Date(user.pdfPremiumEnd) > now) === true;

    // Fetch usage counts for today
    const tomorrow = new Date(now);
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(now.getDate() + 1);
    
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const usageLimits = await prisma.usageLimit.findMany({
      where: {
        userId: user.id, // Using dbUser.id or userId (clerkId)
        date: {
          gte: todayStart,
          lt: tomorrow
        }
      }
    });

    const kraUsage = usageLimits.find(u => u.type === 'KRA')?.count || 0;
    const pdfUsage = usageLimits.find(u => u.type === 'PDF')?.count || 0;

    return NextResponse.json({ 
        isCyberPro,
        hasPdfPremium,
        subscriptionTier: isFreePeriod ? 'premium_free' : user.subscriptionTier,
        subscriptionStatus: isFreePeriod ? 'active' : user.subscriptionStatus,
        subscriptionEnd: isFreePeriod ? FREE_UNTIL_DATE.toISOString() : user.subscriptionEnd,
        pdfPremiumEnd: isFreePeriod ? FREE_UNTIL_DATE.toISOString() : user.pdfPremiumEnd,
        role: user.role,
        usage: {
          KRA: kraUsage,
          PDF: pdfUsage,
          limit: 2
        }
    });

  } catch (error) {
    console.error('Error fetching user status:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      // @ts-ignore - Prisma error codes are sometimes dynamic
      if (error.code) console.error('Code:', error.code);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
