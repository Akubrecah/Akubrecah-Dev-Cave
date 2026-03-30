import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export type UsageType = 'KRA' | 'PDF';

// Tier-based daily limits
const TIER_LIMITS: Record<string, number> = {
  free: 2,
  basic: 10,
  pro: 999999,
  enterprise: 999999,
  // Legacy / other tiers
  weekly: 999999,
  monthly: 999999,
  daily_pro: 999999,
  none: 2,
};

function getDailyLimit(tier: string | null | undefined): number {
  return TIER_LIMITS[tier ?? 'free'] ?? 2;
}

export async function checkUsageLimit(type: UsageType): Promise<{
  allowed: boolean;
  count: number;
  remaining: number;
  isPremium: boolean;
  tier: string;
  dailyLimit: number;
}> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { allowed: false, count: 0, remaining: 0, isPremium: false, tier: 'free', dailyLimit: 2 };

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      id: true,
      role: true,
      subscriptionStatus: true,
      subscriptionTier: true,
      subscriptionEnd: true,
      pdfPremiumEnd: true,
    },
  });

  if (!dbUser) return { allowed: false, count: 0, remaining: 0, isPremium: false, tier: 'free', dailyLimit: 2 };

  const now = new Date();

  // Admins & Cyber roles always premium/unlimited
  const isPrivilegedRole = dbUser.role === 'admin' || dbUser.role === 'cyber';

  // Determine active tier
  const hasActiveSub =
    dbUser.subscriptionStatus === 'active' &&
    dbUser.subscriptionEnd != null &&
    new Date(dbUser.subscriptionEnd) > now;

  const activeTier = hasActiveSub
    ? (dbUser.subscriptionTier ?? 'free')
    : (dbUser.pdfPremiumEnd && new Date(dbUser.pdfPremiumEnd) > now)
    ? 'pro' // treat pdfPremiumEnd as "pro" level for PDF
    : 'free';

  const isPremium = isPrivilegedRole || hasActiveSub || (dbUser.pdfPremiumEnd != null && new Date(dbUser.pdfPremiumEnd) > now);
  const dailyLimit = isPrivilegedRole ? 999999 : getDailyLimit(activeTier);

  if (dailyLimit >= 999999) {
    return { allowed: true, count: 0, remaining: 999999, isPremium: true, tier: activeTier, dailyLimit };
  }

  // Check daily usage count
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usage = await prisma.usageLimit.findUnique({
    where: {
      userId_type_date: {
        userId: dbUser.id,
        type,
        date: today,
      },
    },
  });

  const count = usage?.count || 0;
  const remaining = Math.max(0, dailyLimit - count);

  return {
    allowed: count < dailyLimit,
    count,
    remaining,
    isPremium,
    tier: activeTier,
    dailyLimit,
  };
}

export async function incrementUsage(type: UsageType): Promise<void> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (!dbUser) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.usageLimit.upsert({
    where: {
      userId_type_date: {
        userId: dbUser.id,
        type,
        date: today,
      },
    },
    create: {
      userId: dbUser.id,
      type,
      date: today,
      count: 1,
    },
    update: {
      count: {
        increment: 1,
      },
    },
  });
}
