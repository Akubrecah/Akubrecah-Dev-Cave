import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const resources = await prisma.tscResource.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        fileName: true,
        fileType: true,
        size: true,
        fileUrl: true,
        createdAt: true,
        // We don't select fileContent here to keep the list response small
        // We will fetch content individually if needed, or provide direct download
      }
    });
    return NextResponse.json(resources);
  } catch (error) {
    console.error('[TSC Resources GET]', error);
    return NextResponse.json({ error: 'Failed to fetch TSC resources' }, { status: 500 });
  }
}
