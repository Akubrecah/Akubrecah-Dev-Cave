import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export type UsageType = 'KRA' | 'PDF';

const FREE_LIMIT = 2;

export async function checkUsageLimit(type: UsageType): Promise<{
  allowed: boolean;
  count: number;
  remaining: number;
  isPremium: boolean;
}> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { allowed: false, count: 0, remaining: 0, isPremium: false };

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, role: true, subscriptionStatus: true, subscriptionEnd: true, pdfPremiumEnd: true }
  });

  if (!dbUser) return { allowed: false, count: 0, remaining: 0, isPremium: false };

  const now = new Date();
  
  // 1. Determine Premium Status (Admin/Cyber roles or active expiry dates)
  const isPremium = 
    dbUser.role === 'admin' || 
    dbUser.role === 'cyber' ||
    (dbUser.subscriptionEnd && new Date(dbUser.subscriptionEnd) > now) ||
    (dbUser.pdfPremiumEnd && new Date(dbUser.pdfPremiumEnd) > now);

  if (isPremium) {
    return { allowed: true, count: 0, remaining: 9999, isPremium: true };
  }

  // 2. Check Daily Limit for Free Users
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usage = await prisma.usageLimit.findUnique({
    where: {
      userId_type_date: {
        userId: dbUser.id,
        type,
        date: today
      }
    }
  });

  const count = usage?.count || 0;
  const remaining = Math.max(0, FREE_LIMIT - count);

  return {
    allowed: count < FREE_LIMIT,
    count,
    remaining,
    isPremium: false
  };
}

export async function incrementUsage(type: UsageType): Promise<void> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true }
  });
  if (!dbUser) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.usageLimit.upsert({
    where: {
      userId_type_date: {
        userId: dbUser.id,
        type,
        date: today
      }
    },
    create: {
      userId: dbUser.id,
      type,
      date: today,
      count: 1
    },
    update: {
      count: {
        increment: 1
      }
    }
  });
}
