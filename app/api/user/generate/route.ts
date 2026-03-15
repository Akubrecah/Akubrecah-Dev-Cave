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
        subscriptionEnd: true
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
          subscriptionEnd: true
        }
      });
    }

    const subscriptionActive = user.subscriptionStatus === 'active' && 
      user.subscriptionEnd && new Date(user.subscriptionEnd) > new Date();

    // Subscribers bypass the 2-per-day limit
    if (user.role === 'cyber' && subscriptionActive) {
      return NextResponse.json({ success: true, allowed: true, message: 'Subscriber access granted' });
    }

    // Free tier: no per-day limit enforced
    return NextResponse.json({ 
      success: true, 
      allowed: true,
      message: 'Access granted'
    });

  } catch (error: unknown) {
    console.error('Generation Error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}
