import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Heartbeat DB update temporarily disabled due to migration failure
    // Returning 200 to keep the tracker active without crashing
    return NextResponse.json({ success: true, mode: 'passive' });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update heartbeat' }, { status: 500 });
  }
}
