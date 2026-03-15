import { PrismaClient } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export type UsageType = 'KRA' | 'PDF';

/**
 * Checks if a user has reached their daily usage limit.
 * Fremium users are limited to 2 usages per day per type.
 */
export async function checkUsageLimit(type: UsageType): Promise<{
  allowed: boolean;
  count: number;
  remaining: number;
  isPremium: boolean;
}> {
  const user = await currentUser();
  if (!user) {
    return { allowed: false, count: 0, remaining: 0, isPremium: false };
  }

  // Fetch user from DB to check subscription
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) {
    return { allowed: false, count: 0, remaining: 0, isPremium: false };
  }

  const now = new Date();
  
  // Check if user is Cyber Pro or has active PDF premium
  const isCyberPro = (
    dbUser.role === 'cyber' || 
    dbUser.subscriptionTier?.startsWith('premium') || 
    dbUser.subscriptionTier === 'weekly' || 
    dbUser.subscriptionTier === 'monthly'
  ) && 
  dbUser.subscriptionStatus === 'active' && 
  dbUser.subscriptionEnd && 
  new Date(dbUser.subscriptionEnd) > now;

  const hasPdfPremium = isCyberPro || 
                        (dbUser.pdfPremiumEnd && new Date(dbUser.pdfPremiumEnd) > now) === true;

  // Determine if the user is considered premium for the requested type
  const isPremiumForType = type === 'KRA' ? isCyberPro : hasPdfPremium;

  if (isPremiumForType) {
    return { allowed: true, count: 0, remaining: 9999, isPremium: true };
  }

  // Check today's usage
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usage = await prisma.usageLimit.findUnique({
    where: {
      userId_type_date: {
        userId: dbUser.id,
        type: type,
        date: today,
      },
    },
  });

  const count = usage?.count || 0;
  const limit = 2;

  return {
    allowed: count < limit,
    count,
    remaining: Math.max(0, limit - count),
    isPremium: false,
  };
}

/**
 * Increments the usage count for a user for a specific type.
 */
export async function incrementUsage(type: UsageType): Promise<void> {
  const user = await currentUser();
  if (!user) return;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser || dbUser.subscriptionStatus === 'active') return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.usageLimit.upsert({
    where: {
      userId_type_date: {
        userId: dbUser.id,
        type: type,
        date: today,
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      userId: dbUser.id,
      type: type,
      date: today,
      count: 1,
    },
  });
}
