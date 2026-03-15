import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user from DB to check role and subscription status
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { 
        role: true, 
        subscriptionStatus: true, 
        subscriptionEnd: true,
        dailyGeneratesCount: true,
        lastGenerateDate: true
      }
    });

    // If user not in DB, auto-create them (happens on first login before webhook syncs)
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: 'unknown@example.com', // Will be updated by webhook later
          name: 'User',
          role: 'free'
        },
        select: {
          role: true,
          subscriptionStatus: true,
          subscriptionEnd: true,
          dailyGeneratesCount: true,
          lastGenerateDate: true
        }
      });
    }

    const subscriptionActive = user.subscriptionStatus === 'active' && 
      user.subscriptionEnd && new Date(user.subscriptionEnd) > new Date();

    // Subscribers bypass the 2-per-day limit
    if (user.role === 'cyber' && subscriptionActive) {
      return NextResponse.json({ success: true, allowed: true, message: 'Subscriber access granted' });
    }

    // --- Free Tier Logic: Limit to 2 per day ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let isNewDay = true;
    if (user.lastGenerateDate) {
      const lastGen = new Date(user.lastGenerateDate);
      lastGen.setHours(0, 0, 0, 0);
      if (lastGen.getTime() === today.getTime()) {
        isNewDay = false;
      }
    }

    // If it's a new day, reset count to 0. Otherwise, keep current count.
    const currentCount = isNewDay ? 0 : user.dailyGeneratesCount;

    if (currentCount >= 2) {
      return NextResponse.json(
        { error: 'Daily limit reached. Free users can only generate 2 certificates per day. Please subscribe to remove limits.' },
        { status: 403 }
      );
    }

    // Increment count and update lastGenerateDate
    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        dailyGeneratesCount: currentCount + 1,
        lastGenerateDate: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      allowed: true, 
      remainingFreeGenerates: 2 - (currentCount + 1),
      message: 'Free generate access granted' 
    });

  } catch (error: unknown) {
    console.error('Generation Error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}
