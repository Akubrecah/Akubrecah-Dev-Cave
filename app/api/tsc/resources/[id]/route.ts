import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const resource = await prisma.tscResource.findUnique({
      where: { id },
    });

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error('[TSC Resource ID GET]', error);
    return NextResponse.json({ error: 'Failed to fetch resource' }, { status: 500 });
  }
}
