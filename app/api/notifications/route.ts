import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const notifications = await (prisma as unknown as Record<string, { findMany: (opts: unknown) => Promise<unknown[]> }>).notification.findMany({
      where: { active: true },
      select: {
        id: true,
        message: true,
        type: true,
        theme: true,
        active: true,
        createdAt: true,
        speed: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { speed } = await request.json();
    
    // Update all active marquee notifications
    const result = await (prisma as unknown as Record<string, { updateMany: (opts: unknown) => Promise<{ count: number }> }>).notification.updateMany({
      where: { type: 'marquee', active: true },
      data: { speed: parseInt(speed) || 50 }
    });
    
    return NextResponse.json({ success: true, updated: result.count });
  } catch (error) {
    console.error('Error updating marquee speed:', error);
    return NextResponse.json({ error: 'Failed to update marquee speed' }, { status: 500 });
  }
}
