import { NextResponse } from 'next/server';
import { checkUsageLimit } from '@/lib/pdf/usage';

export async function GET() {
  try {
    const status = await checkUsageLimit('PDF');
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json({ allowed: false, error: 'Failed to fetch usage status' }, { status: 500 });
  }
}
