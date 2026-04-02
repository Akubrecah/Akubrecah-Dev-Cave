import { NextResponse } from 'next/server';
import { checkUsageLimit, incrementUsage } from '@/lib/pdf/usage';

export async function POST(req: Request) {
  try {
    // Rate limiting disabled - Always allowed
    // Since generation logic is handled on the client (html2pdf), 
    // this API acts as a gatekeeper and incrementer for tracking only.
    
    // Increment usage for analytics
    await incrementUsage('KRA');

    return NextResponse.json({ 
      success: true, 
      allowed: true,
      remaining: 999999,
      message: 'Access granted'
    });

  } catch (error: unknown) {
    console.error('Generation Authorization Error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}
