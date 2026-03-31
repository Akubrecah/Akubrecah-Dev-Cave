import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const certificates = await prisma.certificate.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        kraPin: true,
        taxpayerName: true,
        createdAt: true,
        details: true,
        // pdfContent is excluded here for performance
      }
    });

    return NextResponse.json(certificates);
  } catch (error) {
    console.error('[CERTIFICATES_GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { kraPin, taxpayerName, details, pdfContent } = await req.json();

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
        details: details || {},
        pdfContent: pdfContent || null
      }
    });

    return NextResponse.json({ success: true, certificate: { id: certificate.id, kraPin: certificate.kraPin } });
  } catch (error) {
    console.error('[CERTIFICATES_POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
