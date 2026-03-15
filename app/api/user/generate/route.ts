import { NextResponse } from 'next/server';
import { checkUsageLimit, incrementUsage } from '@/lib/pdf/usage';

export async function POST(req: Request) {
  try {
    // Enforcement: Check daily limit for KRA Certificate Generation
    const { allowed, remaining, isPremium } = await checkUsageLimit('KRA');
    
    if (!allowed) {
      return NextResponse.json({ 
        error: 'Daily generation limit reached. Please upgrade to Cyber Pro for unlimited certificates.',
        remaining 
      }, { status: 429 });
    }

    // Since generation logic is handled on the client (html2pdf), 
    // this API acts as a gatekeeper and incrementer.
    
    // Increment usage
    await incrementUsage('KRA');

    return NextResponse.json({ 
      success: true, 
      allowed: true,
      remaining: isPremium ? 9999 : remaining - 1,
      message: isPremium ? 'Premium access granted' : 'Generation authorized'
    });

  } catch (error: unknown) {
    console.error('Generation Authorization Error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}
