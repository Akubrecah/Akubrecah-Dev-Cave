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

    // Defensive DB fetch
    let user = null;
    try {
      user = await prisma.user.findUnique({
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
    } catch (dbError) {
      console.error('[STATUS API] Database fetch failed:', dbError);
      // If DB is down, we fallback to a safe guest-like response for admin check
      return NextResponse.json({
          isCyberPro: false,
          hasPdfPremium: false,
          subscriptionTier: 'free',
          subscriptionStatus: 'inactive',
          activeTier: 'free',
          role: 'personal',
          usage: {
            KRA: 0,
            PDF: 0,
            limit: 2,
            remaining: 0,
            nextRefresh: new Date().toISOString(),
          },
          db_status: 'unavailable'
      });
    }

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

    if (!user) {
        try {
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
        } catch (createError) {
            console.error('[STATUS API] Database create failed:', createError);
            // Return degraded status if create fails
             return NextResponse.json({
                isCyberPro: isAdminIdentified,
                hasPdfPremium: isAdminIdentified,
                role: isAdminIdentified ? 'admin' : 'personal',
                usage: { KRA: 0, PDF: 0, limit: 2, remaining: 2, nextRefresh: new Date().toISOString() },
                db_status: 'create_failed'
            });
        }
    }

    // Ensure super admin always has admin role
    if (isAdminIdentified && user.role !== 'admin') {
      try {
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
      } catch (updateError) {
          console.error('[STATUS API] Database update failed:', updateError);
          // Just proceed with current user state if update fails
      }
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

    // Active tier string - Prioritize admin-assigned tier if present
    const activeTier = (user.subscriptionTier && user.subscriptionTier !== 'none')
      ? user.subscriptionTier
      : hasPdfPremiumDate
      ? 'pro'
      : 'free';

    const isCyberPro = isPrivilegedRole || hasActiveSub || hasPdfPremiumDate;
    const hasPdfPremium = isCyberPro;

    const dailyLimit = isPrivilegedRole
      ? 999999
      : (TIER_LIMITS[activeTier] ?? 2);

    // Fetch usage counts for today
    let usageLimits: { type: string; count: number }[] = [];
    const tomorrow = new Date(now);
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(now.getDate() + 1);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    try {
        usageLimits = await prisma.usageLimit.findMany({
          where: {
            userId: user.id,
            date: { gte: todayStart, lt: tomorrow },
          },
        });
    } catch (usageError) {
        console.error('[STATUS API] Usage fetch failed:', usageError);
    }

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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
