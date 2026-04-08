import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const limited = rateLimit(req);
  if (limited) return limited;

  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { credits: true, subscriptionStatus: true, subscriptionEnd: true, role: true }
    });

    if (!user) {
      // Create user if they don't exist in DB yet (could also be done via Clerk Webhook)
      const currentUser = await (await import('@clerk/nextjs/server')).currentUser();
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: currentUser?.emailAddresses[0]?.emailAddress || '',
          name: currentUser?.firstName 
            ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() 
            : 'New User'
        }
      });
    }

    let subscriptionActive = false;
    if (user.subscriptionStatus === 'active' && user.subscriptionEnd) {
      subscriptionActive = new Date(user.subscriptionEnd) > new Date();
      if (!subscriptionActive) {
        // Update expired subscription
        await prisma.user.update({
          where: { clerkId: userId },
          data: { subscriptionStatus: 'expired' }
        });
      }
    }

    return NextResponse.json({
      credits: user.credits,
      subscriptionActive,
      subscriptionEnd: user.subscriptionEnd,
      role: user.role
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}

// Optionally deduct credit
export async function POST(req: NextRequest) {
  const limited = rateLimit(req);
  if (limited) return limited;

  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const { amount = 1 } = await req.json();

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { credits: true, subscriptionStatus: true, subscriptionEnd: true, role: true }
    });

    if (!user) return new NextResponse('User not found', { status: 404 });

    const subscriptionActive = user.subscriptionStatus === 'active' && 
      user.subscriptionEnd && new Date(user.subscriptionEnd) > new Date();

    if (user.role === 'cyber' && subscriptionActive) {
      return NextResponse.json({ success: true, message: 'Subscription active, no credit deducted' });
    }

    if (user.credits < amount) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: { credits: { decrement: amount } }
    });

    return NextResponse.json({ success: true, remainingCredits: updatedUser.credits });

  } catch (error: unknown) {
     if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}
