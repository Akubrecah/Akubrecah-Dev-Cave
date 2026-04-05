import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { theme } = await req.json();
    if (!theme || !['light', 'dark', 'system'].includes(theme)) {
      return NextResponse.json({ error: 'Invalid theme' }, { status: 400 });
    }

    await prisma.user.update({
      where: { clerkId: userId },
      data: { theme },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user theme:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
