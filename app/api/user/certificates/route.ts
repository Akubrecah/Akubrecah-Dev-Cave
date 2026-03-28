import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { kraPin, taxpayerName, details } = await req.json();

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    const certificate = await prisma.certificate.create({
      data: {
        userId: user.id,
        kraPin,
        taxpayerName,
        details: details || {}
      }
    });

    return NextResponse.json({ success: true, certificate });
  } catch (error) {
    console.error('[CERTIFICATES_POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
