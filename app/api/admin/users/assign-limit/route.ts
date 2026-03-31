import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

const TIER_CONFIG = {
  basic: {
    subscriptionTier: 'basic',
    subscriptionStatus: 'active',
    label: 'Basic',
  },
  pro: {
    subscriptionTier: 'pro',
    subscriptionStatus: 'active',
    label: 'Pro',
  },
} as const;

type TierKey = keyof typeof TIER_CONFIG;

export async function POST(req: Request) {
  const adminOrError = await requireAdmin();
  if (adminOrError instanceof NextResponse) return adminOrError;

  try {
    const body = await req.json();
    const { userId, tier, days } = body;

    if (!userId || !tier || !days) {
      return NextResponse.json(
        { error: 'userId, tier, and days are required' },
        { status: 400 }
      );
    }

    if (!Object.keys(TIER_CONFIG).includes(tier)) {
      return NextResponse.json(
        { error: `Invalid tier. Must be one of: ${Object.keys(TIER_CONFIG).join(', ')}` },
        { status: 400 }
      );
    }

    const numDays = parseInt(days, 10);
    if (isNaN(numDays) || numDays < 1 || numDays > 365) {
      return NextResponse.json(
        { error: 'days must be a number between 1 and 365' },
        { status: 400 }
      );
    }

    const config = TIER_CONFIG[tier as TierKey];

    // Calculate expiry: extend from now if no active sub, or extend from current expiry
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionEnd: true, subscriptionTier: true, subscriptionStatus: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();

    // If existing active same/higher tier, extend from current end date
    const baseDate =
      existingUser.subscriptionStatus === 'active' &&
      existingUser.subscriptionEnd &&
      new Date(existingUser.subscriptionEnd) > now
        ? new Date(existingUser.subscriptionEnd)
        : now;

    const subscriptionEnd = new Date(baseDate);
    subscriptionEnd.setDate(subscriptionEnd.getDate() + numDays);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: config.subscriptionTier,
        subscriptionStatus: config.subscriptionStatus,
        subscriptionEnd,
      },
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionEnd: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updated,
      message: `${config.label} tier assigned for ${numDays} day(s). Expires: ${subscriptionEnd.toISOString()}`,
    });
  } catch (error) {
    console.error('[Admin Assign Limit]', error);
    return NextResponse.json({ error: 'Failed to assign limit' }, { status: 500 });
  }
}
