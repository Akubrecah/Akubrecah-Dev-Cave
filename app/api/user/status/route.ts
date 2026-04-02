import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { TIERS, isValidTier } from '@/lib/pricing';

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
      return NextResponse.json({
          isPremiumUser: false,
          hasPdfPremium: false,
          subscriptionTier: 'free',
          subscriptionStatus: 'inactive',
          activeTier: 'free',
          role: 'personal',
          timeExpired: false,
          usage: {
            KRA: 0,
            PDF: 0,
            limit: 0,
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
    
    const isAdminIdentified = 
        email === SUPER_ADMIN_EMAIL.toLowerCase() || 
        email.includes('akubrecah') ||
        firstName.includes('akubrecah') ||
        lastName.includes('akubrecah') ||
        fullName.includes('akubrecah') ||
        username.includes('akubrecah');

    if (!user) {
        try {
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
             return NextResponse.json({
                isPremiumUser: isAdminIdentified,
                hasPdfPremium: isAdminIdentified,
                role: isAdminIdentified ? 'admin' : 'personal',
                timeExpired: false,
                usage: { KRA: 0, PDF: 0, limit: 0, remaining: 0, nextRefresh: new Date().toISOString() },
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
      }
    }

    const now = new Date();

    const isAdmin = user.role === 'admin';
    const isPrivilegedRole = isAdmin || user.role === 'premium' || user.role === 'cyber';

    // Time-gate: subscription must be active AND not expired
    const hasActiveTimedSub =
      user.subscriptionStatus === 'active' &&
      user.subscriptionEnd != null &&
      new Date(user.subscriptionEnd) > now;

    // Detect expired subscription (had one but it ran out)
    const timeExpired =
      !hasActiveTimedSub &&
      user.subscriptionStatus === 'active' &&
      user.subscriptionEnd != null &&
      new Date(user.subscriptionEnd) <= now;

    // Active tier string
    let activeTier = hasActiveTimedSub && user.subscriptionTier
      ? user.subscriptionTier
      : 'free';

    let subscriptionEnd = user.subscriptionEnd;

    // ADMIN OVERRIDE: Admin tier should NOT be free
    if (isAdmin) {
      activeTier = 'premium_plus';
      // Provide a virtual long-term end if none exists
      if (!subscriptionEnd) {
        const farFuture = new Date();
        farFuture.setFullYear(farFuture.getFullYear() + 10);
        subscriptionEnd = farFuture;
      }
    }

    const isPremiumUser = isAdmin || hasActiveTimedSub || user.role === 'premium' || user.role === 'cyber';
    const hasPdfPremium = isPremiumUser;

    // Filing limits from pricing config
    const filingLimit = isPrivilegedRole
      ? 999999
      : (isValidTier(activeTier) ? TIERS[activeTier].filings : 0);

    // For unlimited tiers skip usage counting
    if (isAdmin || isPrivilegedRole || filingLimit >= 999999) {
      return NextResponse.json({
        isPremiumUser,
        hasPdfPremium,
        subscriptionTier: isAdmin ? 'premium_plus' : (user.subscriptionTier || 'free'),
        subscriptionStatus: isAdmin ? 'active' : (user.subscriptionStatus || 'inactive'),
        subscriptionEnd,
        activeTier,
        role: user.role,
        timeExpired: false,
        usage: {
          KRA: 0,
          PDF: 0,
          limit: 999999,
          remaining: 999999,
          nextRefresh: subscriptionEnd?.toISOString() ?? new Date().toISOString(),
        },
      });
    }

    // If expired or free, return blocked state
    if (!hasActiveTimedSub) {
      return NextResponse.json({
        isPremiumUser: false,
        hasPdfPremium: false,
        subscriptionTier: user.subscriptionTier || 'free',
        subscriptionStatus: user.subscriptionStatus || 'inactive',
        subscriptionEnd: user.subscriptionEnd,
        activeTier: 'free',
        role: user.role,
        timeExpired,
        usage: {
          KRA: 0,
          PDF: 0,
          limit: 0,
          remaining: 0,
          nextRefresh: user.subscriptionEnd?.toISOString() ?? new Date().toISOString(),
        },
      });
    }

    // Count filings used since sub started
    const subDurationMs = isValidTier(activeTier) ? TIERS[activeTier].durationMs : 0;
    const subStart = new Date(new Date(user.subscriptionEnd!).getTime() - subDurationMs);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    let usageLimits: { type: string; count: number }[] = [];
    try {
        usageLimits = await prisma.usageLimit.findMany({
          where: {
            userId: user.id,
            date: { gte: subStart < todayStart ? subStart : todayStart },
          },
        });
    } catch (usageError) {
        console.error('[STATUS API] Usage fetch failed:', usageError);
    }

    const kraUsage = usageLimits.filter((u) => u.type === 'KRA').reduce((sum, u) => sum + u.count, 0);
    const pdfUsage = usageLimits.filter((u) => u.type === 'PDF').reduce((sum, u) => sum + u.count, 0);
    const remainingCredits = Math.max(0, filingLimit - kraUsage);

    return NextResponse.json({
      isPremiumUser,
      hasPdfPremium,
      subscriptionTier: user.subscriptionTier || 'free',
      subscriptionStatus: user.subscriptionStatus || 'inactive',
      subscriptionEnd: user.subscriptionEnd,
      activeTier,
      role: user.role,
      timeExpired: false,
      usage: {
        KRA: kraUsage,
        PDF: pdfUsage,
        limit: filingLimit,
        remaining: remainingCredits,
        nextRefresh: user.subscriptionEnd?.toISOString() ?? new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error fetching user status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
