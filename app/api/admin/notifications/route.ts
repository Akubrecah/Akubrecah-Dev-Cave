import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

export async function GET() {
  const adminOrError = await requireAdmin();
  if (adminOrError instanceof NextResponse) return adminOrError;

  try {
    const notifications = await (prisma as any).notification.findMany({
      select: {
        id: true,
        message: true,
        type: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        // theme: true, // Omitted until DB syncs
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
  const adminOrError = await requireAdmin();
  if (adminOrError instanceof NextResponse) return adminOrError;

  try {
    const body = await req.json();
    const { message, type, theme, active } = body;

    if (!message || !type) {
      return NextResponse.json({ error: 'message and type are required' }, { status: 400 });
    }

    // If active is true, deactivate all other notifications
    if (active) {
      await (prisma as any).notification.updateMany({
        where: { active: true },
        data: { active: false },
      });
    }

    const notificationData: any = {
      message,
      type,
      active: active ?? true,
    };

    // Only add theme if we know the DB is ready (manual check or try/catch)
    // For now, we omit it to prevent the crash
    // notificationData.theme = theme || 'purple';

    const notification = await (prisma as any).notification.create({
      data: notificationData,
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('[Admin Notifications POST]', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const adminOrError = await requireAdmin();
  if (adminOrError instanceof NextResponse) return adminOrError;

  try {
    const body = await req.json();
    const { id, message, type, theme, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // If active is true, deactivate all other notifications
    if (active) {
      await (prisma as any).notification.updateMany({
        where: { NOT: { id }, active: true },
        data: { active: false },
      });
    }

    const updateData: any = {
      message,
      type,
      active,
    };

    // Update theme only if it was provided and we aren't in safe mode
    // if (theme) updateData.theme = theme;

    const notification = await (prisma as any).notification.update({
      where: { id },
      data: updateData,
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
