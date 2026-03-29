import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

// GET: Fetch all contact messages
export async function GET() {
  const adminOrError = await requireAdmin();
  if (adminOrError instanceof NextResponse) return adminOrError;

  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            clerkId: true,
          }
        }
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('[Admin Messages GET]', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// PATCH: Resolve a message and notify the user
export async function PATCH(req: Request) {
  const adminOrError = await requireAdmin();
  if (adminOrError instanceof NextResponse) return adminOrError;

  try {
    const { id, status, resolution } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Message ID and status are required' }, { status: 400 });
    }

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { 
        status, 
        resolution,
        updatedAt: new Date()
      },
    });

    // Create a notification for the user if resolved
    if (status === 'resolved') {
        await prisma.userNotification.create({
            data: {
                userId: message.userId,
                message: `Your inquiry about "${message.subject}" has been resolved: ${resolution || 'Issue was addressed by our team.'}`,
            }
        });
    }

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('[Admin Messages PATCH]', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}
