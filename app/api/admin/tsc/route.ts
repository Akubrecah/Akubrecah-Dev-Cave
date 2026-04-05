import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

export async function GET() {
  const adminOrError = await requireAdmin();
  if (adminOrError instanceof NextResponse) return adminOrError;

  try {
    const resources = await prisma.tscResource.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(resources);
  } catch (error) {
    console.error('[Admin TSC GET]', error);
    return NextResponse.json({ error: 'Failed to fetch TSC resources' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const adminOrError = await requireAdmin();
  if (adminOrError instanceof NextResponse) return adminOrError;

  try {
    const body = await request.json();
    const { title, description, fileContent, fileUrl, fileName, fileType, size } = body;

    if (!title || !fileName) {
      return NextResponse.json({ error: 'Title and File Name are required' }, { status: 400 });
    }

    const resource = await prisma.tscResource.create({
      data: {
        title,
        description,
        fileContent,
        fileUrl,
        fileName,
        fileType,
        size: size ? parseInt(size) : null,
      },
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error('[Admin TSC POST]', error);
    return NextResponse.json({ error: 'Failed to create TSC resource' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const adminOrError = await requireAdmin();
  if (adminOrError instanceof NextResponse) return adminOrError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.tscResource.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin TSC DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete TSC resource' }, { status: 500 });
  }
}
