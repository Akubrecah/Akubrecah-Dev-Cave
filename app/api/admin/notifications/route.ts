import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

export async function GET() {
  const adminOrError = await requireAdmin();
  if (adminOrError instanceof NextResponse) return adminOrError;

  try {
    const notifications = await prisma.notification.findMany({
      select: {
        id: true,
        message: true,
        type: true,
        active: true,
        createdAt: true,
        theme: true,
        speed: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('[Admin Notifications GET]', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const adminOrError = await requireAdmin();
    if (adminOrError instanceof NextResponse) return adminOrError;

    const body = await req.json();
    const { message, type, active, theme, speed } = body;

    // If active is true, deactivate all other notifications OF THE SAME TYPE
    if (active) {
      await prisma.notification.updateMany({
        where: { type, active: true },
        data: { active: false }
      });
    }

    const notification = await prisma.notification.create({
      data: {
        message,
        type,
        active: !!active,
        theme: theme || 'purple',
        speed: parseInt(speed) || 30,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('[Admin Notifications POST]', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const adminOrError = await requireAdmin();
    if (adminOrError instanceof NextResponse) return adminOrError;

    const body = await req.json();
    const { id, message, type, active, theme, speed } = body;

    // If active is true, deactivate all other notifications OF THE SAME TYPE
    if (active) {
      await prisma.notification.updateMany({
        where: { 
          type, 
          active: true,
          NOT: { id }
        },
        data: { active: false }
      });
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: {
        message,
        type,
        active: !!active,
        theme: theme || 'purple',
        speed: parseInt(speed) || 30,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('[Admin Notifications PATCH]', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const adminOrError = await requireAdmin();
  if (adminOrError instanceof NextResponse) return adminOrError;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Notifications DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}
