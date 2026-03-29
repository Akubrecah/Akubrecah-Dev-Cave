import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { userId: clerkId } = getAuth(req as any);

  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const notifications = await prisma.userNotification.findMany({
      where: {
        user: { clerkId }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('[User Notifications GET]', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { userId: clerkId } = getAuth(req as any);

  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    if (!id) {
        // Mark all as read
        await prisma.userNotification.updateMany({
            where: { user: { clerkId }, isRead: false },
            data: { isRead: true }
        });
        return NextResponse.json({ success: true });
    }

    const notification = await prisma.userNotification.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error('[User Notifications PATCH]', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
