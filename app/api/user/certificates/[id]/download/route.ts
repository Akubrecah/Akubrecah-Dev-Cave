import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    
    // Diagnostic logging for DB connection in API context
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('[CERTIFICATE_DOWNLOAD] ❌ DATABASE_URL is missing in process.env at runtime');
    } else {
      console.log(`[CERTIFICATE_DOWNLOAD] ✅ DATABASE_URL present, length: ${dbUrl.length}`);
    }
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        role: true,
        subscriptionStatus: true,
        subscriptionEnd: true,
        pdfPremiumEnd: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Identity unknown' }, { status: 404 });
    }

    // Check for Paid Subscription (Any tier other than 'none' or 'free' is considered paid)
    const now = new Date();
    const isAdmin = user.role === 'admin' || user.role === 'cyber';
    const hasActiveSub = user.subscriptionStatus === 'active' && user.subscriptionEnd && new Date(user.subscriptionEnd) > now;
    const hasPdfPremium = user.pdfPremiumEnd && new Date(user.pdfPremiumEnd) > now;

    if (!isAdmin && !hasActiveSub && !hasPdfPremium) {
      return NextResponse.json({
        error: 'Active Paid Subscription Required',
        message: 'Retrieval of historical documents is reserved for paid terminal subscribers.'
      }, { status: 403 });
    }

    const certificate = await prisma.certificate.findUnique({
      where: { id },
    });

    if (!certificate) {
      return NextResponse.json({ error: 'File Not Found' }, { status: 404 });
    }

    // Security: Only owner or admin can access
    if (certificate.userId !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!certificate.pdfContent) {
      return NextResponse.json({ error: 'No PDF data stored for this entry' }, { status: 404 });
    }

    // Reconstruct PDF from base64
    const pdfBuffer = Buffer.from(certificate.pdfContent, 'base64');

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="KRA_CERT_${certificate.kraPin}_${new Date(certificate.createdAt).getTime()}.pdf"`,
      },
    });

  } catch (error) {
    console.error('[CERTIFICATE_DOWNLOAD] Error:', error);
    // Log details of the error to understand if it's a driver or prisma error
    if (error instanceof Error) {
      console.error('[CERTIFICATE_DOWNLOAD] Detail:', error.message);
      console.error('[CERTIFICATE_DOWNLOAD] Stack:', error.stack);
    }
    return NextResponse.json({ error: 'Retrival Engine Failure', detail: error instanceof Error ? error.message : 'Unknown' }, { status: 500 });
  }
}
