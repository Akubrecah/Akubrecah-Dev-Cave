import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const notification = await (prisma as any).notification.findFirst({
      where: { active: true },
      select: {
        id: true,
        message: true,
        type: true,
        active: true,
        createdAt: true,
        // theme: true, // Omitted until DB syncs
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json({ error: 'Failed to fetch notification' }, { status: 500 });
  }
}
