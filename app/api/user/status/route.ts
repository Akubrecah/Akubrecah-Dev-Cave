import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

const SUPER_ADMIN_EMAIL = 'poweldayck@gmail.com';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        email: true,
        role: true,
        subscriptionStatus: true,
        subscriptionTier: true,
        subscriptionEnd: true,
        pdfPremiumEnd: true,
      }
    });

    const clerkUser = await currentUser();
    const email = (clerkUser?.emailAddresses?.[0]?.emailAddress || '').toLowerCase();
    const firstName = (clerkUser?.firstName || '').toLowerCase();
    const lastName = (clerkUser?.lastName || '').toLowerCase();
    const username = (clerkUser?.username || '').toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();
    
    // Check if "akubrecah" is anywhere in the user's data
    const isAdminIdentified = 
        email === SUPER_ADMIN_EMAIL.toLowerCase() || 
        email.includes('akubrecah') ||
        firstName.includes('akubrecah') ||
        lastName.includes('akubrecah') ||
        fullName.includes('akubrecah') ||
        username.includes('akubrecah');

    console.log(`[STATUS API] USER: ${email} | NAME: ${fullName} | USERNAME: ${username} | ADMIN? ${isAdminIdentified}`);

    if (!user) {
        // User hasn't been synced to DB yet — try to auto-create
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email,
            name: fullName || undefined,
            role: isAdminIdentified ? 'admin' : 'personal',
          },
          select: {
            id: true,
            email: true,
            role: true,
            subscriptionStatus: true,
            subscriptionTier: true,
            subscriptionEnd: true,
            pdfPremiumEnd: true,
          }
        });
    }

    // Ensure super admin always has admin role
    if (isAdminIdentified && user.role !== 'admin') {
      user = await prisma.user.update({
        where: { clerkId: userId },
        data: { role: 'admin' },
        select: {
          id: true,
          email: true,
          role: true,
          subscriptionStatus: true,
          subscriptionTier: true,
          subscriptionEnd: true,
          pdfPremiumEnd: true,
        }
      });
    }

    const now = new Date();

    // Tier limits: free=2, basic=10, pro/enterprise/admin=unlimited
    const TIER_LIMITS: Record<string, number> = {
      free: 2, basic: 10, pro: 999999, enterprise: 999999,
      weekly: 999999, monthly: 999999, daily_pro: 999999, none: 2,
    };

    const isAdmin = user.role === 'admin';
    const isPrivilegedRole = isAdmin || user.role === 'cyber';

    const hasActiveSub =
      user.subscriptionStatus === 'active' &&
      user.subscriptionEnd != null &&
      new Date(user.subscriptionEnd) > now;

    const hasPdfPremiumDate = user.pdfPremiumEnd != null && new Date(user.pdfPremiumEnd) > now;

    // Active tier string
    const activeTier = hasActiveSub
      ? (user.subscriptionTier ?? 'free')
      : hasPdfPremiumDate
      ? 'pro'
      : 'free';

    const isCyberPro = isPrivilegedRole || hasActiveSub || hasPdfPremiumDate;
    const hasPdfPremium = isCyberPro;

    const dailyLimit = isPrivilegedRole
      ? 999999
      : (TIER_LIMITS[activeTier] ?? 2);

    // Fetch usage counts for today
    const tomorrow = new Date(now);
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(now.getDate() + 1);

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const usageLimits = await prisma.usageLimit.findMany({
      where: {
        userId: user.id,
        date: { gte: todayStart, lt: tomorrow },
      },
    });

    const kraUsage = usageLimits.find((u: { type: string; count: number }) => u.type === 'KRA')?.count || 0;
    const pdfUsage = usageLimits.find((u: { type: string; count: number }) => u.type === 'PDF')?.count || 0;

    const remainingCredits = dailyLimit >= 999999 ? 999999 : Math.max(0, dailyLimit - kraUsage);

    return NextResponse.json({
      isCyberPro,
      hasPdfPremium,
      subscriptionTier: user.subscriptionTier || 'free',
      subscriptionStatus: user.subscriptionStatus || 'inactive',
      subscriptionEnd: user.subscriptionEnd,
      pdfPremiumEnd: user.pdfPremiumEnd,
      activeTier,
      role: user.role,
      usage: {
        KRA: kraUsage,
        PDF: pdfUsage,
        limit: dailyLimit,
        remaining: remainingCredits,
        nextRefresh: tomorrow.toISOString(),
      },
    });

  } catch (error) {
    console.error('Error fetching user status:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      // @ts-expect-error - Prisma error codes are sometimes dynamic
      if (error.code) console.error('Code:', error.code);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
