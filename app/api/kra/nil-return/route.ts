import { NextResponse } from 'next/server';
import { fileNilReturn, NilReturnData } from '@/lib/kra-client';
import { checkUsageLimit, incrementUsage } from '@/lib/pdf/usage';

export async function POST(req: Request) {
    try {
        // Rate limiting disabled - Always allowed

        const body: NilReturnData = await req.json();
        
        // Basic validation
        if (!body.TaxpayerPIN || !body.ObligationCode || !body.Month || !body.Year) {
            return NextResponse.json({ errorMessage: 'Missing required fields' }, { status: 400 });
        }

        const result = await fileNilReturn(body);

        // Increment usage on success
        try { await incrementUsage('KRA'); } catch (e) { console.warn('[NIL-RETURN] incrementUsage failed:', e); }

        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error('[NIL-RETURN] Route Error:', error);
        if (error instanceof Error) {
            return NextResponse.json({ errorMessage: error.message }, { status: 500 });
        }
        return NextResponse.json({ errorMessage: 'Unknown error occurred' }, { status: 500 });
    }
}
