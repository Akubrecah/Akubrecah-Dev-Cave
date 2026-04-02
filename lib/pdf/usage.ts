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
  
  // Return unlimited even if no user, but try to find user for metadata
  const dbUser = clerkId ? await prisma.user.findUnique({
    where: { clerkId },
    select: {
      subscriptionTier: true,
      subscriptionEnd: true,
    },
  }) : null;

  return {
    allowed: true, // Always allowed
    count: 0,
    remaining: 999999, // Unlimited
    isPremium: true,
    tier: dbUser?.subscriptionTier || 'unlimited',
    filingLimit: 999999,
    timeExpired: false,
    subscriptionEnd: dbUser?.subscriptionEnd?.toISOString() ?? null,
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
