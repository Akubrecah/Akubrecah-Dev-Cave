import { NextResponse } from 'next/server';
import { incrementUsage } from '@/lib/pdf/usage';

export async function POST() {
  try {
    await incrementUsage('PDF');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to increment usage' }, { status: 500 });
  }
}
