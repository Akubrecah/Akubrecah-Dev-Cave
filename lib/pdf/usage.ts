import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { TIERS, isValidTier } from '@/lib/pricing';

export type UsageType = 'KRA' | 'PDF';

function getTierLimit(tier: string | null | undefined): number {
  if (!tier || !isValidTier(tier)) return 0;
  return TIERS[tier].filings;
}

export async function checkUsageLimit(type: UsageType): Promise<{
  allowed: boolean;
  count: number;
  remaining: number;
  isPremium: boolean;
  tier: string;
  filingLimit: number;
  timeExpired: boolean;
  subscriptionEnd: string | null;
}> {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return { allowed: false, count: 0, remaining: 0, isPremium: false, tier: 'free', filingLimit: 0, timeExpired: false, subscriptionEnd: null };
  }

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

  if (!dbUser) {
    return { allowed: false, count: 0, remaining: 0, isPremium: false, tier: 'free', filingLimit: 0, timeExpired: false, subscriptionEnd: null };
  }

  const now = new Date();

  // Admins & Premium roles are always unlimited
  const isPrivilegedRole = dbUser.role === 'admin' || dbUser.role === 'premium' || dbUser.role === 'cyber';

  if (isPrivilegedRole) {
    return { allowed: true, count: 0, remaining: 999999, isPremium: true, tier: dbUser.subscriptionTier || 'admin', filingLimit: 999999, timeExpired: false, subscriptionEnd: null };
  }

  // Time-gate check: subscription must be active AND not expired
  const hasActiveTimedSub =
    dbUser.subscriptionStatus === 'active' &&
    dbUser.subscriptionEnd != null &&
    new Date(dbUser.subscriptionEnd) > now;

  const activeTier = hasActiveTimedSub ? (dbUser.subscriptionTier ?? 'free') : 'free';
  const timeExpired = !hasActiveTimedSub && dbUser.subscriptionStatus === 'active' && dbUser.subscriptionEnd != null;

  // If time has expired, treat as free
  if (!hasActiveTimedSub) {
    return { allowed: false, count: 0, remaining: 0, isPremium: false, tier: 'free', filingLimit: 0, timeExpired, subscriptionEnd: dbUser.subscriptionEnd?.toISOString() ?? null };
  }

  const filingLimit = getTierLimit(activeTier);

  // Unlimited tiers
  if (filingLimit >= 999999) {
    return { allowed: true, count: 0, remaining: 999999, isPremium: true, tier: activeTier, filingLimit, timeExpired: false, subscriptionEnd: dbUser.subscriptionEnd?.toISOString() ?? null };
  }

  // Count filings used since subscription started (not just today)
  const subStart = dbUser.subscriptionEnd
    ? new Date(new Date(dbUser.subscriptionEnd).getTime() - (isValidTier(activeTier) ? TIERS[activeTier].durationMs : 0))
    : now;

  const usage = await prisma.usageLimit.findMany({
    where: {
      userId: dbUser.id,
      type,
      date: { gte: subStart },
    },
  });

  const count = usage.reduce((sum, u) => sum + u.count, 0);
  const remaining = Math.max(0, filingLimit - count);

  return {
    allowed: count < filingLimit,
    count,
    remaining,
    isPremium: true,
    tier: activeTier,
    filingLimit,
    timeExpired: false,
    subscriptionEnd: dbUser.subscriptionEnd?.toISOString() ?? null,
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
