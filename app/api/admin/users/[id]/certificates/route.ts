import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

const SUPER_ADMIN_EMAIL = 'poweldayck@gmail.com';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if requester is admin
    const clerkUser = await currentUser();
    const email = (clerkUser?.emailAddresses?.[0]?.emailAddress || '').toLowerCase();
    const isAdminIdentified = 
        email === SUPER_ADMIN_EMAIL.toLowerCase() || 
        email.includes('akubrecah');

    const adminUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { role: true }
    });

    if (!isAdminIdentified && adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const certificates = await prisma.certificate.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(certificates);
  } catch (error) {
    console.error('[ADMIN_USER_CERTIFICATES_GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
